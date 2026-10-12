import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { PriceSnapshot } from './index'

type PricesModule = typeof import('./index')

const CACHE_KEY = 'trade-journal:prices'
const NOW = new Date('2026-09-30T12:00:00Z').getTime()

function memoryStorage(): Storage {
  const data = new Map<string, string>()
  return {
    get length() {
      return data.size
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (i) => [...data.keys()][i] ?? null,
    removeItem: (key) => void data.delete(key),
    setItem: (key, value) => void data.set(key, String(value)),
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

function priceBody(prices: Record<string, number>) {
  return Object.fromEntries(Object.entries(prices).map(([id, usd]) => [id, { usd }]))
}

function requestedUrl(fetchMock: ReturnType<typeof vi.fn>, call = 0): URL {
  return new URL(String(fetchMock.mock.calls[call]![0]))
}

let storage: Storage
let fetchMock: ReturnType<typeof vi.fn>
let prices: PricesModule

function seedCache(snapshot: Partial<PriceSnapshot>) {
  storage.setItem(CACHE_KEY, JSON.stringify({ prices: {}, fetchedAt: null, ...snapshot }))
}

beforeEach(async () => {
  vi.useFakeTimers({ now: NOW, toFake: ['Date'] })
  storage = memoryStorage()
  vi.stubGlobal('localStorage', storage)
  fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
  // Fresh module state (in-flight requests, last requested ids) for every test.
  vi.resetModules()
  prices = await import('./index')
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('getCachedPrices', () => {
  it('returns an empty snapshot when nothing is cached', () => {
    expect(prices.getCachedPrices()).toEqual({ prices: {}, fetchedAt: null, error: null })
  })

  it('ignores corrupt cache entries', () => {
    storage.setItem(CACHE_KEY, '{oops')
    expect(prices.getCachedPrices()).toEqual({ prices: {}, fetchedAt: null, error: null })
    storage.setItem(CACHE_KEY, JSON.stringify({ prices: { bitcoin: 1, eth: 'x' }, fetchedAt: 'y' }))
    expect(prices.getCachedPrices()).toEqual({ prices: { bitcoin: 1 }, fetchedAt: null, error: null })
  })
})

describe('refreshPrices', () => {
  it('fetches all ids in one batched request and caches the result', async () => {
    fetchMock.mockResolvedValue(json(priceBody({ bitcoin: 65000, ethereum: 3200 })))

    const snap = await prices.refreshPrices(['ethereum', 'bitcoin', 'bitcoin'])

    expect(fetchMock).toHaveBeenCalledOnce()
    const url = requestedUrl(fetchMock)
    expect(url.origin + url.pathname).toBe('https://api.coingecko.com/api/v3/simple/price')
    expect(url.searchParams.get('ids')).toBe('bitcoin,ethereum')
    expect(url.searchParams.get('vs_currencies')).toBe('usd')
    expect(snap).toEqual({ prices: { bitcoin: 65000, ethereum: 3200 }, fetchedAt: NOW, error: null })
    expect(prices.getCachedPrices()).toEqual(snap)
  })

  it('returns the cache without fetching for an empty id list', async () => {
    seedCache({ prices: { bitcoin: 1 }, fetchedAt: NOW - 3_600_000 })
    const snap = await prices.refreshPrices([])
    expect(fetchMock).not.toHaveBeenCalled()
    expect(snap.prices).toEqual({ bitcoin: 1 })
  })

  it('skips the network when the last fetch was less than 60 s ago', async () => {
    seedCache({ prices: { bitcoin: 1 }, fetchedAt: NOW - 30_000 })
    const snap = await prices.refreshPrices(['bitcoin'])
    expect(fetchMock).not.toHaveBeenCalled()
    expect(snap).toEqual({ prices: { bitcoin: 1 }, fetchedAt: NOW - 30_000, error: null })
  })

  it('fetches again once 60 s have passed', async () => {
    seedCache({ prices: { bitcoin: 1 }, fetchedAt: NOW - 60_000 })
    fetchMock.mockResolvedValue(json(priceBody({ bitcoin: 2 })))
    const snap = await prices.refreshPrices(['bitcoin'])
    expect(fetchMock).toHaveBeenCalledOnce()
    expect(snap.prices.bitcoin).toBe(2)
  })

  it('fetches within the throttle window when forced', async () => {
    seedCache({ prices: { bitcoin: 1 }, fetchedAt: NOW - 5_000 })
    fetchMock.mockResolvedValue(json(priceBody({ bitcoin: 2 })))
    const snap = await prices.refreshPrices(['bitcoin'], { force: true })
    expect(fetchMock).toHaveBeenCalledOnce()
    expect(snap.prices.bitcoin).toBe(2)
  })

  it('fetches within the throttle window when a coin has no cached price yet', async () => {
    seedCache({ prices: { bitcoin: 1 }, fetchedAt: NOW - 5_000 })
    fetchMock.mockResolvedValue(json(priceBody({ bitcoin: 2, solana: 150 })))
    await prices.refreshPrices(['bitcoin', 'solana'])
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('does not refetch unknown ids inside the throttle window', async () => {
    fetchMock.mockResolvedValue(json(priceBody({ bitcoin: 2 })))
    await prices.refreshPrices(['bitcoin', 'no-such-coin'])
    await prices.refreshPrices(['bitcoin', 'no-such-coin'])
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('merges new prices into the cache without dropping other coins', async () => {
    seedCache({ prices: { bitcoin: 1, dogecoin: 0.1 }, fetchedAt: NOW - 120_000 })
    fetchMock.mockResolvedValue(json(priceBody({ bitcoin: 2 })))
    const snap = await prices.refreshPrices(['bitcoin'])
    expect(snap.prices).toEqual({ bitcoin: 2, dogecoin: 0.1 })
    expect(prices.getCachedPrices().prices).toEqual({ bitcoin: 2, dogecoin: 0.1 })
  })

  it('returns cached prices with the problem on HTTP 429', async () => {
    const fetchedAt = new Date(2026, 8, 30, 11, 2).getTime()
    seedCache({ prices: { bitcoin: 1 }, fetchedAt })
    fetchMock.mockResolvedValue(json({ status: { error_code: 429 } }, 429))

    const snap = await prices.refreshPrices(['bitcoin'], { force: true })

    expect(snap.prices).toEqual({ bitcoin: 1 })
    expect(snap.fetchedAt).toBe(fetchedAt)
    expect(snap.error).toEqual({ kind: 'rateLimited' })
    // The failure is not written into the cache.
    expect(prices.getCachedPrices()).toEqual({ prices: { bitcoin: 1 }, fetchedAt, error: null })
  })

  it('reports a rate limit even when nothing is cached yet', async () => {
    fetchMock.mockResolvedValue(json({}, 429))
    const snap = await prices.refreshPrices(['bitcoin'])
    expect(snap).toEqual({ prices: {}, fetchedAt: null, error: { kind: 'rateLimited' } })
  })

  it('never throws on network errors or bad responses', async () => {
    seedCache({ prices: { bitcoin: 1 }, fetchedAt: NOW - 120_000 })
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    const offline = await prices.refreshPrices(['bitcoin'])
    expect(offline.prices).toEqual({ bitcoin: 1 })
    expect(offline.error).toEqual({ kind: 'offline' })

    fetchMock.mockResolvedValueOnce(new Response('<html>', { status: 200 }))
    const garbled = await prices.refreshPrices(['bitcoin'])
    expect(garbled.error).toEqual({ kind: 'badResponse' })

    fetchMock.mockResolvedValueOnce(json({}, 500))
    const serverError = await prices.refreshPrices(['bitcoin'])
    expect(serverError.error).toEqual({ kind: 'http', status: 500 })
  })

  it('shares one request between concurrent refreshes of the same ids', async () => {
    fetchMock.mockResolvedValue(json(priceBody({ bitcoin: 2 })))
    const [a, b] = await Promise.all([prices.refreshPrices(['bitcoin']), prices.refreshPrices(['bitcoin'])])
    expect(fetchMock).toHaveBeenCalledOnce()
    expect(a).toEqual(b)
  })
})

describe('searchCoins', () => {
  const coins = [
    { id: 'bitcoin-cash', symbol: 'bch', name: 'Bitcoin Cash', market_cap_rank: 20, thumb: 'bch.png' },
    { id: 'wrapped-bitcoin', symbol: 'wbtc', name: 'Wrapped Bitcoin', market_cap_rank: 15, thumb: 'wbtc.png' },
    { id: 'btc-fake', symbol: 'btc', name: 'Fake BTC', market_cap_rank: null, thumb: '' },
    { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', market_cap_rank: 1, thumb: 'btc.png' },
    { id: 'unranked', symbol: 'btcx', name: 'BTC X', market_cap_rank: null, thumb: 'x.png' },
    { id: 'bad-entry', name: 'No symbol' },
  ]

  it('puts exact symbol matches first, then sorts by rank with unranked coins last', async () => {
    fetchMock.mockResolvedValue(json({ coins, exchanges: [] }))

    const results = await prices.searchCoins(' btc ')

    expect(requestedUrl(fetchMock).searchParams.get('query')).toBe('btc')
    expect(results.map((c) => c.geckoId)).toEqual(['bitcoin', 'btc-fake', 'wrapped-bitcoin', 'bitcoin-cash', 'unranked'])
    expect(results[0]).toEqual({ geckoId: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', rank: 1, thumb: 'btc.png' })
    expect(results[1]!.thumb).toBeNull()
  })

  it('limits results to 10', async () => {
    const many = Array.from({ length: 25 }, (_, i) => ({
      id: `coin-${i}`,
      symbol: `c${i}`,
      name: `Coin ${i}`,
      market_cap_rank: 100 - i,
      thumb: null,
    }))
    fetchMock.mockResolvedValue(json({ coins: many }))
    const results = await prices.searchCoins('coin')
    expect(results).toHaveLength(10)
    expect(results[0]!.geckoId).toBe('coin-24')
  })

  it('returns nothing for an empty query without calling the API', async () => {
    expect(await prices.searchCoins('   ')).toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('passes the abort signal to fetch and rethrows the abort', async () => {
    const controller = new AbortController()
    fetchMock.mockImplementation((_url: string, init: RequestInit) => {
      expect(init.signal).toBe(controller.signal)
      controller.abort()
      return Promise.reject(new DOMException('Aborted', 'AbortError'))
    })
    await expect(prices.searchCoins('eth', controller.signal)).rejects.toMatchObject({ name: 'AbortError' })
  })

  it('throws a readable error when rate limited', async () => {
    fetchMock.mockResolvedValue(json({}, 429))
    await expect(prices.searchCoins('eth')).rejects.toThrow('Rate limited')
  })

  it('throws AppErrors with codes', async () => {
    fetchMock.mockResolvedValueOnce(json({}, 429))
    await expect(prices.searchCoins('eth')).rejects.toMatchObject({ code: 'searchRateLimited' })
    fetchMock.mockResolvedValueOnce(json({}, 503))
    await expect(prices.searchCoins('eth')).rejects.toMatchObject({ code: 'searchHttp', params: { status: 503 } })
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    await expect(prices.searchCoins('eth')).rejects.toMatchObject({ code: 'searchOffline' })
  })
})
