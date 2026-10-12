import { useEffect, useEffectEvent, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useT } from '../i18n'
import { isTopLayer, lockPage, pushLayer } from './modal'
import { useVisualViewport } from './useVisualViewport'

interface Props {
  title: string
  onClose: () => void
  children: ReactNode
}

/** Bottom sheet on phones, centered dialog on wide screens. Closes on backdrop tap and Escape. */
export function Sheet({ title, onClose, children }: Props) {
  const t = useT()
  const titleId = useId()
  const dialog = useRef<HTMLDivElement>(null)
  const box = useVisualViewport()
  // Captured during the first render, before any autoFocus inside the sheet moves focus.
  const [opener] = useState(() => document.activeElement as HTMLElement | null)
  const close = useEffectEvent(() => onClose())

  useEffect(() => {
    const token = {}
    const popLayer = pushLayer(token)
    const unlock = lockPage()
    const el = dialog.current
    if (el && !el.contains(document.activeElement)) el.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isTopLayer(token)) {
        e.preventDefault()
        close()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      popLayer()
      unlock()
      opener?.focus?.({ preventScroll: true })
    }
  }, [opener])

  const style = box ? { top: box.top, height: box.height, bottom: 'auto' } : undefined

  return createPortal(
    <div className="sheet-layer" style={style}>
      <div className="sheet-backdrop" onClick={onClose} aria-hidden="true" />
      <div ref={dialog} className="sheet" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
        <div className="sheet-grabber" aria-hidden="true" />
        <div className="sheet-head">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="text-btn" onClick={onClose}>
            {t.common.close}
          </button>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
