import type { BagSummary } from '../domain'
import { useT } from '../i18n'
import type { BagSort } from './bagSort'
import { ClosedRow, OpenRow } from './BagRows'
import type { OpenPosition } from './portfolioView'
import { sortAriaLabel, sortLabel } from './sortLabels'
import { onTabKeys } from './tabKeys'

export type ListTab = 'open' | 'closed'

interface Props {
  tab: ListTab
  onTab: (tab: ListTab) => void
  open: OpenPosition[]
  closed: BagSummary[]
  onOpen: (bagId: string) => void
  /** The sort of the shown tab; its button opens the sort sheet. */
  sort: BagSort
  onSortClick: () => void
}

export function BagList({ tab, onTab, open, closed, onOpen, sort, onSortClick }: Props) {
  const t = useT()
  const tabs: { id: ListTab; label: string; count: number }[] = [
    { id: 'open', label: t.list.open, count: open.length },
    { id: 'closed', label: t.list.closed, count: closed.length },
  ]
  const shownCount = tab === 'open' ? open.length : closed.length

  return (
    <section className="bag-list">
      <div className="segmented" role="tablist" aria-label={t.list.label} onKeyDown={onTabKeys}>
        {tabs.map((item) => (
          <button
            key={item.id}
            id={`bags-tab-${item.id}`}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            aria-controls="bags-panel"
            tabIndex={tab === item.id ? 0 : -1}
            onClick={() => onTab(item.id)}
          >
            {item.label}
            <span className="segmented-count num">{item.count}</span>
          </button>
        ))}
      </div>
      <div id="bags-panel" role="tabpanel" aria-labelledby={`bags-tab-${tab}`}>
        {/* The left side stays free for the storage filter chips of feature 5 (docs/list-sorting/plan.md §5.1). */}
        {shownCount > 0 && (
          <div className="list-tools">
            <button
              type="button"
              className="sort-btn"
              aria-haspopup="dialog"
              aria-label={sortAriaLabel(t, sort)}
              onClick={onSortClick}
            >
              {sortLabel(t, sort)}
            </button>
          </div>
        )}
        {tab === 'open' ? (
          open.length > 0 ? (
            <div className="card list">
              {open.map((p) => (
                <OpenRow key={p.summary.bag.id} position={p} onOpen={onOpen} />
              ))}
            </div>
          ) : (
            <p className="empty">{t.list.emptyOpen}</p>
          )
        ) : closed.length > 0 ? (
          <div className="card list">
            {closed.map((s) => (
              <ClosedRow key={s.bag.id} summary={s} onOpen={onOpen} />
            ))}
          </div>
        ) : (
          <p className="empty">{t.list.emptyClosed}</p>
        )}
      </div>
    </section>
  )
}
