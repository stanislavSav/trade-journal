import { useCallback, useEffect, useRef, useState } from 'react'
import { getCachedPrices, refreshPrices, type PriceSnapshot } from './index'

export interface UsePrices {
  snapshot: PriceSnapshot
  refreshing: boolean
  refresh: () => void // forced refresh (pull-to-refresh / button)
}

const INTERVAL_MS = 5 * 60_000

export interface PriceWatcher {
  refresh: () => void // forced
  stop: () => void
}

/**
 * Framework-free core of usePrices: refreshes now, when the page becomes visible again and every
 * 5 minutes while visible. After stop(), no callbacks fire and no timers or listeners remain.
 */
export function watchPrices(
  geckoIds: string[],
  onSnapshot: (snapshot: PriceSnapshot) => void,
  onRefreshing: (refreshing: boolean) => void,
): PriceWatcher {
  let stopped = false
  let pending = 0
  let timer: ReturnType<typeof setInterval> | undefined

  const run = (force: boolean) => {
    if (stopped) return
    pending++
    onRefreshing(true)
    void refreshPrices(geckoIds, { force }).then((snapshot) => {
      pending--
      if (stopped) return
      onSnapshot(snapshot)
      if (pending === 0) onRefreshing(false)
    })
  }

  const visible = () => typeof document === 'undefined' || document.visibilityState === 'visible'
  const startTimer = () => {
    timer ??= setInterval(() => run(false), INTERVAL_MS)
  }
  const stopTimer = () => {
    clearInterval(timer)
    timer = undefined
  }
  const onVisibilityChange = () => {
    if (visible()) {
      run(false)
      startTimer()
    } else {
      stopTimer()
    }
  }

  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', onVisibilityChange)
  if (visible()) startTimer()
  run(false)

  return {
    refresh: () => run(true),
    stop: () => {
      stopped = true
      stopTimer()
      if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVisibilityChange)
    },
  }
}

// Overlapping refreshes can finish out of order; never replace newer prices with older ones.
function newer(current: PriceSnapshot, next: PriceSnapshot): PriceSnapshot {
  return (next.fetchedAt ?? -1) >= (current.fetchedAt ?? -1) ? next : current
}

/**
 * React hook: starts from cached prices, refreshes on mount, when the id list changes,
 * when the app becomes visible again, and every 5 minutes while visible.
 */
export function usePrices(geckoIds: string[]): UsePrices {
  const key = [...new Set(geckoIds)].sort().join(',')
  const [snapshot, setSnapshot] = useState(getCachedPrices)
  const [refreshing, setRefreshing] = useState(false)
  const watcher = useRef<PriceWatcher | null>(null)

  useEffect(() => {
    const ids = key === '' ? [] : key.split(',')
    const w = watchPrices(ids, (next) => setSnapshot((current) => newer(current, next)), setRefreshing)
    watcher.current = w
    return () => {
      w.stop()
      if (watcher.current === w) watcher.current = null
    }
  }, [key])

  const refresh = useCallback(() => watcher.current?.refresh(), [])

  return { snapshot, refreshing, refresh }
}
