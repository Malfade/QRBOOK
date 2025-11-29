import { prisma } from '../prisma'
import { Prisma } from '@prisma/client'
import { isTimeInWindow } from '../utils'

export async function checkReservationConflict(
  roomId: number,
  startTime: Date,
  endTime: Date,
  excludeId?: number
): Promise<boolean> {
  const conflicts = await prisma.reservation.findMany({
    where: {
      roomId,
      status: 'active',
      id: excludeId ? { not: excludeId } : undefined,
      OR: [
        {
          AND: [
            { startTime: { lte: startTime } },
            { endTime: { gt: startTime } },
          ],
        },
        {
          AND: [
            { startTime: { lt: endTime } },
            { endTime: { gte: endTime } },
          ],
        },
        {
          AND: [
            { startTime: { gte: startTime } },
            { endTime: { lte: endTime } },
          ],
        },
      ],
    },
  })

  return conflicts.length > 0
}

export async function validateReservationTime(
  roomId: number,
  startTime: Date,
  endTime: Date
): Promise<{ valid: boolean; error?: string }> {
  // Check if start time is in the past
  if (startTime < new Date()) {
    return { valid: false, error: 'Время начала не может быть в прошлом' }
  }

  // Check if end time is after start time
  if (endTime <= startTime) {
    return { valid: false, error: 'Время окончания должно быть позже времени начала' }
  }

  // Get room with booking window
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: { bookingStart: true, bookingEnd: true, isBlocked: true },
  })

  if (!room) {
    return { valid: false, error: 'Кабинет не найден' }
  }

  if (room.isBlocked) {
    return { valid: false, error: 'Кабинет заблокирован' }
  }

  // Check booking window
  if (room.bookingStart && room.bookingEnd) {
    const startValid = isTimeInWindow(startTime, room.bookingStart, room.bookingEnd)
    const endValid = isTimeInWindow(endTime, room.bookingStart, room.bookingEnd)

    if (!startValid || !endValid) {
      return {
        valid: false,
        error: `Бронирование разрешено только с ${room.bookingStart} до ${room.bookingEnd}`,
      }
    }
  }

  // Check for conflicts
  const hasConflict = await checkReservationConflict(roomId, startTime, endTime)
  if (hasConflict) {
    return { valid: false, error: 'В это время кабинет уже забронирован' }
  }

  return { valid: true }
}

export async function getAvailableSlots(
  roomId: number,
  date: Date
): Promise<Array<{ startTime: Date; endTime: Date }>> {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: { bookingStart: true, bookingEnd: true, isBlocked: true },
  })

  if (!room || room.isBlocked) {
    return []
  }

  // Default to 08:00 - 20:00 if no window specified
  const startHour = room.bookingStart
    ? parseInt(room.bookingStart.split(':')[0])
    : 8
  const endHour = room.bookingEnd
    ? parseInt(room.bookingEnd.split(':')[0])
    : 20

  // Get existing reservations for the day
  const dayStart = new Date(date)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(date)
  dayEnd.setHours(23, 59, 59, 999)

  const reservations = await prisma.reservation.findMany({
    where: {
      roomId,
      status: 'active',
      startTime: { gte: dayStart },
      endTime: { lte: dayEnd },
    },
    orderBy: { startTime: 'asc' },
  })

  // Generate hourly slots
  const slots: Array<{ startTime: Date; endTime: Date }> = []
  const now = new Date()

  for (let hour = startHour; hour < endHour; hour++) {
    const slotStart = new Date(date)
    slotStart.setHours(hour, 0, 0, 0)
    const slotEnd = new Date(date)
    slotEnd.setHours(hour + 1, 0, 0, 0)

    // Skip if in the past
    if (slotEnd <= now) continue

    // Check if slot conflicts with any reservation
    const hasConflict = reservations.some(
      (res) => res.startTime < slotEnd && res.endTime > slotStart
    )

    if (!hasConflict) {
      slots.push({ startTime: slotStart, endTime: slotEnd })
    }
  }

  return slots
}

export async function getUserReservations(
  userId: number,
  options?: {
    status?: 'active' | 'finished' | 'cancelled'
    includeRoom?: boolean
  }
) {
  return prisma.reservation.findMany({
    where: {
      userId,
      status: options?.status,
    },
    include: {
      room: options?.includeRoom !== false,
    },
    orderBy: { startTime: 'desc' },
  })
}

export async function getRoomReservations(
  roomId: number,
  options?: {
    from?: Date
    to?: Date
    status?: 'active' | 'finished' | 'cancelled'
  }
) {
  return prisma.reservation.findMany({
    where: {
      roomId,
      status: options?.status,
      startTime: options?.from ? { gte: options.from } : undefined,
      endTime: options?.to ? { lte: options.to } : undefined,
    },
    include: {
      user: {
        select: { id: true, name: true, role: true },
      },
    },
    orderBy: { startTime: 'asc' },
  })
}

export async function cancelReservation(
  reservationId: number,
  userId: number,
  isAdmin: boolean = false
): Promise<{ success: boolean; error?: string }> {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
  })

  if (!reservation) {
    return { success: false, error: 'Бронирование не найдено' }
  }

  if (!isAdmin && reservation.userId !== userId) {
    return { success: false, error: 'Нет прав на отмену этого бронирования' }
  }

  if (reservation.status !== 'active') {
    return { success: false, error: 'Бронирование уже завершено или отменено' }
  }

  await prisma.reservation.update({
    where: { id: reservationId },
    data: { status: 'cancelled' },
  })

  return { success: true }
}

export async function createReservation(
  roomId: number,
  userId: number,
  startTime: Date,
  endTime: Date
) {
  // Validate
  const validation = await validateReservationTime(roomId, startTime, endTime)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  // Create
  return prisma.reservation.create({
    data: {
      roomId,
      userId,
      startTime,
      endTime,
      status: 'active',
    },
    include: {
      room: true,
      user: {
        select: { id: true, name: true, role: true },
      },
    },
  })
}

