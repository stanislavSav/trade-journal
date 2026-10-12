import { describe, expect, it } from 'vitest'
import { joinList } from './joinList'

describe('joinList', () => {
  it('joins English words without a comma before "and"', () => {
    expect(joinList('en', ['asset', 'qty', 'total'])).toBe('asset, qty and total')
    expect(joinList('en', ['qty', 'total'])).toBe('qty and total')
    expect(joinList('en', ['total'])).toBe('total')
  })

  it('joins Ukrainian words with "і"', () => {
    expect(joinList('uk', ['монету', 'кількість', 'суму'])).toBe('монету, кількість і суму')
  })
})
