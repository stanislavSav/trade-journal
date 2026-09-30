import { formatDate } from '../domain'

const pad = (n: number) => String(n).padStart(2, '0')

/** Local calendar date of a timestamp as ISO "YYYY-MM-DD". */
export function localIso(ms: number): string {
  const d = new Date(ms)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function formatClock(ms: number): string {
  const d = new Date(ms)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** "14:02" for today, "28.09.26 14:02" for other days. */
export function formatStamp(ms: number, now = Date.now()): string {
  const day = localIso(ms)
  return day === localIso(now) ? formatClock(ms) : `${formatDate(day)} ${formatClock(ms)}`
}
