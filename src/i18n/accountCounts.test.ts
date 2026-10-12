import { describe, expect, it } from 'vitest'
import { en } from './en'
import { uk } from './uk'

const nbsp = ' '
const plain = (s: string) => s.replaceAll(nbsp, ' ')

describe('account counts (docs/account-removal/plan.md §5.3)', () => {
  it('English: one and other', () => {
    expect(plain(en.accounts.counts({ bags: 1, trades: 1 }))).toBe('1 bag · 1 trade')
    expect(plain(en.accounts.counts({ bags: 3, trades: 12 }))).toBe('3 bags · 12 trades')
    expect(plain(en.accounts.counts({ bags: 0, trades: 0 }))).toBe('0 bags · 0 trades')
  })

  it('Ukrainian: one, few and many forms', () => {
    expect(plain(uk.accounts.counts({ bags: 1, trades: 1 }))).toBe('1 позиція · 1 угода')
    expect(plain(uk.accounts.counts({ bags: 3, trades: 22 }))).toBe('3 позиції · 22 угоди')
    expect(plain(uk.accounts.counts({ bags: 5, trades: 11 }))).toBe('5 позицій · 11 угод')
    expect(plain(uk.accounts.counts({ bags: 21, trades: 0 }))).toBe('21 позиція · 0 угод')
  })

  it('keeps each number on the same line as its word', () => {
    expect(en.accounts.what({ bags: 2, trades: 5 })).toContain(`2${nbsp}bags, 5${nbsp}trades`)
    expect(uk.accounts.what({ bags: 2, trades: 5 })).toContain(`2${nbsp}позиції, 5${nbsp}угод`)
  })
})
