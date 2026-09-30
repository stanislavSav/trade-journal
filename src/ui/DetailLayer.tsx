import { useRef, type ReactNode } from 'react'
import { useEdgeSwipeBack } from './useEdgeSwipeBack'

/** The bag screen slides over the list (instead of replacing it) so a back swipe reveals the list underneath. */
export function DetailLayer({ onBack, children }: { onBack: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEdgeSwipeBack(ref, onBack)
  return (
    <div className="detail-layer" ref={ref}>
      <div className="app">{children}</div>
    </div>
  )
}
