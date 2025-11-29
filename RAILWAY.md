# 🚂 Деплой QRBOOK на Railway (Next.js версия)

## Быстрый старт (5 минут)

### 1. Создайте проект на Railway

1. Зайдите на [railway.app](https://railway.app/)
2. Нажмите **"New Project"**
3. Выберите **"Deploy from GitHub repo"**
4. Выберите ваш репозиторий

### 2. Добавьте PostgreSQL

1. Нажмите **"+ New"**
2. Выберите **"Database"** → **"Add PostgreSQL"**
3. Railway автоматически создаст базу данных

### 3. Настройте переменные окружения

В разделе **Variables** добавьте:

```bash
# Database (автоматически из PostgreSQL сервиса)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT Secret (сгенерируйте случайную строку)
JWT_SECRET=jgf64kciufkgmvbndls7ujiokp0fbnhby6
# Генерация: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# App URLs (замените после первого деплоя на реальный URL)
NEXT_PUBLIC_APP_URL=https://qrbook-production.up.railway.app
NEXT_PUBLIC_QR_BASE_URL=https://qrbook-production.up.railway.app/qr

# Node Environment
NODE_ENV=production
```

### 4. Деплой

Railway автоматически:
- Обнаружит `Dockerfile`
- Соберет Docker образ
- Запустит миграции Prisma
- Запустит seed данные (если БД пустая)
- Запустит Next.js приложение

### 5. После первого деплоя

1. Получите реальный URL вашего приложения (например: `https://qrbook-production-xxxx.up.railway.app`)
2. Обновите переменные:
   ```bash
   NEXT_PUBLIC_APP_URL=https://qrbook-production-xxxx.up.railway.app
   NEXT_PUBLIC_QR_BASE_URL=https://qrbook-production-xxxx.up.railway.app/qr
   ```
3. Пересоберите приложение (Railway сделает это автоматически)

### 6. Проверка

- ✅ Откройте ваш URL
- ✅ Войдите: `admin` / `admin1234`
- ✅ Проверьте функционал

---

## 🔑 Тестовые учётки

| Роль    | Логин   | Пароль      |
|---------|---------|-------------|
| Admin   | admin   | admin1234   |
| Teacher | teacher | teacher1234 |
| Student | student | student1234 |

**⚠️ Обязательно смените пароли в production!**

---

## 🔧 Структура проекта

```
QRBOOK/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/         # Авторизация
│   │   ├── rooms/        # Кабинеты
│   │   ├── reservations/ # Бронирования
│   │   └── admin/        # Админ API
│   ├── layout.tsx        # Главный layout
│   └── page.tsx          # Главная страница
├── lib/                   # Библиотеки
│   ├── auth.ts           # JWT авторизация
│   ├── prisma.ts         # Prisma client
│   ├── qr.ts             # QR генерация
│   ├── validation.ts     # Zod схемы
│   └── services/         # Бизнес-логика
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed данные
├── Dockerfile            # Railway Dockerfile
├── package.json
└── next.config.js
```

---

## 🐛 Troubleshooting

### Проблема: Database connection failed

**Решение:**
```bash
# Проверьте что DATABASE_URL установлен
railway variables | grep DATABASE_URL

# Должно быть: DATABASE_URL=${{Postgres.DATABASE_URL}}
```

### Проблема: Prisma migrations не применяются

**Решение:**
```bash
# Вручную примените миграции через Railway CLI
railway run npx prisma migrate deploy
railway run npm run seed
```

### Проблема: QR коды не генерируются

**Решение:**
Проверьте что `NEXT_PUBLIC_APP_URL` установлен правильно

---

## 📊 Railway CLI

```bash
# Установка
npm i -g @railway/cli

# Логин
railway login

# Просмотр логов
railway logs

# Выполнение команд
railway run npx prisma studio
railway run npm run seed

# Подключение к БД
railway connect Postgres
```

---

## ✅ Преимущества Next.js версии

- ✅ **Один сервис** вместо двух (backend + frontend)
- ✅ **Проще деплой** - один Docker образ
- ✅ **Server Components** - быстрая загрузка
- ✅ **API Routes** - встроенный backend
- ✅ **TypeScript** - типобезопасность везде
- ✅ **Prisma ORM** - современная работа с БД
- ✅ **Меньше затрат** - меньше ресурсов Railway

---

**Время деплоя**: ~5-10 минут  
**Стоимость**: $5 бесплатных кредитов/месяц

*Готово к production!* 🎉

