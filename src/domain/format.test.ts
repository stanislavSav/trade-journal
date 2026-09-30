import { afterEach, describe, expect, it, vi } from 'vitest'
import { formatBagDates, formatDate, formatPct, formatPrice, formatQty, formatUsd, todayIso } from './format'
import type { Side, Trade } from './types'

const MINUS = '−'

describe('formatPct', () => {
  it('shows one decimal with a sign', () => {
    expect(formatPct(6.66)).toBe('+6.7%')
    expect(formatPct(-14.5)).toBe(`${MINUS}14.5%`)
    expect(formatPct(250)).toBe('+250.0%')
  })

  it('shows zero without a sign', () => {
    expect(formatPct(0)).toBe('0.0%')
    expect(formatPct(-0.01)).toBe('0.0%')
  })

  it('shows null as a dash', () => {
    expect(formatPct(null)).toBe('—')
  })
})

describe('formatPrice', () => {
  it('uses no decimals at or above 1,000', () => {
    expect(formatPrice(12345.67)).toBe('12,346')
  })

  it('uses 2 decimals from 10 up to 1,000', () => {
    expect(formatPrice(45.6789)).toBe('45.68')
    expect(formatPrice(62.3)).toBe('62.30')
  })

  it('uses 4 decimals from 1 up to 10', () => {
    expect(formatPrice(3.14159)).toBe('3.1416')
  })

  it('uses 4 significant digits below 1', () => {
    expect(formatPrice(0.45678)).toBe('0.4568')
    expect(formatPrice(0.034567)).toBe('0.03457')
  })

  it('shows null as a dash and zero as 0', () => {
    expect(formatPrice(null)).toBe('—')
    expect(formatPrice(0)).toBe('0')
  })
})

describe('formatQty', () => {
  it('groups thousands and keeps at most 2 decimals at or above 1,000', () => {
    expect(formatQty(24680)).toBe('24,680')
    expect(formatQty(2468.137)).toBe('2,468.14')
    expect(formatQty(24680.000000000004)).toBe('24,680')
  })

  it('keeps at most 4 decimals from 1 up to 1,000', () => {
    expect(formatQty(12.5)).toBe('12.5')
    expect(formatQty(1.23456)).toBe('1.2346')
  })

  it('keeps up to 8 significant digits below 1, trailing zeros trimmed', () => {
    expect(formatQty(0.01234567)).toBe('0.01234567')
    expect(formatQty(0.625)).toBe('0.625')
    expect(formatQty(0.5)).toBe('0.5')
    expect(formatQty(0.30000000000000004)).toBe('0.3')
  })

  it('shows zero as 0', () => {
    expect(formatQty(0)).toBe('0')
  })
})

describe('formatUsd', () => {
  it('drops cents at or above $100', () => {
    expect(formatUsd(1234)).toBe('$1,234')
    expect(formatUsd(1000)).toBe('$1,000')
    expect(formatUsd(1234567.89)).toBe('$1,234,568')
    expect(formatUsd(999.5)).toBe('$1,000')
    expect(formatUsd(157.25)).toBe('$157')
  })

  it('shows two decimals below $100', () => {
    expect(formatUsd(12.34)).toBe('$12.34')
    expect(formatUsd(0.5)).toBe('$0.50')
    expect(formatUsd(99.5)).toBe('$99.50')
  })

  it('does not show cents when rounding reaches $100', () => {
    expect(formatUsd(99.999)).toBe('$100')
  })

  it('uses a real minus sign for negatives', () => {
    expect(formatUsd(-1234)).toBe(`${MINUS}$1,234`)
    expect(formatUsd(-12.5)).toBe(`${MINUS}$12.50`)
  })

  it('adds a sign when signed', () => {
    expect(formatUsd(1234, { signed: true })).toBe('+$1,234')
    expect(formatUsd(-1234, { signed: true })).toBe(`${MINUS}$1,234`)
    expect(formatUsd(157.04, { signed: true })).toBe('+$157')
    expect(formatUsd(12.5, { signed: true })).toBe('+$12.50')
  })

  it('shows zero without a sign, even when signed or when a tiny value rounds to zero', () => {
    expect(formatUsd(0, { signed: true })).toBe('$0.00')
    expect(formatUsd(-0.001, { signed: true })).toBe('$0.00')
    expect(formatUsd(-0.001)).toBe('$0.00')
  })

  it('shows null and non-finite values as a dash', () => {
    expect(formatUsd(null)).toBe('—')
    expect(formatUsd(Number.NaN)).toBe('—')
  })
})

describe('formatDate', () => {
  it('shows an ISO date as DD.MM.YY', () => {
    expect(formatDate('2026-06-03')).toBe('03.06.26')
    expect(formatDate('1999-12-31')).toBe('31.12.99')
  })

  it('shows an unknown date as ?', () => {
    expect(formatDate(null)).toBe('?')
  })
})

describe('formatBagDates', () => {
  const trade = (side: Side, date: string | null, createdAt: number): Trade => ({
    id: `t${createdAt}`,
    bagId: 'b',
    side,
    date,
    qty: 1,
    total: 1,
    createdAt,
    updatedAt: createdAt,
  })

  it('shows first – last date in calculation order', () => {
    expect(formatBagDates([trade('buy', '2025-11-26', 1), trade('buy', '2026-07-04', 2)])).toBe('26.11.25 – 04.07.26')
  })

  it('shows ? for an unknown end, so a single known date is not read as a same-day trade', () => {
    expect(formatBagDates([trade('buy', '2026-08-19', 1), trade('sell', null, 2)])).toBe('19.08.26 – ?')
    expect(formatBagDates([trade('buy', null, 1), trade('sell', '2025-09-30', 2)])).toBe('? – 30.09.25')
  })

  it('shows one date when all trades are on the same known day', () => {
    expect(formatBagDates([trade('buy', '2026-09-26', 1)])).toBe('26.09.26')
    expect(formatBagDates([trade('buy', '2026-06-03', 1), trade('buy', '2026-06-03', 2)])).toBe('03.06.26')
  })

  it('shows ? when there are no trades', () => {
    expect(formatBagDates([])).toBe('?')
  })
})

describe('todayIso', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the local date, zero-padded', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 5, 23, 30))
    expect(todayIso()).toBe('2026-01-05')
  })
})
