// Pure parts of the update checks (docs/update-prompt/plan.md): the throttle rule and the "update ready" store.
// Kept apart from updates.ts so tests do not need the virtual:pwa-register module.

export const MIN_CHECK_GAP_MS = 60_000
export const CHECK_INTERVAL_MS = 30 * 60_000

/** True when enough time has passed since the last check. */
export function shouldCheck(now: number, lastCheck: number | null, minGap = MIN_CHECK_GAP_MS): boolean {
  return lastCheck === null || now - lastCheck >= minGap
}

// ---- "update ready" store, read with useSyncExternalStore ----

let ready = false
const listeners = new Set<() => void>()

export function subscribeUpdateReady(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function isUpdateReady(): boolean {
  return ready
}

export function markUpdateReady(): void {
  if (ready) return
  ready = true
  for (const listener of listeners) listener()
}

/** Test helper: forget the state between tests. */
export function resetUpdateReady(): void {
  ready = false
}
