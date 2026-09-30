import type { Journal } from '../domain'

export interface MergeCounts {
  added: number
  updated: number
}

/** Trades that are new after a merge (live, unseen id) or whose stored copy changed. */
export function countMergedTrades(before: Journal, after: Journal): MergeCounts {
  const known = new Map(before.trades.map((t) => [t.id, t.updatedAt]))
  let added = 0
  let updated = 0
  for (const t of after.trades) {
    const prev = known.get(t.id)
    if (prev === undefined) {
      if (!t.deleted) added++
    } else if (prev !== t.updatedAt) {
      updated++
    }
  }
  return { added, updated }
}
