// Tests for sortBags and the sort helpers. Spec: docs/list-sorting/plan.md §3 and §6.1.
import { describe, expect, it } from 'vitest'
import {
  summarizeAccount,
  summarizeBag,
  valuePosition,
  type Bag,
  type BagSummary,
  type Journal,
  type PositionValue,
  type Side,
  type Trade,
} from '../domain'
import {
  DEFAULT_SORT,
  FIRST_DIR,
  SORT_KEYS,
  formatSort,
  nextSort,
  parseSort,
  sortBags,
  type BagSort,
  type SortDir,
  type SortableRow,
} from './bagSort'
import type { ListTab } from './BagList'

const NO_PRICE: PositionValue = { price: null, value: null, unrealized: null, unrealizedPct: null }

type SummaryExtra = Partial<BagSummary> & { symbol?: string; name?: string }

/** A hand-made summary: only the fields the sort reads matter. */
function summary(id: string, extra: SummaryExtra = {}): BagSummary {
  const { symbol = 'BTC', name = id, ...rest } = extra
  return {
    bag: { id, accountId: 'cs', symbol, name, updatedAt: 1 },
    trades: [],
    status: 'open',
    qty: 1,
    cost: 100,
    avg: 100,
    invested: 100,
    proceeds: 0,
    realized: 0,
    firstDate: null,
    lastDate: null,
    warnings: [],
    ...rest,
  }
}

function openRow(id: string, value: number | null, extra: SummaryExtra = {}) {
  const s = summary(id, extra)
  const pos: PositionValue =
    value === null
      ? NO_PRICE
      : { price: value, value, unrealized: value - s.cost, unrealizedPct: ((value - s.cost) / s.cost) * 100 }
  return { summary: s, pos }
}

function closedRow(id: string, extra: SummaryExtra = {}): SortableRow {
  return { summary: summary(id, { status: 'closed', qty: 0, cost: 0, avg: null, ...extra }) }
}

const ids = (rows: readonly SortableRow[]) => rows.map((r) => r.summary.bag.id)
const sorted = (rows: readonly SortableRow[], key: BagSort['key'], dir: SortDir) => ids(sortBags(rows, { key, dir }))

let seq = 0
function trade(bagId: string, side: Side, date: string | null, total = 100, extra: Partial<Trade> = {}): Trade {
  seq += 1
  return { id: `t${seq}`, bagId, side, date, qty: 1, total, createdAt: seq, updatedAt: seq, ...extra }
}

function bag(id: string, symbol = 'BTC', name = id): Bag {
  return { id, accountId: 'cs', symbol, name, updatedAt: 1 }
}

describe('sortBags: value', () => {
  const rows = [
    openRow('small', 50),
    openRow('none-cheap', null, { cost: 10 }),
    openRow('big', 900),
    openRow('none-dear', null, { cost: 500 }),
    openRow('mid', 300),
  ]

  it('puts the largest value first and unpriced rows last, by cost largest first', () => {
    expect(sorted(rows, 'value', 'desc')).toEqual(['big', 'mid', 'small', 'none-dear', 'none-cheap'])
  })

  it('with Value up, priced rows are smallest first and unpriced rows are still last by cost', () => {
    expect(sorted(rows, 'value', 'asc')).toEqual(['small', 'mid', 'big', 'none-dear', 'none-cheap'])
  })
})

describe('sortBags: gain %', () => {
  it('orders open rows by unrealized %, rows without a price last in both directions', () => {
    const rows = [openRow('loss', 80), openRow('none', null), openRow('win', 150), openRow('flat', 100)]
    expect(sorted(rows, 'gain', 'desc')).toEqual(['win', 'flat', 'loss', 'none'])
    expect(sorted(rows, 'gain', 'asc')).toEqual(['loss', 'flat', 'win', 'none'])
  })

  it('orders closed rows by realized / invested, a row with nothing invested last', () => {
    const rows = [
      closedRow('half', { invested: 200, realized: 100 }), // +50 %
      closedRow('only-sells', { invested: 0, realized: 300 }),
      closedRow('double', { invested: 100, realized: 100 }), // +100 %
      closedRow('loss', { invested: 1000, realized: -100 }), // -10 %
    ]
    expect(sorted(rows, 'gain', 'desc')).toEqual(['double', 'half', 'loss', 'only-sells'])
    expect(sorted(rows, 'gain', 'asc')).toEqual(['loss', 'half', 'double', 'only-sells'])
  })
})

describe('sortBags: invested', () => {
  it('uses the cost still held on open rows', () => {
    const rows = [openRow('a', 1, { cost: 10, invested: 9999 }), openRow('b', 1, { cost: 500, invested: 500 })]
    expect(sorted(rows, 'invested', 'desc')).toEqual(['b', 'a'])
  })

  it('uses the total of all buys on closed rows (their cost is 0)', () => {
    const rows = [closedRow('small-buys', { invested: 100 }), closedRow('big-buys', { invested: 5000 })]
    expect(sorted(rows, 'invested', 'desc')).toEqual(['big-buys', 'small-buys'])
    expect(sorted(rows, 'invested', 'asc')).toEqual(['small-buys', 'big-buys'])
  })
})

describe('sortBags: latest action', () => {
  const rows = (): SortableRow[] => [
    { summary: summarizeBag(bag('june'), [trade('june', 'buy', '2026-06-01')]) },
    { summary: summarizeBag(bag('undated'), [trade('undated', 'buy', null)]) },
    { summary: summarizeBag(bag('mixed'), [trade('mixed', 'buy', '2026-08-01'), trade('mixed', 'buy', null)]) },
    { summary: summarizeBag(bag('march'), [trade('march', 'buy', '2026-03-01')]) },
  ]

  it('puts the newest known date first; a bag with only unknown dates is last in both directions', () => {
    expect(sorted(rows(), 'latest', 'desc')).toEqual(['mixed', 'june', 'march', 'undated'])
    expect(sorted(rows(), 'latest', 'asc')).toEqual(['march', 'june', 'mixed', 'undated'])
  })

  it('does not use createdAt: a trade typed in last with an older date sorts by its date', () => {
    const first = trade('typed-first', 'buy', '2026-06-01', 100, { createdAt: 1 })
    const last = trade('typed-last', 'buy', '2024-01-01', 100, { createdAt: 9e12 })
    const typedFirst = summarizeBag(bag('typed-first'), [first])
    const typedLast = summarizeBag(bag('typed-last'), [last])
    expect(sorted([{ summary: typedLast }, { summary: typedFirst }], 'latest', 'desc')).toEqual([
      'typed-first',
      'typed-last',
    ])
  })
})

describe('sortBags: name', () => {
  const rows = [
    openRow('eth', 1, { symbol: 'ETH', name: 'Long' }),
    openRow('btc-26', 1, { symbol: 'BTC', name: 'Jun 26' }),
    openRow('btc-3', 1, { symbol: 'BTC', name: 'Jun 3' }),
    openRow('ada', 1, { symbol: 'ADA', name: 'Swing' }),
  ]

  it('orders by symbol, then bag name, with numbers in natural order', () => {
    expect(sorted(rows, 'name', 'asc')).toEqual(['ada', 'btc-3', 'btc-26', 'eth'])
  })

  it('Z–A reverses the order', () => {
    expect(sorted(rows, 'name', 'desc')).toEqual(['eth', 'btc-26', 'btc-3', 'ada'])
  })
})

describe('sortBags: ties and purity', () => {
  const rows = [
    openRow('id-2', 100, { symbol: 'ETH', name: 'Same' }),
    openRow('id-1', 100, { symbol: 'ETH', name: 'Same' }),
    openRow('zed', 100, { symbol: 'ZEC', name: 'A' }),
    openRow('ada', 100, { symbol: 'ADA', name: 'A' }),
  ]

  it('orders equal values by name A–Z in both directions, then by bag id', () => {
    expect(sorted(rows, 'value', 'desc')).toEqual(['ada', 'id-1', 'id-2', 'zed'])
    expect(sorted(rows, 'value', 'asc')).toEqual(['ada', 'id-1', 'id-2', 'zed'])
  })

  it('gives the same output for any input order', () => {
    const expected = sorted(rows, 'invested', 'desc')
    for (const shuffled of [[...rows].reverse(), [rows[2]!, rows[0]!, rows[3]!, rows[1]!]]) {
      expect(sorted(shuffled, 'invested', 'desc')).toEqual(expected)
    }
  })

  it('does not mutate the input array', () => {
    const input = [openRow('a', 1), openRow('b', 2)]
    const before = [...input]
    const output = sortBags(input, DEFAULT_SORT.open)
    expect(input).toEqual(before)
    expect(output).not.toBe(input)
  })
})

describe('sortBags: defaults keep the order from before sorting existed', () => {
  it('DEFAULT_SORT.closed matches summarizeAccount(...).closed, unknown dates last', () => {
    const journal: Journal = {
      version: 1,
      accounts: [{ id: 'cs', name: 'CS', updatedAt: 1 }],
      coins: [],
      bags: [bag('c-june'), bag('c-undated'), bag('c-aug'), bag('c-jan')],
      trades: [
        trade('c-june', 'buy', '2026-05-01'),
        trade('c-june', 'sell', '2026-06-01'),
        trade('c-undated', 'buy', null),
        trade('c-undated', 'sell', null),
        trade('c-aug', 'buy', '2026-02-01'),
        trade('c-aug', 'sell', '2026-08-01'),
        trade('c-jan', 'buy', '2026-01-01'),
        trade('c-jan', 'sell', null),
      ],
    }
    const today = summarizeAccount(journal, 'cs').closed
    expect(today).toHaveLength(4)
    const rows = [...today].reverse().map((s) => ({ summary: s }))
    expect(ids(sortBags(rows, DEFAULT_SORT.closed))).toEqual(today.map((s) => s.bag.id))
  })

  it('DEFAULT_SORT.open matches the old openPositions order: priced by value, then unpriced by cost', () => {
    // The comparator openPositions used before this change (src/ui/portfolioView.ts).
    const oldOrder = (a: SortableRow, b: SortableRow) => {
      const av = a.pos!.value
      const bv = b.pos!.value
      if (av !== null && bv !== null) return bv - av
      if (av !== null) return -1
      if (bv !== null) return 1
      return b.summary.cost - a.summary.cost
    }
    const open = [
      summarizeBag(bag('o-sol', 'SOL'), [trade('o-sol', 'buy', '2026-01-01', 400)]),
      summarizeBag(bag('o-fake', 'FAKE'), [trade('o-fake', 'buy', '2026-01-01', 50)]),
      summarizeBag(bag('o-btc', 'BTC'), [trade('o-btc', 'buy', '2026-01-01', 1000)]),
      summarizeBag(bag('o-new', 'NEW'), [trade('o-new', 'buy', '2026-01-01', 700)]),
      summarizeBag(bag('o-eth', 'ETH'), [trade('o-eth', 'buy', '2026-01-01', 300)]),
    ]
    const prices: Record<string, number> = { SOL: 900, BTC: 1200, ETH: 50 }
    const rows = open.map((s) => ({ summary: s, pos: valuePosition(s, prices[s.bag.symbol]) }))
    const before = ids([...rows].sort(oldOrder))
    expect(before).toEqual(['o-btc', 'o-sol', 'o-eth', 'o-new', 'o-fake'])
    expect(ids(sortBags(rows, DEFAULT_SORT.open))).toEqual(before)
  })
})

describe('parseSort and formatSort', () => {
  it('falls back to the default of the tab for missing or bad values', () => {
    for (const tab of ['open', 'closed'] as const) {
      for (const raw of [null, '', 'gain', 'gain:up', 'size:desc']) {
        expect(parseSort(raw, tab)).toEqual(DEFAULT_SORT[tab])
      }
    }
  })

  it('reads a valid value', () => {
    expect(parseSort('name:asc', 'open')).toEqual({ key: 'name', dir: 'asc' })
    expect(parseSort('name:asc', 'closed')).toEqual({ key: 'name', dir: 'asc' })
  })

  it('accepts value only on the Open tab', () => {
    expect(parseSort('value:desc', 'open')).toEqual({ key: 'value', dir: 'desc' })
    expect(parseSort('value:desc', 'closed')).toEqual({ key: 'latest', dir: 'desc' })
  })

  it('round-trips every key of each tab in both directions', () => {
    for (const tab of ['open', 'closed'] as ListTab[]) {
      for (const key of SORT_KEYS[tab]) {
        for (const dir of ['asc', 'desc'] as const) {
          const raw = formatSort({ key, dir })
          expect(raw).toBe(`${key}:${dir}`)
          expect(formatSort(parseSort(raw, tab))).toBe(raw)
        }
      }
    }
  })
})

describe('nextSort, FIRST_DIR and SORT_KEYS', () => {
  it('flips the direction of the active key', () => {
    expect(nextSort({ key: 'gain', dir: 'desc' }, 'gain')).toEqual({ key: 'gain', dir: 'asc' })
    expect(nextSort({ key: 'name', dir: 'asc' }, 'name')).toEqual({ key: 'name', dir: 'desc' })
  })

  it('starts another key at its first direction', () => {
    expect(nextSort({ key: 'gain', dir: 'asc' }, 'name')).toEqual({ key: 'name', dir: 'asc' })
    for (const key of ['value', 'gain', 'invested', 'latest'] as const) {
      expect(nextSort({ key: 'name', dir: 'asc' }, key)).toEqual({ key, dir: 'desc' })
      expect(FIRST_DIR[key]).toBe('desc')
    }
    expect(FIRST_DIR.name).toBe('asc')
  })

  it('offers Value on Open only, first in the list', () => {
    expect(SORT_KEYS.open).toEqual(['value', 'gain', 'invested', 'latest', 'name'])
    expect(SORT_KEYS.closed).toEqual(['gain', 'invested', 'latest', 'name'])
    expect(SORT_KEYS.closed).not.toContain('value')
  })
})
