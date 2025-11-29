import { z } from 'zod'

export const loginSchema = z.object({
  name: z.string().min(1, 'Имя обязательно'),
  password: z.string().min(6, 'Пароль должен быть минимум 6 символов'),
})

export const registerSchema = z.object({
  name: z.string().min(3, 'Имя должно быть минимум 3 символа'),
  password: z.string().min(6, 'Пароль должен быть минимум 6 символов'),
  role: z.enum(['student', 'teacher'], {
    errorMap: () => ({ message: 'Роль должна быть student или teacher' }),
  }),
})

export const reservationSchema = z.object({
  roomId: z.number().int().positive(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
}).refine(
  (data) => new Date(data.endTime) > new Date(data.startTime),
  { message: 'Время окончания должно быть позже времени начала', path: ['endTime'] }
)

export const roomSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  type: z.enum(['public', 'admin', 'service']),
  bookingStart: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  bookingEnd: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  isBlocked: z.boolean().optional(),
})

export const updateReservationSchema = z.object({
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  status: z.enum(['active', 'finished', 'cancelled']).optional(),
  userId: z.number().int().positive().optional(),
})

export const updateUserSchema = z.object({
  name: z.string().min(3).optional(),
  role: z.enum(['student', 'teacher', 'admin']).optional(),
  password: z.string().min(6).optional(),
})

