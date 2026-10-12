import { useEffect, useState, type FormEvent } from 'react'
import {
  asError,
  formatPrice,
  formatQty,
  formatUsd,
  todayIso,
  type Side,
  type Trade,
  type TradePatch,
} from '../domain'
import { DateInput, DecimalInput, Field, FormError, SideToggle } from './fields'
import { useT } from '../i18n'
import { amountErrorText, dateErrorText, readAmount, readAsText } from './formValues'
import { NoteField } from './NoteField'
import { toInputText, toMoneyInputText } from './numbers'
import { Sheet } from './Sheet'

interface Props {
  trade: Trade
  symbol: string
  /** Both may throw; the error is shown in the form. */
  onSave: (patch: TradePatch) => void
  onDelete: () => void
  onClose: () => void
}

export function EditTradeSheet({ trade, symbol, onSave, onDelete, onClose }: Props) {
  const t = useT()
  const [side, setSide] = useState<Side>(trade.side)
  const [date, setDate] = useState(trade.date ?? '')
  const [qtyText, setQtyText] = useState(() => toInputText(trade.qty))
  const [totalText, setTotalText] = useState(() => toMoneyInputText(trade.total))
  const [note, setNote] = useState(trade.note ?? '')
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // The delete confirmation expires so a stray second tap later does not delete.
  useEffect(() => {
    if (!confirming) return
    const timer = setTimeout(() => setConfirming(false), 4000)
    return () => clearTimeout(timer)
  }, [confirming])

  const qty = readAmount(qtyText, 'qty')
  const total = readAmount(totalText, 'money')
  const dError = dateErrorText(t, date)
  const price = qty.value !== null && total.value !== null ? total.value / qty.value : null
  const valid = qty.value !== null && total.value !== null && !dError
  const qtyError = amountErrorText(t, qty.error)
  const totalError = amountErrorText(t, total.error)
  const qtyHint = readAsText(t, qtyText, qty.value, formatQty)
  const totalHint = readAsText(t, totalText, total.value, (v) => formatUsd(v))

  const run = (action: () => void) => {
    try {
      action()
    } catch (err) {
      setError(asError(err))
    }
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!valid || qty.value === null || total.value === null) return
    const patch: TradePatch = {
      side,
      date: date === '' ? null : date,
      qty: qty.value,
      total: total.value,
      note: note.trim(),
    }
    run(() => onSave(patch))
  }

  return (
    <Sheet title={t.trade.editTitle({ symbol })} onClose={onClose}>
      <form className="trade-form" onSubmit={submit} noValidate>
        <SideToggle value={side} onChange={setSide} />
        <div className="card form-card">
          <Field id="edit-date" label={t.trade.date} error={dError} hint={date === '' ? t.trade.unknownDate : null}>
            <div className="input-with-btn">
              <DateInput id="edit-date" value={date} onChange={setDate} />
              {date !== '' ? (
                <button type="button" className="chip-btn" onClick={() => setDate('')}>
                  {t.trade.unknown}
                </button>
              ) : (
                <button type="button" className="chip-btn" onClick={() => setDate(todayIso())}>
                  {t.trade.today}
                </button>
              )}
            </div>
          </Field>
          <Field id="edit-qty" label={t.trade.qty} error={qtyError} hint={qtyHint}>
            <DecimalInput
              id="edit-qty"
              value={qtyText}
              onChange={setQtyText}
              invalid={!!qtyError}
              hasMsg={!!qtyError || !!qtyHint}
            />
          </Field>
          <Field id="edit-total" label={t.trade.total} error={totalError} hint={totalHint}>
            <DecimalInput
              id="edit-total"
              value={totalText}
              onChange={setTotalText}
              invalid={!!totalError}
              hasMsg={!!totalError || !!totalHint}
            />
          </Field>
          <div className="field readonly">
            <span className="field-label">{t.trade.price}</span>
            <output className="num" htmlFor="edit-qty edit-total">
              {formatPrice(price)} <span className="muted">{t.trade.auto}</span>
            </output>
          </div>
        </div>

        <NoteField id="edit-note" value={note} onChange={setNote} />

        {error && <FormError error={error} />}
        <button type="submit" className="btn primary block" disabled={!valid}>
          {t.trade.saveChanges}
        </button>
        <button
          type="button"
          className={`btn block danger${confirming ? ' confirming' : ''}`}
          onClick={() => (confirming ? run(onDelete) : setConfirming(true))}
        >
          {confirming ? t.trade.tapAgainToDelete : t.trade.deleteTrade}
        </button>
      </form>
    </Sheet>
  )
}
