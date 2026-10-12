// Pure journal edits. Each returns a new Journal and never mutates its input.
// `now` is ms since epoch and becomes updatedAt (and createdAt for new trades).
import { AppError } from './errors'
import { accountIdFor } from './journal'
import { normaliseStorageIds } from './storages'
import { summarizeAccount } from './portfolio'
import type { Bag, Coin, Journal, Side, Synced, Trade } from './types'

export interface NewTradeInput {
  accountId: string
  symbol: string // any case, stored upper case
  coinName?: string // used when the coin is new
  geckoId?: string | null // used when the coin is new or has no geckoId yet
  /** Add to an existing bag, or start a new one (name defaults to defaultBagName; storageIds are its tags). */
  bag: { bagId: string } | { newBagName?: string; storageIds?: string[] }
  side: Side
  date: string | null
  qty: number
  total: number
  note?: string
}

export type TradePatch = Partial<Pick<Trade, 'side' | 'date' | 'qty' | 'total' | 'note'>>

/** Month names for default bag names. The UI passes the list of its language (docs/i18n/plan.md D11). */
export const EN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Add a trade; creates the Coin and/or Bag when needed. Returns the journal and the new trade id. */
export function addTrade(journal: Journal, input: NewTradeInput, now: number): { journal: Journal; tradeId: string } {
  const symbol = input.symbol.trim().toUpperCase()
  if (!symbol) throw new AppError('symbolRequired', 'Symbol is required')
  if (!journal.accounts.some((a) => a.id === input.accountId && !a.deleted)) throw new AppError('accountNotFound', 'Account not found')
  checkTradeValues(input)
  const storageIds = 'bagId' in input.bag ? [] : normaliseStorageIds(input.bag.storageIds ?? [])
  const coins = ensureCoin(journal.coins, symbol, input, now)
  let bags = journal.bags
  let bagId: string
  if ('bagId' in input.bag) {
    const bag = liveBag(journal, input.bag.bagId)
    if (bag.accountId !== input.accountId || bag.symbol !== symbol) {
      throw new AppError('bagOtherOwner', `Bag "${bag.name}" belongs to another account or coin`, { name: bag.name })
    }
    bagId = bag.id
  } else {
    const bag: Bag = {
      id: newId(),
      accountId: input.accountId,
      symbol,
      name: input.bag.newBagName?.trim() || defaultBagName(input.date),
      ...(storageIds.length > 0 ? { storageIds } : {}),
      updatedAt: now,
    }
    bags = [...bags, bag]
    bagId = bag.id
  }
  const trade: Trade = {
    id: newId(),
    bagId,
    side: input.side,
    date: input.date,
    qty: input.qty,
    total: input.total,
    ...noteField(input.note),
    createdAt: now,
    updatedAt: now,
  }
  return { journal: { ...journal, coins, bags, trades: [...journal.trades, trade] }, tradeId: trade.id }
}

// Same rules parseJournal enforces, so every saved journal can be restored from a backup.
function checkTradeValues(t: Pick<Trade, 'side' | 'date' | 'qty' | 'total'>): void {
  if (t.side !== 'buy' && t.side !== 'sell') throw new AppError('sideInvalid', 'Side must be buy or sell')
  if (t.date !== null && !/^\d{4}-\d{2}-\d{2}$/.test(t.date)) throw new AppError('dateInvalid', 'Date must be YYYY-MM-DD')
  if (!(Number.isFinite(t.qty) && t.qty > 0)) throw new AppError('qtyInvalid', 'Quantity must be a positive number')
  if (!(Number.isFinite(t.total) && t.total > 0)) throw new AppError('totalInvalid', 'Total must be a positive number')
}

function liveBag(journal: Journal, bagId: string): Bag {
  const bag = journal.bags.find((b) => b.id === bagId && !b.deleted)
  if (!bag) throw new AppError('bagNotFound', 'Bag not found')
  return bag
}

function ensureCoin(coins: Coin[], symbol: string, input: NewTradeInput, now: number): Coin[] {
  const existing = coins.find((c) => c.id === symbol)
  const geckoId = input.geckoId?.trim() || null
  if (!existing || existing.deleted) {
    return putById(coins, { id: symbol, symbol, name: input.coinName?.trim() || symbol, geckoId, updatedAt: now })
  }
  if (existing.geckoId === null && geckoId) return putById(coins, { ...existing, geckoId, updatedAt: now })
  return coins
}

/** Replace the record with the same id, or append it. */
function putById<T extends Synced>(list: T[], record: T): T[] {
  const index = list.findIndex((x) => x.id === record.id)
  return index === -1 ? [...list, record] : list.map((x, i) => (i === index ? record : x))
}

function noteField(note: string | undefined): { note?: string } {
  const trimmed = note?.trim()
  return trimmed ? { note: trimmed } : {}
}

export function updateTrade(journal: Journal, tradeId: string, patch: TradePatch, now: number): Journal {
  const { note, ...current } = liveTrade(journal, tradeId)
  const next: Trade = {
    ...current,
    side: patch.side ?? current.side,
    date: patch.date === undefined ? current.date : patch.date,
    qty: patch.qty ?? current.qty,
    total: patch.total ?? current.total,
    ...noteField(patch.note ?? note),
    updatedAt: now,
  }
  checkTradeValues(next)
  return { ...journal, trades: putById(journal.trades, next) }
}

function liveTrade(journal: Journal, tradeId: string): Trade {
  const trade = journal.trades.find((t) => t.id === tradeId && !t.deleted)
  if (!trade) throw new AppError('tradeNotFound', 'Trade not found')
  return trade
}

/** Tombstone a trade. If its bag has no live trades left, tombstone the bag too. */
export function deleteTrade(journal: Journal, tradeId: string, now: number): Journal {
  const trade = liveTrade(journal, tradeId)
  const trades = putById(journal.trades, { ...trade, deleted: true, updatedAt: now })
  const bag = journal.bags.find((b) => b.id === trade.bagId && !b.deleted)
  const bagEmpty = !trades.some((t) => t.bagId === trade.bagId && !t.deleted)
  const bags = bag && bagEmpty ? putById(journal.bags, { ...bag, deleted: true, updatedAt: now }) : journal.bags
  return { ...journal, bags, trades }
}

export function renameBag(journal: Journal, bagId: string, name: string, now: number): Journal {
  const trimmed = name.trim()
  if (!trimmed) throw new AppError('bagNameRequired', 'Bag name is required')
  const bag = liveBag(journal, bagId)
  return { ...journal, bags: putById(journal.bags, { ...bag, name: trimmed, updatedAt: now }) }
}

/** Create or update a coin (matched by upper-case symbol). */
export function upsertCoin(
  journal: Journal,
  coin: { symbol: string; name: string; geckoId: string | null },
  now: number,
): Journal {
  const symbol = coin.symbol.trim().toUpperCase()
  if (!symbol) throw new AppError('symbolRequired', 'Symbol is required')
  const next: Coin = {
    id: symbol,
    symbol,
    name: coin.name.trim() || symbol,
    geckoId: coin.geckoId?.trim() || null,
    updatedAt: now,
  }
  return { ...journal, coins: putById(journal.coins, next) }
}

/** Add an account; no-op if a live account with the same id already exists. */
export function addAccount(journal: Journal, name: string, now: number): Journal {
  const id = accountIdFor(name)
  if (!id) throw new AppError('accountNameRequired', 'Account name is required')
  if (journal.accounts.some((a) => a.id === id && !a.deleted)) return journal
  // A fresh record (no `deleted`) also revives a tombstoned account with this id.
  return { ...journal, accounts: putById(journal.accounts, { id, name: name.trim(), updatedAt: now }) }
}

/** Live bags of this account and coin that are still open, largest cost first. */
export function openBagsFor(journal: Journal, accountId: string, symbol: string): Bag[] {
  const upper = symbol.trim().toUpperCase()
  return summarizeAccount(journal, accountId)
    .open.filter((s) => s.bag.symbol === upper)
    .map((s) => s.bag)
}

/**
 * Default name for a new bag: month and 2-digit year of `date`, e.g. "Jun 26"; `newName` ("New") when date is null.
 * The UI passes the month list and the "New" word of its language (docs/i18n/plan.md D11).
 */
export function defaultBagName(date: string | null, months: readonly string[] = EN_MONTHS, newName = 'New'): string {
  const match = /^\d{2}(\d{2})-(\d{2})-\d{2}$/.exec(date ?? '')
  const month = match && months[Number(match[2]) - 1]
  return match && month ? `${month} ${match[1]}` : newName
}

export function newId(): string {
  return crypto.randomUUID()
}

/** Live bags of the account, and live trades whose bag (live or deleted) belongs to the account. */
export function countAccountData(journal: Journal, accountId: string): { bags: number; trades: number } {
  const bagIds = accountBagIds(journal, accountId)
  return {
    bags: journal.bags.filter((b) => b.accountId === accountId && !b.deleted).length,
    trades: journal.trades.filter((t) => bagIds.has(t.bagId) && !t.deleted).length,
  }
}

/**
 * Tombstone a live account, every live bag of it, and every live trade whose bag belongs to it (live or deleted bag).
 * Records that are already deleted are not touched. Coins are not touched. Throws "Account not found".
 * Spec: docs/account-removal/plan.md §6.1.
 */
export function removeAccount(journal: Journal, accountId: string, now: number): Journal {
  const account = journal.accounts.find((a) => a.id === accountId && !a.deleted)
  if (!account) throw new Error('Account not found')
  const bagIds = accountBagIds(journal, accountId)
  return {
    ...journal,
    accounts: putById(journal.accounts, { ...account, deleted: true, updatedAt: now }),
    bags: journal.bags.map((b) =>
      b.accountId === accountId && !b.deleted ? { ...b, deleted: true, updatedAt: now } : b,
    ),
    trades: journal.trades.map((t) =>
      bagIds.has(t.bagId) && !t.deleted ? { ...t, deleted: true, updatedAt: now } : t,
    ),
  }
}

/** Ids of every bag of the account, live or deleted. */
function accountBagIds(journal: Journal, accountId: string): Set<string> {
  return new Set(journal.bags.filter((b) => b.accountId === accountId).map((b) => b.id))
}
