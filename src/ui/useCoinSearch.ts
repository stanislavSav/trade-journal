import { useEffect, useState } from 'react'
import { AppError, isAppError } from '../domain/errors'
import { searchCoins, type CoinSearchResult } from '../prices'

export interface CoinSearch {
  results: CoinSearchResult[]
  loading: boolean
  error: AppError | null // the UI writes the text (errorText)
}

interface Answer {
  query: string
  results: CoinSearchResult[]
  error: AppError | null
}

/** Offline beats whatever the request said; an unknown failure becomes searchFailed. */
function searchError(err: unknown): AppError {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return new AppError('deviceOffline', 'Offline')
  return isAppError(err) ? err : new AppError('searchFailed', 'Search failed')
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
          setAnswer({ query, results: [], error: searchError(err) })
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
