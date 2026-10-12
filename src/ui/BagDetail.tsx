import type { ReactNode } from 'react'
import {
  formatBagDates,
  formatDate,
  formatPct,
  formatPrice,
  formatQty,
  formatUsd,
  valuePosition,
  type BagSummary,
  type BagWarning,
  type Coin,
  type Side,
} from '../domain'
import { useT, type Messages } from '../i18n'
import type { StorageInfo } from '../storage-tags/resolve'
import { StorageIcon } from '../storage-tags/StorageIcon'
import { BagName } from './BagName'
import { BackIcon } from './icons'
import { tone } from './numbers'
import { StorageTags } from './StorageTags'
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
  /** The bag's known storages (bagStorages), in stored order. */
  storages: readonly StorageInfo[]
  onEditStorages: () => void
}

function Stat({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className="stat">
      <dt>{label}</dt>
      <dd className={`num ${className}`}>{children}</dd>
    </div>
  )
}

function warningText(t: Messages, w: BagWarning): string {
  const qty = formatQty(w.qty)
  return w.date === null ? t.bag.oversold({ qty }) : t.bag.oversoldOn({ qty, date: formatDate(w.date) })
}

export function BagDetail({
  summary: s,
  coin,
  price,
  backLabel,
  onBack,
  onEditTrade,
  onTrade,
  onRename,
  storages,
  onEditStorages,
}: Props) {
  const t = useT()
  // Exactly one tag: its icon before the symbol (plan D5).
  const only = storages.length === 1 ? storages[0] : undefined
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
          {only && <StorageIcon info={only} size={28} />}
          {s.bag.symbol}
          {only && <span className="sr-only">, {only.name}</span>}
          <span className={`badge status ${s.status}`}>{open ? t.bag.open : t.bag.closed}</span>
        </h1>
        <BagName name={s.bag.name} onRename={onRename} />
        <div className="detail-coin">
          {coin?.name ?? s.bag.symbol}
          {!coin?.geckoId && ` · ${t.bag.noLivePrice}`}
        </div>
        <StorageTags storages={storages} onEdit={onEditStorages} />
      </div>

      <dl className="card stats">
        {open && (
          <>
            <Stat label={t.bag.holding}>{formatQty(s.qty)}</Stat>
            <Stat label={t.bag.avgCost}>{formatPrice(s.avg)}</Stat>
            <Stat label={t.bag.cost}>{formatUsd(s.cost)}</Stat>
          </>
        )}
        {priced && (
          <>
            <Stat label={t.bag.price}>{formatPrice(pos.price)}</Stat>
            <Stat label={t.bag.value}>{formatUsd(pos.value)}</Stat>
            <Stat label={t.bag.unrealized} className={tone(pos.unrealized)}>
              {formatUsd(pos.unrealized, { signed: true })}
              <span className="stat-pct">{formatPct(pos.unrealizedPct)}</span>
            </Stat>
          </>
        )}
        <Stat label={t.bag.invested}>{formatUsd(s.invested)}</Stat>
        <Stat label={t.bag.proceeds}>{formatUsd(s.proceeds)}</Stat>
        <Stat label={t.bag.realized} className={tone(s.realized)}>
          {formatUsd(s.realized, { signed: true })}
        </Stat>
        <Stat label={t.bag.dates}>{formatBagDates(s.trades)}</Stat>
      </dl>

      {s.warnings.length > 0 && (
        <div className="card warnings" role="note">
          <h2 className="warnings-title">{t.bag.checkTrades}</h2>
          <ul>
            {s.warnings.map((w, i) => (
              <li key={i}>{warningText(t, w)}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="action-row">
        <button type="button" className="btn buy" onClick={() => onTrade('buy')}>
          {t.bag.buyMore}
        </button>
        {open && (
          <button type="button" className="btn sell" onClick={() => onTrade('sell')}>
            {t.bag.sell}
          </button>
        )}
      </div>

      <h2 className="section-title">{t.bag.trades}</h2>
      <div className="card list">
        {s.trades.map((t) => (
          <TradeRow key={t.id} trade={t} onEdit={onEditTrade} />
        ))}
      </div>
    </div>
  )
}
