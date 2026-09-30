import { formatPrice, formatQty, type BagSummary, type Side } from '../domain'
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

function optionLabel(s: BagSummary): string {
  return s.status === 'open' ? `${s.bag.name} · ${formatQty(s.qty)}` : `${s.bag.name} (closed)`
}

export function BagField({ side, options, choice, onChoice, newName, onNewName, newNamePlaceholder }: Props) {
  // A buy with no open bag of this coin silently starts a new one.
  if (options.length === 0) return null
  const selected = options.find((s) => s.bag.id === choice)
  const hint =
    side === 'sell' && selected ? `holding ${formatQty(selected.qty)} · avg ${formatPrice(selected.avg)}` : undefined

  return (
    <>
      <Field id="trade-bag" label="Bag" hint={hint}>
        <select
          id="trade-bag"
          className="input select"
          value={choice ?? ''}
          onChange={(e) => onChoice(e.target.value)}
          aria-describedby={hint ? 'trade-bag-msg' : undefined}
        >
          {options.map((s) => (
            <option key={s.bag.id} value={s.bag.id}>
              {optionLabel(s)}
            </option>
          ))}
          {side === 'buy' && <option value={NEW_BAG}>New bag…</option>}
        </select>
      </Field>
      {side === 'buy' && choice === NEW_BAG && (
        <Field id="trade-bag-name" label="Name">
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
