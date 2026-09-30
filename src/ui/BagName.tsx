import { useState, type FormEvent } from 'react'

/** Bag name with inline rename. `onRename` may throw; its message is shown next to the input. */
export function BagName({ name, onRename }: { name: string; onRename: (name: string) => void }) {
  const [draft, setDraft] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const stop = () => {
    setDraft(null)
    setError(null)
  }

  if (draft === null) {
    return (
      <div className="bag-name-row">
        <span className="bag-name">{name}</span>
        <button type="button" className="text-btn" onClick={() => setDraft(name)}>
          Rename
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
      setError(err instanceof Error ? err.message : 'Could not rename')
    }
  }

  return (
    <form className="bag-name-row rename" onSubmit={submit}>
      <label htmlFor="bag-rename" className="sr-only">
        Bag name
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
        Save
      </button>
      <button type="button" className="text-btn" onClick={stop}>
        Cancel
      </button>
      {error && (
        <p id="bag-rename-msg" className="form-error rename-error" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
