import { formatPrice, formatQty, type BagSummary, type Side } from '../domain'
import { useT, type Messages } from '../i18n'
import { NEW_BAG } from './bagChoice'
import { Field } from './fields'

interface Props {
  side: Side
  options: BagSummary[]
  choice: string | null // bag id or NEW_BAG; null = nothing to choose from
  onChoice: (choice: string) => void
  newName: string
  onNewName: (name: string) => void
  newNamePlaceholder: string
}

function optionLabel(t: Messages, s: BagSummary): string {
  return s.status === 'open' ? `${s.bag.name} · ${formatQty(s.qty)}` : t.trade.bagClosed({ name: s.bag.name })
}

export function BagField({ side, options, choice, onChoice, newName, onNewName, newNamePlaceholder }: Props) {
  const t = useT()
  // A buy with no open bag of this coin silently starts a new one.
  if (options.length === 0) return null
  const selected = options.find((s) => s.bag.id === choice)
  const hint =
    side === 'sell' && selected
      ? t.trade.holdingHint({ qty: formatQty(selected.qty), avg: formatPrice(selected.avg) })
      : undefined

  return (
    <>
      <Field id="trade-bag" label={t.trade.bag} hint={hint}>
        <select
          id="trade-bag"
          className="input select"
          value={choice ?? ''}
          onChange={(e) => onChoice(e.target.value)}
          aria-describedby={hint ? 'trade-bag-msg' : undefined}
        >
          {options.map((s) => (
            <option key={s.bag.id} value={s.bag.id}>
              {optionLabel(t, s)}
            </option>
          ))}
          {side === 'buy' && <option value={NEW_BAG}>{t.trade.newBag}</option>}
        </select>
      </Field>
      {side === 'buy' && choice === NEW_BAG && (
        <Field id="trade-bag-name" label={t.trade.newBagName}>
          <input
            id="trade-bag-name"
            className="input"
            type="text"
            value={newName}
            placeholder={newNamePlaceholder}
            maxLength={40}
            onChange={(e) => onNewName(e.target.value)}
          />
        </Field>
      )}
    </>
  )
}
