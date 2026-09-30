import type { KeyboardEvent } from 'react'

export const accountTabId = (id: string) => `account-tab-${id}`

/** Arrow/Home/End keys move between role="tab" buttons inside a tablist and select them. */
export function onTabKeys(e: KeyboardEvent<HTMLElement>) {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return
  const tabs = [...e.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]')]
  const i = tabs.indexOf(document.activeElement as HTMLElement)
  if (i < 0) return
  const n = tabs.length
  const next = e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + n) % n
  e.preventDefault()
  tabs[next]?.focus()
  tabs[next]?.click()
}
