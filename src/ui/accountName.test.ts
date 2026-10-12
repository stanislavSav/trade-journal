import { describe, expect, it } from 'vitest'
import { nameMatches } from './accountName'

describe('nameMatches', () => {
  it('ignores spaces around the typed text', () => {
    expect(nameMatches(' Family ', 'Family')).toBe(true)
  })

  it('is case-sensitive', () => {
    expect(nameMatches('family', 'Family')).toBe(false)
    expect(nameMatches('FAMILY', 'Family')).toBe(false)
  })

  it('treats NFC and NFD forms of a Cyrillic name as the same', () => {
    const nfc = 'Мій'.normalize('NFC')
    const nfd = 'Мій'.normalize('NFD')
    expect(nfc).not.toBe(nfd)
    expect(nameMatches(nfd, nfc)).toBe(true)
    expect(nameMatches(nfc, nfd)).toBe(true)
  })

  it('never matches empty text', () => {
    expect(nameMatches('', 'Family')).toBe(false)
    expect(nameMatches('   ', 'Family')).toBe(false)
    expect(nameMatches('', '')).toBe(false)
  })

  it('does not match a part of the name', () => {
    expect(nameMatches('Fam', 'Family')).toBe(false)
  })
})
