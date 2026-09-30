import { useEffect, useState } from 'react'
import { searchCoins, type CoinSearchResult } from '../prices'

export interface CoinSearch {
  results: CoinSearchResult[]
  loading: boolean
  error: string | null
}

interface Answer {
  query: string
  results: CoinSearchResult[]
  error: string | null
}

const idle: CoinSearch = { results: [], loading: false, error: null }

/** CoinGecko search, debounced 400 ms; a newer query aborts the older request. */
export function useCoinSearch(query: string, enabled: boolean): CoinSearch {
  const [answer, setAnswer] = useState<Answer>({ query: '', results: [], error: null })

  useEffect(() => {
    if (!enabled) return
    const ctrl = new AbortController()
    const timer = setTimeout(() => {
      searchCoins(query, ctrl.signal).then(
        (results) => {
          if (!ctrl.signal.aborted) setAnswer({ query, results, error: null })
        },
        (err: unknown) => {
          if (ctrl.signal.aborted) return
          const offline = typeof navigator !== 'undefined' && navigator.onLine === false
          const error = offline ? 'Offline' : err instanceof Error ? err.message : 'Search failed'
          setAnswer({ query, results: [], error })
        },
      )
    }, 400)
    return () => {
      clearTimeout(timer)
      ctrl.abort()
    }
  }, [query, enabled])

  if (!enabled) return idle
  // Older results stay visible while the next query loads, which avoids flicker while typing.
  const fresh = answer.query === query
  return { results: answer.results, loading: !fresh, error: fresh ? answer.error : null }
}
