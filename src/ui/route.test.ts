import { describe, expect, it } from 'vitest'
import { bagIdFrom } from './route'

describe('bagIdFrom', () => {
  it('reads the open bag from history state', () => {
    expect(bagIdFrom({ bagId: 'b1' })).toBe('b1')
  })

  it('returns null for the list and for foreign or missing state', () => {
    expect(bagIdFrom({ bagId: null })).toBeNull()
    expect(bagIdFrom(null)).toBeNull()
    expect(bagIdFrom(undefined)).toBeNull()
    expect(bagIdFrom({ other: 1 })).toBeNull()
    expect(bagIdFrom({ bagId: 42 })).toBeNull()
    expect(bagIdFrom('b1')).toBeNull()
  })
})
