import { prisma } from '../prisma'

export type AuditAction =
  | 'create_reservation'
  | 'cancel_reservation'
  | 'update_reservation'
  | 'update_room'
  | 'create_user'
  | 'login'
  | 'logout'

export async function createAuditLog(
  actorId: number | null,
  action: AuditAction,
  description?: string,
  payload?: Record<string, unknown>
) {
  return prisma.auditLog.create({
    data: {
      actorId,
      action,
      description,
      payload: payload || null,
    },
  })
}

export async function getAuditLogs(options?: {
  actorId?: number
  action?: AuditAction
  limit?: number
  offset?: number
}) {
  return prisma.auditLog.findMany({
    where: {
      actorId: options?.actorId,
      action: options?.action,
    },
    include: {
      actor: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: options?.limit || 100,
    skip: options?.offset || 0,
  })
}

export async function getRecentActivity(limit: number = 50) {
  return prisma.auditLog.findMany({
    include: {
      actor: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

