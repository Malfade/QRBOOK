import { NextRequest, NextResponse } from 'next/server'
import { createReservation, getUserReservations } from '@/lib/services/reservations'
import { requireAuth } from '@/lib/auth'
import { reservationSchema } from '@/lib/validation'
import { createAuditLog } from '@/lib/services/audit'

export async function GET(request: NextRequest) {
  try {
    const userOrResponse = await requireAuth(request)
    if (userOrResponse instanceof NextResponse) {
      return userOrResponse
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as 'active' | 'finished' | 'cancelled' | null

    const reservations = await getUserReservations(userOrResponse.id, {
      status: status || undefined,
      includeRoom: true,
    })

    return NextResponse.json({ reservations })
  } catch (error) {
    console.error('Get reservations error:', error)
    return NextResponse.json(
      { error: 'Ошибка получения броней' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userOrResponse = await requireAuth(request)
    if (userOrResponse instanceof NextResponse) {
      return userOrResponse
    }

    const body = await request.json()
    
    // Validate
    const result = reservationSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { roomId, startTime, endTime } = result.data

    const reservation = await createReservation(
      roomId,
      userOrResponse.id,
      new Date(startTime),
      new Date(endTime)
    )

    // Audit log
    await createAuditLog(
      userOrResponse.id,
      'create_reservation',
      `Created reservation for room ${reservation.room.name}`,
      { reservationId: reservation.id, roomId }
    )

    return NextResponse.json({ reservation }, { status: 201 })
  } catch (error: any) {
    console.error('Create reservation error:', error)
    return NextResponse.json(
      { error: error.message || 'Ошибка создания брони' },
      { status: 400 }
    )
  }
}

