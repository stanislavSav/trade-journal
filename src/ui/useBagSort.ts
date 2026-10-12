import { useCallback, useMemo } from 'react'
import { deviceKey } from '../state/demo'
import { useStoredString } from '../state/useStoredString'
import { formatSort, nextSort, parseSort, type BagSort, type SortKey } from './bagSort'
import type { ListTab } from './BagList'

/** Device preference keys, one per list (G5; docs/list-sorting/plan.md D8). Not in backups; own keys in demo. */
export const SORT_STORAGE_KEYS: Record<ListTab, string> = {
  open: deviceKey('sort:open'),
  closed: deviceKey('sort:closed'),
}

/** The saved sort of each list, shared by all accounts, and `pick` for a tap in the sort sheet. */
export function useBagSort(): { sorts: Record<ListTab, BagSort>; pick: (tab: ListTab, key: SortKey) => void } {
  const [rawOpen, storeOpen] = useStoredString(SORT_STORAGE_KEYS.open)
  const [rawClosed, storeClosed] = useStoredString(SORT_STORAGE_KEYS.closed)
  const sorts = useMemo(
    () => ({ open: parseSort(rawOpen, 'open'), closed: parseSort(rawClosed, 'closed') }),
    [rawOpen, rawClosed],
  )
  const pick = useCallback(
    (tab: ListTab, key: SortKey) => {
      const store = tab === 'open' ? storeOpen : storeClosed
      store(formatSort(nextSort(sorts[tab], key)))
    },
    [sorts, storeOpen, storeClosed],
  )
  return { sorts, pick }
}
