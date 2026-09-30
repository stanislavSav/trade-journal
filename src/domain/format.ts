// Display formatting. All functions are pure; none throw on odd input.
import type { Trade } from './types'

const DASH = '—'
const MINUS = '−'

function grouped(value: number, minDecimals: number, maxDecimals: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: minDecimals, maximumFractionDigits: maxDecimals })
}

// Sign is decided on the rounded value so a tiny negative never prints as "−$0.00".
function sign(rounded: number, signed: boolean | undefined): string {
  if (rounded < 0) return MINUS
  return signed && rounded > 0 ? '+' : ''
}

/** "$1,234" / "$157" (no cents at or above $100), "$12.34" below; signed: "+$157" / "−$1,234" (U+2212). null -> "—". */
export function formatUsd(value: number | null, opts?: { signed?: boolean }): string {
  if (value === null || !Number.isFinite(value)) return DASH
  const digits = Math.abs(Number(value.toFixed(2))) >= 100 ? 0 : 2
  const rounded = Number(value.toFixed(digits))
  return `${sign(rounded, opts?.signed)}$${grouped(Math.abs(rounded), digits, digits)}`
}

/** Coin quantity: up to 8 significant decimals for small numbers, thousands separators, trailing zeros trimmed. */
export function formatQty(value: number): string {
  if (!Number.isFinite(value)) return DASH
  const abs = Math.abs(value)
  if (abs >= 1000) return grouped(value, 0, 2)
  if (abs >= 1) return grouped(value, 0, 4)
  return value.toLocaleString('en-US', { maximumSignificantDigits: 8 })
}

/** Per-coin price with sensible precision: 12,346 · 45.68 · 3.1416 · 0.03457. null -> "—". */
export function formatPrice(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return DASH
  if (value === 0) return '0'
  const abs = Math.abs(value)
  if (abs >= 1000) return grouped(value, 0, 0)
  if (abs >= 10) return grouped(value, 2, 2)
  if (abs >= 1) return grouped(value, 4, 4)
  return value.toLocaleString('en-US', { minimumSignificantDigits: 4, maximumSignificantDigits: 4 })
}

/** "+6.7%" / "−14.5%". null -> "—". */
export function formatPct(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return DASH
  const rounded = Number(value.toFixed(1))
  return `${sign(rounded, true)}${grouped(Math.abs(rounded), 1, 1)}%`
}

/** ISO "2026-06-03" -> "03.06.26"; null -> "?". */
export function formatDate(iso: string | null): string {
  if (iso === null) return '?'
  const match = /^\d{2}(\d{2})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return iso
  const [, yy, mm, dd] = match
  return `${dd}.${mm}.${yy}`
}

/**
 * Date range of a bag's trades, given in calculation order (BagSummary.trades): "26.11.25 – 04.07.26".
 * The ends are the first and last trade, so an unknown-date sell shows as "19.08.26 – ?".
 * One known day shows once: "26.09.26".
 */
export function formatBagDates(trades: Trade[]): string {
  const first = trades[0]
  const last = trades[trades.length - 1]
  if (!first || !last) return '?'
  if (first.date !== null && first.date === last.date) return formatDate(first.date)
  return `${formatDate(first.date)} – ${formatDate(last.date)}`
}

/** Today's local date as ISO "YYYY-MM-DD". */
export function todayIso(): string {
  const now = new Date()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${mm}-${dd}`
}
