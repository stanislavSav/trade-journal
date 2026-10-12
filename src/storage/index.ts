// Local persistence (this device only) and iCloud backup files.
import { emptyJournal, parseJournal, type Journal } from '../domain'
import { AppError } from '../domain/errors'

export interface BackupState {
  lastChangeAt: number | null // last saveJournal() call
  lastBackupAt: number | null // last successful exportBackup()
}

const JOURNAL_KEY = 'trade-journal:journal:v1'
// Copy of stored data that failed to load, so the next save cannot destroy it for good.
const UNREADABLE_KEY = 'trade-journal:journal:v1:unreadable'
const BACKUP_KEY = 'trade-journal:backup'
const BACKUP_FILE_NAME = 'trades.json'

function readItem(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

/** Journal from localStorage, or emptyJournal() when nothing is stored or data is unreadable. */
export function loadJournal(): Journal {
  const raw = readItem(JOURNAL_KEY)
  if (raw === null) return emptyJournal()
  try {
    return parseJournal(JSON.parse(raw))
  } catch (err) {
    console.warn(`Stored journal is unreadable, starting empty. Raw data kept in "${UNREADABLE_KEY}".`, err)
    writeItem(UNREADABLE_KEY, raw)
    return emptyJournal()
  }
}

/** Persist the journal and record lastChangeAt = now. */
export function saveJournal(journal: Journal): void {
  if (!writeItem(JOURNAL_KEY, JSON.stringify(journal))) {
    throw new AppError('storageFull', 'Could not save on this device (storage is full or blocked)')
  }
  writeBackupState({ ...getBackupState(), lastChangeAt: Date.now() })
}

function toTime(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

export function getBackupState(): BackupState {
  const raw = readItem(BACKUP_KEY)
  let parsed: unknown = null
  try {
    parsed = raw === null ? null : JSON.parse(raw)
  } catch {
    parsed = null
  }
  const state = typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : {}
  return { lastChangeAt: toTime(state.lastChangeAt), lastBackupAt: toTime(state.lastBackupAt) }
}

function writeBackupState(state: BackupState): void {
  writeItem(BACKUP_KEY, JSON.stringify(state))
}

/** True when there are changes that were not yet exported (lastChangeAt > lastBackupAt). */
export function hasUnsavedChanges(state: BackupState): boolean {
  return state.lastChangeAt !== null && (state.lastBackupAt === null || state.lastChangeAt > state.lastBackupAt)
}

// Desktop Safari/Chrome also support navigator.share, but there a plain download is what people expect.
function isTouchDevice(): boolean {
  try {
    if (globalThis.matchMedia?.('(pointer: coarse)').matches) return true
    const ua = navigator.userAgent
    const mobileUa = /iPhone|iPad|iPod|Android|Mobile/i.test(ua)
    // iPadOS reports a desktop Mac user agent; real Macs have no touch points.
    const iPadAsMac = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1
    return navigator.maxTouchPoints > 0 && (mobileUa || iPadAsMac)
  } catch {
    return false
  }
}

function canShareFile(file: File): boolean {
  try {
    return typeof navigator.share === 'function' && navigator.canShare?.({ files: [file] }) === true
  } catch {
    return false
  }
}

function isAbortError(err: unknown): boolean {
  return err instanceof Error && err.name === 'AbortError'
}

function downloadFile(file: File): void {
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Revoking right away can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

/**
 * Write the journal as "trades.json". Uses the share sheet (navigator.share with a File) where
 * available, so on iPhone the user picks "Save to Files" -> iCloud Drive; otherwise triggers a download.
 * Records lastBackupAt unless the user cancelled.
 */
export async function exportBackup(journal: Journal): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const file = new File([JSON.stringify(journal, null, 2)], BACKUP_FILE_NAME, { type: 'application/json' })
  let result: 'shared' | 'downloaded'
  if (isTouchDevice() && canShareFile(file)) {
    try {
      await navigator.share({ files: [file] })
    } catch (err) {
      if (isAbortError(err)) return 'cancelled'
      const reason = err instanceof Error ? err.message : String(err)
      throw new AppError('shareFailed', `Could not open the share sheet: ${reason}`, { reason })
    }
    result = 'shared'
  } else {
    downloadFile(file)
    result = 'downloaded'
  }
  writeBackupState({ ...getBackupState(), lastBackupAt: Date.now() })
  return result
}

/** Read and validate a backup file picked by the user. Throws an AppError on bad files. */
export async function readBackupFile(file: File): Promise<Journal> {
  let text: string
  try {
    text = await file.text()
  } catch {
    throw new AppError('fileUnreadable', 'Could not read the file')
  }
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    throw new AppError('fileNotJson', 'File is not valid JSON')
  }
  return parseJournal(json)
}

/** Ask the browser to keep this site's storage (navigator.storage.persist). Never throws. */
export async function requestPersistence(): Promise<void> {
  try {
    if (await navigator.storage?.persisted?.()) return
    await navigator.storage?.persist?.()
  } catch {
    // Not supported or refused: storage stays "best effort".
  }
}
