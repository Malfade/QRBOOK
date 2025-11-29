import { NextRequest, NextResponse } from 'next/server'
import { getRoomById, updateRoom, deleteRoom } from '@/lib/services/rooms'
import { requireRole } from '@/lib/auth'
import { createAuditLog } from '@/lib/services/audit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const roomId = parseInt(id)

    const room = await getRoomById(roomId)
    
    if (!room) {
      return NextResponse.json(
        { error: 'Кабинет не найден' },
        { status: 404 }
      )
    }

    return NextResponse.json({ room })
  } catch (error) {
    console.error('Get room error:', error)
    return NextResponse.json(
      { error: 'Ошибка получения кабинета' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Only admin can update rooms
    const userOrResponse = await requireRole(request, ['admin'])
    if (userOrResponse instanceof NextResponse) {
      return userOrResponse
    }

    const { id } = await params
    const roomId = parseInt(id)
    const body = await request.json()

    const room = await updateRoom(roomId, body)

    // Audit log
    await createAuditLog(
      userOrResponse.id,
      'update_room',
      `Updated room ${room.name}`,
      { roomId, changes: body }
    )

    return NextResponse.json({ room })
  } catch (error) {
    console.error('Update room error:', error)
    return NextResponse.json(
      { error: 'Ошибка обновления кабинета' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Only admin can delete rooms
    const userOrResponse = await requireRole(request, ['admin'])
    if (userOrResponse instanceof NextResponse) {
      return userOrResponse
    }

    const { id } = await params
    const roomId = parseInt(id)

    await deleteRoom(roomId)

    // Audit log
    await createAuditLog(
      userOrResponse.id,
      'update_room',
      `Deleted room ${roomId}`,
      { roomId }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete room error:', error)
    return NextResponse.json(
      { error: 'Ошибка удаления кабинета' },
      { status: 500 }
    )
  }
}

