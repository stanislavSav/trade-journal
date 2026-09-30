import type { ReactNode } from 'react'
import { todayIso, type Side } from '../domain'
import { msgId } from './formValues'

/** One labelled row in a grouped form card, with an optional message line under it. */
export function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string
  label: string
  error?: string | null
  hint?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="field-wrap">
      <div className="field">
        <label htmlFor={id}>{label}</label>
        <div className="field-control">{children}</div>
      </div>
      {error ? (
        <div id={msgId(id)} className="field-msg error">
          {error}
        </div>
      ) : hint ? (
        <div id={msgId(id)} className="field-msg">
          {hint}
        </div>
      ) : null}
    </div>
  )
}

interface DecimalInputProps {
  id: string
  value: string
  onChange: (text: string) => void
  invalid: boolean
  hasMsg: boolean
  placeholder?: string
}

export function DecimalInput({ id, value, onChange, invalid, hasMsg, placeholder }: DecimalInputProps) {
  return (
    <input
      id={id}
      className="input num"
      type="text"
      inputMode="decimal"
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      enterKeyHint="next"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-invalid={invalid || undefined}
      aria-describedby={hasMsg ? msgId(id) : undefined}
    />
  )
}

export function SideToggle({ value, onChange }: { value: Side; onChange: (side: Side) => void }) {
  return (
    <div className="side-toggle" role="radiogroup" aria-label="Side">
      {(['buy', 'sell'] as const).map((s) => (
        <button
          key={s}
          type="button"
          role="radio"
          aria-checked={value === s}
          className={`side-btn ${s}`}
          onClick={() => onChange(s)}
        >
          {s === 'buy' ? 'BUY' : 'SELL'}
        </button>
      ))}
    </div>
  )
}

export function DateInput({ id, value, onChange }: { id: string; value: string; onChange: (iso: string) => void }) {
  return (
    <input
      id={id}
      className="input num"
      type="date"
      value={value}
      max={todayIso()}
      onChange={(e) => onChange(e.target.value)}
      aria-describedby={msgId(id)}
    />
  )
}
