// Tests for removeAccount and countAccountData. Spec: docs/account-removal/plan.md §3, §6.1, §6.3.
import { describe, expect, it } from 'vitest'
import { addAccount, addTrade, countAccountData, removeAccount } from './actions'
import { emptyJournal, mergeJournals } from './journal'
import { summarizeAccount } from './portfolio'
import type { Bag, Journal, Trade } from './types'

const NOW = 1_780_000_000_000
const OLD = 1_700_000_000_000

function bag(id: string, accountId: string, symbol: string, extra: Partial<Bag> = {}): Bag {
  return { id, accountId, symbol, name: id, updatedAt: OLD, ...extra }
}

function trade(id: string, bagId: string, extra: Partial<Trade> = {}): Trade {
  return { id, bagId, side: 'buy', date: '2026-06-01', qty: 1, total: 100, createdAt: OLD, updatedAt: OLD, ...extra }
}

/**
 * Two accounts. "family" has two live bags, an already-deleted bag with a deleted trade,
 * and an orphan: a live trade whose bag is already deleted (possible after a merge).
 */
function sample(): Journal {
  return {
    version: 1,
    storages: [],
    accounts: [
      { id: 'cs', name: 'CS', updatedAt: OLD },
      { id: 'family', name: 'Family', updatedAt: OLD },
    ],
    coins: [
      { id: 'BTC', symbol: 'BTC', name: 'Bitcoin', geckoId: 'bitcoin', updatedAt: OLD },
      { id: 'ETH', symbol: 'ETH', name: 'Ethereum', geckoId: 'ethereum', updatedAt: OLD },
    ],
    bags: [
      bag('fam-long', 'family', 'BTC'),
      bag('fam-swing', 'family', 'ETH'),
      bag('fam-gone', 'family', 'BTC', { deleted: true, updatedAt: OLD + 5 }),
      bag('cs-long', 'cs', 'BTC'),
    ],
    trades: [
      trade('t1', 'fam-long'),
      trade('t2', 'fam-long', { date: '2026-06-02' }),
      trade('t3', 'fam-swing'),
      trade('t-gone', 'fam-gone', { deleted: true, updatedAt: OLD + 5 }),
      trade('t-orphan', 'fam-gone'),
      trade('t-cs', 'cs-long'),
    ],
  }
}

const byId = <T extends { id: string }>(list: T[], id: string): T => list.find((x) => x.id === id)!

describe('removeAccount', () => {
  it('tombstones the account, its bags and their trades with updatedAt now', () => {
    const after = removeAccount(sample(), 'family', NOW)
    expect(byId(after.accounts, 'family')).toEqual({ id: 'family', name: 'Family', deleted: true, updatedAt: NOW })
    for (const id of ['fam-long', 'fam-swing']) {
      expect(byId(after.bags, id)).toMatchObject({ deleted: true, updatedAt: NOW })
    }
    for (const id of ['t1', 't2', 't3']) {
      expect(byId(after.trades, id)).toMatchObject({ deleted: true, updatedAt: NOW })
    }
  })

  it('leaves other accounts, their bags and trades, and all coins untouched', () => {
    const start = sample()
    const after = removeAccount(start, 'family', NOW)
    expect(byId(after.accounts, 'cs')).toBe(byId(start.accounts, 'cs'))
    expect(byId(after.bags, 'cs-long')).toBe(byId(start.bags, 'cs-long'))
    expect(byId(after.trades, 't-cs')).toBe(byId(start.trades, 't-cs'))
    expect(after.coins).toBe(start.coins)
  })

  it('keeps already-deleted records as they are', () => {
    const start = sample()
    const after = removeAccount(start, 'family', NOW)
    expect(byId(after.bags, 'fam-gone')).toBe(byId(start.bags, 'fam-gone'))
    expect(byId(after.trades, 't-gone')).toBe(byId(start.trades, 't-gone'))
    expect(byId(after.bags, 'fam-gone').updatedAt).toBe(OLD + 5)
  })

  it('tombstones a live trade whose bag is already deleted (an orphan)', () => {
    const after = removeAccount(sample(), 'family', NOW)
    expect(byId(after.trades, 't-orphan')).toMatchObject({ deleted: true, updatedAt: NOW })
  })

  it('throws for an unknown account and for an account that is already removed', () => {
    expect(() => removeAccount(sample(), 'nobody', NOW)).toThrow('Account not found')
    const removed = removeAccount(sample(), 'family', NOW)
    expect(() => removeAccount(removed, 'family', NOW + 1)).toThrow('Account not found')
  })

  it('does not mutate the input', () => {
    const start = sample()
    const snapshot = structuredClone(start)
    removeAccount(start, 'family', NOW)
    expect(start).toEqual(snapshot)
  })

  it('leaves nothing of the account to show or count', () => {
    const after = removeAccount(sample(), 'family', NOW)
    const summary = summarizeAccount(after, 'family')
    expect(summary.open).toEqual([])
    expect(summary.closed).toEqual([])
    expect(countAccountData(after, 'family')).toEqual({ bags: 0, trades: 0 })
  })

  it('allows removing the last account', () => {
    const after = removeAccount(emptyJournal(), 'cs', NOW)
    expect(after.accounts.every((a) => a.deleted)).toBe(true)
  })
})

describe('countAccountData', () => {
  it('counts live bags of the account and live trades of its bags, orphans included', () => {
    const j = sample()
    expect(countAccountData(j, 'family')).toEqual({ bags: 2, trades: 4 })
    expect(countAccountData(j, 'cs')).toEqual({ bags: 1, trades: 1 })
  })

  it('returns zeros for an unknown account', () => {
    expect(countAccountData(sample(), 'nobody')).toEqual({ bags: 0, trades: 0 })
  })
})

describe('removeAccount and mergeJournals', () => {
  const familyGone = (j: Journal) => {
    expect(byId(j.accounts, 'family').deleted).toBe(true)
    expect(j.bags.filter((b) => b.accountId === 'family').every((b) => b.deleted)).toBe(true)
    const familyBags = new Set(j.bags.filter((b) => b.accountId === 'family').map((b) => b.id))
    expect(j.trades.filter((t) => familyBags.has(t.bagId)).every((t) => t.deleted)).toBe(true)
  }

  it('E1/E6: the removal wins over an older copy, in both merge orders', () => {
    const old = sample()
    const removed = removeAccount(old, 'family', NOW)
    familyGone(mergeJournals(removed, old))
    familyGone(mergeJournals(old, removed))
  })

  it('E2: a trade added on another device before syncing survives as a hidden orphan', () => {
    const old = sample()
    const removed = removeAccount(old, 'family', NOW)
    const { journal: otherDevice, tradeId } = addTrade(
      old,
      {
        accountId: 'family',
        symbol: 'BTC',
        bag: { bagId: 'fam-long' },
        side: 'buy',
        date: '2026-07-01',
        qty: 1,
        total: 100,
      },
      NOW - 1,
    )
    const merged = mergeJournals(removed, otherDevice)
    expect(byId(merged.trades, tradeId).deleted).toBeUndefined()
    expect(byId(merged.bags, 'fam-long').deleted).toBe(true)
    expect(byId(merged.accounts, 'family').deleted).toBe(true)
    const summary = summarizeAccount(merged, 'family')
    expect(summary.open).toEqual([])
    expect(summary.closed).toEqual([])
  })

  it('E5: adding an account with the same name revives the id with no live bags', () => {
    const removed = removeAccount(sample(), 'family', NOW)
    const after = addAccount(removed, 'Family', NOW + 1)
    expect(byId(after.accounts, 'family')).toEqual({ id: 'family', name: 'Family', updatedAt: NOW + 1 })
    expect(countAccountData(after, 'family')).toEqual({ bags: 0, trades: 0 })
    expect(summarizeAccount(after, 'family').open).toEqual([])
  })
})
