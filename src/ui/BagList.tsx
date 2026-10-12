import type { BagSummary } from '../domain'
import { useT } from '../i18n'
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
  const t = useT()
  const tabs: { id: ListTab; label: string; count: number }[] = [
    { id: 'open', label: t.list.open, count: open.length },
    { id: 'closed', label: t.list.closed, count: closed.length },
  ]

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
