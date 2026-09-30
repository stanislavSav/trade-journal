import { useState, type FormEvent } from 'react'
import { accountIdFor, type Account } from '../domain'
import { Field } from './fields'
import { Sheet } from './Sheet'

interface Props {
  accounts: Account[]
  /** May throw; the message is shown in the form. */
  onAdd: (name: string) => void
  onClose: () => void
}

export function AddAccountSheet({ accounts, onAdd, onClose }: Props) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
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
      setError(err instanceof Error ? err.message : 'Could not add the account')
    }
  }

  return (
    <Sheet title="Add account" onClose={onClose}>
      <form className="trade-form" onSubmit={submit} noValidate>
        <div className="card form-card">
          <Field id="account-name" label="Name" error={taken ? 'This account already exists' : error}>
            <input
              id="account-name"
              className="input"
              type="text"
              value={name}
              maxLength={24}
              placeholder="e.g. Family"
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
          Add account
        </button>
      </form>
    </Sheet>
  )
}
