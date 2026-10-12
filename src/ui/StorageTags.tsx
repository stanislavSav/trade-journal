// "Stored at" on the bag screen: the bag's storage tags as chips, and Edit / Add (docs/storage-tags/plan.md §5.2).
import { useId } from 'react'
import { useT } from '../i18n'
import type { StorageInfo } from '../storage-tags/resolve'
import { StorageIcon } from '../storage-tags/StorageIcon'
import './storage-tags.css'

/** The tags as chips (not interactive), or "Not set". */
export function StorageChips({ storages, labelledBy }: { storages: readonly StorageInfo[]; labelledBy?: string }) {
  const t = useT()
  if (storages.length === 0) return <span className="storage-not-set">{t.storage.notSet}</span>
  return (
    <ul className="storage-tag-list" aria-labelledby={labelledBy}>
      {storages.map((info) => (
        <li key={info.id} className="storage-chip">
          <StorageIcon info={info} size={16} />
          <span className="storage-chip-name">{info.name}</span>
        </li>
      ))}
    </ul>
  )
}

export function StorageTags({ storages, onEdit }: { storages: readonly StorageInfo[]; onEdit: () => void }) {
  const t = useT()
  const labelId = useId()
  return (
    <div className="storage-tags">
      <div className="storage-tags-head">
        <span id={labelId} className="storage-tags-label">
          {t.storage.storedAt}
        </span>
        <button type="button" className="text-btn" onClick={onEdit} aria-describedby={labelId}>
          {storages.length > 0 ? t.storage.edit : t.storage.add}
        </button>
      </div>
      <StorageChips storages={storages} labelledBy={labelId} />
    </div>
  )
}
