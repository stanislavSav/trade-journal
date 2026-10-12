import { describe, expect, it } from 'vitest'
import { orderTrades, summarizeAccount, summarizeBag, valuePosition } from './portfolio'
import type { Bag, Journal, Side, Trade } from './types'

const bag: Bag = { id: 'b1', accountId: 'cs', symbol: 'POL', name: 'Long-term', updatedAt: 1 }

// Each new trade gets a later createdAt, like trades entered one after another.
let seq = 0

function trade(side: Side, date: string | null, qty: number, total: number, extra: Partial<Trade> = {}): Trade {
  seq += 1
  const id = `t${String(seq).padStart(3, '0')}`
  return { id, bagId: 'b1', side, date, qty, total, createdAt: seq, updatedAt: seq, ...extra }
}

const ids = (trades: Trade[]) => trades.map((t) => t.id)

describe('orderTrades', () => {
  it('orders dated trades by date, unknown-date buys first and unknown-date sells last', () => {
    const lateSell = trade('sell', null, 1, 1, { id: 'late-sell' })
    const july = trade('buy', '2026-07-01', 1, 1, { id: 'july' })
    const earlyBuy = trade('buy', null, 1, 1, { id: 'early-buy' })
    const june = trade('sell', '2026-06-01', 1, 1, { id: 'june' })
    expect(ids(orderTrades([lateSell, july, earlyBuy, june]))).toEqual(['early-buy', 'june', 'july', 'late-sell'])
  })

  it('breaks ties by createdAt, then id', () => {
    const a = trade('buy', '2026-06-01', 1, 1, { id: 'a', createdAt: 5 })
    const b = trade('buy', '2026-06-01', 1, 1, { id: 'b', createdAt: 5 })
    const c = trade('buy', '2026-06-01', 1, 1, { id: 'c', createdAt: 1 })
    expect(ids(orderTrades([b, a, c]))).toEqual(['c', 'a', 'b'])
  })

  it('does not mutate the input', () => {
    const input = [trade('buy', '2026-07-01', 1, 1), trade('buy', '2026-06-01', 1, 1)]
    const before = ids(input)
    orderTrades(input)
    expect(ids(input)).toEqual(before)
  })
})

describe('summarizeBag', () => {
  it('books a partial sell against the average cost', () => {
    const s = summarizeBag(bag, [
      trade('buy', '2026-03-01', 12000, 3600),
      trade('buy', '2026-04-01', 18000, 2700),
      trade('buy', '2026-05-01', 30000, 3300),
      trade('sell', '2026-06-01', 45000, 5850),
    ])
    expect(s.status).toBe('open')
    expect(s.realized).toBeCloseTo(-1350, 6)
    expect(s.qty).toBeCloseTo(15000, 6)
    expect(s.cost).toBeCloseTo(2400, 6)
    expect(s.avg).toBeCloseTo(0.16, 9)
    expect(s.invested).toBeCloseTo(9600, 6)
    expect(s.proceeds).toBeCloseTo(5850, 6)
    expect(s.firstDate).toBe('2026-03-01')
    expect(s.lastDate).toBe('2026-06-01')
    expect(s.warnings).toEqual([])
  })

  it('leaves the average cost unchanged after a partial sell', () => {
    const buys = [trade('buy', '2026-06-01', 2, 100), trade('buy', '2026-06-02', 2, 300)]
    const before = summarizeBag(bag, buys)
    const after = summarizeBag(bag, [...buys, trade('sell', '2026-06-03', 1, 50)])
    expect(before.avg).toBeCloseTo(100, 9)
    expect(after.avg).toBeCloseTo(100, 9)
    expect(after.qty).toBeCloseTo(3, 9)
    expect(after.cost).toBeCloseTo(300, 9)
    expect(after.realized).toBeCloseTo(-50, 9)
  })

  it('closes a bag when everything bought is sold, despite float noise', () => {
    const s = summarizeBag(bag, [
      trade('buy', '2026-06-02', 0.013, 900),
      trade('buy', '2026-06-09', 0.02731, 1850),
      trade('buy', '2026-06-16', 0.031, 2050),
      trade('buy', '2026-06-23', 0.057, 3700),
      trade('sell', '2026-07-21', 0.01273, 850),
      trade('sell', null, 0.09718, 6650),
      trade('sell', '2026-08-19', 0.0184, 1250),
    ])
    expect(s.status).toBe('closed')
    expect(s.realized).toBeCloseTo(250, 6)
    expect(s.qty).toBe(0)
    expect(s.cost).toBe(0)
    expect(s.avg).toBeNull()
    expect(s.lastDate).toBe('2026-08-19')
    expect(s.warnings).toEqual([])
  })

  it('counts an unknown-date buy before dated sells', () => {
    const s = summarizeBag(bag, [trade('sell', '2025-09-30', 2750.5, 990), trade('buy', null, 2750.5, 250)])
    expect(s.status).toBe('closed')
    expect(s.realized).toBeCloseTo(740, 6)
    expect(s.warnings).toEqual([])
    expect(s.firstDate).toBe('2025-09-30')
    expect(s.lastDate).toBe('2025-09-30')
  })

  it('clamps to zero and warns when selling more than held', () => {
    const s = summarizeBag(bag, [trade('buy', '2026-07-01', 1, 100), trade('sell', '2026-07-21', 1.5, 300)])
    expect(s.warnings).toEqual(['Sold 0.5 more than held on 21.07.26'])
    expect(s.qty).toBe(0)
    expect(s.cost).toBe(0)
    expect(s.realized).toBeCloseTo(200, 9)
    expect(s.status).toBe('closed')
  })

  it('starts from zero after an oversell when buying again', () => {
    const s = summarizeBag(bag, [
      trade('buy', '2026-07-01', 1, 100),
      trade('sell', '2026-07-21', 1.5, 300),
      trade('buy', '2026-07-22', 2, 50),
    ])
    expect(s.status).toBe('open')
    expect(s.qty).toBeCloseTo(2, 9)
    expect(s.cost).toBeCloseTo(50, 9)
    expect(s.avg).toBeCloseTo(25, 9)
    expect(s.warnings).toHaveLength(1)
  })

  it('books the whole total of a sell with nothing held, without a date when unknown', () => {
    const s = summarizeBag(bag, [trade('sell', null, 2, 40)])
    expect(s.realized).toBeCloseTo(40, 9)
    expect(s.warnings).toEqual(['Sold 2 more than held'])
    expect(s.status).toBe('closed')
  })

  it('does not warn about float noise when selling everything', () => {
    const s = summarizeBag(bag, [
      trade('buy', '2026-06-01', 0.3, 30),
      trade('sell', '2026-06-02', 0.1, 20),
      trade('sell', '2026-06-03', 0.2, 40),
    ])
    expect(s.warnings).toEqual([])
    expect(s.status).toBe('closed')
    expect(s.realized).toBeCloseTo(30, 9)
  })

  it('ignores deleted trades and trades of other bags', () => {
    const live = trade('buy', '2026-06-01', 1, 100)
    const s = summarizeBag(bag, [
      live,
      trade('buy', '2026-06-02', 5, 999, { deleted: true }),
      trade('buy', '2026-06-03', 7, 777, { bagId: 'other' }),
    ])
    expect(ids(s.trades)).toEqual([live.id])
    expect(s.qty).toBeCloseTo(1, 9)
    expect(s.invested).toBeCloseTo(100, 9)
    expect(s.lastDate).toBe('2026-06-01')
  })

  it('keeps a bag with only buys open', () => {
    const s = summarizeBag(bag, [trade('buy', null, 1, 10)])
    expect(s.status).toBe('open')
    expect(s.avg).toBeCloseTo(10, 9)
    expect(s.firstDate).toBeNull()
    expect(s.lastDate).toBeNull()
  })
})

describe('summarizeAccount', () => {
  const makeBag = (id: string, accountId = 'cs', deleted?: boolean): Bag => ({
    id,
    accountId,
    symbol: 'BTC',
    name: id,
    updatedAt: 1,
    ...(deleted ? { deleted } : {}),
  })

  const journal: Journal = {
    version: 1,
    accounts: [
      { id: 'cs', name: 'CS', updatedAt: 0 },
      { id: 'family', name: 'Family', updatedAt: 0 },
    ],
    coins: [],
    bags: [
      makeBag('small'),
      makeBag('closed-nodate'),
      makeBag('closed-old'),
      makeBag('big'),
      makeBag('closed-new'),
      makeBag('gone', 'cs', true),
      makeBag('family-bag', 'family'),
    ],
    trades: [
      trade('buy', '2026-06-01', 1, 100, { bagId: 'small' }),
      trade('buy', '2026-06-01', 2, 1000, { bagId: 'big' }),
      trade('sell', '2026-06-02', 1, 510, { bagId: 'big' }),
      trade('buy', '2025-12-01', 1, 100, { bagId: 'closed-old' }),
      trade('sell', '2026-01-01', 1, 120, { bagId: 'closed-old' }),
      trade('buy', '2026-04-01', 1, 100, { bagId: 'closed-new' }),
      trade('sell', '2026-05-01', 1, 95, { bagId: 'closed-new' }),
      trade('buy', null, 1, 10, { bagId: 'closed-nodate' }),
      trade('sell', null, 1, 11, { bagId: 'closed-nodate' }),
      trade('buy', '2026-06-01', 1, 10000, { bagId: 'gone' }),
      trade('buy', '2026-06-01', 1, 5000, { bagId: 'family-bag' }),
    ],
    storages: [],
  }

  it('sorts open bags by cost and closed bags by last date, unknown dates last', () => {
    const s = summarizeAccount(journal, 'cs')
    expect(s.accountId).toBe('cs')
    expect(s.open.map((b) => b.bag.id)).toEqual(['big', 'small'])
    expect(s.closed.map((b) => b.bag.id)).toEqual(['closed-new', 'closed-old', 'closed-nodate'])
  })

  it('sums realized P/L over open and closed bags, and cost over open bags', () => {
    const s = summarizeAccount(journal, 'cs')
    expect(s.realized).toBeCloseTo(10 + 20 - 5 + 1, 9)
    expect(s.openCost).toBeCloseTo(600, 9)
  })

  it('only includes live bags of the account', () => {
    const s = summarizeAccount(journal, 'family')
    expect(s.open.map((b) => b.bag.id)).toEqual(['family-bag'])
    expect(s.closed).toEqual([])
  })
})

describe('valuePosition', () => {
  const open = summarizeBag(bag, [trade('buy', '2026-06-01', 2, 100)])
  const nulls = { price: null, value: null, unrealized: null, unrealizedPct: null }

  it('values the coins held at the price', () => {
    const v = valuePosition(open, 42.75)
    expect(v.price).toBe(42.75)
    expect(v.value).toBeCloseTo(85.5, 9)
    expect(v.unrealized).toBeCloseTo(-14.5, 9)
    expect(v.unrealizedPct).toBeCloseTo(-14.5, 9)
  })

  it('returns all nulls when the price is unknown', () => {
    expect(valuePosition(open, null)).toEqual(nulls)
    expect(valuePosition(open, undefined)).toEqual(nulls)
  })

  it('returns all nulls when the bag holds nothing', () => {
    const closed = summarizeBag(bag, [trade('buy', '2026-06-01', 1, 10), trade('sell', '2026-06-02', 1, 20)])
    expect(valuePosition(closed, 50)).toEqual(nulls)
  })

  it('has no percentage when the cost is zero', () => {
    const v = valuePosition({ ...open, cost: 0 }, 5)
    expect(v.value).toBeCloseTo(10, 9)
    expect(v.unrealized).toBeCloseTo(10, 9)
    expect(v.unrealizedPct).toBeNull()
  })
})
