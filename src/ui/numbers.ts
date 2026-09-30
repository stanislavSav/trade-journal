const count = (s: string, ch: string) => s.split(ch).length - 1

/** "1,234,567" -> "1234567"; null when the groups are not thousands groups ("1,2,3"). */
function ungroup(whole: string, sep: string): string | null {
  const groups = whole.split(sep)
  return groups.slice(1).every((g) => /^\d{3}$/.test(g)) ? groups.join('') : null
}

function clean(text: string): string {
  return text.replace(/[\s\u00a0\u202f'\u2019_$]/g, '')
}

/**
 * Parse what people type on phones and desktops: "0,5", "0.5", "1 812", "1,234.56", "1.234,56".
 * A single separator is the decimal point; repeated ones are thousands separators.
 * Exception for money: "1,812" / "1.812" is $1812, since dollar amounts do not have 3 decimals.
 * Returns null for empty or invalid input.
 */
export function parseDecimal(text: string, kind: 'qty' | 'money' = 'qty'): number | null {
  let s = clean(text)
  if (s === '') return null
  if (kind === 'money' && isAmbiguousDecimal(s)) s = s.replace(/[.,]/, '')
  const commas = count(s, ',')
  const dots = count(s, '.')
  let parsed: string | null
  if (commas && dots) {
    const dec = s.lastIndexOf(',') > s.lastIndexOf('.') ? ',' : '.'
    const at = s.lastIndexOf(dec)
    const whole = s.slice(0, at)
    parsed = whole.includes(dec) ? null : ungroup(whole, dec === ',' ? '.' : ',')
    if (parsed !== null) parsed += `.${s.slice(at + 1)}`
  } else if (commas > 1 || dots > 1) {
    parsed = ungroup(s, commas > 1 ? ',' : '.')
  } else {
    parsed = s.replace(',', '.')
  }
  if (parsed === null || !/^(\d+\.?\d*|\.\d+)$/.test(parsed)) return null
  const n = Number(parsed)
  return Number.isFinite(n) ? n : null
}

/** "1,812" could mean 1812 or 1.812, so the form says how it was read. */
export function isAmbiguousDecimal(text: string): boolean {
  return /^[1-9]\d{0,2}[.,]\d{3}$/.test(clean(text))
}

/** A number as plain input text without float noise, e.g. 0.62500000000001 -> "0.625". */
export function toInputText(n: number): string {
  return n.toLocaleString('en-US', { useGrouping: false, maximumSignificantDigits: 12 })
}

/** Like toInputText, but 1.234 becomes "1.2340" so parseDecimal(…, 'money') does not read it as 1234. */
export function toMoneyInputText(n: number): string {
  const text = toInputText(n)
  return isAmbiguousDecimal(text) ? `${text}0` : text
}

/** CSS class for a signed amount; tiny values stay neutral. */
export function tone(value: number | null | undefined): string {
  if (value == null || Math.abs(value) < 0.005) return ''
  return value > 0 ? 'pos' : 'neg'
}
