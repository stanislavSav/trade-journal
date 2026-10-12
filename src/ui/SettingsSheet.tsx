import { useId, useState } from 'react'
import type { Account, Journal } from '../domain'
import { LANG_NAMES, LANGS, useLang, useT } from '../i18n'
import { checkForUpdates } from '../pwa/updates'
import { AccountsSection } from './AccountsSection'
import { Sheet } from './Sheet'

const REPO_URL = 'https://github.com/stanislavSav/trade-journal'
const LICENCE_URL = `${REPO_URL}/blob/main/LICENSE`

interface Props {
  /** Live accounts in header order. */
  accounts: Account[]
  journal: Journal
  onRemoveAccount: (accountId: string) => void
  /** Shows a short toast (result of Check for updates). */
  onNotify: (text: string) => void
  onClose: () => void
}

/** Device settings, the accounts, and information about the app (docs/i18n/plan.md §5.2). */
export function SettingsSheet({ accounts, journal, onRemoveAccount, onNotify, onClose }: Props) {
  const t = useT()
  const { lang, setLang, chosen } = useLang()
  const languageId = useId()
  const aboutId = useId()
  const [checking, setChecking] = useState(false)

  const check = async () => {
    setChecking(true)
    const result = await checkForUpdates()
    setChecking(false)
    // 'ready' shows the update card itself; the toast covers the other results.
    if (result !== 'ready') onNotify(t.update[result])
  }

  const links = [
    { href: REPO_URL, label: t.settings.sourceCode },
    { href: LICENCE_URL, label: t.settings.licence },
  ]

  return (
    <Sheet title={t.settings.title} onClose={onClose}>
      <div className="settings">
        <section aria-labelledby={languageId}>
          <h3 id={languageId} className="section-title">
            {t.settings.language}
          </h3>
          <div className="segmented settings-segmented" role="radiogroup" aria-label={t.settings.language}>
            {LANGS.map((l) => (
              <button
                key={l}
                type="button"
                role="radio"
                lang={l}
                aria-checked={lang === l}
                onClick={() => setLang(l)}
              >
                {LANG_NAMES[l]}
              </button>
            ))}
          </div>
          {!chosen && <p className="help settings-hint">{t.settings.languageHint}</p>}
        </section>

        <AccountsSection accounts={accounts} journal={journal} onRemove={onRemoveAccount} />

        <section aria-labelledby={aboutId}>
          <h3 id={aboutId} className="section-title">
            {t.settings.about}
          </h3>
          <div className="card list">
            <div className="about-head">
              <div className="about-title">
                <span>Trade Journal</span>
                <span className="num muted">{__APP_VERSION__}</span>
              </div>
              <p className="help">{t.settings.dataStays}</p>
              <p className="help num">
                {__APP_COMMIT__ ? (
                  <a href={`${REPO_URL}/commit/${__APP_COMMIT__}`} target="_blank" rel="noopener noreferrer">
                    {t.update.build({ build: __APP_BUILD__ })}
                    <span className="sr-only"> {t.settings.opensInNewTab}</span>
                  </a>
                ) : (
                  t.update.build({ build: __APP_BUILD__ })
                )}
              </p>
            </div>
            <button type="button" className="row link-row" onClick={check} disabled={checking}>
              <span>{checking ? t.update.checking : t.update.check}</span>
              <span className="link-arrow" aria-hidden="true">
                ↻
              </span>
            </button>
            {links.map((link) => (
              <a key={link.href} className="row link-row" href={link.href} target="_blank" rel="noopener noreferrer">
                <span>
                  {link.label}
                  <span className="sr-only"> {t.settings.opensInNewTab}</span>
                </span>
                <span className="link-arrow" aria-hidden="true">
                  ↗
                </span>
              </a>
            ))}
          </div>
        </section>
      </div>
    </Sheet>
  )
}
