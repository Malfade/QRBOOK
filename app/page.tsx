import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { getDashboardStats } from '@/lib/services/reports'

export default async function HomePage() {
  const user = await getSession()
  const stats = await getDashboardStats()

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-left">
          <Link href="/" className="logo">QRBOOKS</Link>
        </div>
        
        <nav className="app-nav">
          <Link href="/" className="nav-link active">Главная</Link>
          <Link href="/rooms" className="nav-link">Кабинеты</Link>
          {user && <Link href="/dashboard" className="nav-link">Мои брони</Link>}
          {user?.role === 'admin' && (
            <Link href="/admin" className="nav-link">Админка</Link>
          )}
        </nav>

        <div className="auth-block">
          {user ? (
            <>
              <span className="user-chip">
                <span>{user.name}</span>
                <span className="user-chip__role">{user.role}</span>
              </span>
              <form action="/api/auth/logout" method="POST">
                <button type="submit" className="btn btn-tertiary">Выход</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-outline">Вход</Link>
              <Link href="/register" className="btn btn-primary">Регистрация</Link>
            </>
          )}
        </div>
      </header>

      <main className="app-main">
        <div className="page">
          <section className="hero">
            <div className="hero-text">
              <div className="hero-kicker">🎓 Колледж</div>
              <h1>Бронирование кабинетов через QR</h1>
              <p>
                Полнофункциональная система бронирования кабинетов колледжа. 
                Бронируйте через веб или сканируя QR-коды на дверях кабинетов.
              </p>

              <div className="hero-stats">
                <div className="hero-stat">
                  <div className="hero-stat__value">{stats.totalRooms}</div>
                  <div className="hero-stat__label">Кабинетов</div>
                </div>
                <div className="hero-stat">
                  <div className="hero-stat__value">{stats.activeReservations}</div>
                  <div className="hero-stat__label">Активных броней</div>
                </div>
                <div className="hero-stat">
                  <div className="hero-stat__value">{stats.totalUsers}</div>
                  <div className="hero-stat__label">Пользователей</div>
                </div>
              </div>

              <div className="hero-actions">
                <Link href="/rooms" className="btn btn-primary">
                  Посмотреть кабинеты
                </Link>
                {!user && (
                  <Link href="/register" className="btn btn-secondary">
                    Зарегистрироваться
                  </Link>
                )}
              </div>
            </div>

            <div className="hero-image">
              <div className="hero-card">
                <div className="hero-room">Каб. 101</div>
                <div className="hero-status">
                  <span>●</span> Доступен
                </div>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                  Отсканируйте QR-код на двери или забронируйте онлайн
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2>Возможности</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">📱</div>
                <h3>QR-код бронирование</h3>
                <p>Сканируйте QR на двери кабинета для быстрого бронирования</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🕐</div>
                <h3>Умное расписание</h3>
                <p>Автоматический расчёт свободных окон на 24 часа вперёд</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">👥</div>
                <h3>Роли пользователей</h3>
                <p>Студенты, преподаватели и администраторы с разными правами</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🛡️</div>
                <h3>Безопасность</h3>
                <p>JWT авторизация, защита от конфликтов бронирований</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

