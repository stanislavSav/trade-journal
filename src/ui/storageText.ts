// Translated labels for storage kinds, picker groups and the overview filter (docs/storage-tags/plan.md D7, §5.1).
import type { StorageKind } from '../domain'
import type { Messages } from '../i18n'
import type { StorageFilter } from '../storage-tags/filter'
import type { PickerGroupKey } from '../storage-tags/picker'
import type { StorageLookup } from '../storage-tags/resolve'

export function kindLabel(t: Messages, kind: StorageKind): string {
  const labels: Record<StorageKind, string> = {
    cex: t.storage.kindCex,
    dex: t.storage.kindDex,
    hot: t.storage.kindHot,
    cold: t.storage.kindCold,
    other: t.storage.kindOther,
  }
  return labels[kind]
}

export function groupLabel(t: Messages, key: PickerGroupKey): string {
  const labels: Record<PickerGroupKey, string> = {
    used: t.storage.groupUsed,
    cex: t.storage.groupCex,
    dex: t.storage.groupDex,
    hot: t.storage.groupHot,
    cold: t.storage.groupCold,
    custom: t.storage.groupCustom,
  }
  return labels[key]
}

/** The storage name of a single-storage filter (the id when the storage is gone). */
function filterName(f: { id: string }, lookup: StorageLookup): string {
  return lookup(f.id)?.name ?? f.id
}

/** The text on a filter chip: "All", the storage name, "Mixed" or "No tag". */
export function filterChipLabel(t: Messages, f: StorageFilter, lookup: StorageLookup): string {
  if (f.kind === 'storage') return filterName(f, lookup)
  return f.kind === 'all' ? t.storage.filterAll : f.kind === 'mixed' ? t.storage.filterMixed : t.storage.filterNone
}

/** The caption under Value in the summary card; null for All. */
export function filterCaption(t: Messages, f: StorageFilter, lookup: StorageLookup): string | null {
  if (f.kind === 'storage') return t.storage.onlyStorage({ name: filterName(f, lookup) })
  return f.kind === 'all' ? null : f.kind === 'mixed' ? t.storage.onlyMixed : t.storage.onlyNone
}

/** The empty-list text when a filter hides every bag of a tab; null for All (the list keeps its usual text). */
export function filterEmptyText(
  t: Messages,
  f: StorageFilter,
  lookup: StorageLookup,
  tab: 'open' | 'closed',
): string | null {
  const s = t.storage
  const open = tab === 'open'
  switch (f.kind) {
    case 'all':
      return null
    case 'storage': {
      const name = filterName(f, lookup)
      return open ? s.emptyOpenIn({ name }) : s.emptyClosedIn({ name })
    }
    case 'mixed':
      return open ? s.emptyOpenMixed : s.emptyClosedMixed
    case 'none':
      return open ? s.emptyOpenNone : s.emptyClosedNone
  }
}
