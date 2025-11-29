import { NextRequest, NextResponse } from 'next/server'
import { getRoomReservations } from '@/lib/services/reservations'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const roomId = parseInt(id)
    const { searchParams } = new URL(request.url)
    
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const status = searchParams.get('status') as 'active' | 'finished' | 'cancelled' | null

    const reservations = await getRoomReservations(roomId, {
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      status: status || undefined,
    })

    return NextResponse.json({ reservations })
  } catch (error) {
    console.error('Get room reservations error:', error)
    return NextResponse.json(
      { error: 'Ошибка получения броней кабинета' },
      { status: 500 }
    )
  }
}

