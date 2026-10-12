// Second view of the storage picker: add or edit a custom storage (docs/storage-tags/plan.md §5.4).
import { useEffect, useState, type FormEvent } from 'react'
import {
  asError,
  CUSTOM_COLOURS,
  CUSTOM_ID_PREFIX,
  CUSTOM_NAME_MAX,
  STORAGE_KINDS,
  type CustomStorageInput,
  type StorageKind,
} from '../domain'
import { useT } from '../i18n'
import { storageNameTaken } from '../storage-tags/picker'
import type { StorageInfo } from '../storage-tags/resolve'
import { StorageIcon } from '../storage-tags/StorageIcon'
import { Field, FormError } from './fields'
import { BackIcon } from './icons'
import { kindLabel } from './storageText'
import './storage-tags.css'

interface Props {
  /** The storage to edit; absent = a new storage. */
  storage?: StorageInfo
  initialName?: string
  /** Every storage the user can pick (predefined + live custom), for the "name already in the list" check. */
  infos: readonly StorageInfo[]
  /** Edit mode: how many bags use the storage. */
  usedBy?: number
  /** Both may throw; the error is shown in the form. */
  onSubmit: (input: CustomStorageInput) => void
  onDelete?: () => void
  onBack: () => void
}

export function CustomStorageForm({ storage, initialName = '', infos, usedBy = 0, onSubmit, onDelete, onBack }: Props) {
  const t = useT()
  const editing = storage !== undefined
  const [name, setName] = useState(storage?.name ?? initialName)
  const [kind, setKind] = useState<StorageKind>(storage?.kind ?? 'other')
  // A new storage starts with the next colour that no custom storage has, so two new ones look different.
  const [colour, setColour] = useState(() => storage?.colour ?? nextColour(infos))
  const [submitted, setSubmitted] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // The delete confirmation expires so a stray second tap later does not delete (as in EditTradeSheet).
  useEffect(() => {
    if (!confirming) return
    const timer = setTimeout(() => setConfirming(false), 4000)
    return () => clearTimeout(timer)
  }, [confirming])

  const trimmed = name.trim()
  const taken = storageNameTaken(trimmed, infos, storage?.id)
  const nameError = taken
    ? t.errors.storageNameTaken
    : submitted && trimmed === ''
      ? t.errors.storageNameRequired
      : null
  const preview: StorageInfo = {
    id: storage?.id ?? `${CUSTOM_ID_PREFIX}preview`,
    name: trimmed || '?',
    kind,
    colour,
    iconUrl: null,
    custom: true,
    aliases: [],
  }

  const run = (action: () => void) => {
    try {
      action()
    } catch (err) {
      setError(asError(err))
    }
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (trimmed === '' || taken) return
    run(() => onSubmit({ name: trimmed, kind, colour }))
  }

  return (
    <form className="trade-form" onSubmit={submit} noValidate>
      <button type="button" className="text-btn storage-back" onClick={onBack}>
        <BackIcon />
        {t.common.back}
      </button>
      <div className="card form-card">
        <Field id="storage-name" label={t.storage.name} error={nameError}>
          <input
            id="storage-name"
            className="input"
            type="text"
            value={name}
            maxLength={CUSTOM_NAME_MAX}
            autoFocus
            autoComplete="off"
            enterKeyHint="done"
            aria-invalid={nameError ? true : undefined}
            aria-describedby={nameError ? 'storage-name-msg' : undefined}
            onChange={(e) => {
              setName(e.target.value)
              setError(null)
            }}
          />
        </Field>
        <div className="storage-field-stack">
          <span className="field-label" id="storage-kind-label">
            {t.storage.kind}
          </span>
          <div className="storage-kinds" role="radiogroup" aria-labelledby="storage-kind-label">
            {STORAGE_KINDS.map((k) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={kind === k}
                className="storage-kind-btn"
                onClick={() => setKind(k)}
              >
                {kindLabel(t, k)}
              </button>
            ))}
          </div>
        </div>
        <div className="storage-field-stack">
          <span className="field-label" id="storage-colour-label">
            {t.storage.colour}
          </span>
          <div className="storage-colours" role="radiogroup" aria-labelledby="storage-colour-label">
            {CUSTOM_COLOURS.map((c, i) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={colour === c}
                aria-label={t.storage.colourNames[i] ?? c}
                className="storage-swatch"
                style={{ background: c }}
                onClick={() => setColour(c)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="storage-preview">
        <span className="muted">{t.storage.preview}</span>
        <StorageIcon info={preview} size={28} />
        <span className="storage-preview-name">{trimmed}</span>
      </div>

      {error && <FormError error={error} />}
      <button type="submit" className="btn primary block">
        {editing ? t.common.save : t.storage.add}
      </button>

      {editing && onDelete && (
        <>
          <p className="storage-usage">{usedBy > 0 ? t.storage.usedBy(usedBy) : t.storage.notUsed}</p>
          <button
            type="button"
            className={`btn block danger${confirming ? ' confirming' : ''}`}
            onClick={() => (confirming ? run(onDelete) : setConfirming(true))}
          >
            {confirming ? t.trade.tapAgainToDelete : t.storage.deleteStorage}
          </button>
        </>
      )}
    </form>
  )
}

function nextColour(infos: readonly StorageInfo[]): string {
  const used = new Set(infos.filter((s) => s.custom).map((s) => s.colour))
  return CUSTOM_COLOURS.find((c) => !used.has(c)) ?? CUSTOM_COLOURS[0]!
}
