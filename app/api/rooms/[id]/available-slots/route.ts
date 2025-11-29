import { NextRequest, NextResponse } from 'next/server'
import { getAvailableSlots } from '@/lib/services/reservations'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const roomId = parseInt(id)
    const { searchParams } = new URL(request.url)
    
    const dateParam = searchParams.get('date')
    const date = dateParam ? new Date(dateParam) : new Date()

    const slots = await getAvailableSlots(roomId, date)

    return NextResponse.json({ slots })
  } catch (error) {
    console.error('Get available slots error:', error)
    return NextResponse.json(
      { error: 'Ошибка получения свободных слотов' },
      { status: 500 }
    )
  }
}

