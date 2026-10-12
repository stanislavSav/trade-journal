import { formatPct, formatUsd } from '../domain'
import { useT, type Messages } from '../i18n'
import type { PriceProblem } from '../prices'
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

/** "Rate limited — showing prices from 14:02": the problem, then how old the prices on screen are. */
function priceProblemText(t: Messages, problem: PriceProblem, fetchedAt: number | null): string {
  const what =
    problem.kind === 'http' ? t.prices.http({ status: problem.status ?? 0 }) : t.prices[problem.kind]
  const age = fetchedAt === null ? t.prices.noPricesYet : t.prices.showingFrom({ time: formatStamp(fetchedAt) })
  return `${what} — ${age}`
}

export function SummaryCard({ totals, realized, prices }: Props) {
  const t = useT()
  const { snapshot, refreshing, refresh } = prices
  const value = totals.count === 0 ? 0 : totals.value
  const plTone = tone(totals.pl)

  return (
    <section className="card summary" aria-label={t.summary.label}>
      <div className="summary-row summary-main">
        <span className="summary-label">{t.summary.value}</span>
        <span className="summary-value num">{formatUsd(value)}</span>
      </div>
      {totals.unpriced > 0 && (
        <div className="summary-note">{t.summary.withoutPrice({ unpriced: totals.unpriced, count: totals.count })}</div>
      )}
      <div className="summary-row">
        <span className="summary-label">{t.summary.openPl}</span>
        <span className={`num ${plTone}`}>
          {formatUsd(totals.pl, { signed: true })}
          <span className="summary-pct">{formatPct(totals.plPct)}</span>
        </span>
      </div>
      <div className="summary-row">
        <span className="summary-label">{t.summary.realized}</span>
        <span className={`num ${tone(realized)}`}>{formatUsd(realized, { signed: true })}</span>
      </div>
      <div className="price-line">
        <span className="num">
          {snapshot.fetchedAt ? t.summary.pricesAt({ time: formatStamp(snapshot.fetchedAt) }) : t.prices.noPricesYet}
        </span>
        <span aria-hidden="true">·</span>
        <button
          type="button"
          className={`refresh-btn${refreshing ? ' spinning' : ''}`}
          onClick={refresh}
          disabled={refreshing}
          aria-label={refreshing ? t.summary.refreshing : t.summary.refresh}
        >
          <RefreshIcon />
        </button>
      </div>
      {snapshot.error && (
        <div className="price-error">{priceProblemText(t, snapshot.error, snapshot.fetchedAt)}</div>
      )}
    </section>
  )
}
