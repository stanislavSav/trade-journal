import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Journal } from '../domain'

const EMPTY: Journal = { version: 1, accounts: [], coins: [], bags: [], trades: [], storages: [] }

vi.mock('../domain', () => ({
  emptyJournal: () => structuredClone(EMPTY),
  parseJournal: (json: unknown) => {
    if (typeof json !== 'object' || json === null || (json as { version?: unknown }).version !== 1) {
      throw new Error('Not a trade journal backup')
    }
    return json as Journal
  },
}))

const {
  exportBackup,
  getBackupState,
  hasUnsavedChanges,
  loadJournal,
  readBackupFile,
  requestPersistence,
  saveJournal,
} = await import('./index')

const JOURNAL_KEY = 'trade-journal:journal:v1'
const BACKUP_KEY = 'trade-journal:backup'

function memoryStorage(): Storage {
  const data = new Map<string, string>()
  return {
    get length() {
      return data.size
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (i) => [...data.keys()][i] ?? null,
    removeItem: (key) => void data.delete(key),
    setItem: (key, value) => void data.set(key, String(value)),
  }
}

const journal: Journal = {
  version: 1,
  accounts: [{ id: 'cs', name: 'CS', updatedAt: 1 }],
  coins: [],
  bags: [],
  trades: [],
  storages: [],
}

let storage: Storage

beforeEach(() => {
  storage = memoryStorage()
  vi.stubGlobal('localStorage', storage)
  vi.useFakeTimers({ now: new Date('2026-09-30T12:00:00Z') })
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('loadJournal / saveJournal', () => {
  it('returns an empty journal when nothing is stored', () => {
    expect(loadJournal()).toEqual(EMPTY)
  })

  it('round-trips a saved journal and records lastChangeAt', () => {
    saveJournal(journal)
    expect(loadJournal()).toEqual(journal)
    expect(getBackupState()).toEqual({ lastChangeAt: Date.now(), lastBackupAt: null })
  })

  it('returns an empty journal for corrupt data without overwriting it', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    storage.setItem(JOURNAL_KEY, '{not json')
    expect(loadJournal()).toEqual(EMPTY)
    expect(storage.getItem(JOURNAL_KEY)).toBe('{not json')
    expect(storage.getItem('trade-journal:journal:v1:unreadable')).toBe('{not json')
  })

  it('returns an empty journal when stored data fails validation', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    storage.setItem(JOURNAL_KEY, JSON.stringify({ version: 99 }))
    expect(loadJournal()).toEqual(EMPTY)
  })

  it('survives a localStorage that throws on read', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('SecurityError')
      },
    })
    expect(loadJournal()).toEqual(EMPTY)
    expect(getBackupState()).toEqual({ lastChangeAt: null, lastBackupAt: null })
  })

  it('throws a readable error when the journal cannot be written', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
    })
    expect(() => saveJournal(journal)).toThrow('Could not save on this device')
  })
})

describe('getBackupState / hasUnsavedChanges', () => {
  it('ignores malformed backup state', () => {
    storage.setItem(BACKUP_KEY, JSON.stringify({ lastChangeAt: 'x', lastBackupAt: 5 }))
    expect(getBackupState()).toEqual({ lastChangeAt: null, lastBackupAt: 5 })
    storage.setItem(BACKUP_KEY, 'garbage')
    expect(getBackupState()).toEqual({ lastChangeAt: null, lastBackupAt: null })
  })

  it('compares change and backup times', () => {
    expect(hasUnsavedChanges({ lastChangeAt: null, lastBackupAt: null })).toBe(false)
    expect(hasUnsavedChanges({ lastChangeAt: null, lastBackupAt: 5 })).toBe(false)
    expect(hasUnsavedChanges({ lastChangeAt: 5, lastBackupAt: null })).toBe(true)
    expect(hasUnsavedChanges({ lastChangeAt: 6, lastBackupAt: 5 })).toBe(true)
    expect(hasUnsavedChanges({ lastChangeAt: 5, lastBackupAt: 5 })).toBe(false)
    expect(hasUnsavedChanges({ lastChangeAt: 4, lastBackupAt: 5 })).toBe(false)
  })
})

describe('exportBackup', () => {
  const iPhoneUa = 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148'
  const macUa = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15'

  function stubDocument() {
    const anchor = { href: '', download: '', style: {} as Record<string, string>, click: vi.fn(), remove: vi.fn() }
    vi.stubGlobal('document', {
      createElement: vi.fn(() => anchor),
      body: { appendChild: vi.fn() },
    })
    const createUrl = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:backup')
    const revokeUrl = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    return { anchor, createUrl, revokeUrl }
  }

  function stubNavigator(opts: { ua: string; touchPoints: number; share?: () => Promise<void> }) {
    const share = vi.fn<(data: ShareData) => Promise<void>>(opts.share ?? (() => Promise.resolve()))
    vi.stubGlobal('navigator', {
      userAgent: opts.ua,
      maxTouchPoints: opts.touchPoints,
      canShare: () => true,
      share,
    })
    return share
  }

  it('uses the share sheet on a phone and records the backup', async () => {
    saveJournal(journal)
    vi.advanceTimersByTime(1000)
    const share = stubNavigator({ ua: iPhoneUa, touchPoints: 5 })

    await expect(exportBackup(journal)).resolves.toBe('shared')

    const file = share.mock.calls[0]![0].files![0]!
    expect(file.name).toBe('trades.json')
    expect(file.type).toBe('application/json')
    expect(JSON.parse(await file.text())).toEqual(journal)
    expect(await file.text()).toContain('\n  "version": 1')
    const state = getBackupState()
    expect(state.lastBackupAt).toBe(Date.now())
    expect(hasUnsavedChanges(state)).toBe(false)
  })

  it('returns cancelled and records nothing when the share sheet is dismissed', async () => {
    stubNavigator({
      ua: iPhoneUa,
      touchPoints: 5,
      share: () => Promise.reject(new DOMException('Share canceled', 'AbortError')),
    })
    await expect(exportBackup(journal)).resolves.toBe('cancelled')
    expect(getBackupState().lastBackupAt).toBeNull()
  })

  it('rejects with a readable error when sharing fails for another reason', async () => {
    stubNavigator({
      ua: iPhoneUa,
      touchPoints: 5,
      share: () => Promise.reject(new DOMException('No user gesture', 'NotAllowedError')),
    })
    await expect(exportBackup(journal)).rejects.toThrow('Could not open the share sheet: No user gesture')
    expect(getBackupState().lastBackupAt).toBeNull()
  })

  it('downloads on desktop even when the browser could share', async () => {
    const share = stubNavigator({ ua: macUa, touchPoints: 0 })
    const { anchor, createUrl, revokeUrl } = stubDocument()

    await expect(exportBackup(journal)).resolves.toBe('downloaded')

    expect(share).not.toHaveBeenCalled()
    expect(createUrl).toHaveBeenCalledOnce()
    expect(anchor.href).toBe('blob:backup')
    expect(anchor.download).toBe('trades.json')
    expect(anchor.click).toHaveBeenCalledOnce()
    expect(anchor.remove).toHaveBeenCalledOnce()
    expect(getBackupState().lastBackupAt).toBe(Date.now())
    expect(revokeUrl).not.toHaveBeenCalled()
    vi.runAllTimers()
    expect(revokeUrl).toHaveBeenCalledWith('blob:backup')
  })

  it('treats an iPad with a desktop user agent as a touch device', async () => {
    const share = stubNavigator({ ua: macUa, touchPoints: 5 })
    await expect(exportBackup(journal)).resolves.toBe('shared')
    expect(share).toHaveBeenCalledOnce()
  })

  it('downloads on a touch device that cannot share files', async () => {
    vi.stubGlobal('navigator', { userAgent: iPhoneUa, maxTouchPoints: 5 })
    const { anchor } = stubDocument()
    await expect(exportBackup(journal)).resolves.toBe('downloaded')
    expect(anchor.click).toHaveBeenCalledOnce()
  })
})

describe('readBackupFile', () => {
  it('parses a valid backup', async () => {
    const file = new File([JSON.stringify(journal)], 'trades.json')
    await expect(readBackupFile(file)).resolves.toEqual(journal)
  })

  it('rejects files that are not JSON', async () => {
    await expect(readBackupFile(new File(['hello'], 'x.json'))).rejects.toThrow('File is not valid JSON')
  })

  it('passes validation errors through', async () => {
    const file = new File([JSON.stringify({ foo: 1 })], 'x.json')
    await expect(readBackupFile(file)).rejects.toThrow('Not a trade journal backup')
  })
})

describe('requestPersistence', () => {
  it('asks for persistent storage when not yet granted', async () => {
    const persist = vi.fn(() => Promise.resolve(true))
    vi.stubGlobal('navigator', { storage: { persisted: () => Promise.resolve(false), persist } })
    await requestPersistence()
    expect(persist).toHaveBeenCalledOnce()
  })

  it('never throws', async () => {
    vi.stubGlobal('navigator', { storage: { persist: () => Promise.reject(new Error('nope')) } })
    await expect(requestPersistence()).resolves.toBeUndefined()
    vi.stubGlobal('navigator', {})
    await expect(requestPersistence()).resolves.toBeUndefined()
  })
})
