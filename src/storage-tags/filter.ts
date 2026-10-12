// The storage filter on the overview: which chips to show and which bags a chip keeps.
// Pure; spec: docs/storage-tags/plan.md §3 D2, D3, D6 and §6.1.
import type { Bag, BagSummary } from '../domain/types'
import { bagStorages, type StorageLookup } from './resolve'

export type StorageFilter = { kind: 'all' } | { kind: 'mixed' } | { kind: 'none' } | { kind: 'storage'; id: string }

const ALL: StorageFilter = { kind: 'all' }

/** The stored form of a filter: 'all' | 'mixed' | 'none' | 'storage:<id>'. */
export function filterKey(f: StorageFilter): string {
  return f.kind === 'storage' ? `storage:${f.id}` : f.kind
}

/** Reads a stored filter. Anything unknown (null, '', 'storage:', garbage) is All. */
export function parseFilterKey(raw: string | null): StorageFilter {
  if (raw === 'mixed' || raw === 'none') return { kind: raw }
  if (raw?.startsWith('storage:') && raw.length > 'storage:'.length) return { kind: 'storage', id: raw.slice(8) }
  return ALL
}

/** The group of one bag, from its known tags only: 0 → none, 1 → that storage, 2+ → mixed. */
function bagGroup(bag: Bag, lookup: StorageLookup): StorageFilter {
  const [first, ...rest] = bagStorages(bag, lookup)
  if (!first) return { kind: 'none' }
  return rest.length === 0 ? { kind: 'storage', id: first.id } : { kind: 'mixed' }
}

/**
 * The chips for the bags of one account (open and closed): All, the single storages by name, then Mixed and No tag
 * when a bag is in that group. [] when no bag has a known tag, so the row is hidden.
 */
export function filterChips(bags: readonly BagSummary[], lookup: StorageLookup, locale = 'en'): StorageFilter[] {
  const singles = new Map<string, string>() // id → name
  let mixed = false
  let none = false
  for (const { bag } of bags) {
    const group = bagGroup(bag, lookup)
    if (group.kind === 'storage') singles.set(group.id, lookup(group.id)?.name ?? group.id)
    else if (group.kind === 'mixed') mixed = true
    else none = true
  }
  if (singles.size === 0 && !mixed) return []
  const collator = new Intl.Collator(locale, { sensitivity: 'base', numeric: true })
  const storages = [...singles]
    .sort(([idA, a], [idB, b]) => collator.compare(a, b) || idA.localeCompare(idB))
    .map(([id]): StorageFilter => ({ kind: 'storage', id }))
  return [
    ALL,
    ...storages,
    ...(mixed ? [{ kind: 'mixed' } as const] : []),
    ...(none ? [{ kind: 'none' } as const] : []),
  ]
}

/** True when the bag belongs to the chip. */
export function matchesFilter(bag: Bag, f: StorageFilter, lookup: StorageLookup): boolean {
  if (f.kind === 'all') return true
  const group = bagGroup(bag, lookup)
  return group.kind === f.kind && (f.kind !== 'storage' || (group.kind === 'storage' && group.id === f.id))
}

/** The filter to use: the stored one when it is one of the chips, else All. The stored value itself is kept (D3). */
export function activeFilter(raw: string | null, chips: readonly StorageFilter[]): StorageFilter {
  const stored = parseFilterKey(raw)
  const key = filterKey(stored)
  return chips.some((c) => filterKey(c) === key) ? stored : ALL
}
