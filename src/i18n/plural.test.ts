import { describe, expect, it } from 'vitest'
import { pluralEn, pluralUk } from './plural'

describe('pluralUk', () => {
  const form = pluralUk({ one: () => 'one', few: () => 'few', many: () => 'many', other: () => 'other' })

  it('uses "one" for 1, 21, 31, 101', () => {
    for (const n of [1, 21, 31, 101]) expect(form(n)).toBe('one')
  })

  it('uses "few" for 2–4, 22–24', () => {
    for (const n of [2, 3, 4, 22, 23, 24]) expect(form(n)).toBe('few')
  })

  it('uses "many" for 0, 5–20, 11–14, 25', () => {
    for (const n of [0, 5, 6, 10, 11, 12, 13, 14, 15, 20, 25]) expect(form(n)).toBe('many')
  })

  it('passes the number to the form', () => {
    const trades = pluralUk({
      one: (n) => `${n} нова`,
      few: (n) => `${n} нові`,
      many: (n) => `${n} нових`,
      other: (n) => `${n} нових`,
    })
    expect(trades(1)).toBe('1 нова')
    expect(trades(3)).toBe('3 нові')
    expect(trades(5)).toBe('5 нових')
    expect(trades(21)).toBe('21 нова')
    expect(trades(11)).toBe('11 нових')
  })
})

describe('pluralEn', () => {
  const form = pluralEn({ one: () => 'one', other: () => 'other' })

  it('uses "one" only for 1', () => {
    expect(form(1)).toBe('one')
    for (const n of [0, 2, 5, 21]) expect(form(n)).toBe('other')
  })

  it('passes the number to the form', () => {
    const bags = pluralEn({ one: (n) => `${n} bag`, other: (n) => `${n} bags` })
    expect(bags(1)).toBe('1 bag')
    expect(bags(2)).toBe('2 bags')
  })
})
