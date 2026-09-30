import type { ReactNode } from 'react'
import {
  formatBagDates,
  formatPct,
  formatPrice,
  formatQty,
  formatUsd,
  valuePosition,
  type BagSummary,
  type Coin,
  type Side,
} from '../domain'
import { BagName } from './BagName'
import { BackIcon } from './icons'
import { tone } from './numbers'
import { TradeRow } from './TradeRow'

interface Props {
  summary: BagSummary
  coin: Coin | undefined
  price: number | undefined
  backLabel: string
  onBack: () => void
  onEditTrade: (tradeId: string) => void
  onTrade: (side: Side) => void
  onRename: (name: string) => void
}

function Stat({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className="stat">
      <dt>{label}</dt>
      <dd className={`num ${className}`}>{children}</dd>
    </div>
  )
}

export function BagDetail({ summary: s, coin, price, backLabel, onBack, onEditTrade, onTrade, onRename }: Props) {
  const open = s.status === 'open'
  const pos = valuePosition(s, price)
  const priced = open && pos.value !== null

  return (
    <div className="detail">
      <div className="topbar">
        <button type="button" className="back-btn" onClick={onBack}>
          <BackIcon />
          {backLabel}
        </button>
      </div>

      <div className="detail-head">
        <h1>
          {s.bag.symbol}
          <span className={`badge status ${s.status}`}>{open ? 'Open' : 'Closed'}</span>
        </h1>
        <BagName name={s.bag.name} onRename={onRename} />
        <div className="detail-coin">
          {coin?.name ?? s.bag.symbol}
          {!coin?.geckoId && ' · no live price'}
        </div>
      </div>

      <dl className="card stats">
        {open && (
          <>
            <Stat label="Holding">{formatQty(s.qty)}</Stat>
            <Stat label="Avg cost">{formatPrice(s.avg)}</Stat>
            <Stat label="Cost">{formatUsd(s.cost)}</Stat>
          </>
        )}
        {priced && (
          <>
            <Stat label="Price">{formatPrice(pos.price)}</Stat>
            <Stat label="Value">{formatUsd(pos.value)}</Stat>
            <Stat label="Unrealized" className={tone(pos.unrealized)}>
              {formatUsd(pos.unrealized, { signed: true })}
              <span className="stat-pct">{formatPct(pos.unrealizedPct)}</span>
            </Stat>
          </>
        )}
        <Stat label="Invested">{formatUsd(s.invested)}</Stat>
        <Stat label="Proceeds">{formatUsd(s.proceeds)}</Stat>
        <Stat label="Realized" className={tone(s.realized)}>
          {formatUsd(s.realized, { signed: true })}
        </Stat>
        <Stat label="Dates">{formatBagDates(s.trades)}</Stat>
      </dl>

      {s.warnings.length > 0 && (
        <div className="card warnings" role="note">
          <h2 className="warnings-title">Check these trades</h2>
          <ul>
            {s.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="action-row">
        <button type="button" className="btn buy" onClick={() => onTrade('buy')}>
          Buy more
        </button>
        {open && (
          <button type="button" className="btn sell" onClick={() => onTrade('sell')}>
            Sell
          </button>
        )}
      </div>

      <h2 className="section-title">Trades</h2>
      <div className="card list">
        {s.trades.map((t) => (
          <TradeRow key={t.id} trade={t} onEdit={onEditTrade} />
        ))}
      </div>
    </div>
  )
}
