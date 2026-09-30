import { Component, useState, type ErrorInfo, type ReactNode } from 'react'
import { exportBackup, loadJournal } from '../storage'

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

/** Last resort screen. Your data is still on the device, so offer a backup before anything else. */
function Crashed({ error }: { error: Error }) {
  const [note, setNote] = useState<string | null>(null)

  const backup = () => {
    try {
      exportBackup(loadJournal()).then(
        (r) => setNote(r === 'cancelled' ? null : 'Backup saved'),
        (err: unknown) => setNote(err instanceof Error ? err.message : 'Backup failed'),
      )
    } catch (err) {
      setNote(err instanceof Error ? err.message : 'Backup failed')
    }
  }

  return (
    <main className="app crashed">
      <h1>Something went wrong</h1>
      <p className="muted">{error.message}</p>
      <p>Your trades are still stored on this device.</p>
      <div className="action-row">
        <button type="button" className="btn primary" onClick={backup}>
          Save backup
        </button>
        <button type="button" className="btn" onClick={() => location.reload()}>
          Reload
        </button>
      </div>
      {note && <p className="help">{note}</p>}
    </main>
  )
}
