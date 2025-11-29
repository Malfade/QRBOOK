import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

export interface SessionUser {
  id: number
  name: string
  role: 'student' | 'teacher' | 'admin'
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function signToken(user: SessionUser): Promise<string> {
  return new SignJWT({ user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET)
    return verified.payload.user as SessionUser
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  
  if (!token) return null
  
  return verifyToken(token)
}

export async function requireAuth(
  request: NextRequest
): Promise<SessionUser | NextResponse> {
  const token = request.cookies.get('token')?.value
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const user = await verifyToken(token)
  
  if (!user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
  
  return user
}

export async function requireRole(
  request: NextRequest,
  allowedRoles: Array<'student' | 'teacher' | 'admin'>
): Promise<SessionUser | NextResponse> {
  const userOrResponse = await requireAuth(request)
  
  if (userOrResponse instanceof NextResponse) {
    return userOrResponse
  }
  
  if (!allowedRoles.includes(userOrResponse.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  return userOrResponse
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('token')
}

