import { NextRequest, NextResponse } from 'next/server'
import { getDashboardStats, getReservationStats, getUserStats } from '@/lib/services/reports'
import { requireRole } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Only admin can view stats
    const userOrResponse = await requireRole(request, ['admin'])
    if (userOrResponse instanceof NextResponse) {
      return userOrResponse
    }

    const [dashboard, reservations, users] = await Promise.all([
      getDashboardStats(),
      getReservationStats(),
      getUserStats(),
    ])

    return NextResponse.json({
      dashboard,
      reservations,
      users,
    })
  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json(
      { error: 'Ошибка получения статистики' },
      { status: 500 }
    )
  }
}

