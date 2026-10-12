// Data model for the trade journal. This file is the shared contract:
// domain logic, storage, prices and UI all depend on it.

export type Side = 'buy' | 'sell'

/**
 * Fields every stored record has. When two journals are merged,
 * records are matched by `id` and the copy with the newest `updatedAt` wins.
 * Deleting sets `deleted: true` (a tombstone) so the deletion survives a merge.
 */
export interface Synced {
  id: string
  updatedAt: number // ms since epoch
  deleted?: boolean
}

/** A portfolio owner, shown as a tab (e.g. "Main", "Family"). `id` is the lower-case slug of the name. */
export interface Account extends Synced {
  name: string
}

/** A coin symbol and how to fetch its live price. `id` equals `symbol`. */
export interface Coin extends Synced {
  symbol: string // upper case, e.g. "BTC"
  name: string // e.g. "Bitcoin"
  geckoId: string | null // CoinGecko id for live prices; null = no live price
}

/**
 * A bag is one trade idea for one coin in one account: a group of buys and sells
 * with its own average cost. A coin can have several bags (e.g. "Long-term" and a swing).
 */
export interface Bag extends Synced {
  accountId: string
  symbol: string // Coin.symbol
  name: string // e.g. "Long-term", "Jun 26"
}

export interface Trade extends Synced {
  bagId: string
  side: Side
  /** ISO date "YYYY-MM-DD". null = unknown, shown as "?". */
  date: string | null
  qty: number // coins, > 0
  /** USD actually paid (buy) or received (sell), fees included. > 0 */
  total: number
  note?: string
  createdAt: number // ms since epoch, tie-breaker for ordering
}

export interface Journal {
  version: 1
  accounts: Account[]
  coins: Coin[]
  bags: Bag[]
  trades: Trade[]
}

export type BagStatus = 'open' | 'closed'

/** Calculated state of one bag (average cost method). */
export interface BagSummary {
  bag: Bag
  trades: Trade[] // live (not deleted) trades in calculation order
  status: BagStatus // 'closed' when every coin bought has been sold
  qty: number // coins still held
  cost: number // USD cost basis of the coins still held
  avg: number | null // cost / qty; null when qty is 0
  invested: number // sum of buy totals
  proceeds: number // sum of sell totals
  realized: number // realized P/L of all sells in this bag
  firstDate: string | null
  lastDate: string | null
  warnings: BagWarning[] // data; the UI writes the sentence
}

/** Something in a bag's trades that the user should check. `oversold`: a sell of `qty` more coins than held. */
export interface BagWarning {
  kind: 'oversold'
  qty: number
  date: string | null // ISO date of the sell; null when unknown
}

/** Market value of an open bag at a given price. All null when the price is unknown. */
export interface PositionValue {
  price: number | null
  value: number | null
  unrealized: number | null
  unrealizedPct: number | null // e.g. -14.5 for -14.5 %
}

export interface AccountSummary {
  accountId: string
  open: BagSummary[] // sorted by cost, largest first
  closed: BagSummary[] // sorted by last date, newest first; unknown dates last
  realized: number // realized P/L over all bags of the account (open and closed)
  openCost: number // sum of cost over open bags
}
