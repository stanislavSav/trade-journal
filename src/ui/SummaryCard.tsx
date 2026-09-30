import { formatPct, formatUsd } from '../domain'
import type { UsePrices } from '../prices/usePrices'
import { RefreshIcon } from './icons'
import { tone } from './numbers'
import type { OpenTotals } from './portfolioView'
import { formatStamp } from './time'

interface Props {
  totals: OpenTotals
  realized: number
  prices: UsePrices
}

export function SummaryCard({ totals, realized, prices }: Props) {
  const { snapshot, refreshing, refresh } = prices
  const value = totals.count === 0 ? 0 : totals.value
  const plTone = tone(totals.pl)

  return (
    <section className="card summary" aria-label="Portfolio summary">
      <div className="summary-row summary-main">
        <span className="summary-label">Value</span>
        <span className="summary-value num">{formatUsd(value)}</span>
      </div>
      {totals.unpriced > 0 && (
        <div className="summary-note">
          {totals.unpriced} of {totals.count} without price
        </div>
      )}
      <div className="summary-row">
        <span className="summary-label">Open P/L</span>
        <span className={`num ${plTone}`}>
          {formatUsd(totals.pl, { signed: true })}
          <span className="summary-pct">{formatPct(totals.plPct)}</span>
        </span>
      </div>
      <div className="summary-row">
        <span className="summary-label">Realized</span>
        <span className={`num ${tone(realized)}`}>{formatUsd(realized, { signed: true })}</span>
      </div>
      <div className="price-line">
        <span className="num">{snapshot.fetchedAt ? `prices ${formatStamp(snapshot.fetchedAt)}` : 'no prices yet'}</span>
        <span aria-hidden="true">·</span>
        <button
          type="button"
          className={`refresh-btn${refreshing ? ' spinning' : ''}`}
          onClick={refresh}
          disabled={refreshing}
          aria-label={refreshing ? 'Refreshing prices' : 'Refresh prices'}
        >
          <RefreshIcon />
        </button>
      </div>
      {snapshot.error && <div className="price-error">{snapshot.error}</div>}
    </section>
  )
}
