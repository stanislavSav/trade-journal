import { formatDate, formatPrice, formatQty, formatUsd, type Trade } from '../domain'
import { useT } from '../i18n'

export function TradeRow({ trade, onEdit }: { trade: Trade; onEdit: (tradeId: string) => void }) {
  const t = useT()
  const price = trade.qty > 0 ? trade.total / trade.qty : null
  return (
    <button type="button" className="row" onClick={() => onEdit(trade.id)}>
      <span className="row-main">
        <span className="trade-top">
          <span className={`badge ${trade.side}`}>{trade.side === 'buy' ? t.trade.buy : t.trade.sell}</span>
          <span className="num">{formatDate(trade.date)}</span>
        </span>
        <span className="row-meta num">
          {formatQty(trade.qty)} @ {formatPrice(price)}
        </span>
        {trade.note && <span className="row-note">{trade.note}</span>}
      </span>
      <span className="row-side">
        <span className="row-value num">{formatUsd(trade.total)}</span>
      </span>
    </button>
  )
}
