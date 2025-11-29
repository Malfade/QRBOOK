import { prisma } from '../prisma'

export async function getDashboardStats() {
  const [
    totalRooms,
    totalReservations,
    activeReservations,
    totalUsers,
    blockedRooms,
  ] = await Promise.all([
    prisma.room.count(),
    prisma.reservation.count(),
    prisma.reservation.count({ where: { status: 'active' } }),
    prisma.user.count(),
    prisma.room.count({ where: { isBlocked: true } }),
  ])

  return {
    totalRooms,
    totalReservations,
    activeReservations,
    totalUsers,
    blockedRooms,
  }
}

export async function getReservationStats() {
  const [active, finished, cancelled] = await Promise.all([
    prisma.reservation.count({ where: { status: 'active' } }),
    prisma.reservation.count({ where: { status: 'finished' } }),
    prisma.reservation.count({ where: { status: 'cancelled' } }),
  ])

  return { active, finished, cancelled }
}

export async function getUserStats() {
  const [students, teachers, admins] = await Promise.all([
    prisma.user.count({ where: { role: 'student' } }),
    prisma.user.count({ where: { role: 'teacher' } }),
    prisma.user.count({ where: { role: 'admin' } }),
  ])

  return { students, teachers, admins }
}

export async function getRoomUtilization(roomId?: number) {
  const where = roomId ? { roomId } : {}
  
  const [total, active] = await Promise.all([
    prisma.reservation.count({ where }),
    prisma.reservation.count({ where: { ...where, status: 'active' } }),
  ])

  return { total, active, utilizationRate: total > 0 ? (active / total) * 100 : 0 }
}

export async function getTopRooms(limit: number = 10) {
  const rooms = await prisma.room.findMany({
    include: {
      _count: {
        select: { reservations: true },
      },
    },
    orderBy: {
      reservations: {
        _count: 'desc',
      },
    },
    take: limit,
  })

  return rooms.map((room) => ({
    id: room.id,
    name: room.name,
    type: room.type,
    reservationCount: room._count.reservations,
  }))
}

export async function getTopUsers(limit: number = 10) {
  const users = await prisma.user.findMany({
    where: {
      role: { in: ['student', 'teacher'] },
    },
    include: {
      _count: {
        select: { reservations: true },
      },
    },
    orderBy: {
      reservations: {
        _count: 'desc',
      },
    },
    take: limit,
  })

  return users.map((user) => ({
    id: user.id,
    name: user.name,
    role: user.role,
    reservationCount: user._count.reservations,
  }))
}

