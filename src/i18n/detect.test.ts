import { describe, expect, it } from 'vitest'
import { detectLanguage, parseStoredLang, resolveLang } from './detect'

describe('detectLanguage', () => {
  it('takes the first uk* or en* entry', () => {
    expect(detectLanguage(['uk-UA'])).toBe('uk')
    expect(detectLanguage(['UK'])).toBe('uk')
    expect(detectLanguage(['ru-RU', 'uk-UA'])).toBe('uk')
    expect(detectLanguage(['de-DE', 'en-US'])).toBe('en')
    expect(detectLanguage(['en-GB', 'uk'])).toBe('en')
  })

  it('falls back to English', () => {
    expect(detectLanguage(['ru-RU'])).toBe('en')
    expect(detectLanguage([])).toBe('en')
  })
})

describe('parseStoredLang', () => {
  it('accepts only en and uk', () => {
    expect(parseStoredLang('uk')).toBe('uk')
    expect(parseStoredLang('en')).toBe('en')
    expect(parseStoredLang('fr')).toBeNull()
    expect(parseStoredLang('')).toBeNull()
    expect(parseStoredLang(null)).toBeNull()
  })
})

describe('resolveLang', () => {
  it('uses the stored choice first', () => {
    expect(resolveLang('en', ['uk-UA'])).toEqual({ lang: 'en', chosen: true })
    expect(resolveLang('uk', ['en-US'])).toEqual({ lang: 'uk', chosen: true })
  })

  it('follows the device while nothing valid is stored', () => {
    expect(resolveLang(null, ['uk-UA'])).toEqual({ lang: 'uk', chosen: false })
    expect(resolveLang('fr', ['uk-UA'])).toEqual({ lang: 'uk', chosen: false })
    expect(resolveLang(null, ['de-DE'])).toEqual({ lang: 'en', chosen: false })
  })
})
