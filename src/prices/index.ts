// Live prices and coin search via the public CoinGecko API (no key, heavily rate limited).
import { AppError } from '../domain/errors'

export interface CoinSearchResult {
  geckoId: string
  symbol: string // upper case
  name: string
  rank: number | null // market cap rank
  thumb: string | null // small logo URL
}

/** Why the last price refresh failed. The UI writes the sentence (docs/i18n/plan.md D16). */
export interface PriceProblem {
  kind: 'offline' | 'rateLimited' | 'http' | 'badResponse' | 'failed'
  status?: number // HTTP status, for 'http'
}

export interface PriceSnapshot {
  prices: Record<string, number> // geckoId -> USD
  fetchedAt: number | null // when these prices were fetched
  error: PriceProblem | null // last refresh error; the prices shown are from fetchedAt
}

const API = 'https://api.coingecko.com/api/v3'
const CACHE_KEY = 'trade-journal:prices'
const MIN_REFRESH_MS = 60_000
const REQUEST_TIMEOUT_MS = 15_000
const SEARCH_LIMIT = 10

// Ids asked for in the last successful fetch. CoinGecko silently omits unknown ids, so without this
// an id with no price would defeat the 60 s throttle.
let lastRequested = new Set<string>()
const inFlight = new Map<string, Promise<PriceSnapshot>>()

function timeoutSignal(): AbortSignal | undefined {
  return typeof AbortSignal.timeout === 'function' ? AbortSignal.timeout(REQUEST_TIMEOUT_MS) : undefined
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function toCoin(raw: unknown): CoinSearchResult | null {
  if (!isObject(raw)) return null
  const { id, symbol, name, market_cap_rank: rank, thumb } = raw
  if (typeof id !== 'string' || typeof symbol !== 'string' || typeof name !== 'string') return null
  return {
    geckoId: id,
    symbol: symbol.toUpperCase(),
    name,
    rank: typeof rank === 'number' && Number.isFinite(rank) ? rank : null,
    thumb: typeof thumb === 'string' && thumb !== '' ? thumb : null,
  }
}

/** Search coins by symbol or name. Exact symbol matches first, then by market cap rank. */
export async function searchCoins(query: string, signal?: AbortSignal): Promise<CoinSearchResult[]> {
  const q = query.trim()
  if (q === '') return []
  let res: Response
  try {
    res = await fetch(`${API}/search?query=${encodeURIComponent(q)}`, { signal })
  } catch (err) {
    if (signal?.aborted) throw err
    throw new AppError('searchOffline', 'Could not reach CoinGecko')
  }
  if (res.status === 429) throw new AppError('searchRateLimited', 'Rate limited by CoinGecko, try again in a minute')
  if (!res.ok) throw new AppError('searchHttp', `Coin search failed (HTTP ${res.status})`, { status: res.status })
  const data: unknown = await res.json()
  const coins = isObject(data) && Array.isArray(data.coins) ? data.coins : []
  const wanted = q.toUpperCase()
  const exact = (c: CoinSearchResult) => (c.symbol === wanted ? 0 : 1)
  const rank = (c: CoinSearchResult) => c.rank ?? Number.POSITIVE_INFINITY
  return coins
    .map(toCoin)
    .filter((c): c is CoinSearchResult => c !== null)
    .sort((a, b) => exact(a) - exact(b) || rank(a) - rank(b))
    .slice(0, SEARCH_LIMIT)
}

function emptySnapshot(): PriceSnapshot {
  return { prices: {}, fetchedAt: null, error: null }
}

/** Last known prices from localStorage (empty snapshot when none). */
export function getCachedPrices(): PriceSnapshot {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw === null) return emptySnapshot()
    const data: unknown = JSON.parse(raw)
    if (!isObject(data) || !isObject(data.prices)) return emptySnapshot()
    const prices: Record<string, number> = {}
    for (const [id, price] of Object.entries(data.prices)) {
      if (typeof price === 'number' && Number.isFinite(price)) prices[id] = price
    }
    const fetchedAt = typeof data.fetchedAt === 'number' && Number.isFinite(data.fetchedAt) ? data.fetchedAt : null
    return { prices, fetchedAt, error: null }
  } catch {
    return emptySnapshot()
  }
}

function saveCache(snapshot: PriceSnapshot): void {
  try {
    // Errors are only meaningful for the refresh that produced them, so they are not stored.
    localStorage.setItem(CACHE_KEY, JSON.stringify({ prices: snapshot.prices, fetchedAt: snapshot.fetchedAt }))
  } catch {
    // Cache is best effort.
  }
}

function withError(cached: PriceSnapshot, problem: PriceProblem): PriceSnapshot {
  return { ...cached, error: problem }
}

async function fetchPrices(ids: string[]): Promise<PriceSnapshot> {
  let res: Response
  try {
    const url = `${API}/simple/price?ids=${ids.map(encodeURIComponent).join(',')}&vs_currencies=usd`
    res = await fetch(url, { signal: timeoutSignal() })
  } catch {
    return withError(getCachedPrices(), { kind: 'offline' })
  }
  if (res.status === 429) return withError(getCachedPrices(), { kind: 'rateLimited' })
  if (!res.ok) return withError(getCachedPrices(), { kind: 'http', status: res.status })
  let data: unknown
  try {
    data = await res.json()
  } catch {
    return withError(getCachedPrices(), { kind: 'badResponse' })
  }
  if (!isObject(data)) return withError(getCachedPrices(), { kind: 'badResponse' })

  // Re-read the cache so prices written by another refresh in the meantime are kept.
  const cached = getCachedPrices()
  const prices = { ...cached.prices }
  for (const id of ids) {
    const entry = data[id]
    const usd = isObject(entry) ? entry.usd : undefined
    if (typeof usd === 'number' && Number.isFinite(usd)) prices[id] = usd
  }
  const snapshot: PriceSnapshot = { prices, fetchedAt: Date.now(), error: null }
  saveCache(snapshot)
  lastRequested = new Set(ids)
  return snapshot
}

/**
 * Fetch USD prices for all ids in ONE request, merge them into the cache and return the snapshot.
 * Skips the network when the last fetch was < 60 s ago, unless `force`.
 * On failure returns the cached snapshot with `error` set. Never throws.
 */
export async function refreshPrices(geckoIds: string[], opts?: { force?: boolean }): Promise<PriceSnapshot> {
  try {
    const ids = [...new Set(geckoIds.map((id) => id.trim()).filter((id) => id !== ''))].sort()
    const cached = getCachedPrices()
    if (ids.length === 0) return cached

    // A new coin (not in the cache yet) is fetched right away instead of waiting for the throttle.
    const fresh = cached.fetchedAt !== null && Date.now() - cached.fetchedAt < MIN_REFRESH_MS
    const known = ids.every((id) => id in cached.prices || lastRequested.has(id))
    if (!opts?.force && fresh && known) return cached

    // Concurrent refreshes for the same ids (e.g. React StrictMode effects) share one request.
    const key = ids.join(',')
    let request = inFlight.get(key)
    if (!request) {
      request = fetchPrices(ids).finally(() => inFlight.delete(key))
      inFlight.set(key, request)
    }
    return await request
  } catch {
    return withError(getCachedPrices(), { kind: 'failed' })
  }
}
