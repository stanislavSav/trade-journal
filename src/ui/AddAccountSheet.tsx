import { useState, type FormEvent } from 'react'
import { accountIdFor, asError, type Account } from '../domain'
import { errorText, useT } from '../i18n'
import { Field } from './fields'
import { Sheet } from './Sheet'

interface Props {
  accounts: Account[]
  /** May throw; the error is shown in the form. */
  onAdd: (name: string) => void
  onClose: () => void
}

export function AddAccountSheet({ accounts, onAdd, onClose }: Props) {
  const t = useT()
  const [name, setName] = useState('')
  const [error, setError] = useState<Error | null>(null)
  const trimmed = name.trim()
  const id = trimmed ? accountIdFor(trimmed) : ''
  const taken = id !== '' && accounts.some((a) => a.id === id)
  const valid = trimmed !== '' && id !== '' && !taken

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!valid) return
    try {
      onAdd(trimmed)
    } catch (err) {
      setError(asError(err))
    }
  }

  return (
    <Sheet title={t.account.title} onClose={onClose}>
      <form className="trade-form" onSubmit={submit} noValidate>
        <div className="card form-card">
          <Field
            id="account-name"
            label={t.account.name}
            error={taken ? t.account.exists : error && errorText(t, error).text}
          >
            <input
              id="account-name"
              className="input"
              type="text"
              value={name}
              maxLength={24}
              placeholder={t.account.placeholder}
              autoFocus
              autoComplete="off"
              autoCapitalize="characters"
              enterKeyHint="done"
              onChange={(e) => {
                setName(e.target.value)
                setError(null)
              }}
            />
          </Field>
        </div>
        <button type="submit" className="btn primary block" disabled={!valid}>
          {t.account.add}
        </button>
      </form>
    </Sheet>
  )
}
