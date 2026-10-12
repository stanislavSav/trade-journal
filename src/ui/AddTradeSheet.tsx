import { useMemo, useState, type FormEvent } from 'react'
import {
  asError,
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
import { DateInput, DecimalInput, Field, FormError, SideToggle } from './fields'
import { joinList, useLang, useT } from '../i18n'
import { storageLookup, type StorageInfo } from '../storage-tags/resolve'
import { amountErrorText, dateErrorText, readAmount, readAsText } from './formValues'
import { NoteField } from './NoteField'
import { tone, toInputText } from './numbers'
import { Sheet } from './Sheet'
import { StoragePickerSheet } from './StoragePickerSheet'
import type { CustomStorageHandlers } from './storageHandlers'
import { StorageChips } from './StorageTags'

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
  /** Stored at, prefilled for a new bag (task 05 passes the active single-storage filter). */
  presetStorageIds?: readonly string[]
  /** The picker's custom-storage callbacks (storageHandlers.ts). */
  storageEdits: CustomStorageHandlers
  /** May throw; the error is shown in the form. */
  onSave: (input: NewTradeInput) => void
  onClose: () => void
}

function initialAsset(symbol: string | undefined, coins: Coin[]): AssetValue {
  const coin = symbol ? coins.find((c) => c.symbol === symbol) : undefined
  if (coin) return { text: coin.symbol, pick: { symbol: coin.symbol, name: coin.name, geckoId: coin.geckoId } }
  return { text: symbol ?? '', pick: null }
}

export function AddTradeSheet({ journal, accounts, preset, presetStorageIds, storageEdits, onSave, onClose }: Props) {
  const t = useT()
  const { lang } = useLang()
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
  const [saveError, setSaveError] = useState<Error | null>(null)
  const [storageIds, setStorageIds] = useState<string[]>(() => [...(presetStorageIds ?? [])])
  const [pickingStorage, setPickingStorage] = useState(false)

  const symbol = assetSymbol(asset)
  const account = useMemo(() => summarizeAccount(journal, accountId), [journal, accountId])
  const options = useMemo(
    () => bagOptions(journal, account, symbol, side, preset.bagId),
    [journal, account, symbol, side, preset.bagId],
  )
  const choice = resolveBagChoice(bagChoice, options, side)
  const selected = options.find((s) => s.bag.id === choice) ?? null
  // Stored at is asked only when the trade starts a new bag (docs/storage-tags/plan.md §5.5).
  const startsNewBag = side === 'buy' && (choice === NEW_BAG || options.length === 0)
  const lookup = useMemo(() => storageLookup(journal), [journal])
  const chosenStorages = storageIds.map(lookup).filter((s): s is StorageInfo => s !== null)

  const qty = readAmount(qtyText, 'qty')
  const total = readAmount(totalText, 'money')
  const held = side === 'sell' && selected ? selected.qty : null
  const qtyError =
    amountErrorText(t, qty.error) ?? (exceedsHeld(qty.value, held) ? t.trade.holdOnly({ qty: formatQty(held ?? 0) }) : null)
  const totalError = amountErrorText(t, total.error)
  const qtyHint = readAsText(t, qtyText, qty.value, formatQty)
  const totalHint = readAsText(t, totalText, total.value, (v) => formatUsd(v))
  const dError = dateErrorText(t, date)
  const price = qty.value !== null && total.value !== null ? total.value / qty.value : null
  const sellPl =
    side === 'sell' && selected?.avg != null && qty.value !== null && total.value !== null
      ? total.value - qty.value * selected.avg
      : null
  const noBagToSell = side === 'sell' && symbol !== '' && options.length === 0
  const accountName = accounts.find((a) => a.id === accountId)?.name ?? accountId
  // A new bag without a name gets the default name in the UI language; it is then stored as is (plan D11).
  const autoBagName = defaultBagName(date === '' ? null : date, t.trade.months, t.trade.newBagDefault)

  const missing = [
    symbol === '' && t.trade.missingAsset,
    qty.value === null && !qty.error && t.trade.missingQty,
    total.value === null && !total.error && t.trade.missingTotal,
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
      bag:
        choice && choice !== NEW_BAG
          ? { bagId: choice }
          : { newBagName: newBagName.trim() || autoBagName, ...(startsNewBag ? { storageIds } : {}) },
      side,
      date: date === '' ? null : date,
      qty: side === 'sell' ? snapToHeld(qty.value, held) : qty.value,
      total: total.value,
      note: note.trim() || undefined,
    }
    try {
      onSave(input)
    } catch (err) {
      setSaveError(asError(err))
    }
  }

  return (
    <Sheet title={t.trade.addTitle} onClose={onClose}>
      <form className="trade-form" onSubmit={submit} noValidate>
        <SideToggle value={side} onChange={setSide} />

        <div className="card form-card">
          <Field id="trade-account" label={t.trade.account}>
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
            <div className="field-msg error standalone">{t.trade.noBagToSell({ symbol, account: accountName })}</div>
          )}
          <BagField
            side={side}
            options={options}
            choice={choice}
            onChoice={setBagChoice}
            newName={newBagName}
            onNewName={setNewBagName}
            newNamePlaceholder={autoBagName}
          />
          {startsNewBag && (
            <div className="field storage-field">
              <span className="field-label" id="trade-storage-label">
                {t.storage.storedAt}
              </span>
              <div className="field-control storage-field-control">
                <StorageChips storages={chosenStorages} labelledBy="trade-storage-label" />
                <button
                  type="button"
                  className="chip-btn"
                  aria-describedby="trade-storage-label"
                  onClick={() => setPickingStorage(true)}
                >
                  {t.storage.choose}
                </button>
              </div>
            </div>
          )}
          <Field id="trade-date" label={t.trade.date} error={dError} hint={date === '' ? t.trade.unknownDate : null}>
            <DateInput id="trade-date" value={date} onChange={setDate} />
          </Field>
          <Field id="trade-qty" label={t.trade.qty} error={qtyError} hint={qtyHint}>
            <div className="input-with-btn">
              <DecimalInput
                id="trade-qty"
                value={qtyText}
                onChange={setQtyText}
                invalid={!!qtyError}
                hasMsg={!!qtyError || !!qtyHint}
                placeholder="0"
              />
              {held !== null && held > 0 && (
                <button type="button" className="chip-btn" onClick={() => setQtyText(toInputText(held))}>
                  {t.trade.max}
                </button>
              )}
            </div>
          </Field>
          <Field id="trade-total" label={t.trade.total} error={totalError} hint={totalHint}>
            <DecimalInput
              id="trade-total"
              value={totalText}
              onChange={setTotalText}
              invalid={!!totalError}
              hasMsg={!!totalError || !!totalHint}
              placeholder={side === 'buy' ? t.trade.totalPlaceholderBuy : t.trade.totalPlaceholderSell}
            />
          </Field>
        </div>

        <div className="card form-card">
          <div className="field readonly">
            <span className="field-label">{t.trade.price}</span>
            <output className="num" htmlFor="trade-qty trade-total">
              {formatPrice(price)} <span className="muted">{t.trade.auto}</span>
            </output>
          </div>
          {sellPl !== null && (
            <div className="field preview">
              <span className="field-label">{t.trade.sellPl}</span>
              <span className={`num ${tone(sellPl)}`}>≈ {formatUsd(sellPl, { signed: true })}</span>
            </div>
          )}
        </div>

        <NoteField id="trade-note" value={note} onChange={setNote} />

        {saveError && <FormError error={saveError} />}
        <button type="submit" className="btn primary block" disabled={!valid}>
          {t.common.save}
        </button>
        {!valid && missing.length > 0 && (
          <p className="form-hint">{t.trade.enter({ fields: joinList(lang, missing) })}</p>
        )}
      </form>
      {/* A second sheet over this one (portal). Outside the form, so React events from the picker's own form
          never reach this form's onSubmit. */}
      {pickingStorage && (
        <StoragePickerSheet
          journal={journal}
          title={t.storage.storedAt}
          initial={storageIds}
          onSave={(ids) => {
            setStorageIds(ids)
            setPickingStorage(false)
          }}
          onClose={() => setPickingStorage(false)}
          {...storageEdits}
        />
      )}
    </Sheet>
  )
}
