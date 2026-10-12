import { useMemo, useState } from 'react'
import type { Coin } from '../domain'
import { errorText, useT } from '../i18n'
import { currentPick, type AssetPick, type AssetValue } from './assetValue'
import { Field } from './fields'
import { msgId } from './formValues'
import { useCoinSearch } from './useCoinSearch'

function matchCoins(coins: Coin[], query: string): Coin[] {
  const q = query.toUpperCase()
  if (!q) return []
  const rank = (c: Coin) => {
    const name = c.name.toUpperCase()
    if (c.symbol === q) return 0
    if (c.symbol.startsWith(q)) return 1
    if (name.startsWith(q)) return 2
    if (c.symbol.includes(q) || name.includes(q)) return 3
    return -1
  }
  return coins
    .map((c) => ({ c, r: rank(c) }))
    .filter((x) => x.r >= 0)
    .sort((a, b) => a.r - b.r || a.c.symbol.localeCompare(b.c.symbol))
    .slice(0, 5)
    .map((x) => x.c)
}

interface Props {
  id: string
  value: AssetValue
  onChange: (value: AssetValue) => void
  coins: Coin[]
}

export function AssetField({ id, value, onChange, coins }: Props) {
  const t = useT()
  const [suggesting, setSuggesting] = useState(false)
  const query = value.text.trim()
  const symbol = query.toUpperCase()
  const known = coins.find((c) => c.symbol === symbol)
  const pick = currentPick(value)
  const local = useMemo(() => matchCoins(coins, query), [coins, query])
  // Search CoinGecko for unknown symbols, and for known ones that still lack a live price.
  const remoteWanted = suggesting && query.length >= 2 && !pick && !known?.geckoId
  const remote = useCoinSearch(query, remoteWanted)

  const choose = (p: AssetPick) => {
    onChange({ text: p.symbol, pick: p })
    setSuggesting(false)
  }

  const showList = suggesting && query !== '' && (local.length > 0 || remoteWanted)

  let hint: string
  if (pick) hint = pick.geckoId ? pick.name : `${pick.name} · no live price`
  else if (known) hint = known.geckoId ? known.name : `${known.name} · no live price`
  else if (symbol) hint = remote.results.length > 0 ? 'New coin · pick it from the list for a live price' : 'New coin · no live price'
  else hint = 'Type a symbol or name'

  return (
    <>
      <Field id={id} label="Asset" hint={hint}>
        <input
          id={id}
          className="input"
          type="text"
          value={value.text}
          placeholder="BTC, SOL, Hyperliquid…"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck={false}
          enterKeyHint="next"
          aria-describedby={msgId(id)}
          onChange={(e) => {
            onChange({ text: e.target.value, pick: null })
            setSuggesting(true)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape' && showList) {
              // Close the suggestions, not the whole sheet.
              e.stopPropagation()
              e.nativeEvent.stopImmediatePropagation()
              setSuggesting(false)
            }
          }}
        />
      </Field>
      {showList && (
        <div className="suggest" aria-label="Suggestions" role="group">
          {local.map((c) => (
            <button
              key={c.id}
              type="button"
              className="suggest-item"
              onClick={() => choose({ symbol: c.symbol, name: c.name, geckoId: c.geckoId })}
            >
              <span className="suggest-thumb placeholder" aria-hidden="true" />
              <span className="suggest-name">{c.name}</span>
              <span className="suggest-symbol">{c.symbol}</span>
              <span className="suggest-rank">in journal</span>
            </button>
          ))}
          {remoteWanted &&
            remote.results.slice(0, 8).map((r) => (
              <button
                key={r.geckoId}
                type="button"
                className="suggest-item"
                onClick={() => choose({ symbol: r.symbol, name: r.name, geckoId: r.geckoId })}
              >
                {r.thumb ? (
                  <img className="suggest-thumb" src={r.thumb} alt="" width={24} height={24} loading="lazy" referrerPolicy="no-referrer" />
                ) : (
                  <span className="suggest-thumb placeholder" aria-hidden="true" />
                )}
                <span className="suggest-name">{r.name}</span>
                <span className="suggest-symbol">{r.symbol}</span>
                <span className="suggest-rank num">{r.rank ? `#${r.rank}` : ''}</span>
              </button>
            ))}
          {remoteWanted && remote.loading && <div className="suggest-status">Searching…</div>}
          {remoteWanted && !remote.loading && remote.error && (
            <div className="suggest-status">Search unavailable ({errorText(t, remote.error).text}). You can still save.</div>
          )}
          {remoteWanted && !remote.loading && !remote.error && remote.results.length === 0 && local.length === 0 && (
            <div className="suggest-status">No coins found</div>
          )}
        </div>
      )}
    </>
  )
}
