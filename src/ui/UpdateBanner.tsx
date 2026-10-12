import { useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { useT } from '../i18n'
import { isUpdateReady, subscribeUpdateReady } from '../pwa/updates'

/**
 * "New version available" card (docs/update-prompt/plan.md D3–D6). Lives outside #root, like the toast, so it shows
 * over sheets. Not modal: it never takes focus; the status region announces it.
 */
export function UpdateBanner() {
  const t = useT()
  const ready = useSyncExternalStore(subscribeUpdateReady, isUpdateReady, () => false)
  const [later, setLater] = useState(false)
  const show = ready && !later

  return createPortal(
    <div className="update-region" role="status" aria-live="polite">
      {show && (
        <div className="update-card">
          <span className="update-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 11a8 8 0 1 0-2.3 5.7" />
              <path d="M20 4v7h-7" />
            </svg>
          </span>
          <div className="update-text">
            <strong>{t.update.title}</strong>
            <span>{t.update.text}</span>
          </div>
          <div className="update-actions">
            <button type="button" className="btn small update-later" onClick={() => setLater(true)}>
              {t.update.later}
            </button>
            <button type="button" className="btn small primary" onClick={() => window.location.reload()}>
              {t.update.refresh}
            </button>
          </div>
        </div>
      )}
    </div>,
    document.body,
  )
}
