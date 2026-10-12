// Order of the rows in the Open and Closed lists, and the saved sort choice.
// Pure functions, no React. Spec: docs/list-sorting/plan.md §3 and §6.1.
import type { BagSummary, PositionValue } from '../domain'
import type { ListTab } from './BagList'

export type SortKey = 'value' | 'gain' | 'invested' | 'latest' | 'name'
export type SortDir = 'asc' | 'desc'

export interface BagSort {
  key: SortKey
  dir: SortDir
}

/** Open rows are OpenPosition (has pos); closed rows are { summary }. Open vs closed comes from summary.status. */
export interface SortableRow {
  summary: BagSummary
  pos?: PositionValue
}

/** The options each tab offers, in sheet order. Closed bags hold no coins, so Closed has no Value. */
export const SORT_KEYS: Record<ListTab, readonly SortKey[]> = {
  open: ['value', 'gain', 'invested', 'latest', 'name'],
  closed: ['gain', 'invested', 'latest', 'name'],
}

/** Open: Value, largest first (the order before sorting existed). Closed: Latest action, newest first. */
export const DEFAULT_SORT: Record<ListTab, BagSort> = {
  open: { key: 'value', dir: 'desc' },
  closed: { key: 'latest', dir: 'desc' },
}

/** The direction a key gets when the user picks it: Name A–Z, every other key largest or newest first. */
export const FIRST_DIR: Record<SortKey, SortDir> = {
  value: 'desc',
  gain: 'desc',
  invested: 'desc',
  latest: 'desc',
  name: 'asc',
}

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })

/** Coin symbol A–Z, then bag name A–Z ("Jun 3" before "Jun 26"). */
function compareNames(a: SortableRow, b: SortableRow): number {
  const x = a.summary.bag
  const y = b.summary.bag
  return collator.compare(x.symbol, y.symbol) || collator.compare(x.name, y.name)
}

function compareIds(a: SortableRow, b: SortableRow): number {
  const x = a.summary.bag.id
  const y = b.summary.bag.id
  if (x < y) return -1
  return x > y ? 1 : 0
}

/** The value a row is sorted by; null = unknown (always last). Not used for the name key. */
function valueOf(row: SortableRow, key: Exclude<SortKey, 'name'>): number | string | null {
  const { summary, pos } = row
  const open = summary.status === 'open'
  switch (key) {
    case 'value':
      return open ? (pos?.value ?? null) : null
    case 'gain':
      if (open) return pos?.unrealizedPct ?? null
      return summary.invested > 0 ? (summary.realized / summary.invested) * 100 : null
    case 'invested':
      return open ? summary.cost : summary.invested
    case 'latest':
      return summary.lastDate
  }
}

function compareValues(a: number | string, b: number | string): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  if (a < b) return -1
  return a > b ? 1 : 0
}

/**
 * Rows in the order of `sort`, as a new array (the input is not changed).
 * Rows with an unknown value are last in both directions. Ties are ordered by name A–Z, then by bag id,
 * so the result never depends on the input order. For Value, unpriced rows are ordered by cost, largest first.
 */
export function sortBags<T extends SortableRow>(rows: readonly T[], sort: BagSort): T[] {
  const sign = sort.dir === 'asc' ? 1 : -1
  const { key } = sort
  const compare = (a: T, b: T): number => {
    if (key === 'name') return sign * compareNames(a, b) || compareIds(a, b)
    const va = valueOf(a, key)
    const vb = valueOf(b, key)
    if (va === null || vb === null) {
      if (va !== null) return -1
      if (vb !== null) return 1
      const byCost = key === 'value' ? b.summary.cost - a.summary.cost : 0
      return byCost || compareNames(a, b) || compareIds(a, b)
    }
    return sign * compareValues(va, vb) || compareNames(a, b) || compareIds(a, b)
  }
  return [...rows].sort(compare)
}

/** Read a saved choice ("gain:desc"). Missing, malformed, or a key the tab does not offer → DEFAULT_SORT[tab]. */
export function parseSort(raw: string | null, tab: ListTab): BagSort {
  const match = /^([a-z]+):(asc|desc)$/.exec(raw ?? '')
  const key = match?.[1] as SortKey | undefined
  if (!match || !key || !SORT_KEYS[tab].includes(key)) return DEFAULT_SORT[tab]
  return { key, dir: match[2] as SortDir }
}

/** The saved form of a choice, e.g. "gain:desc". parseSort reads it back. */
export function formatSort(sort: BagSort): string {
  return `${sort.key}:${sort.dir}`
}

/** The choice after the user taps `key`: the active key flips its direction; another key starts at FIRST_DIR. */
export function nextSort(current: BagSort, key: SortKey): BagSort {
  if (current.key === key) return { key, dir: current.dir === 'asc' ? 'desc' : 'asc' }
  return { key, dir: FIRST_DIR[key] }
}
