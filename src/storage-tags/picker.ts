// What the storage picker shows: groups, search and the name check of the custom storage form.
// Pure; spec: docs/storage-tags/plan.md §3 ("Picker", "Custom storage form") and §5.3–5.4.
import type { Journal } from '../domain/types'
import { storageSearch, type StorageInfo, type StorageLookup } from './resolve'

export type PickerGroupKey = 'used' | 'cex' | 'dex' | 'hot' | 'cold' | 'custom'

export interface PickerGroup {
  key: PickerGroupKey
  items: StorageInfo[]
}

const GROUP_ORDER: readonly PickerGroupKey[] = ['used', 'cex', 'dex', 'hot', 'cold', 'custom']

/** Ids of the known storages on any live bag, in every account. Unknown and deleted ids are left out. */
export function usedStorageIds(journal: Journal, lookup: StorageLookup): Set<string> {
  const used = new Set<string>()
  for (const bag of journal.bags) {
    if (bag.deleted) continue
    for (const id of bag.storageIds ?? []) if (lookup(id)) used.add(id)
  }
  return used
}

/**
 * The picker groups in their fixed order: Used in this journal, Exchanges, DEX, Hot wallets, Cold wallets, Custom.
 * A storage in "Used" is not repeated in its own group. Custom storages of any kind go to "Custom".
 * Alphabetical inside a group (in `locale`); empty groups are left out. `query` filters every group.
 */
export function pickerGroups(
  infos: readonly StorageInfo[],
  used: ReadonlySet<string>,
  query: string,
  locale: string,
): PickerGroup[] {
  const byKey = new Map<PickerGroupKey, StorageInfo[]>(GROUP_ORDER.map((key) => [key, []]))
  for (const info of storageSearch(query, infos)) {
    const key: PickerGroupKey = used.has(info.id) ? 'used' : info.custom ? 'custom' : (info.kind as PickerGroupKey)
    byKey.get(key)?.push(info)
  }
  const collator = new Intl.Collator(locale, { sensitivity: 'base', numeric: true })
  return GROUP_ORDER.map((key) => ({ key, items: byKey.get(key)!.sort((a, b) => collator.compare(a.name, b.name)) }))
    .filter((group) => group.items.length > 0)
}

/**
 * True when `name` (trimmed, any case) is already the name of a predefined storage or of another live custom
 * storage. The domain checks only custom names; the predefined check lives here (task 03).
 */
export function storageNameTaken(name: string, infos: readonly StorageInfo[], selfId?: string): boolean {
  const key = name.trim().toLocaleLowerCase()
  return key !== '' && infos.some((s) => s.id !== selfId && s.name.trim().toLocaleLowerCase() === key)
}

/** How many live bags (all accounts) carry this storage id. */
export function bagsUsingStorage(journal: Journal, id: string): number {
  return journal.bags.filter((b) => !b.deleted && b.storageIds?.includes(id)).length
}
