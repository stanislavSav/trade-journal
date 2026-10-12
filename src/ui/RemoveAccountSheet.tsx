import { useState, type FormEvent } from 'react'
import { asError, type Account } from '../domain'
import { useT } from '../i18n'
import { nameMatches } from './accountName'
import { FormError } from './fields'
import { Sheet } from './Sheet'

interface Props {
  account: Account
  counts: { bags: number; trades: number }
  /** Absent in the demo: there is nothing to back up there (docs/demo-data/plan.md D7). */
  onExport?: () => Promise<'shared' | 'downloaded' | 'cancelled'>
  onConfirm: () => void
  /** Back to Settings; nothing is deleted. */
  onClose: () => void
}

/** Confirms the removal of an account: counts, warning, backup button, typed name (docs/account-removal/plan.md §5.2). */
export function RemoveAccountSheet({ account, counts, onExport, onConfirm, onClose }: Props) {
  const t = useT()
  const [typed, setTyped] = useState('')
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const matches = nameMatches(typed, account.name)

  // No await before onExport(): the share sheet only opens during the user's tap.
  const save = () => {
    if (!onExport) return
    setError(null)
    setSaved(false)
    setBusy(true)
    onExport()
      .then((result) => setSaved(result !== 'cancelled'))
      .catch((err: unknown) => setError(asError(err)))
      .finally(() => setBusy(false))
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (matches) onConfirm()
  }

  return (
    <Sheet title={t.accounts.removeTitle({ name: account.name })} onClose={onClose}>
      <form className="trade-form" onSubmit={submit} noValidate>
        <div className="card remove-warning">
          <p>{t.accounts.what(counts)}</p>
          <p>{t.accounts.final}</p>
        </div>

        {onExport && (
          <div className="remove-backup">
            <p className="help">{t.accounts.backupHint}</p>
            <button type="button" className="btn small" onClick={save} disabled={busy}>
              {t.accounts.saveBackup}
            </button>
            {saved && (
              <p className="help ok" role="status">
                {t.accounts.backupSaved}
              </p>
            )}
            {error && <FormError error={error} />}
          </div>
        )}

        <div className="remove-confirm">
          <label htmlFor="remove-account-name" className="remove-label">
            {t.accounts.typeToConfirm({ name: account.name })}
          </label>
          <div className="card remove-input-card">
            <input
              id="remove-account-name"
              className="input"
              type="text"
              value={typed}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="done"
              onChange={(e) => setTyped(e.target.value)}
            />
          </div>
        </div>

        <button type="submit" className="btn block destructive" disabled={!matches}>
          {t.accounts.confirm}
        </button>
      </form>
    </Sheet>
  )
}
