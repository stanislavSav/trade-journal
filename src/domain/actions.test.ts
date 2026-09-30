import { describe, expect, it } from 'vitest'
import {
  addAccount,
  addTrade,
  defaultBagName,
  deleteTrade,
  openBagsFor,
  renameBag,
  updateTrade,
  upsertCoin,
  type NewTradeInput,
} from './actions'
import { emptyJournal } from './journal'
import type { Journal } from './types'

const NOW = 1_780_000_000_000

const btcBuy: NewTradeInput = {
  accountId: 'cs',
  symbol: 'btc',
  coinName: 'Bitcoin',
  geckoId: 'bitcoin',
  bag: {},
  side: 'buy',
  date: '2026-06-03',
  qty: 0.011,
  total: 750,
  note: '  first entry  ',
}

describe('addTrade', () => {
  it('creates the coin, a bag named after the month, and the trade', () => {
    const start = emptyJournal()
    const snapshot = structuredClone(start)
    const { journal, tradeId } = addTrade(start, btcBuy, NOW)

    expect(start).toEqual(snapshot)
    expect(journal.coins).toEqual([{ id: 'BTC', symbol: 'BTC', name: 'Bitcoin', geckoId: 'bitcoin', updatedAt: NOW }])
    expect(journal.bags).toHaveLength(1)
    const bag = journal.bags[0]!
    expect(bag).toMatchObject({ accountId: 'cs', symbol: 'BTC', name: 'Jun 26', updatedAt: NOW })
    expect(journal.trades).toEqual([
      {
        id: tradeId,
        bagId: bag.id,
        side: 'buy',
        date: '2026-06-03',
        qty: 0.011,
        total: 750,
        note: 'first entry',
        createdAt: NOW,
        updatedAt: NOW,
      },
    ])
  })

  it('defaults the coin name to the symbol, and uses the given bag name and no empty note', () => {
    const input = { ...btcBuy, symbol: 'pol', coinName: undefined, geckoId: undefined, note: ' ' }
    const { journal } = addTrade(emptyJournal(), { ...input, bag: { newBagName: ' Long-term ' } }, NOW)
    expect(journal.coins).toEqual([{ id: 'POL', symbol: 'POL', name: 'POL', geckoId: null, updatedAt: NOW }])
    expect(journal.bags[0]!.name).toBe('Long-term')
    expect(journal.trades[0]).not.toHaveProperty('note')
  })

  it('reuses an existing coin and only fills in a missing geckoId', () => {
    const noGecko: Journal = {
      ...emptyJournal(),
      coins: [{ id: 'BTC', symbol: 'BTC', name: 'Bitcoin', geckoId: null, updatedAt: 1 }],
    }
    const filled = addTrade(noGecko, { ...btcBuy, coinName: 'Other name' }, NOW).journal
    expect(filled.coins).toEqual([{ id: 'BTC', symbol: 'BTC', name: 'Bitcoin', geckoId: 'bitcoin', updatedAt: NOW }])

    const kept = addTrade(filled, { ...btcBuy, geckoId: 'wrapped-bitcoin' }, NOW + 1).journal
    expect(kept.coins).toEqual(filled.coins)
  })

  describe('into an existing bag', () => {
    const base: Journal = {
      ...emptyJournal(),
      accounts: [
        { id: 'cs', name: 'CS', updatedAt: 0 },
        { id: 'family', name: 'Family', updatedAt: 0 },
      ],
      bags: [
        { id: 'cs-btc', accountId: 'cs', symbol: 'BTC', name: 'Swing', updatedAt: 1 },
        { id: 'family-btc', accountId: 'family', symbol: 'BTC', name: 'Swing', updatedAt: 1 },
        { id: 'cs-eth', accountId: 'cs', symbol: 'ETH', name: 'Swing', updatedAt: 1 },
        { id: 'cs-gone', accountId: 'cs', symbol: 'BTC', name: 'Old', updatedAt: 1, deleted: true },
      ],
    }

    it('adds the trade to that bag', () => {
      const { journal, tradeId } = addTrade(base, { ...btcBuy, bag: { bagId: 'cs-btc' } }, NOW)
      expect(journal.bags).toEqual(base.bags)
      expect(journal.trades.find((t) => t.id === tradeId)?.bagId).toBe('cs-btc')
    })

    it('refuses a bag of another account, another coin, a deleted or unknown bag', () => {
      for (const bagId of ['family-btc', 'cs-eth', 'cs-gone', 'missing']) {
        expect(() => addTrade(base, { ...btcBuy, bag: { bagId } }, NOW)).toThrow(Error)
      }
    })
  })

  it('refuses values a backup could not be restored from', () => {
    const j = emptyJournal()
    expect(() => addTrade(j, { ...btcBuy, qty: 0 }, NOW)).toThrow('Quantity must be a positive number')
    expect(() => addTrade(j, { ...btcBuy, total: Number.NaN }, NOW)).toThrow('Total must be a positive number')
    expect(() => addTrade(j, { ...btcBuy, date: '3.6.26' }, NOW)).toThrow('Date must be YYYY-MM-DD')
    expect(() => addTrade(j, { ...btcBuy, symbol: '  ' }, NOW)).toThrow('Symbol is required')
    expect(() => addTrade(j, { ...btcBuy, accountId: 'nobody' }, NOW)).toThrow('Account not found')
  })

  it('names a blank new bag after the date', () => {
    const { journal } = addTrade(emptyJournal(), { ...btcBuy, date: null, bag: { newBagName: '   ' } }, NOW)
    expect(journal.bags[0]!.name).toBe('New')
  })
})

describe('defaultBagName', () => {
  it('uses the month and 2-digit year of the date', () => {
    expect(defaultBagName('2026-06-03')).toBe('Jun 26')
    expect(defaultBagName('2025-12-31')).toBe('Dec 25')
    expect(defaultBagName('2030-01-01')).toBe('Jan 30')
  })

  it('is "New" when the date is unknown', () => {
    expect(defaultBagName(null)).toBe('New')
  })
})

// A journal with one BTC bag holding two trades, built through the public actions.
function twoTrades() {
  const first = addTrade(emptyJournal(), btcBuy, NOW)
  const bagId = first.journal.bags[0]!.id
  const second = addTrade(first.journal, { ...btcBuy, bag: { bagId }, side: 'sell', qty: 0.005, total: 400 }, NOW + 1)
  return { journal: second.journal, bagId, buyId: first.tradeId, sellId: second.tradeId }
}

describe('updateTrade', () => {
  it('applies the patch and bumps updatedAt', () => {
    const { journal, buyId } = twoTrades()
    const snapshot = structuredClone(journal)
    const updated = updateTrade(journal, buyId, { qty: 0.012, date: null, note: ' fixed ' }, NOW + 5)
    expect(journal).toEqual(snapshot)
    expect(updated.trades.find((t) => t.id === buyId)).toMatchObject({
      qty: 0.012,
      date: null,
      total: 750,
      note: 'fixed',
      createdAt: NOW,
      updatedAt: NOW + 5,
    })
  })

  it('removes the note when patched with an empty string', () => {
    const { journal, buyId } = twoTrades()
    const updated = updateTrade(journal, buyId, { note: '' }, NOW + 5)
    expect(updated.trades.find((t) => t.id === buyId)).not.toHaveProperty('note')
  })

  it('refuses a missing or deleted trade and invalid values', () => {
    const { journal, buyId } = twoTrades()
    expect(() => updateTrade(journal, 'missing', { qty: 1 }, NOW + 5)).toThrow('Trade not found')
    const deleted = { ...journal, trades: journal.trades.map((t) => (t.id === buyId ? { ...t, deleted: true } : t)) }
    expect(() => updateTrade(deleted, buyId, { qty: 1 }, NOW + 6)).toThrow('Trade not found')
    expect(() => updateTrade(journal, buyId, { total: -3 }, NOW + 5)).toThrow('Total must be a positive number')
  })
})

describe('deleteTrade', () => {
  it('tombstones the trade and keeps the bag while it has live trades', () => {
    const { journal, bagId, buyId } = twoTrades()
    const after = deleteTrade(journal, buyId, NOW + 5)
    expect(after.trades.find((t) => t.id === buyId)).toMatchObject({ deleted: true, updatedAt: NOW + 5, qty: 0.011 })
    expect(after.bags.find((b) => b.id === bagId)).not.toHaveProperty('deleted')
  })

  it('tombstones the bag when its last live trade is deleted', () => {
    const { journal, bagId, buyId, sellId } = twoTrades()
    const after = deleteTrade(deleteTrade(journal, buyId, NOW + 5), sellId, NOW + 6)
    expect(after.bags.find((b) => b.id === bagId)).toMatchObject({ deleted: true, updatedAt: NOW + 6 })
    expect(after.trades.every((t) => t.deleted)).toBe(true)
  })

  it('refuses a missing trade', () => {
    expect(() => deleteTrade(twoTrades().journal, 'missing', NOW)).toThrow('Trade not found')
  })
})

describe('renameBag', () => {
  it('trims the new name and bumps updatedAt', () => {
    const { journal, bagId } = twoTrades()
    const after = renameBag(journal, bagId, '  Swing  ', NOW + 5)
    expect(after.bags.find((b) => b.id === bagId)).toMatchObject({ name: 'Swing', updatedAt: NOW + 5 })
  })

  it('refuses an empty name or unknown bag', () => {
    const { journal, bagId } = twoTrades()
    expect(() => renameBag(journal, bagId, '   ', NOW + 5)).toThrow('Bag name is required')
    expect(() => renameBag(journal, 'missing', 'Swing', NOW + 5)).toThrow('Bag not found')
  })
})

describe('upsertCoin', () => {
  it('creates a coin keyed by the upper-case symbol', () => {
    const after = upsertCoin(emptyJournal(), { symbol: ' eth ', name: 'Ethereum', geckoId: 'ethereum' }, NOW)
    expect(after.coins).toEqual([{ id: 'ETH', symbol: 'ETH', name: 'Ethereum', geckoId: 'ethereum', updatedAt: NOW }])
  })

  it('updates the name and geckoId of an existing coin', () => {
    const created = upsertCoin(emptyJournal(), { symbol: 'POL', name: 'POL', geckoId: null }, NOW)
    const after = upsertCoin(created, { symbol: 'pol', name: 'Polygon', geckoId: 'polygon-ecosystem-token' }, NOW + 1)
    expect(after.coins).toEqual([
      { id: 'POL', symbol: 'POL', name: 'Polygon', geckoId: 'polygon-ecosystem-token', updatedAt: NOW + 1 },
    ])
  })

  it('stores a blank geckoId as null and refuses a blank symbol', () => {
    const after = upsertCoin(emptyJournal(), { symbol: 'XYZ', name: 'Xyz', geckoId: '  ' }, NOW)
    expect(after.coins[0]!.geckoId).toBeNull()
    expect(() => upsertCoin(emptyJournal(), { symbol: ' ', name: 'x', geckoId: null }, NOW)).toThrow(
      'Symbol is required',
    )
  })
})

describe('addAccount', () => {
  it('adds an account with a slug id and the trimmed name', () => {
    const after = addAccount(emptyJournal(), '  My Fund ', NOW)
    expect(after.accounts).toContainEqual({ id: 'my-fund', name: 'My Fund', updatedAt: NOW })
    expect(after.accounts).toHaveLength(2)
  })

  it('returns the same journal when a live account has that id', () => {
    const start = emptyJournal()
    expect(addAccount(start, ' cs ', NOW)).toBe(start)
  })

  it('revives a deleted account', () => {
    const start: Journal = { ...emptyJournal(), accounts: [{ id: 'family', name: 'Family', updatedAt: 3, deleted: true }] }
    expect(addAccount(start, 'Family', NOW).accounts).toEqual([{ id: 'family', name: 'Family', updatedAt: NOW }])
  })

  it('refuses a name without letters or digits', () => {
    expect(() => addAccount(emptyJournal(), ' - ', NOW)).toThrow('Account name is required')
  })
})

describe('openBagsFor', () => {
  it('lists live open bags of the account and coin, largest cost first', () => {
    let j = addAccount(emptyJournal(), 'Family', NOW)
    // The clock must advance: same-date trades are ordered by createdAt, and a tie falls back to the random id.
    let clock = NOW
    const add = (input: Partial<NewTradeInput>) => {
      clock += 1
      const result = addTrade(j, { ...btcBuy, ...input }, clock)
      j = result.journal
      return result.tradeId
    }
    const bagOfTrade = (tradeId: string) => j.trades.find((t) => t.id === tradeId)!.bagId
    add({ bag: { newBagName: 'Small' }, total: 500 })
    add({ bag: { newBagName: 'Big' }, total: 1500 })
    const closedBag = bagOfTrade(add({ bag: { newBagName: 'Closed' } }))
    add({ bag: { bagId: closedBag }, side: 'sell', total: 900 })
    const deletedTrade = add({ bag: { newBagName: 'Deleted' } })
    j = deleteTrade(j, deletedTrade, clock + 1)
    add({ bag: { newBagName: 'Other account' }, accountId: 'family' })
    add({ bag: { newBagName: 'Other coin' }, symbol: 'ETH' })

    expect(openBagsFor(j, 'cs', 'btc').map((b) => b.name)).toEqual(['Big', 'Small'])
  })
})
