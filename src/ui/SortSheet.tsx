import { useT } from '../i18n'
import { SORT_KEYS, type BagSort, type SortKey } from './bagSort'
import type { ListTab } from './BagList'
import { Sheet } from './Sheet'
import { sortDirLong, sortDirShort } from './sortLabels'

interface Props {
  tab: ListTab
  sort: BagSort
  onPick: (key: SortKey) => void
  onClose: () => void
}

/** The sort options of one list (docs/list-sorting/plan.md §5.2). One tap = one change, then the sheet closes. */
export function SortSheet({ tab, sort, onPick, onClose }: Props) {
  const t = useT()
  const title = tab === 'open' ? t.sort.titleOpen : t.sort.titleClosed

  return (
    <Sheet title={title} onClose={onClose}>
      <div className="sort-sheet">
        <div className="card list" role="radiogroup" aria-label={title}>
          {SORT_KEYS[tab].map((key) => {
            const active = sort.key === key
            return (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={active}
                className="row sort-option"
                onClick={() => {
                  onPick(key)
                  onClose()
                }}
              >
                <span className="row-main">
                  <span>{t.sort.keys[key]}</span>
                  {active && (
                    <span className="row-meta">
                      {key === 'name' ? (
                        <span className="sr-only">{sortDirLong(t, sort)}</span>
                      ) : (
                        `${sortDirLong(t, sort)} `
                      )}
                      <span aria-hidden="true">{sortDirShort(t, sort)}</span>
                    </span>
                  )}
                </span>
                {active && (
                  <span className="sort-check" aria-hidden="true">
                    ✓
                  </span>
                )}
              </button>
            )
          })}
        </div>
        <div className="sort-hints">
          <p className="help">{t.sort.hintFlip}</p>
          <p className="help">{tab === 'open' ? t.sort.hintInvestedOpen : t.sort.hintInvestedClosed}</p>
          <p className="help">{t.sort.hintUnknown}</p>
        </div>
      </div>
    </Sheet>
  )
}
