import { NextRequest, NextResponse } from 'next/server'
import { createUser, getUserByName } from '@/lib/services/users'
import { signToken, setAuthCookie } from '@/lib/auth'
import { createAuditLog } from '@/lib/services/audit'
import { registerSchema } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate
    const result = registerSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, password, role } = result.data

    // Check if user exists
    const existing = await getUserByName(name)
    if (existing) {
      return NextResponse.json(
        { error: 'Пользователь с таким именем уже существует' },
        { status: 400 }
      )
    }

    // Create user
    const user = await createUser({ name, password, role })

    // Create token
    const token = await signToken({
      id: user.id,
      name: user.name,
      role: user.role,
    })

    // Set cookie
    await setAuthCookie(token)

    // Audit log
    await createAuditLog(user.id, 'create_user', `User ${name} registered`)

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Ошибка при регистрации' },
      { status: 500 }
    )
  }
}

