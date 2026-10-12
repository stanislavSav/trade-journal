import { formatBagDates, formatPct, formatPrice, formatQty, formatUsd, type BagSummary } from '../domain'
import { useT } from '../i18n'
import { bagStorages, type StorageLookup } from '../storage-tags/resolve'
import { StorageIcon } from '../storage-tags/StorageIcon'
import { tone } from './numbers'
import type { OpenPosition } from './portfolioView'

function Title({ summary, lookup }: { summary: BagSummary; lookup: StorageLookup }) {
  const t = useT()
  // Exactly one known tag: its icon before the symbol (docs/storage-tags/plan.md D5).
  const tags = bagStorages(summary.bag, lookup)
  const only = tags.length === 1 ? tags[0] : undefined
  return (
    <span className="row-title">
      {only && <StorageIcon info={only} size={18} />}
      {summary.bag.symbol}
      {only && <span className="sr-only">, {only.name}</span>}
      {summary.warnings.length > 0 && (
        <span className="warn-dot" title={t.list.hasWarnings}>
          <span className="sr-only">{t.list.hasWarningsSr}</span>
        </span>
      )}
    </span>
  )
}

interface RowProps {
  onOpen: (bagId: string) => void
  lookup: StorageLookup
}

export function OpenRow({ position, onOpen, lookup }: RowProps & { position: OpenPosition }) {
  const t = useT()
  const { summary: s, pos } = position
  return (
    <button type="button" className="row" onClick={() => onOpen(s.bag.id)}>
      <span className="row-main">
        <Title summary={s} lookup={lookup} />
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

export function ClosedRow({ summary: s, onOpen, lookup }: RowProps & { summary: BagSummary }) {
  return (
    <button type="button" className="row" onClick={() => onOpen(s.bag.id)}>
      <span className="row-main">
        <Title summary={s} lookup={lookup} />
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
