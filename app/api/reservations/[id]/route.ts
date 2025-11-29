import { NextRequest, NextResponse } from 'next/server'
import { cancelReservation } from '@/lib/services/reservations'
import { requireAuth } from '@/lib/auth'
import { createAuditLog } from '@/lib/services/audit'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userOrResponse = await requireAuth(request)
    if (userOrResponse instanceof NextResponse) {
      return userOrResponse
    }

    const { id } = await params
    const reservationId = parseInt(id)

    const result = await cancelReservation(
      reservationId,
      userOrResponse.id,
      userOrResponse.role === 'admin'
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // Audit log
    await createAuditLog(
      userOrResponse.id,
      'cancel_reservation',
      `Cancelled reservation ${reservationId}`,
      { reservationId }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cancel reservation error:', error)
    return NextResponse.json(
      { error: 'Ошибка отмены брони' },
      { status: 500 }
    )
  }
}

