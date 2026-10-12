import { formatBagDates, formatPct, formatPrice, formatQty, formatUsd, type BagSummary } from '../domain'
import { useT } from '../i18n'
import { tone } from './numbers'
import type { OpenPosition } from './portfolioView'

function Title({ summary }: { summary: BagSummary }) {
  const t = useT()
  return (
    <span className="row-title">
      {summary.bag.symbol}
      {summary.warnings.length > 0 && (
        <span className="warn-dot" title={t.list.hasWarnings}>
          <span className="sr-only">{t.list.hasWarningsSr}</span>
        </span>
      )}
    </span>
  )
}

export function OpenRow({ position, onOpen }: { position: OpenPosition; onOpen: (bagId: string) => void }) {
  const t = useT()
  const { summary: s, pos } = position
  return (
    <button type="button" className="row" onClick={() => onOpen(s.bag.id)}>
      <span className="row-main">
        <Title summary={s} />
        <span className="row-sub">{s.bag.name}</span>
        <span className="row-meta num">
          {t.list.qtyAvg({ qty: formatQty(s.qty), avg: formatPrice(s.avg) })}
        </span>
      </span>
      {pos.value !== null ? (
        <span className="row-side">
          <span className="row-value num">{formatUsd(pos.value)}</span>
          <span className={`row-pct num ${tone(pos.unrealizedPct)}`}>{formatPct(pos.unrealizedPct)}</span>
        </span>
      ) : (
        <span className="row-side">
          <span className="row-value num muted">{formatUsd(s.cost)}</span>
          <span className="row-sub">{t.list.costNoPrice}</span>
        </span>
      )}
    </button>
  )
}

export function ClosedRow({ summary: s, onOpen }: { summary: BagSummary; onOpen: (bagId: string) => void }) {
  return (
    <button type="button" className="row" onClick={() => onOpen(s.bag.id)}>
      <span className="row-main">
        <Title summary={s} />
        <span className="row-sub">{s.bag.name}</span>
        <span className="row-meta row-meta-wrap num">
          <span>{formatBagDates(s.trades)}</span>
          <span>
            {formatUsd(s.invested)} → {formatUsd(s.proceeds)}
          </span>
        </span>
      </span>
      <span className="row-side">
        <span className={`row-value num ${tone(s.realized)}`}>{formatUsd(s.realized, { signed: true })}</span>
      </span>
    </button>
  )
}
