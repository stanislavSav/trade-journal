import { describe, expect, it } from 'vitest'
import { parseDecimal, toInputText, toMoneyInputText } from './numbers'

describe('parseDecimal', () => {
  it.each([
    ['0,5', 0.5],
    ['0.5', 0.5],
    [' 10 ', 10],
    ['1 812', 1812],
    ['1\u00a0812,50', 1812.5],
    ['1,234.56', 1234.56],
    ['1.234,56', 1234.56],
    ['1,234,567', 1234567],
    ['$1,500.25', 1500.25],
    ['.5', 0.5],
    ['0,625', 0.625],
    ['1,812', 1.812],
  ])('qty %s -> %s', (text, value) => {
    expect(parseDecimal(text)).toBe(value)
  })

  it.each([
    ['1,812', 1812],
    ['1.812', 1812],
    ['0,125', 0.125],
    ['1812,5', 1812.5],
  ])('money %s -> %s', (text, value) => {
    expect(parseDecimal(text, 'money')).toBe(value)
  })

  it.each(['', '  ', 'abc', '1,2.3.4', '-5', '1e5', '1..2'])('rejects %j', (text) => {
    expect(parseDecimal(text)).toBeNull()
  })
})

describe('input text', () => {
  it('drops float noise and round-trips', () => {
    expect(toInputText(0.1 + 0.2)).toBe('0.3')
    expect(toInputText(0.00000012)).toBe('0.00000012')
    expect(parseDecimal(toInputText(12345.678))).toBe(12345.678)
  })

  it('keeps 3-decimal dollar amounts unambiguous', () => {
    expect(parseDecimal(toMoneyInputText(1.234), 'money')).toBe(1.234)
    expect(parseDecimal(toMoneyInputText(1812), 'money')).toBe(1812)
  })
})
