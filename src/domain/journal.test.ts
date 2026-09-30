import { describe, expect, it } from 'vitest'
import { accountIdFor, emptyJournal, mergeJournals, parseJournal } from './journal'
import type { Account, Bag, Coin, Journal, Trade } from './types'

function journalOf(parts: Partial<Omit<Journal, 'version'>>): Journal {
  return { version: 1, accounts: [], coins: [], bags: [], trades: [], ...parts }
}

const account = (id: string, updatedAt: number, name = id.toUpperCase()): Account => ({ id, name, updatedAt })
const coin = (symbol: string, updatedAt: number, geckoId: string | null = null): Coin => ({
  id: symbol,
  symbol,
  name: symbol,
  geckoId,
  updatedAt,
})
const bagOf = (id: string, updatedAt: number, extra: Partial<Bag> = {}): Bag => ({
  id,
  accountId: 'cs',
  symbol: 'BTC',
  name: 'Jun 26',
  updatedAt,
  ...extra,
})
const tradeOf = (id: string, updatedAt: number, extra: Partial<Trade> = {}): Trade => ({
  id,
  bagId: 'b1',
  side: 'buy',
  date: '2026-06-03',
  qty: 0.011,
  total: 750,
  createdAt: 1,
  updatedAt,
  ...extra,
})

describe('mergeJournals', () => {
  it('keeps the newer copy whichever side it is on', () => {
    const a = journalOf({ accounts: [account('cs', 5, 'A-new'), account('family', 1, 'A-old')] })
    const b = journalOf({ accounts: [account('cs', 3, 'B-old'), account('family', 9, 'B-new')] })
    expect(mergeJournals(a, b).accounts.map((x) => x.name)).toEqual(['A-new', 'B-new'])
  })

  it('lets a newer tombstone beat an older live copy', () => {
    const live = tradeOf('t1', 10)
    const tombstone = { ...live, deleted: true, updatedAt: 11 }
    expect(mergeJournals(journalOf({ trades: [live] }), journalOf({ trades: [tombstone] })).trades).toEqual([tombstone])
    expect(mergeJournals(journalOf({ trades: [tombstone] }), journalOf({ trades: [live] })).trades).toEqual([tombstone])
  })

  it('keeps the copy from a on a tie', () => {
    const a = journalOf({ coins: [coin('BTC', 7, 'bitcoin')] })
    const b = journalOf({ coins: [coin('BTC', 7, null)] })
    expect(mergeJournals(a, b).coins).toEqual([coin('BTC', 7, 'bitcoin')])
  })

  it('keeps records found on one side only and sorts every collection by id', () => {
    const a = journalOf({ bags: [bagOf('z', 1)], trades: [tradeOf('t3', 1), tradeOf('t1', 1)] })
    const b = journalOf({ bags: [bagOf('a', 1)], trades: [tradeOf('t2', 1)] })
    const merged = mergeJournals(a, b)
    expect(merged.version).toBe(1)
    expect(merged.bags.map((x) => x.id)).toEqual(['a', 'z'])
    expect(merged.trades.map((x) => x.id)).toEqual(['t1', 't2', 't3'])
  })

  it('gives the same result in either order when there are no ties', () => {
    const a = journalOf({
      accounts: [account('cs', 2)],
      coins: [coin('BTC', 4, 'bitcoin'), coin('POL', 1)],
      bags: [bagOf('b1', 3, { name: 'Swing' })],
      trades: [tradeOf('t1', 8), tradeOf('t2', 2, { deleted: true })],
    })
    const b = journalOf({
      accounts: [account('cs', 1), account('family', 1)],
      coins: [coin('BTC', 2), coin('ETH', 5, 'ethereum')],
      bags: [bagOf('b1', 6, { name: 'Long-term' }), bagOf('b2', 1)],
      trades: [tradeOf('t1', 3, { qty: 1 }), tradeOf('t2', 5, { qty: 2 })],
    })
    expect(mergeJournals(a, b)).toEqual(mergeJournals(b, a))
  })

  it('does not mutate its inputs', () => {
    const a = journalOf({ trades: [tradeOf('t2', 1), tradeOf('t1', 1)] })
    const b = journalOf({ trades: [tradeOf('t1', 5)] })
    const aBefore = structuredClone(a)
    const bBefore = structuredClone(b)
    mergeJournals(a, b)
    expect(a).toEqual(aBefore)
    expect(b).toEqual(bBefore)
  })
})

describe('accountIdFor', () => {
  it('slugs a name to lower case with dashes', () => {
    expect(accountIdFor('CS')).toBe('cs')
    expect(accountIdFor('My Fund')).toBe('my-fund')
    expect(accountIdFor('  Family & Co. -- 2026!  ')).toBe('family-co-2026')
  })

  it('keeps non-Latin letters', () => {
    expect(accountIdFor('Влад')).toBe('влад')
  })

  it('returns an empty id when the name has no letters or digits', () => {
    expect(accountIdFor('  --  ')).toBe('')
  })
})

describe('emptyJournal', () => {
  it('has one account CS that any backup overrides', () => {
    expect(emptyJournal()).toEqual({
      version: 1,
      accounts: [{ id: 'cs', name: 'CS', updatedAt: 0 }],
      coins: [],
      bags: [],
      trades: [],
    })
  })

  it('returns a fresh object each time', () => {
    const a = emptyJournal()
    a.accounts.push({ id: 'x', name: 'X', updatedAt: 1 })
    expect(emptyJournal().accounts).toHaveLength(1)
  })
})

describe('parseJournal', () => {
  const full = journalOf({
    accounts: [account('cs', 0), account('family', 3)],
    coins: [coin('BTC', 2, 'bitcoin'), coin('POL', 2)],
    bags: [bagOf('b1', 4), bagOf('b2', 5, { deleted: true })],
    trades: [tradeOf('t1', 6, { note: 'first entry' }), tradeOf('t2', 7, { side: 'sell', date: null, deleted: true })],
  })

  // A valid backup whose first trade is replaced by `trade`.
  const withTrade = (trade: Record<string, unknown>) => ({
    ...JSON.parse(JSON.stringify(full)),
    trades: [{ ...tradeOf('t1', 6), ...trade }],
  })

  it('accepts a journal round-tripped through JSON', () => {
    expect(parseJournal(JSON.parse(JSON.stringify(full)))).toEqual(full)
    expect(parseJournal(JSON.parse(JSON.stringify(emptyJournal())))).toEqual(emptyJournal())
  })

  it('rejects things that are not a journal', () => {
    for (const junk of [null, 'hello', 42, [], { foo: 1 }]) {
      expect(() => parseJournal(junk)).toThrow('Not a trade journal backup')
    }
  })

  it('rejects an unknown version', () => {
    expect(() => parseJournal({ ...full, version: 2 })).toThrow('Unsupported backup version: 2')
  })

  it('rejects a backup with a missing collection', () => {
    const { bags: _bags, ...noBags } = full
    expect(() => parseJournal(noBags)).toThrow('Not a trade journal backup: bags missing')
  })

  it('rejects records with missing or wrong fields', () => {
    expect(() => parseJournal({ ...full, accounts: [{ id: 'cs', updatedAt: 0 }] })).toThrow(
      'Account 1: name must be a string',
    )
    expect(() => parseJournal({ ...full, coins: [coin('BTC', 1), { ...coin('ETH', 1), geckoId: 5 }] })).toThrow(
      'Coin 2: geckoId must be a string or null',
    )
    expect(() => parseJournal({ ...full, bags: [{ ...bagOf('b1', 1), id: '' }] })).toThrow(
      'Bag 1: id must be a non-empty string',
    )
    expect(() => parseJournal({ ...full, trades: ['nope'] })).toThrow('Trade 1: not an object')
  })

  it('rejects a bad trade side, qty, total or date', () => {
    expect(() => parseJournal(withTrade({ side: 'hold' }))).toThrow('Trade 1: side must be "buy" or "sell"')
    expect(() => parseJournal(withTrade({ qty: -1 }))).toThrow('Trade 1: qty must be a positive number')
    expect(() => parseJournal(withTrade({ qty: '1' }))).toThrow('Trade 1: qty must be a positive number')
    expect(() => parseJournal(withTrade({ total: 0 }))).toThrow('Trade 1: total must be a positive number')
    expect(() => parseJournal(withTrade({ date: '03.06.26' }))).toThrow('Trade 1: date must be YYYY-MM-DD or null')
    expect(() => parseJournal(withTrade({ date: undefined }))).toThrow('Trade 1: date must be YYYY-MM-DD or null')
  })

  it('rejects duplicate ids in one collection', () => {
    expect(() => parseJournal({ ...full, trades: [tradeOf('t1', 1), tradeOf('t1', 2)] })).toThrow(
      'Trade 2: duplicate id "t1"',
    )
  })

  it('drops unknown fields', () => {
    const parsed = parseJournal(withTrade({ extra: 'x' }))
    expect(parsed.trades[0]).toEqual(tradeOf('t1', 6))
  })
})
