import { formatDate, formatQty } from './format'
import type { AccountSummary, Bag, BagSummary, Journal, PositionValue, Trade } from './types'

// Remaining qty at or below this fraction of the qty bought counts as zero (float noise from sums).
const CLOSE_TOLERANCE = 1e-9

/**
 * Calculation order inside a bag:
 * 1. Dated trades by date ascending.
 * 2. Unknown-date buys come before everything, unknown-date sells after everything.
 * 3. Ties are broken by createdAt, then id.
 */
export function orderTrades(trades: Trade[]): Trade[] {
  return [...trades].sort(compareTrades)
}

function phase(t: Trade): number {
  if (t.date !== null) return 1
  return t.side === 'buy' ? 0 : 2
}

function compareStrings(a: string, b: string): number {
  if (a < b) return -1
  return a > b ? 1 : 0
}

function compareTrades(a: Trade, b: Trade): number {
  return (
    phase(a) - phase(b) ||
    compareStrings(a.date ?? '', b.date ?? '') ||
    a.createdAt - b.createdAt ||
    compareStrings(a.id, b.id)
  )
}

/**
 * Average cost per bag. A buy adds its qty and total to the bag.
 * A sell removes qty × avg from the cost, books (total − qty × avg) as realized P/L,
 * and leaves avg unchanged. Deleted trades are ignored.
 * The bag is 'closed' when remaining qty is ~0 (tolerance 1e-9 relative to qty bought) and it has a sell.
 * Selling more than held clamps qty and cost to 0 and adds a warning.
 */
export function summarizeBag(bag: Bag, trades: Trade[]): BagSummary {
  // Filtering by bagId lets callers pass journal.trades as-is.
  const ordered = orderTrades(trades.filter((t) => !t.deleted && t.bagId === bag.id))
  let qty = 0
  let cost = 0
  let invested = 0
  let proceeds = 0
  let realized = 0
  let bought = 0
  let hasSell = false
  const warnings: string[] = []
  for (const t of ordered) {
    if (t.side === 'buy') {
      qty += t.qty
      cost += t.total
      invested += t.total
      bought += t.qty
      continue
    }
    hasSell = true
    proceeds += t.total
    const tolerance = CLOSE_TOLERANCE * bought
    const excess = t.qty - qty
    if (excess > tolerance) {
      realized += t.total - cost
      warnings.push(`Sold ${formatQty(excess)} more than held${t.date === null ? '' : ` on ${formatDate(t.date)}`}`)
      qty = 0
      cost = 0
      continue
    }
    const soldCost = qty > 0 ? t.qty * (cost / qty) : 0
    realized += t.total - soldCost
    qty -= t.qty
    cost -= soldCost
    if (qty <= tolerance) {
      qty = 0
      cost = 0
    }
  }
  const closed = hasSell && qty <= CLOSE_TOLERANCE * bought
  if (closed) {
    qty = 0
    cost = 0
  }
  const dates = ordered.flatMap((t) => (t.date === null ? [] : [t.date])).sort()
  return {
    bag,
    trades: ordered,
    status: closed ? 'closed' : 'open',
    qty,
    cost,
    avg: qty > 0 ? cost / qty : null,
    invested,
    proceeds,
    realized,
    firstDate: dates[0] ?? null,
    lastDate: dates[dates.length - 1] ?? null,
    warnings,
  }
}

/** Summaries for every live bag of one account. See AccountSummary for sorting. */
export function summarizeAccount(journal: Journal, accountId: string): AccountSummary {
  const tradesByBag = new Map<string, Trade[]>()
  for (const t of journal.trades) {
    const list = tradesByBag.get(t.bagId)
    if (list) list.push(t)
    else tradesByBag.set(t.bagId, [t])
  }
  const summaries = journal.bags
    .filter((b) => !b.deleted && b.accountId === accountId)
    .map((b) => summarizeBag(b, tradesByBag.get(b.id) ?? []))
  const open = summaries.filter((s) => s.status === 'open').sort(byCostDesc)
  const closed = summaries.filter((s) => s.status === 'closed').sort(byLastDateDesc)
  return {
    accountId,
    open,
    closed,
    realized: sum(summaries.map((s) => s.realized)),
    openCost: sum(open.map((s) => s.cost)),
  }
}

function sum(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0)
}

function byCostDesc(a: BagSummary, b: BagSummary): number {
  return b.cost - a.cost || compareStrings(a.bag.id, b.bag.id)
}

function byLastDateDesc(a: BagSummary, b: BagSummary): number {
  if (a.lastDate === b.lastDate) return compareStrings(a.bag.id, b.bag.id)
  if (a.lastDate === null) return 1
  if (b.lastDate === null) return -1
  return compareStrings(b.lastDate, a.lastDate)
}

/** Value of an open bag at `price`. Returns all nulls if price is null/undefined or the bag holds nothing. */
export function valuePosition(summary: BagSummary, price: number | null | undefined): PositionValue {
  if (price === null || price === undefined || !Number.isFinite(price) || summary.qty === 0) {
    return { price: null, value: null, unrealized: null, unrealizedPct: null }
  }
  const value = summary.qty * price
  const unrealized = value - summary.cost
  return { price, value, unrealized, unrealizedPct: summary.cost > 0 ? (unrealized / summary.cost) * 100 : null }
}
