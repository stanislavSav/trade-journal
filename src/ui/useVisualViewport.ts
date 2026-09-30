import { useEffect, useState } from 'react'

export interface ViewportBox {
  top: number
  height: number
}

/**
 * The visible part of the page. On iPhone the keyboard shrinks the visual viewport but not
 * the layout viewport, so a bottom sheet pinned to the layout viewport ends up under the keyboard.
 */
export function useVisualViewport(): ViewportBox | null {
  const [box, setBox] = useState<ViewportBox | null>(null)

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const update = () => setBox({ top: vv.offsetTop, height: vv.height })
    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [])

  return box
}
