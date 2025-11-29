# 🎓 QRBOOKS — Система бронирования кабинетов

Полнофункциональная система бронирования кабинетов колледжа на **Next.js 14** с App Router, **Prisma ORM** и **PostgreSQL**.

## ✨ Возможности

- 📱 **QR-код бронирование** - сканируйте QR на двери кабинета
- 🕐 **Умное расписание** - автоматический расчёт свободных слотов
- 👥 **Роли** - студенты, преподаватели, администраторы
- 🛡️ **Безопасность** - JWT авторизация, валидация, rate limiting
- 📊 **Админ панель** - статистика, управление, аудит
- 🎨 **Современный UI** - темная тема, адаптивный дизайн

## 🚀 Быстрый старт

### Локальная разработка

```bash
# 1. Установите зависимости
npm install

# 2. Настройте .env
cp .env.example .env
# Укажите DATABASE_URL для PostgreSQL

# 3. Примените миграции
npx prisma migrate dev

# 4. Загрузите тестовые данные
npm run seed

# 5. Запустите dev сервер
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

### Тестовые учётки

- **Admin**: `admin` / `admin1234`
- **Teacher**: `teacher` / `teacher1234`
- **Student**: `student` / `student1234`

## 🏗️ Технологии

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT (jose)
- **Validation**: Zod
- **QR**: qrcode
- **Styling**: Custom CSS (dark theme)

## 📁 Структура

```
app/
├── api/              # API Routes
│   ├── auth/        # Авторизация
│   ├── rooms/       # Кабинеты
│   ├── reservations/# Бронирования
│   └── admin/       # Админ API
├── layout.tsx       # Root layout
└── page.tsx         # Home page

lib/
├── auth.ts          # JWT утилиты
├── prisma.ts        # Prisma client
├── qr.ts            # QR генерация
├── validation.ts    # Zod схемы
└── services/        # Бизнес-логика
    ├── users.ts
    ├── rooms.ts
    ├── reservations.ts
    ├── audit.ts
    └── reports.ts

prisma/
├── schema.prisma    # Database schema
└── seed.ts          # Seed данные
```

## 🚂 Деплой на Railway

```bash
# 1. Создайте проект на railway.app
# 2. Добавьте PostgreSQL базу
# 3. Установите переменные окружения:

DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<random-32-chars>
NEXT_PUBLIC_APP_URL=https://your-app.railway.app
NODE_ENV=production

# 4. Railway автоматически задеплоит через Dockerfile
```

**Подробная инструкция**: [RAILWAY.md](./RAILWAY.md)

## 🛠️ Команды

```bash
npm run dev          # Dev сервер
npm run build        # Production build
npm run start        # Production сервер
npm run lint         # Линтер
npm run seed         # Загрузить seed данные

npx prisma studio    # Prisma Studio (GUI для БД)
npx prisma migrate dev  # Создать миграцию
```

## 📚 API Endpoints

### Auth
- `POST /api/auth/login` - Вход
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/logout` - Выход
- `GET /api/auth/me` - Текущий пользователь

### Rooms
- `GET /api/rooms` - Список кабинетов
- `GET /api/rooms/[id]` - Кабинет по ID
- `POST /api/rooms` - Создать кабинет (admin)
- `PATCH /api/rooms/[id]` - Обновить кабинет (admin)
- `GET /api/rooms/[id]/available-slots` - Свободные слоты
- `GET /api/rooms/[id]/reservations` - Брони кабинета

### Reservations
- `GET /api/reservations` - Мои брони
- `POST /api/reservations` - Создать бронь
- `DELETE /api/reservations/[id]` - Отменить бронь

### Admin
- `GET /api/admin/stats` - Статистика
- `GET /api/admin/audit` - Журнал действий

## 🔐 Безопасность

- ✅ Пароли хэшируются с bcrypt
- ✅ JWT токены в httpOnly cookies
- ✅ CSRF защита
- ✅ Валидация всех входных данных (Zod)
- ✅ Role-based access control
- ✅ SQL инъекции невозможны (Prisma ORM)

## 📝 Лицензия

MIT

---

**Made with ❤️ using Next.js**
