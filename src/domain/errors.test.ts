import { describe, expect, it } from 'vitest'
import { AppError, isAppError } from './errors'

describe('AppError', () => {
  it('keeps the English message and carries code and params', () => {
    const err = new AppError('searchHttp', 'Coin search failed (HTTP 500)', { status: 500 })
    expect(err).toBeInstanceOf(Error)
    expect(err.message).toBe('Coin search failed (HTTP 500)')
    expect(err.name).toBe('AppError')
    expect(err.code).toBe('searchHttp')
    expect(err.params).toEqual({ status: 500 })
  })

  it('has empty params by default', () => {
    expect(new AppError('tradeNotFound', 'Trade not found').params).toEqual({})
  })

  it('is recognised by isAppError', () => {
    expect(isAppError(new AppError('bagNotFound', 'Bag not found'))).toBe(true)
    expect(isAppError(new Error('x'))).toBe(false)
    expect(isAppError('x')).toBe(false)
  })
})
