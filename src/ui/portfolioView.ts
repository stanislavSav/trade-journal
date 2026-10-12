// Screen-level derivations on top of the domain summaries.
import {
  summarizeAccount,
  valuePosition,
  type Account,
  type BagSummary,
  type Coin,
  type Journal,
  type PositionValue,
} from '../domain'

export interface OpenPosition {
  summary: BagSummary
  coin: Coin | undefined
  pos: PositionValue
}

export interface OpenTotals {
  value: number | null // null when no open bag has a price
  pl: number | null
  plPct: number | null
  unpriced: number
  count: number
}

export function liveAccounts(journal: Journal): Account[] {
  return journal.accounts.filter((a) => !a.deleted).sort((a, b) => a.name.localeCompare(b.name))
}

export function coinMap(journal: Journal): Map<string, Coin> {
  return new Map(journal.coins.filter((c) => !c.deleted).map((c) => [c.id, c]))
}

export function geckoIdsFor(open: BagSummary[], coins: Map<string, Coin>): string[] {
  const ids = new Set<string>()
  for (const s of open) {
    const id = coins.get(s.bag.symbol)?.geckoId
    if (id) ids.add(id)
  }
  return [...ids].sort()
}

/** Summary of one live bag, or null when it no longer exists (e.g. its last trade was deleted). */
export function findBagSummary(journal: Journal, bagId: string): BagSummary | null {
  const bag = journal.bags.find((b) => b.id === bagId && !b.deleted)
  if (!bag) return null
  const account = summarizeAccount(journal, bag.accountId)
  return [...account.open, ...account.closed].find((s) => s.bag.id === bagId) ?? null
}

export function priceFor(coin: Coin | undefined, prices: Record<string, number>): number | undefined {
  return coin?.geckoId ? prices[coin.geckoId] : undefined
}

/** One row per open bag with its coin and live value, in input order. `sortBags` (src/ui/bagSort.ts) orders them. */
export function openPositions(
  open: BagSummary[],
  coins: Map<string, Coin>,
  prices: Record<string, number>,
): OpenPosition[] {
  return open.map((summary) => {
    const coin = coins.get(summary.bag.symbol)
    return { summary, coin, pos: valuePosition(summary, priceFor(coin, prices)) }
  })
}

export function openTotals(positions: OpenPosition[]): OpenTotals {
  let value = 0
  let cost = 0
  let priced = 0
  for (const { summary, pos } of positions) {
    if (pos.value === null) continue
    value += pos.value
    cost += summary.cost
    priced++
  }
  const count = positions.length
  if (count > 0 && priced === 0) return { value: null, pl: null, plPct: null, unpriced: count, count }
  const pl = value - cost
  return { value, pl, plPct: cost > 0 ? (pl / cost) * 100 : null, unpriced: count - priced, count }
}
