import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  CHECK_INTERVAL_MS,
  MIN_CHECK_GAP_MS,
  isUpdateReady,
  markUpdateReady,
  resetUpdateReady,
  shouldCheck,
  subscribeUpdateReady,
} from './updateState'

describe('shouldCheck', () => {
  it('checks when nothing was checked yet', () => {
    expect(shouldCheck(1_000, null)).toBe(true)
  })

  it('waits at least a minute between checks', () => {
    expect(shouldCheck(10_000 + MIN_CHECK_GAP_MS - 1, 10_000)).toBe(false)
    expect(shouldCheck(10_000 + MIN_CHECK_GAP_MS, 10_000)).toBe(true)
  })

  it('the interval is longer than the throttle', () => {
    expect(CHECK_INTERVAL_MS).toBeGreaterThan(MIN_CHECK_GAP_MS)
  })
})

describe('update ready store', () => {
  afterEach(() => resetUpdateReady())

  it('starts not ready and tells listeners once', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeUpdateReady(listener)
    expect(isUpdateReady()).toBe(false)
    markUpdateReady()
    markUpdateReady()
    expect(isUpdateReady()).toBe(true)
    expect(listener).toHaveBeenCalledTimes(1)
    unsubscribe()
  })

  it('an unsubscribed listener is not called', () => {
    const listener = vi.fn()
    subscribeUpdateReady(listener)()
    markUpdateReady()
    expect(listener).not.toHaveBeenCalled()
  })
})
