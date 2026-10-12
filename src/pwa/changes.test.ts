import { describe, expect, it } from 'vitest'
import { changesUrl } from './changes'

describe('changesUrl', () => {
  it('compares the running commit with main', () => {
    expect(changesUrl('abc123')).toBe('https://github.com/stanislavSav/trade-journal/compare/abc123...main')
  })

  it('falls back to the commit list when the commit is unknown', () => {
    expect(changesUrl('')).toBe('https://github.com/stanislavSav/trade-journal/commits/main')
  })
})
