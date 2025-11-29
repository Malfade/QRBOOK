import { prisma } from '../prisma'
import { generateQRCode } from '../qr'

export async function getAllRooms(options?: {
  includeBlocked?: boolean
  type?: 'public' | 'admin' | 'service'
}) {
  return prisma.room.findMany({
    where: {
      isBlocked: options?.includeBlocked ? undefined : false,
      type: options?.type,
    },
    orderBy: { name: 'asc' },
  })
}

export async function getRoomById(roomId: number) {
  return prisma.room.findUnique({
    where: { id: roomId },
  })
}

export async function createRoom(data: {
  name: string
  type: 'public' | 'admin' | 'service'
  bookingStart?: string | null
  bookingEnd?: string | null
}) {
  // Create room
  const room = await prisma.room.create({
    data: {
      name: data.name,
      type: data.type,
      bookingStart: data.bookingStart,
      bookingEnd: data.bookingEnd,
      isBlocked: false,
    },
  })

  // Generate QR code
  try {
    const qrCodeUrl = await generateQRCode(room.id, room.name)
    await prisma.room.update({
      where: { id: room.id },
      data: { qrCodeUrl },
    })
    return { ...room, qrCodeUrl }
  } catch (error) {
    console.error('Failed to generate QR code:', error)
    return room
  }
}

export async function updateRoom(
  roomId: number,
  data: {
    name?: string
    type?: 'public' | 'admin' | 'service'
    bookingStart?: string | null
    bookingEnd?: string | null
    isBlocked?: boolean
  }
) {
  return prisma.room.update({
    where: { id: roomId },
    data,
  })
}

export async function deleteRoom(roomId: number) {
  return prisma.room.delete({
    where: { id: roomId },
  })
}

export async function toggleRoomBlock(roomId: number, isBlocked: boolean) {
  return prisma.room.update({
    where: { id: roomId },
    data: { isBlocked },
  })
}

export async function updateRoomBookingWindow(
  roomId: number,
  bookingStart: string | null,
  bookingEnd: string | null
) {
  return prisma.room.update({
    where: { id: roomId },
    data: {
      bookingStart,
      bookingEnd,
    },
  })
}

export async function regenerateQRCode(roomId: number) {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: { name: true },
  })

  if (!room) {
    throw new Error('Room not found')
  }

  const qrCodeUrl = await generateQRCode(roomId, room.name)
  
  return prisma.room.update({
    where: { id: roomId },
    data: { qrCodeUrl },
  })
}

export async function bulkToggleRooms(roomIds: number[], isBlocked: boolean) {
  return prisma.room.updateMany({
    where: {
      id: { in: roomIds },
    },
    data: {
      isBlocked,
    },
  })
}

