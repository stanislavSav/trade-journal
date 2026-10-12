import { describe, expect, it } from 'vitest'
import { AppError } from '../domain/errors'
import { en } from './en'
import { errorText } from './errorText'
import { uk } from './uk'

describe('errorText', () => {
  it('gives the catalog text of an AppError in each language', () => {
    const err = new AppError('qtyInvalid', 'Quantity must be a positive number')
    expect(errorText(en, err)).toEqual({ text: 'Quantity must be a positive number' })
    expect(errorText(uk, err)).toEqual({ text: uk.errors.qtyInvalid })
  })

  it('passes the params to the message', () => {
    const err = new AppError('searchHttp', 'Coin search failed (HTTP 503)', { status: 503 })
    expect(errorText(en, err).text).toBe('Coin search failed (HTTP 503)')
    expect(errorText(uk, err).text).toBe('Помилка пошуку монет (HTTP 503)')
  })

  it('gives a headline plus the English detail for a damaged backup', () => {
    const detail = 'Trade 3: qty must be a positive number'
    const err = new AppError('backupDamaged', detail, { detail })
    expect(errorText(en, err)).toEqual({ text: 'The backup file is damaged', detail })
    expect(errorText(uk, err)).toEqual({ text: uk.errors.backupDamaged, detail })
  })

  it('names the version of a newer backup', () => {
    const err = new AppError('backupVersion', 'Unsupported backup version: 2', { version: '2' })
    expect(errorText(en, err).text).toBe('This backup is from a newer version of the app (version 2)')
  })

  it('gives the generic headline with the raw message for other errors', () => {
    expect(errorText(en, new Error('x'))).toEqual({ text: 'Something went wrong', detail: 'x' })
    expect(errorText(uk, new Error('x'))).toEqual({ text: 'Щось пішло не так', detail: 'x' })
    expect(errorText(en, 'boom')).toEqual({ text: 'Something went wrong', detail: 'boom' })
    expect(errorText(en, new Error(''))).toEqual({ text: 'Something went wrong' })
  })

  it('has a text for every error code in both languages', () => {
    expect(Object.keys(uk.errors).sort()).toEqual(Object.keys(en.errors).sort())
  })
})
