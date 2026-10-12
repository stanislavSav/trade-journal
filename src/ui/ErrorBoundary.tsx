import { Component, useState, type ErrorInfo, type ReactNode } from 'react'
import { asError } from '../domain'
import { useT } from '../i18n'
import { exitDemo, isDemo } from '../state/demo'
import { exportBackup, loadJournal } from '../storage'
import { FormError } from './fields'

// React only supports error boundaries as class components.
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null }

  static getDerivedStateFromError(error: unknown) {
    return { error: error instanceof Error ? error : new Error(String(error)) }
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error(error, info.componentStack)
  }

  render() {
    return this.state.error ? <Crashed error={this.state.error} /> : this.props.children
  }
}

/**
 * Last resort screen. Your data is still on the device, so offer a backup before anything else.
 * The crash message itself is technical and stays as it is (plan D13).
 * In demo there is no backup to offer: loadJournal() is the real journal, not what the tester saw
 * (docs/demo-data/plan.md D9), so the screen offers Reload and Exit demo.
 */
function Crashed({ error }: { error: Error }) {
  const t = useT()
  const [saved, setSaved] = useState(false)
  const [backupError, setBackupError] = useState<Error | null>(null)

  const backup = () => {
    setSaved(false)
    setBackupError(null)
    try {
      exportBackup(loadJournal()).then(
        (r) => setSaved(r !== 'cancelled'),
        (err: unknown) => setBackupError(asError(err)),
      )
    } catch (err) {
      setBackupError(asError(err))
    }
  }

  return (
    <main className="app crashed">
      <h1>{t.common.somethingWrong}</h1>
      <p className="muted">{error.message}</p>
      <p>{isDemo ? t.demo.crashNote : t.crash.stillStored}</p>
      <div className="action-row">
        {!isDemo && (
          <button type="button" className="btn primary" onClick={backup}>
            {t.crash.saveBackup}
          </button>
        )}
        <button type="button" className="btn" onClick={() => location.reload()}>
          {t.crash.reload}
        </button>
        {isDemo && (
          <button type="button" className="btn" onClick={exitDemo}>
            {t.demo.exit}
          </button>
        )}
      </div>
      {saved && <p className="help">{t.crash.backupSaved}</p>}
      {backupError && <FormError error={backupError} />}
    </main>
  )
}
