// Finds new versions of the app in the background and tells the UI (docs/update-prompt/plan.md).
//
// The service worker stays in vite-plugin-pwa's autoUpdate mode (plan D1): a new worker activates by itself. We pass
// `onNeedReload`, so instead of reloading the page the client marks "update ready" and the UI shows a card.
// iOS rarely restarts a Home Screen app, so a check also runs when the app comes back to the screen (plan D2).
import { registerSW } from 'virtual:pwa-register'
import { CHECK_INTERVAL_MS, isUpdateReady, markUpdateReady, shouldCheck } from './updateState'

export { isUpdateReady, subscribeUpdateReady } from './updateState'

// ---- checks ----

export type CheckResult = 'latest' | 'downloading' | 'ready' | 'offline' | 'unsupported'

let registration: ServiceWorkerRegistration | undefined
let swUrl: string | undefined
let lastCheck: number | null = null

async function runCheck(): Promise<CheckResult> {
  if (isUpdateReady()) return 'ready'
  if (!registration || !swUrl) return 'unsupported'
  if (!navigator.onLine) return 'offline'
  lastCheck = Date.now()
  try {
    // Skip the HTTP cache (GitHub Pages sends max-age=600) and make sure the server answers before asking for an update.
    const response = await fetch(swUrl, { cache: 'no-store', headers: { 'cache-control': 'no-cache' } })
    if (response.status !== 200) return 'offline'
    await registration.update()
  } catch {
    return 'offline'
  }
  if (isUpdateReady()) return 'ready'
  return registration.installing || registration.waiting ? 'downloading' : 'latest'
}

/** Background check, at most once per MIN_CHECK_GAP_MS. */
function checkInBackground(): void {
  if (registration?.installing) return
  if (!shouldCheck(Date.now(), lastCheck)) return
  void runCheck()
}

/** Check now (Settings → Check for updates); ignores the throttle. */
export function checkForUpdates(): Promise<CheckResult> {
  return runCheck()
}

/** Register the service worker and start the background checks. Call once, from main.tsx. */
export function startUpdateChecks(): void {
  registerSW({
    immediate: true,
    onNeedReload: markUpdateReady,
    onRegisteredSW(url, r) {
      if (!r) return
      registration = r
      swUrl = url
      lastCheck = Date.now() // registering just checked
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') checkInBackground()
      })
      window.addEventListener('online', checkInBackground)
      window.addEventListener('pageshow', checkInBackground)
      setInterval(() => {
        if (document.visibilityState === 'visible') checkInBackground()
      }, CHECK_INTERVAL_MS)
    },
  })
}
