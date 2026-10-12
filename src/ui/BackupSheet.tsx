import { useRef, useState, type ChangeEvent } from 'react'
import { asError } from '../domain'
import { useT } from '../i18n'
import type { MergeCounts } from '../state/mergeCounts'
import type { BackupState } from '../storage'
import { FormError } from './fields'
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

export function BackupSheet({ backup, unsaved, onExport, onMerge, onMerged, onClose }: Props) {
  const t = useT()
  const fileInput = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState<'save' | 'load' | null>(null)
  const [status, setStatus] = useState<'saved' | 'downloaded' | null>(null)
  const [saveError, setSaveError] = useState<Error | null>(null)
  const [loadError, setLoadError] = useState<Error | null>(null)

  // No await before onExport(): the share sheet only opens during the user's tap.
  const save = () => {
    setSaveError(null)
    setStatus(null)
    setBusy('save')
    onExport()
      .then((result) => {
        if (result === 'shared') setStatus('saved')
        else if (result === 'downloaded') setStatus('downloaded')
      })
      .catch((err: unknown) => setSaveError(asError(err)))
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
      .catch((err: unknown) => setLoadError(asError(err)))
      .finally(() => setBusy(null))
  }

  return (
    <Sheet title={t.backup.title} onClose={onClose}>
      <div className="backup">
        <section className="card backup-card">
          <p className="backup-status">
            {backup.lastBackupAt ? (
              <>
                {t.backup.lastBackup} <span className="num">{formatStamp(backup.lastBackupAt)}</span>
              </>
            ) : (
              t.backup.none
            )}
            {unsaved && <span className="backup-unsaved"> · {t.backup.changesSince}</span>}
          </p>
          <button type="button" className="btn primary block" onClick={save} disabled={busy !== null}>
            {busy === 'save' ? t.backup.saving : t.backup.save}
          </button>
          <p className="help">{t.backup.iphoneHelp}</p>
          {status && (
            <p className="help ok" role="status">
              {status === 'saved' ? t.backup.saved : t.backup.downloaded}
            </p>
          )}
          {saveError && <FormError error={saveError} />}
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
            {busy === 'load' ? t.backup.loading : t.backup.load}
          </button>
          <p className="help">{t.backup.loadHelp}</p>
          {loadError && <FormError error={loadError} />}
        </section>
      </div>
    </Sheet>
  )
}
