import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { PriceSnapshot } from './index'

const refreshPrices = vi.fn<(ids: string[], opts?: { force?: boolean }) => Promise<PriceSnapshot>>()

vi.mock('./index', () => ({
  getCachedPrices: () => ({ prices: {}, fetchedAt: null, error: null }),
  refreshPrices: (ids: string[], opts?: { force?: boolean }) => refreshPrices(ids, opts),
}))

const { watchPrices } = await import('./usePrices')

const snapshot = (fetchedAt: number): PriceSnapshot => ({ prices: { bitcoin: fetchedAt }, fetchedAt, error: null })

function fakeDocument() {
  const doc = Object.assign(new EventTarget(), { visibilityState: 'visible' as DocumentVisibilityState })
  const setVisibility = (state: DocumentVisibilityState) => {
    doc.visibilityState = state
    doc.dispatchEvent(new Event('visibilitychange'))
  }
  return { doc, setVisibility }
}

let setVisibility: (state: DocumentVisibilityState) => void

beforeEach(() => {
  vi.useFakeTimers()
  refreshPrices.mockReset()
  refreshPrices.mockImplementation(() => Promise.resolve(snapshot(Date.now())))
  const fake = fakeDocument()
  setVisibility = fake.setVisibility
  vi.stubGlobal('document', fake.doc)
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('watchPrices', () => {
  it('refreshes right away and reports progress', async () => {
    const onSnapshot = vi.fn()
    const onRefreshing = vi.fn()
    const w = watchPrices(['bitcoin'], onSnapshot, onRefreshing)

    expect(refreshPrices).toHaveBeenCalledWith(['bitcoin'], { force: false })
    expect(onRefreshing).toHaveBeenLastCalledWith(true)
    await vi.advanceTimersByTimeAsync(0)
    expect(onSnapshot).toHaveBeenCalledOnce()
    expect(onRefreshing).toHaveBeenLastCalledWith(false)
    w.stop()
  })

  it('refreshes every 5 minutes while visible', async () => {
    const w = watchPrices(['bitcoin'], vi.fn(), vi.fn())
    await vi.advanceTimersByTimeAsync(5 * 60_000)
    expect(refreshPrices).toHaveBeenCalledTimes(2)
    await vi.advanceTimersByTimeAsync(5 * 60_000)
    expect(refreshPrices).toHaveBeenCalledTimes(3)
    w.stop()
  })

  it('pauses while hidden and refreshes when visible again', async () => {
    const w = watchPrices(['bitcoin'], vi.fn(), vi.fn())
    setVisibility('hidden')
    await vi.advanceTimersByTimeAsync(20 * 60_000)
    expect(refreshPrices).toHaveBeenCalledTimes(1)

    setVisibility('visible')
    expect(refreshPrices).toHaveBeenCalledTimes(2)
    expect(refreshPrices).toHaveBeenLastCalledWith(['bitcoin'], { force: false })
    await vi.advanceTimersByTimeAsync(5 * 60_000)
    expect(refreshPrices).toHaveBeenCalledTimes(3)
    w.stop()
  })

  it('forces the request on refresh()', () => {
    const w = watchPrices(['bitcoin'], vi.fn(), vi.fn())
    w.refresh()
    expect(refreshPrices).toHaveBeenLastCalledWith(['bitcoin'], { force: true })
    w.stop()
  })

  it('stays refreshing until every overlapping request is done', async () => {
    const resolvers: ((s: PriceSnapshot) => void)[] = []
    refreshPrices.mockImplementation(() => new Promise((resolve) => resolvers.push(resolve)))
    const onRefreshing = vi.fn()
    const w = watchPrices(['bitcoin'], vi.fn(), onRefreshing)
    w.refresh()

    resolvers[0]!(snapshot(1))
    await vi.advanceTimersByTimeAsync(0)
    expect(onRefreshing).not.toHaveBeenCalledWith(false)
    resolvers[1]!(snapshot(2))
    await vi.advanceTimersByTimeAsync(0)
    expect(onRefreshing).toHaveBeenLastCalledWith(false)
    w.stop()
  })

  it('ignores results and removes timers and listeners after stop()', async () => {
    let resolve: (s: PriceSnapshot) => void = () => {}
    refreshPrices.mockImplementation(() => new Promise((r) => (resolve = r)))
    const onSnapshot = vi.fn()
    const onRefreshing = vi.fn()
    const w = watchPrices(['bitcoin'], onSnapshot, onRefreshing)
    w.stop()

    resolve(snapshot(1))
    setVisibility('hidden')
    setVisibility('visible')
    await vi.advanceTimersByTimeAsync(30 * 60_000)
    w.refresh()

    expect(refreshPrices).toHaveBeenCalledTimes(1)
    expect(onSnapshot).not.toHaveBeenCalled()
    expect(onRefreshing).not.toHaveBeenCalledWith(false)
    expect(vi.getTimerCount()).toBe(0)
  })
})
