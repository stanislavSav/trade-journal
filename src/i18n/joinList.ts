import type { Lang } from './types'

// English uses the British list style on purpose: "asset, qty and total" (no comma before "and"), as the app
// always wrote it. Ukrainian: "монету, кількість і суму".
const LIST_LOCALE: Record<Lang, string> = { en: 'en-GB', uk: 'uk' }

/** Words joined as a list in the UI language (Intl.ListFormat), e.g. "asset, qty and total". */
export function joinList(lang: Lang, words: string[]): string {
  return new Intl.ListFormat(LIST_LOCALE[lang], { type: 'conjunction' }).format(words)
}
