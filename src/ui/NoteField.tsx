import { useState } from 'react'
import { useT } from '../i18n'

/** Optional note, hidden behind an "Add note" button until needed. */
export function NoteField({ id, value, onChange }: { id: string; value: string; onChange: (note: string) => void }) {
  const t = useT()
  const [open, setOpen] = useState(value !== '')

  if (!open) {
    return (
      <button type="button" className="text-btn add-note" onClick={() => setOpen(true)}>
        {t.trade.addNote}
      </button>
    )
  }

  return (
    <div className="card form-card">
      <div className="field note-field">
        <label htmlFor={id}>{t.trade.note}</label>
        <textarea
          id={id}
          className="input"
          rows={2}
          maxLength={500}
          value={value}
          autoFocus={value === ''}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  )
}
