import { useState, type FormEvent } from 'react'
import { asError } from '../domain'
import { useT } from '../i18n'
import { FormError } from './fields'

/** Bag name with inline rename. `onRename` may throw; the error is shown next to the input. */
export function BagName({ name, onRename }: { name: string; onRename: (name: string) => void }) {
  const t = useT()
  const [draft, setDraft] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const stop = () => {
    setDraft(null)
    setError(null)
  }

  if (draft === null) {
    return (
      <div className="bag-name-row">
        <span className="bag-name">{name}</span>
        <button type="button" className="text-btn" onClick={() => setDraft(name)}>
          {t.bag.rename}
        </button>
      </div>
    )
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const next = draft.trim()
    try {
      if (next && next !== name) onRename(next)
      stop()
    } catch (err) {
      setError(asError(err))
    }
  }

  return (
    <form className="bag-name-row rename" onSubmit={submit}>
      <label htmlFor="bag-rename" className="sr-only">
        {t.bag.nameLabel}
      </label>
      <input
        id="bag-rename"
        className="input rename-input"
        type="text"
        value={draft}
        maxLength={40}
        autoFocus
        enterKeyHint="done"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? 'bag-rename-msg' : undefined}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') stop()
        }}
      />
      <button type="submit" className="btn small" disabled={draft.trim() === ''}>
        {t.common.save}
      </button>
      <button type="button" className="text-btn" onClick={stop}>
        {t.common.cancel}
      </button>
      {error && <FormError id="bag-rename-msg" className="rename-error" error={error} />}
    </form>
  )
}
