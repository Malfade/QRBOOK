import { NextResponse } from 'next/server'
import { getSession, clearAuthCookie } from '@/lib/auth'
import { createAuditLog } from '@/lib/services/audit'

export async function POST() {
  try {
    const user = await getSession()
    
    if (user) {
      await createAuditLog(user.id, 'logout', `User ${user.name} logged out`)
    }

    await clearAuthCookie()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Ошибка при выходе' },
      { status: 500 }
    )
  }
}

