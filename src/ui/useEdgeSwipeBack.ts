import { useEffect, useRef, type RefObject } from 'react'
import { EDGE_ZONE, completesBack, swipeIntent, type SwipeIntent } from './swipe'

const SETTLE = 'transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1)'

/**
 * iOS Home Screen apps have no system back swipe, so we provide one there.
 * Everywhere else (Safari, Android) the OS gesture already goes back through history,
 * and a second, custom gesture would go back twice.
 */
export function isIosStandalone(): boolean {
  return (navigator as Navigator & { standalone?: boolean }).standalone === true
}

function prefersReducedMotion(): boolean {
  return globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

/** Drag `ref` right from the left edge; past the threshold it slides away and `onBack` runs. */
export function useEdgeSwipeBack(
  ref: RefObject<HTMLElement | null>,
  onBack: () => void,
  enabled: boolean = isIosStandalone(),
): void {
  const onBackRef = useRef(onBack)
  useEffect(() => {
    onBackRef.current = onBack
  })

  useEffect(() => {
    const el = ref.current
    if (!enabled || !el) return

    let start: { x: number; y: number } | null = null
    let intent: SwipeIntent = 'none'
    let last = { x: 0, t: 0 }
    let velocity = 0
    let timer: ReturnType<typeof setTimeout> | undefined

    const moveTo = (dx: number, animate: boolean) => {
      el.style.transition = animate ? SETTLE : 'none'
      el.style.transform = dx === 0 ? '' : `translate3d(${dx}px, 0, 0)`
    }

    const onStart = (e: TouchEvent) => {
      const t = e.touches[0]
      start = null
      intent = 'none'
      if (e.touches.length !== 1 || !t || t.clientX > EDGE_ZONE) return
      start = { x: t.clientX, y: t.clientY }
      intent = 'pending'
      last = { x: t.clientX, t: e.timeStamp }
      velocity = 0
    }

    const onMove = (e: TouchEvent) => {
      const t = e.touches[0]
      if (!start || !t || intent === 'none') return
      const dx = t.clientX - start.x
      if (intent === 'pending') {
        intent = swipeIntent(dx, t.clientY - start.y)
        if (intent !== 'back') return
      }
      // Stop the page from scrolling while the screen follows the finger sideways.
      e.preventDefault()
      const dt = e.timeStamp - last.t
      if (dt > 0) velocity = (t.clientX - last.x) / dt
      last = { x: t.clientX, t: e.timeStamp }
      moveTo(Math.max(0, dx), false)
    }

    const onEnd = (e: TouchEvent) => {
      const began = start
      const wasSwipe = intent === 'back'
      start = null
      intent = 'none'
      if (!began || !wasSwipe) return
      const dx = Math.max(0, (e.changedTouches[0]?.clientX ?? last.x) - began.x)
      if (e.type !== 'touchend' || !completesBack(dx, el.clientWidth, velocity)) {
        moveTo(0, true)
        return
      }
      if (prefersReducedMotion()) {
        onBackRef.current()
        return
      }
      moveTo(el.clientWidth, true)
      let done = false
      const finish = () => {
        if (done) return
        done = true
        el.removeEventListener('transitionend', finish)
        onBackRef.current()
        // Normally the screen unmounts now; if it doesn't, don't leave it parked off-screen.
        timer = setTimeout(() => moveTo(0, false), 500)
      }
      el.addEventListener('transitionend', finish)
      timer = setTimeout(finish, 300) // transitionend is not guaranteed to fire
    }

    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchmove', onMove, { passive: false })
    el.addEventListener('touchend', onEnd)
    el.addEventListener('touchcancel', onEnd)
    return () => {
      clearTimeout(timer)
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchmove', onMove)
      el.removeEventListener('touchend', onEnd)
      el.removeEventListener('touchcancel', onEnd)
    }
  }, [ref, enabled])
}
