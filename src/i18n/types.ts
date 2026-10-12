export type Lang = 'en' | 'uk'

export const LANGS: Lang[] = ['en', 'uk']

/** Each language written in its own language, for the switch in Settings (not translated). */
export const LANG_NAMES: Record<Lang, string> = { en: 'English', uk: 'Українська' }
