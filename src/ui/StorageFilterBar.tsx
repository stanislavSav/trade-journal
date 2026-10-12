// The storage filter chips above the summary card (docs/storage-tags/plan.md §5.1). Shown only when chips exist.
import { useLayoutEffect, useRef } from 'react'
import { useT } from '../i18n'
import { filterKey, type StorageFilter } from '../storage-tags/filter'
import type { StorageLookup } from '../storage-tags/resolve'
import { StorageIcon } from '../storage-tags/StorageIcon'
import { filterChipLabel } from './storageText'
import './storage-tags.css'

interface Props {
  chips: readonly StorageFilter[]
  active: StorageFilter
  lookup: StorageLookup
  onPick: (f: StorageFilter) => void
}

export function StorageFilterBar({ chips, active, lookup, onPick }: Props) {
  const t = useT()
  const row = useRef<HTMLDivElement>(null)
  const activeKey = filterKey(active)

  // A remembered chip far to the right is scrolled into view once, without moving the page.
  useLayoutEffect(() => {
    const el = row.current
    const chip = el?.querySelector<HTMLElement>('[aria-pressed="true"]')
    if (!el || !chip) return
    const right = chip.offsetLeft + chip.offsetWidth - el.clientWidth
    if (right > el.scrollLeft) el.scrollLeft = right + 16
    // Only on mount: later taps are on chips the user can already see.
  }, [])

  return (
    <div className="storage-filter" role="group" aria-label={t.storage.filterLabel} ref={row}>
      {chips.map((f) => {
        const key = filterKey(f)
        const info = f.kind === 'storage' ? lookup(f.id) : null
        return (
          <button
            key={key}
            type="button"
            className="storage-filter-chip"
            aria-pressed={key === activeKey}
            onClick={() => onPick(f)}
          >
            {info && <StorageIcon info={info} size={16} />}
            {filterChipLabel(t, f, lookup)}
          </button>
        )
      })}
    </div>
  )
}
