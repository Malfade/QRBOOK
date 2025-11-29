import { prisma } from '../prisma'
import { hashPassword } from '../auth'

export async function getAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getUserById(userId: number) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

export async function getUserByName(name: string) {
  return prisma.user.findFirst({
    where: { name },
  })
}

export async function createUser(data: {
  name: string
  password: string
  role: 'student' | 'teacher' | 'admin'
}) {
  const hashedPassword = await hashPassword(data.password)
  
  return prisma.user.create({
    data: {
      name: data.name,
      hashedPassword,
      role: data.role,
    },
    select: {
      id: true,
      name: true,
      role: true,
      createdAt: true,
    },
  })
}

export async function updateUser(
  userId: number,
  data: {
    name?: string
    role?: 'student' | 'teacher' | 'admin'
    password?: string
  }
) {
  const updateData: {
    name?: string
    role?: 'student' | 'teacher' | 'admin'
    hashedPassword?: string
  } = {}
  
  if (data.name) updateData.name = data.name
  if (data.role) updateData.role = data.role
  if (data.password) updateData.hashedPassword = await hashPassword(data.password)

  return prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      role: true,
      updatedAt: true,
    },
  })
}

export async function deleteUser(userId: number) {
  return prisma.user.delete({
    where: { id: userId },
  })
}

export async function getUserStats(userId: number) {
  const [total, active, finished, cancelled] = await Promise.all([
    prisma.reservation.count({ where: { userId } }),
    prisma.reservation.count({ where: { userId, status: 'active' } }),
    prisma.reservation.count({ where: { userId, status: 'finished' } }),
    prisma.reservation.count({ where: { userId, status: 'cancelled' } }),
  ])

  return { total, active, finished, cancelled }
}

