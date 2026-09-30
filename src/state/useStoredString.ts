import { useCallback, useState } from 'react'

/** A string remembered in localStorage. Storage can be unavailable (private mode), so every access is guarded. */
export function useStoredString(key: string): [string | null, (value: string) => void] {
  const [value, setValue] = useState<string | null>(() => {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  })

  const set = useCallback(
    (next: string) => {
      setValue(next)
      try {
        localStorage.setItem(key, next)
      } catch {
        // not remembered, still works for this session
      }
    },
    [key],
  )

  return [value, set]
}
