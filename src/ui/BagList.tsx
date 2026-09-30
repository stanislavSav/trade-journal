import type { BagSummary } from '../domain'
import { ClosedRow, OpenRow } from './BagRows'
import type { OpenPosition } from './portfolioView'
import { onTabKeys } from './tabKeys'

export type ListTab = 'open' | 'closed'

interface Props {
  tab: ListTab
  onTab: (tab: ListTab) => void
  open: OpenPosition[]
  closed: BagSummary[]
  onOpen: (bagId: string) => void
}

export function BagList({ tab, onTab, open, closed, onOpen }: Props) {
  const tabs: { id: ListTab; label: string; count: number }[] = [
    { id: 'open', label: 'Open', count: open.length },
    { id: 'closed', label: 'Closed', count: closed.length },
  ]

  return (
    <section className="bag-list">
      <div className="segmented" role="tablist" aria-label="Bags" onKeyDown={onTabKeys}>
        {tabs.map((t) => (
          <button
            key={t.id}
            id={`bags-tab-${t.id}`}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            aria-controls="bags-panel"
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => onTab(t.id)}
          >
            {t.label}
            <span className="segmented-count num">{t.count}</span>
          </button>
        ))}
      </div>
      <div id="bags-panel" role="tabpanel" aria-labelledby={`bags-tab-${tab}`}>
        {tab === 'open' ? (
          open.length > 0 ? (
            <div className="card list">
              {open.map((p) => (
                <OpenRow key={p.summary.bag.id} position={p} onOpen={onOpen} />
              ))}
            </div>
          ) : (
            <p className="empty">No open bags. Tap + to add a trade.</p>
          )
        ) : closed.length > 0 ? (
          <div className="card list">
            {closed.map((s) => (
              <ClosedRow key={s.bag.id} summary={s} onOpen={onOpen} />
            ))}
          </div>
        ) : (
          <p className="empty">No closed bags yet.</p>
        )}
      </div>
    </section>
  )
}
