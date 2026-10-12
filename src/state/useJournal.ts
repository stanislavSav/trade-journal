import { useCallback, useEffect, useRef, useState } from 'react'
import { asError, mergeJournals, todayIso, type Journal } from '../domain'
import {
  exportBackup,
  getBackupState,
  hasUnsavedChanges,
  loadJournal,
  readBackupFile,
  requestPersistence,
  saveJournal,
  type BackupState,
} from '../storage'
import { countMergedTrades, type MergeCounts } from './mergeCounts'
import { isDemo } from './demo'
import { demoJournal } from './demoData'

export interface JournalApi {
  journal: Journal
  /**
   * Compute the next journal from the latest one, persist it and render it; returns it.
   * Throws what `fn` throws (nothing changes then). A failed save keeps the change in memory and sets saveError.
   */
  apply: (fn: (j: Journal, now: number) => Journal) => Journal
  backup: BackupState
  unsaved: boolean
  /** Set when the last save to this device failed (e.g. storage full); the UI writes the text (errorText). */
  saveError: Error | null
  exportNow: () => Promise<'shared' | 'downloaded' | 'cancelled'>
  mergeBackup: (file: File) => Promise<MergeCounts>
}

const demoBackup: BackupState = { lastChangeAt: null, lastBackupAt: null }

function readBackupState(): BackupState {
  return isDemo ? demoBackup : getBackupState()
}

export function useJournal(): JournalApi {
  const [journal, setJournal] = useState<Journal>(() => (isDemo ? demoJournal(todayIso()) : loadJournal()))
  const [backup, setBackup] = useState<BackupState>(readBackupState)
  const [saveError, setSaveError] = useState<Error | null>(null)
  // The ref always holds the newest journal, so several apply() calls in one tick chain correctly.
  const current = useRef(journal)

  const commit = useCallback((next: Journal) => {
    current.current = next
    setJournal(next)
    if (isDemo) return next
    try {
      saveJournal(next)
      setSaveError(null)
    } catch (err) {
      setSaveError(asError(err))
    }
    setBackup(getBackupState())
    return next
  }, [])

  // Same-date trades are ordered by createdAt, so `now` must never repeat.
  const lastNow = useRef(0)
  const apply = useCallback(
    (fn: (j: Journal, now: number) => Journal) => {
      const now = Math.max(Date.now(), lastNow.current + 1)
      const next = fn(current.current, now)
      lastNow.current = now
      return commit(next)
    },
    [commit],
  )

  const exportNow = useCallback(async () => {
    // Demo: there is nothing to back up, and exportBackup would write the real lastBackupAt (docs/demo-data/plan.md D7).
    if (isDemo) return 'cancelled' as const
    const result = await exportBackup(current.current)
    setBackup(readBackupState())
    return result
  }, [])

  const mergeBackup = useCallback(
    async (file: File) => {
      const incoming = await readBackupFile(file)
      const before = current.current
      const merged = mergeJournals(before, incoming)
      commit(merged)
      return countMergedTrades(before, merged)
    },
    [commit],
  )

  useEffect(() => {
    if (isDemo) return // nothing is stored in the demo (plan D3)
    requestPersistence().catch(() => {})
  }, [])

  // Another tab of the app changed storage: pick up its journal instead of overwriting it later.
  useEffect(() => {
    if (isDemo) return
    const onStorage = (e: StorageEvent) => {
      if (e.storageArea !== localStorage) return
      try {
        const next = loadJournal()
        current.current = next
        setJournal(next)
        setBackup(getBackupState())
      } catch {
        // keep what we have
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return {
    journal,
    apply,
    backup,
    unsaved: isDemo ? false : hasUnsavedChanges(backup),
    saveError,
    exportNow,
    mergeBackup,
  }
}
