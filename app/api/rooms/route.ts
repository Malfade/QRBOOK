import { NextRequest, NextResponse } from 'next/server'
import { getAllRooms, createRoom } from '@/lib/services/rooms'
import { requireRole } from '@/lib/auth'
import { roomSchema } from '@/lib/validation'
import { createAuditLog } from '@/lib/services/audit'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as 'public' | 'admin' | 'service' | null
    const includeBlocked = searchParams.get('include_blocked') === 'true'

    const rooms = await getAllRooms({
      type: type || undefined,
      includeBlocked,
    })

    return NextResponse.json({ rooms })
  } catch (error) {
    console.error('Get rooms error:', error)
    return NextResponse.json(
      { error: 'Ошибка получения списка кабинетов' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Only admin can create rooms
    const userOrResponse = await requireRole(request, ['admin'])
    if (userOrResponse instanceof NextResponse) {
      return userOrResponse
    }

    const body = await request.json()
    
    // Validate
    const result = roomSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const room = await createRoom(result.data)

    // Audit log
    await createAuditLog(
      userOrResponse.id,
      'update_room',
      `Created room ${room.name}`,
      { roomId: room.id }
    )

    return NextResponse.json({ room }, { status: 201 })
  } catch (error) {
    console.error('Create room error:', error)
    return NextResponse.json(
      { error: 'Ошибка создания кабинета' },
      { status: 500 }
    )
  }
}

