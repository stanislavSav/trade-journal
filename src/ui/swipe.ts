// Edge-swipe-back decisions, kept pure so they can be unit tested.

/** px from the left edge where a back swipe may start (about iOS's own edge zone). */
export const EDGE_ZONE = 28

// Movement before the direction is decided, so a tap or a small jitter is never a swipe.
const LOCK_DISTANCE = 10

export type SwipeIntent = 'pending' | 'back' | 'none'

/** From the movement so far (px): a back swipe, not one (e.g. vertical scroll), or too early to say. */
export function swipeIntent(dx: number, dy: number): SwipeIntent {
  if (Math.hypot(dx, dy) < LOCK_DISTANCE) return 'pending'
  return dx > Math.abs(dy) * 1.2 ? 'back' : 'none'
}

/** On release: go back when dragged past a third of the width, or flicked right (velocity in px/ms). */
export function completesBack(dx: number, width: number, velocity: number): boolean {
  return dx > width / 3 || (velocity > 0.45 && dx > 24)
}
