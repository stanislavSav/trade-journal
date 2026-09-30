import { useMemo, useState, type FormEvent } from 'react'
import {
  defaultBagName,
  formatPrice,
  formatQty,
  formatUsd,
  summarizeAccount,
  todayIso,
  type Account,
  type Coin,
  type Journal,
  type NewTradeInput,
  type Side,
} from '../domain'
import { AssetField } from './AssetField'
import { assetSymbol, currentPick, type AssetValue } from './assetValue'
import { BagField } from './BagField'
import { NEW_BAG, bagOptions, exceedsHeld, resolveBagChoice, snapToHeld } from './bagChoice'
import { DateInput, DecimalInput, Field, SideToggle } from './fields'
import { dateError, readAmount, readAsHint } from './formValues'
import { NoteField } from './NoteField'
import { tone, toInputText } from './numbers'
import { Sheet } from './Sheet'

export interface AddPreset {
  accountId: string
  symbol?: string
  bagId?: string
  side?: Side
}

interface Props {
  journal: Journal
  accounts: Account[]
  preset: AddPreset
  /** May throw; the message is shown in the form. */
  onSave: (input: NewTradeInput) => void
  onClose: () => void
}

function initialAsset(symbol: string | undefined, coins: Coin[]): AssetValue {
  const coin = symbol ? coins.find((c) => c.symbol === symbol) : undefined
  if (coin) return { text: coin.symbol, pick: { symbol: coin.symbol, name: coin.name, geckoId: coin.geckoId } }
  return { text: symbol ?? '', pick: null }
}

function listWords(words: string[]): string {
  if (words.length <= 1) return words.join('')
  return `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`
}

export function AddTradeSheet({ journal, accounts, preset, onSave, onClose }: Props) {
  const coins = useMemo(() => journal.coins.filter((c) => !c.deleted), [journal])
  const [side, setSide] = useState<Side>(preset.side ?? 'buy')
  const [accountId, setAccountId] = useState(preset.accountId)
  const [asset, setAsset] = useState<AssetValue>(() => initialAsset(preset.symbol, coins))
  const [bagChoice, setBagChoice] = useState<string | null>(preset.bagId ?? null)
  const [newBagName, setNewBagName] = useState('')
  const [date, setDate] = useState(todayIso)
  const [qtyText, setQtyText] = useState('')
  const [totalText, setTotalText] = useState('')
  const [note, setNote] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)

  const symbol = assetSymbol(asset)
  const account = useMemo(() => summarizeAccount(journal, accountId), [journal, accountId])
  const options = useMemo(
    () => bagOptions(journal, account, symbol, side, preset.bagId),
    [journal, account, symbol, side, preset.bagId],
  )
  const choice = resolveBagChoice(bagChoice, options, side)
  const selected = options.find((s) => s.bag.id === choice) ?? null

  const qty = readAmount(qtyText, 'qty')
  const total = readAmount(totalText, 'money')
  const held = side === 'sell' && selected ? selected.qty : null
  const qtyError = qty.error ?? (exceedsHeld(qty.value, held) ? `You hold only ${formatQty(held ?? 0)}` : null)
  const dError = dateError(date)
  const price = qty.value !== null && total.value !== null ? total.value / qty.value : null
  const sellPl =
    side === 'sell' && selected?.avg != null && qty.value !== null && total.value !== null
      ? total.value - qty.value * selected.avg
      : null
  const noBagToSell = side === 'sell' && symbol !== '' && options.length === 0
  const accountName = accounts.find((a) => a.id === accountId)?.name ?? accountId

  const missing = [
    symbol === '' && 'asset',
    qty.value === null && !qty.error && 'qty',
    total.value === null && !total.error && 'total',
  ].filter((w): w is string => typeof w === 'string')
  const valid =
    symbol !== '' &&
    qty.value !== null &&
    total.value !== null &&
    !qtyError &&
    !dError &&
    (side === 'buy' || selected !== null)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!valid || qty.value === null || total.value === null) return
    const pick = currentPick(asset)
    const known = coins.some((c) => c.symbol === symbol)
    const input: NewTradeInput = {
      accountId,
      symbol,
      coinName: pick?.name,
      // Unknown coin typed without picking a search result: saved without a live price.
      geckoId: pick ? pick.geckoId : known ? undefined : null,
      bag: choice && choice !== NEW_BAG ? { bagId: choice } : { newBagName: newBagName.trim() || undefined },
      side,
      date: date === '' ? null : date,
      qty: side === 'sell' ? snapToHeld(qty.value, held) : qty.value,
      total: total.value,
      note: note.trim() || undefined,
    }
    try {
      onSave(input)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Could not save the trade')
    }
  }

  return (
    <Sheet title="Add trade" onClose={onClose}>
      <form className="trade-form" onSubmit={submit} noValidate>
        <SideToggle value={side} onChange={setSide} />

        <div className="card form-card">
          <Field id="trade-account" label="Account">
            <select
              id="trade-account"
              className="input select"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </Field>
          <AssetField id="trade-asset" value={asset} onChange={setAsset} coins={coins} />
          {noBagToSell && (
            <div className="field-msg error standalone">
              No open {symbol} bag in {accountName} to sell from
            </div>
          )}
          <BagField
            side={side}
            options={options}
            choice={choice}
            onChoice={setBagChoice}
            newName={newBagName}
            onNewName={setNewBagName}
            newNamePlaceholder={defaultBagName(date === '' ? null : date)}
          />
          <Field id="trade-date" label="Date" error={dError} hint={date === '' ? 'Unknown date, shown as ?' : null}>
            <DateInput id="trade-date" value={date} onChange={setDate} />
          </Field>
          <Field id="trade-qty" label="Qty" error={qtyError} hint={readAsHint(qtyText, qty.value, formatQty)}>
            <div className="input-with-btn">
              <DecimalInput
                id="trade-qty"
                value={qtyText}
                onChange={setQtyText}
                invalid={!!qtyError}
                hasMsg={!!qtyError || !!readAsHint(qtyText, qty.value, formatQty)}
                placeholder="0"
              />
              {held !== null && held > 0 && (
                <button type="button" className="chip-btn" onClick={() => setQtyText(toInputText(held))}>
                  Max
                </button>
              )}
            </div>
          </Field>
          <Field
            id="trade-total"
            label="Total $"
            error={total.error}
            hint={readAsHint(totalText, total.value, (v) => formatUsd(v))}
          >
            <DecimalInput
              id="trade-total"
              value={totalText}
              onChange={setTotalText}
              invalid={!!total.error}
              hasMsg={!!total.error || !!readAsHint(totalText, total.value, (v) => formatUsd(v))}
              placeholder={side === 'buy' ? 'paid, fees included' : 'received, after fees'}
            />
          </Field>
        </div>

        <div className="card form-card">
          <div className="field readonly">
            <span className="field-label">Price</span>
            <output className="num" htmlFor="trade-qty trade-total">
              {formatPrice(price)} <span className="muted">(auto)</span>
            </output>
          </div>
          {sellPl !== null && (
            <div className="field preview">
              <span className="field-label">P/L on this sell</span>
              <span className={`num ${tone(sellPl)}`}>≈ {formatUsd(sellPl, { signed: true })}</span>
            </div>
          )}
        </div>

        <NoteField id="trade-note" value={note} onChange={setNote} />

        {saveError && (
          <p className="form-error" role="alert">
            {saveError}
          </p>
        )}
        <button type="submit" className="btn primary block" disabled={!valid}>
          Save
        </button>
        {!valid && missing.length > 0 && <p className="form-hint">Enter {listWords(missing)}</p>}
      </form>
    </Sheet>
  )
}
