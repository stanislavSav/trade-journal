// Words for a sort choice: the short button text, the direction, and the full spoken label.
// Spec: docs/list-sorting/plan.md §5.1–§5.3.
import type { Messages } from '../i18n'
import type { BagSort } from './bagSort'

/** "↓", "↑", or for Name "A–Z" / "Z–A". */
export function sortDirShort(t: Messages, sort: BagSort): string {
  if (sort.key === 'name') return sort.dir === 'asc' ? t.sort.nameAsc : t.sort.nameDesc
  return sort.dir === 'asc' ? t.sort.asc : t.sort.desc
}

/** "largest first", "newest first", "A to Z", … */
export function sortDirLong(t: Messages, sort: BagSort): string {
  const asc = sort.dir === 'asc'
  if (sort.key === 'name') return asc ? t.sort.nameAscLong : t.sort.nameDescLong
  if (sort.key === 'latest') return asc ? t.sort.oldest : t.sort.newest
  return asc ? t.sort.smallest : t.sort.largest
}

/** The button text: "Value ↓", "Name A–Z". */
export function sortLabel(t: Messages, sort: BagSort): string {
  return t.sort.button({ key: t.sort.keys[sort.key], dir: sortDirShort(t, sort) })
}

/** The button's aria-label: "Sort: Value, largest first". */
export function sortAriaLabel(t: Messages, sort: BagSort): string {
  return t.sort.buttonLabel({ key: t.sort.keys[sort.key], dir: sortDirLong(t, sort) })
}
