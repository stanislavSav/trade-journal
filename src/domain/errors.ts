// Errors that a user can see carry a code and parameters; the UI turns them into text in the active language
// (docs/i18n/plan.md D12). `message` stays English, for logs and tests.

export type ErrorCode =
  // journal edits (actions.ts)
  | 'symbolRequired'
  | 'accountNotFound'
  | 'bagOtherOwner' // { name }
  | 'sideInvalid'
  | 'dateInvalid'
  | 'qtyInvalid'
  | 'totalInvalid'
  | 'bagNotFound'
  | 'tradeNotFound'
  | 'bagNameRequired'
  | 'accountNameRequired'
  // backup files (journal.ts parseJournal); `detail` is the English technical detail (plan D13)
  | 'backupNotJournal' // { detail? }
  | 'backupVersion' // { version }
  | 'backupDamaged' // { detail }
  // this device (storage/index.ts)
  | 'storageFull'
  | 'shareFailed' // { reason }
  | 'fileUnreadable'
  | 'fileNotJson'
  // coin search (prices/index.ts, ui/useCoinSearch.ts)
  | 'searchOffline'
  | 'searchRateLimited'
  | 'searchHttp' // { status }
  | 'searchFailed'
  | 'deviceOffline'

export type ErrorParams = Record<string, string | number>

export class AppError extends Error {
  readonly code: ErrorCode
  readonly params: ErrorParams

  constructor(code: ErrorCode, message: string, params: ErrorParams = {}) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.params = params
  }
}

export function isAppError(e: unknown): e is AppError {
  return e instanceof AppError
}

/** Anything a `catch` got, as an Error (so it can be kept in state and shown later). */
export function asError(e: unknown): Error {
  return e instanceof Error ? e : new Error(String(e))
}
