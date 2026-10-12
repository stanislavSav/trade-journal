// Form value helpers shared by the trade forms (kept out of the .tsx files so Fast Refresh works).
// They return codes and formatted numbers; the forms turn them into text in the UI language.
import { todayIso } from '../domain'
import type { Messages } from '../i18n'
import { isAmbiguousDecimal, parseDecimal } from './numbers'

export const msgId = (id: string) => `${id}-msg`

export type AmountError = 'notNumber' | 'notPositive'

export interface Amount {
  value: number | null
  error: AmountError | null
}

/** Positive amount from free text. Empty input is "missing", not an error. */
export function readAmount(text: string, kind: 'qty' | 'money'): Amount {
  if (text.trim() === '') return { value: null, error: null }
  const value = parseDecimal(text, kind)
  if (value === null) return { value: null, error: 'notNumber' }
  if (value <= 0) return { value: null, error: 'notPositive' }
  return { value, error: null }
}

export function dateError(date: string): 'future' | null {
  return date !== '' && date > todayIso() ? 'future' : null
}

/** How an ambiguous entry like "1,812" was read, as a formatted number (the form adds "read as"); else null. */
export function readAsHint(text: string, value: number | null, show: (n: number) => string): string | null {
  return value !== null && isAmbiguousDecimal(text) ? show(value) : null
}

export function amountErrorText(t: Messages, error: AmountError | null): string | null {
  if (error === 'notNumber') return t.trade.notNumber
  if (error === 'notPositive') return t.trade.notPositive
  return null
}

export function dateErrorText(t: Messages, date: string): string | null {
  return dateError(date) === 'future' ? t.trade.dateInFuture : null
}

/** "read as $1,812" under an ambiguous entry, or null. */
export function readAsText(t: Messages, text: string, value: number | null, show: (n: number) => string): string | null {
  const shown = readAsHint(text, value, show)
  return shown === null ? null : t.trade.readAs({ value: shown })
}
