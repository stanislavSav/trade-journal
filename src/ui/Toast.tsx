import { useEffect, useEffectEvent } from 'react'
import { createPortal } from 'react-dom'

export interface ToastMessage {
  id: number
  text: string
}

/** Short confirmation at the bottom. Lives outside #root so it stays visible (and announced) over sheets. */
export function Toast({ message, onDone }: { message: ToastMessage | null; onDone: () => void }) {
  const done = useEffectEvent(onDone)

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => done(), 3200)
    return () => clearTimeout(timer)
  }, [message])

  return createPortal(
    <div className="toast-region" aria-live="polite" role="status">
      {message && (
        <div key={message.id} className="toast">
          {message.text}
        </div>
      )}
    </div>,
    document.body,
  )
}
