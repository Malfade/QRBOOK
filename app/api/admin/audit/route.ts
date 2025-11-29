import { NextRequest, NextResponse } from 'next/server'
import { getRecentActivity } from '@/lib/services/audit'
import { requireRole } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Only admin can view audit logs
    const userOrResponse = await requireRole(request, ['admin'])
    if (userOrResponse instanceof NextResponse) {
      return userOrResponse
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    const logs = await getRecentActivity(limit)

    return NextResponse.json({ logs })
  } catch (error) {
    console.error('Get audit logs error:', error)
    return NextResponse.json(
      { error: 'Ошибка получения журнала' },
      { status: 500 }
    )
  }
}

