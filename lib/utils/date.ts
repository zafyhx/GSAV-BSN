import { format, formatDistanceToNow, isToday, isYesterday, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  if (isToday(d)) return 'Hari ini'
  if (isYesterday(d)) return 'Kemarin'
  return format(d, 'd MMMM yyyy', { locale: id })
}

export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'd MMM', { locale: id })
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'HH:mm')
}

export function formatRelative(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  if (isToday(d)) return formatTime(d)
  return formatDistanceToNow(d, { addSuffix: true, locale: id })
}

export function getCurrentMonthRange(): { start: Date; end: Date } {
  const now = new Date()
  return {
    start: startOfMonth(now),
    end: endOfMonth(now),
  }
}

export function getDaysInMonth(): Date[] {
  const { start, end } = getCurrentMonthRange()
  return eachDayOfInterval({ start, end })
}

export function getDayOfMonth(): number {
  return new Date().getDate()
}

export function getDaysLeftInMonth(): number {
  const now = new Date()
  const end = endOfMonth(now)
  return end.getDate() - now.getDate()
}

export function getTotalDaysInMonth(): number {
  return endOfMonth(new Date()).getDate()
}

/** Returns a local datetime string in format 'YYYY-MM-DDTHH:mm' — safe for datetime-local inputs */
export function toLocalDateTimeString(date: Date = new Date()): string {
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

export function groupByDate<T extends { transaction_date: string }>(
  items: T[]
): { date: string; label: string; items: T[] }[] {
  const groups: Record<string, T[]> = {}

  items.forEach((item) => {
    const d = parseISO(item.transaction_date)
    const key = format(d, 'yyyy-MM-dd')
    if (!groups[key]) groups[key] = []
    groups[key].push(item)
  })

  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({
      date,
      label: formatDate(date),
      items,
    }))
}
