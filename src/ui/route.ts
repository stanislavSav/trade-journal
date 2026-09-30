import { useCallback, useEffect, useRef, useState } from 'react'

// The open bag lives in history.state, so every kind of "back" (the ‹ button, browser back,
// Mac trackpad swipe, Android back, the iOS edge swipe) returns to the list the same way.

export function bagIdFrom(state: unknown): string | null {
  const id = typeof state === 'object' && state !== null ? (state as { bagId?: unknown }).bagId : null
  return typeof id === 'string' ? id : null
}

function currentState(): Record<string, unknown> {
  const state: unknown = history.state
  return typeof state === 'object' && state !== null ? (state as Record<string, unknown>) : {}
}

export interface BagRoute {
  bagId: string | null
  openBag: (id: string) => void
  closeBag: () => void
}

/** `onNavigate` runs when the user moves through history (e.g. to close an open sheet). */
export function useBagRoute(onNavigate?: () => void): BagRoute {
  const [bagId, setBagId] = useState(() => bagIdFrom(history.state))
  // Whether this page pushed the entry we are on; after a reload there may be no list entry behind it.
  const pushed = useRef(false)
  const onNavigateRef = useRef(onNavigate)
  useEffect(() => {
    onNavigateRef.current = onNavigate
  })

  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      setBagId(bagIdFrom(e.state))
      onNavigateRef.current?.()
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const openBag = useCallback((id: string) => {
    history.pushState({ ...currentState(), bagId: id }, '')
    pushed.current = true
    setBagId(id)
  }, [])

  const closeBag = useCallback(() => {
    // Safe to call twice (e.g. the swipe finishes just as a popstate arrives).
    if (bagIdFrom(history.state) === null) {
      setBagId(null)
    } else if (pushed.current) {
      history.back()
    } else {
      history.replaceState({ ...currentState(), bagId: null }, '')
      setBagId(null)
    }
  }, [])

  return { bagId, openBag, closeBag }
}
