import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create users
  const adminPassword = await hashPassword('admin1234')
  const teacherPassword = await hashPassword('teacher1234')
  const studentPassword = await hashPassword('student1234')

  const admin = await prisma.user.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'admin',
      hashedPassword: adminPassword,
      role: 'admin',
    },
  })

  const teacher = await prisma.user.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'teacher',
      hashedPassword: teacherPassword,
      role: 'teacher',
    },
  })

  const student = await prisma.user.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: 'student',
      hashedPassword: studentPassword,
      role: 'student',
    },
  })

  console.log('✅ Users created:', { admin, teacher, student })

  // Create rooms
  const rooms = []
  for (let i = 1; i <= 10; i++) {
    const room = await prisma.room.upsert({
      where: { id: i },
      update: {},
      create: {
        name: `Каб. ${100 + i}`,
        type: i <= 7 ? 'public' : i === 8 ? 'admin' : 'service',
        bookingStart: '08:00',
        bookingEnd: '20:00',
        isBlocked: false,
      },
    })
    rooms.push(room)
  }

  console.log(`✅ ${rooms.length} rooms created`)

  console.log('🎉 Seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

