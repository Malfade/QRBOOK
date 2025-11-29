import { NextRequest, NextResponse } from 'next/server'
import { getUserByName } from '@/lib/services/users'
import { verifyPassword, signToken, setAuthCookie } from '@/lib/auth'
import { createAuditLog } from '@/lib/services/audit'
import { loginSchema } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate
    const result = loginSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, password } = result.data

    // Find user
    const user = await getUserByName(name)
    if (!user) {
      return NextResponse.json(
        { error: 'Неверное имя или пароль' },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await verifyPassword(password, user.hashedPassword)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Неверное имя или пароль' },
        { status: 401 }
      )
    }

    // Create token
    const token = await signToken({
      id: user.id,
      name: user.name,
      role: user.role,
    })

    // Set cookie
    await setAuthCookie(token)

    // Audit log
    await createAuditLog(user.id, 'login', `User ${name} logged in`)

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Ошибка при входе' },
      { status: 500 }
    )
  }
}

