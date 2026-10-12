import { isAppError, type ErrorParams } from '../domain/errors'
import type { Messages } from './en'

export interface ErrorText {
  text: string
  /** English technical detail (a broken backup, a browser message), shown smaller under the text. Not translated. */
  detail?: string
}

/**
 * Text for anything a `catch` got, in the active language (docs/i18n/plan.md D12, D13).
 * An AppError gets its catalog text; anything else gets "Something went wrong" plus its raw message as detail.
 */
export function errorText(t: Messages, err: unknown): ErrorText {
  if (!isAppError(err)) {
    const detail = err instanceof Error ? err.message : String(err)
    return detail ? { text: t.common.somethingWrong, detail } : { text: t.common.somethingWrong }
  }
  const entry = t.errors[err.code]
  // Each catalog function reads only the params its AppError carries (see ErrorCode in src/domain/errors.ts).
  const text = typeof entry === 'function' ? (entry as (p: ErrorParams) => string)(err.params) : entry
  const detail = err.params.detail ?? err.params.reason
  return detail === undefined || detail === '' ? { text } : { text, detail: String(detail) }
}
