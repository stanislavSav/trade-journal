import { describe, expect, it } from 'vitest'
import { summarizeBag } from '../domain/portfolio'
import type { Bag, Side, Trade } from '../domain/types'
import { realizedOf } from './portfolioView'

const bag = (id: string): Bag => ({ id, accountId: 'cs', symbol: 'BTC', name: id, updatedAt: 1 })
const trade = (bagId: string, side: Side, qty: number, total: number, n: number): Trade => ({
  id: `${bagId}-${n}`,
  bagId,
  side,
  date: `2026-06-0${n}`,
  qty,
  total,
  createdAt: n,
  updatedAt: n,
})

describe('realizedOf', () => {
  // b1: buy 2 for 100, sell 1 for 80 → +30, still open. b2: buy 1 for 50, sell 1 for 40 → −10, closed.
  const b1 = summarizeBag(bag('b1'), [trade('b1', 'buy', 2, 100, 1), trade('b1', 'sell', 1, 80, 2)])
  const b2 = summarizeBag(bag('b2'), [trade('b2', 'buy', 1, 50, 1), trade('b2', 'sell', 1, 40, 2)])

  it('sums the realized P/L of the given bags only', () => {
    expect(realizedOf([b1, b2])).toBe(20)
    expect(realizedOf([b1])).toBe(30)
    expect(realizedOf([b2])).toBe(-10)
  })

  it('is 0 for no bags', () => {
    expect(realizedOf([])).toBe(0)
  })
})
