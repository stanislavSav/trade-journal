import { LANGS, type Lang } from './types'

/**
 * Language from the device list (navigator.languages), plan D5: the first entry that starts with "uk" gives
 * Ukrainian, the first that starts with "en" gives English, none of them gives English.
 * Russian-only devices get English: docs/i18n/parking-lot/01-russian-language-devices.md.
 */
export function detectLanguage(languages: readonly string[]): Lang {
  for (const tag of languages) {
    const lower = tag.toLowerCase()
    if (lower.startsWith('uk')) return 'uk'
    if (lower.startsWith('en')) return 'en'
  }
  return 'en'
}

/** The stored device preference, or null when it is missing or unknown (plan D6). */
export function parseStoredLang(value: string | null): Lang | null {
  return LANGS.find((l) => l === value) ?? null
}

/** The active language: the stored choice, else the device language. `chosen` is true for a stored choice. */
export function resolveLang(stored: string | null, languages: readonly string[]): { lang: Lang; chosen: boolean } {
  const choice = parseStoredLang(stored)
  return choice ? { lang: choice, chosen: true } : { lang: detectLanguage(languages), chosen: false }
}
