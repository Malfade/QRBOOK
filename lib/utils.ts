export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function isTimeInWindow(
  time: Date,
  windowStart?: string | null,
  windowEnd?: string | null
): boolean {
  if (!windowStart || !windowEnd) return true
  
  const timeStr = formatTime(time)
  return timeStr >= windowStart && timeStr <= windowEnd
}

export function parseTimeString(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return { hours, minutes }
}

export function createDateWithTime(date: Date, timeStr: string): Date {
  const { hours, minutes } = parseTimeString(timeStr)
  const result = new Date(date)
  result.setHours(hours, minutes, 0, 0)
  return result
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

