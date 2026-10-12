// Pick any number of storages for a bag: search, groups, multi-select, and custom storages
// (docs/storage-tags/plan.md §5.3–5.4). The sheet only returns the chosen ids; the caller saves them.
import { useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { bagsUsingStorage, pickerGroups, usedStorageIds } from '../storage-tags/picker'
import { storageList, storageLookup, type StorageInfo } from '../storage-tags/resolve'
import { StorageIcon } from '../storage-tags/StorageIcon'
import { MAX_STORAGE_TAGS, type CustomStorageInput, type Journal } from '../domain'
import { useLang, useT } from '../i18n'
import { CustomStorageForm } from './CustomStorageForm'
import { PlusIcon } from './icons'
import { Sheet } from './Sheet'
import { groupLabel, kindLabel } from './storageText'
import './storage-tags.css'

interface Props {
  journal: Journal
  title: string
  initial: readonly string[]
  onSave: (ids: string[]) => void
  onClose: () => void
  /** The three custom-storage callbacks may throw; the message is shown in the form. */
  onAddCustom: (input: CustomStorageInput) => string
  onUpdateCustom: (id: string, patch: Partial<CustomStorageInput>) => void
  onDeleteCustom: (id: string) => void
}

type View = { kind: 'list' } | { kind: 'new'; name: string } | { kind: 'edit'; id: string }

export function StoragePickerSheet({
  journal,
  title,
  initial,
  onSave,
  onClose,
  onAddCustom,
  onUpdateCustom,
  onDeleteCustom,
}: Props) {
  const t = useT()
  const { lang } = useLang()
  const baseId = useId()
  // Ids that are not known (a deleted custom storage, a newer catalogue id) stay in the draft unseen (plan §3).
  const [draft, setDraft] = useState<string[]>(() => [...initial])
  const [query, setQuery] = useState('')
  const [view, setView] = useState<View>({ kind: 'list' })
  const [limitHit, setLimitHit] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  // Where focus and scroll go back to when the form view closes.
  const returnTo = useRef<{ focus: HTMLElement | null; scroll: number } | null>(null)

  const infos = useMemo(() => storageList(journal), [journal])
  const lookup = useMemo(() => storageLookup(journal), [journal])
  // "Used in this journal" is fixed while the sheet is open, so rows do not jump between groups.
  const [used] = useState(() => usedStorageIds(journal, lookup))
  const groups = useMemo(() => pickerGroups(infos, used, query, lang), [infos, used, query, lang])
  const chosen = draft.map(lookup).filter((s): s is StorageInfo => s !== null)
  const selected = new Set(draft)
  const q = query.trim()

  useLayoutEffect(() => {
    if (view.kind !== 'list' || !returnTo.current) return
    const { focus, scroll } = returnTo.current
    returnTo.current = null
    const body = root.current?.closest('.sheet-body')
    if (body) body.scrollTop = scroll
    if (focus?.isConnected) focus.focus({ preventScroll: true })
  }, [view])

  const openForm = (next: Exclude<View, { kind: 'list' }>) => {
    const body = root.current?.closest('.sheet-body')
    returnTo.current = { focus: document.activeElement as HTMLElement | null, scroll: body?.scrollTop ?? 0 }
    setView(next)
  }

  const toggle = (id: string) => {
    if (selected.has(id)) {
      setDraft(draft.filter((x) => x !== id))
      setLimitHit(false)
    } else if (draft.length >= MAX_STORAGE_TAGS) {
      setLimitHit(true)
    } else {
      setDraft([...draft, id])
    }
  }

  if (view.kind !== 'list') {
    const storage = view.kind === 'edit' ? (lookup(view.id) ?? undefined) : undefined
    return (
      <Sheet title={storage ? t.storage.editTitle : t.storage.newTitle} onClose={onClose}>
        <CustomStorageForm
          key={view.kind === 'edit' ? view.id : 'new'}
          storage={storage}
          initialName={view.kind === 'new' ? view.name : undefined}
          infos={infos}
          usedBy={storage ? bagsUsingStorage(journal, storage.id) : 0}
          onBack={() => setView({ kind: 'list' })}
          onSubmit={(input) => {
            if (storage) {
              onUpdateCustom(storage.id, input)
            } else {
              const id = onAddCustom(input)
              if (draft.length < MAX_STORAGE_TAGS) setDraft([...draft, id])
              else setLimitHit(true)
              setQuery('')
            }
            setView({ kind: 'list' })
          }}
          onDelete={
            storage
              ? () => {
                  onDeleteCustom(storage.id)
                  setDraft(draft.filter((x) => x !== storage.id))
                  setLimitHit(false)
                  if (returnTo.current) returnTo.current.focus = null // its ⋯ button is gone
                  setView({ kind: 'list' })
                }
              : undefined
          }
        />
      </Sheet>
    )
  }

  return (
    <Sheet title={title} onClose={onClose}>
      <div className="storage-picker" ref={root}>
        <div className="storage-picker-top">
          <input
            className="input storage-search"
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder={t.storage.search}
            aria-label={t.storage.search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur()
            }}
          />
          {chosen.length > 0 && (
            <ul className="storage-chips" aria-label={t.storage.selected}>
              {chosen.map((info) => (
                <li key={info.id}>
                  <button
                    type="button"
                    className="storage-chip removable"
                    aria-label={t.storage.remove({ name: info.name })}
                    onClick={() => toggle(info.id)}
                  >
                    <StorageIcon info={info} size={16} />
                    <span className="storage-chip-name">{info.name}</span>
                    <span className="storage-chip-x" aria-hidden="true">
                      ✕
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="storage-limit" role="status">
          {limitHit ? t.errors.storageTooMany({ max: MAX_STORAGE_TAGS }) : ''}
        </p>

        {groups.map((group) => {
          const headingId = `${baseId}-${group.key}`
          const showKind = group.key === 'used' || group.key === 'custom'
          return (
            <section key={group.key} className="storage-group" aria-labelledby={headingId}>
              <h3 id={headingId} className="storage-group-title">
                {groupLabel(t, group.key)}
              </h3>
              <div className="card storage-list">
                {group.items.map((info) => (
                  <div key={info.id} className="storage-row">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={selected.has(info.id)}
                      className="storage-pick"
                      onClick={() => toggle(info.id)}
                    >
                      <StorageIcon info={info} size={28} />
                      <span className="storage-text">
                        <span className="storage-name">{info.name}</span>
                        {showKind && <span className="storage-kind">{kindLabel(t, info.kind)}</span>}
                      </span>
                      <span className="storage-check" aria-hidden="true">
                        {selected.has(info.id) && <CheckIcon />}
                      </span>
                    </button>
                    {info.custom && (
                      <button
                        type="button"
                        className="storage-more"
                        aria-label={t.storage.editStorage({ name: info.name })}
                        onClick={() => openForm({ kind: 'edit', id: info.id })}
                      >
                        <MoreIcon />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )
        })}

        {groups.length === 0 && q !== '' ? (
          <div className="storage-nomatch">
            <p>{t.storage.noMatch({ query: q })}</p>
            <button type="button" className="btn block" onClick={() => openForm({ kind: 'new', name: q })}>
              <PlusIcon />
              {t.storage.addAsCustom({ name: q })}
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="btn block storage-add-custom"
            onClick={() => openForm({ kind: 'new', name: '' })}
          >
            <PlusIcon />
            {t.storage.addCustom}
          </button>
        )}

        <div className="storage-save">
          <button type="button" className="btn primary block" onClick={() => onSave(draft)}>
            {t.common.save}
          </button>
        </div>
      </div>
    </Sheet>
  )
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  )
}

function MoreIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="19" cy="12" r="1.8" />
    </svg>
  )
}
