// Form value helpers shared by the trade forms (kept out of the .tsx files so Fast Refresh works).
import { todayIso } from '../domain'
import { isAmbiguousDecimal, parseDecimal } from './numbers'

export const msgId = (id: string) => `${id}-msg`

export interface Amount {
  value: number | null
  error: string | null
}

/** Positive amount from free text. Empty input is "missing", not an error. */
export function readAmount(text: string, kind: 'qty' | 'money'): Amount {
  if (text.trim() === '') return { value: null, error: null }
  const value = parseDecimal(text, kind)
  if (value === null) return { value: null, error: 'Not a number' }
  if (value <= 0) return { value: null, error: 'Must be more than 0' }
  return { value, error: null }
}

export function dateError(date: string): string | null {
  return date !== '' && date > todayIso() ? 'Date is in the future' : null
}

/** Hint that shows how an ambiguous entry like "1,812" was read. */
export function readAsHint(text: string, value: number | null, show: (n: number) => string): string | null {
  return value !== null && isAmbiguousDecimal(text) ? `read as ${show(value)}` : null
}
