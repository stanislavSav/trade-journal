import { useRef, useState, type ChangeEvent } from 'react'
import type { MergeCounts } from '../state/mergeCounts'
import type { BackupState } from '../storage'
import { Sheet } from './Sheet'
import { formatStamp } from './time'

interface Props {
  backup: BackupState
  unsaved: boolean
  onExport: () => Promise<'shared' | 'downloaded' | 'cancelled'>
  onMerge: (file: File) => Promise<MergeCounts>
  onMerged: (counts: MergeCounts) => void
  onClose: () => void
}

const message = (err: unknown) => (err instanceof Error ? err.message : String(err))

export function BackupSheet({ backup, unsaved, onExport, onMerge, onMerged, onClose }: Props) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState<'save' | 'load' | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  // No await before onExport(): the share sheet only opens during the user's tap.
  const save = () => {
    setSaveError(null)
    setStatus(null)
    setBusy('save')
    onExport()
      .then((result) => {
        if (result === 'shared') setStatus('Backup saved')
        else if (result === 'downloaded') setStatus('Downloaded trades.json')
      })
      .catch((err: unknown) => setSaveError(message(err)))
      .finally(() => setBusy(null))
  }

  const load = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // so picking the same file again still fires change
    if (!file) return
    setLoadError(null)
    setBusy('load')
    onMerge(file)
      .then(onMerged)
      .catch((err: unknown) => setLoadError(message(err)))
      .finally(() => setBusy(null))
  }

  return (
    <Sheet title="Backup" onClose={onClose}>
      <div className="backup">
        <section className="card backup-card">
          <p className="backup-status">
            {backup.lastBackupAt ? (
              <>
                Last backup <span className="num">{formatStamp(backup.lastBackupAt)}</span>
              </>
            ) : (
              'No backup yet'
            )}
            {unsaved && <span className="backup-unsaved"> · changes since then</span>}
          </p>
          <button type="button" className="btn primary block" onClick={save} disabled={busy !== null}>
            {busy === 'save' ? 'Saving…' : 'Save backup'}
          </button>
          <p className="help">On iPhone choose Save to Files → iCloud Drive → Trades and replace trades.json.</p>
          {status && (
            <p className="help ok" role="status">
              {status}
            </p>
          )}
          {saveError && (
            <p className="form-error" role="alert">
              {saveError}
            </p>
          )}
        </section>

        <section className="card backup-card">
          <input
            ref={fileInput}
            className="sr-only"
            type="file"
            accept=".json,application/json"
            tabIndex={-1}
            aria-hidden="true"
            onChange={load}
          />
          <button
            type="button"
            className="btn block"
            onClick={() => fileInput.current?.click()}
            disabled={busy !== null}
          >
            {busy === 'load' ? 'Loading…' : 'Load backup'}
          </button>
          <p className="help">Loading merges the file into this device. Trades that are only here are kept.</p>
          {loadError && (
            <p className="form-error" role="alert">
              {loadError}
            </p>
          )}
        </section>
      </div>
    </Sheet>
  )
}
