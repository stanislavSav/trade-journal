import { useState } from 'react'

/** Optional note, hidden behind an "Add note" button until needed. */
export function NoteField({ id, value, onChange }: { id: string; value: string; onChange: (note: string) => void }) {
  const [open, setOpen] = useState(value !== '')

  if (!open) {
    return (
      <button type="button" className="text-btn add-note" onClick={() => setOpen(true)}>
        Add note
      </button>
    )
  }

  return (
    <div className="card form-card">
      <div className="field note-field">
        <label htmlFor={id}>Note</label>
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
