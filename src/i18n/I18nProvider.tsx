import { createContext, useContext, useLayoutEffect, useMemo, type ReactNode } from 'react'
import { useStoredString } from '../state/useStoredString'
import { resolveLang } from './detect'
import { en, type Messages } from './en'
import type { Lang } from './types'
import { uk } from './uk'

/** Device preference (G5, plan D6). Written only when the user picks a language. */
export const LANG_KEY = 'trade-journal:ui:lang'

const catalogs: Record<Lang, Messages> = { en, uk }

export interface I18n {
  lang: Lang
  t: Messages
  setLang: (lang: Lang) => void
  /** True when the user picked the language; false while the app follows the device. */
  chosen: boolean
}

const I18nContext = createContext<I18n | null>(null)

function deviceLanguages(): readonly string[] {
  if (typeof navigator === 'undefined') return []
  return navigator.languages?.length ? navigator.languages : [navigator.language]
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [stored, store] = useStoredString(LANG_KEY)
  const { lang, chosen } = resolveLang(stored, deviceLanguages())

  // Before paint, so a screen reader never starts in the wrong voice (plan D15).
  useLayoutEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const value = useMemo<I18n>(() => ({ lang, t: catalogs[lang], setLang: store, chosen }), [lang, store, chosen])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

function useI18n(): I18n {
  const value = useContext(I18nContext)
  if (!value) throw new Error('useT() and useLang() need an <I18nProvider> above them')
  return value
}

/** Messages of the active language. The only way UI code gets text. */
export function useT(): Messages {
  return useI18n().t
}

/** The active language, the switch, and whether the user has chosen. */
export function useLang(): Pick<I18n, 'lang' | 'setLang' | 'chosen'> {
  const { lang, setLang, chosen } = useI18n()
  return { lang, setLang, chosen }
}
