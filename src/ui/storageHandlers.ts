// The custom-storage callbacks of StoragePickerSheet, bound to the journal (docs/storage-tags/plan.md §6).
// Kept out of JournalApp so that file only opens the picker. Each handler throws what the action throws.
import {
  addCustomStorage,
  deleteCustomStorage,
  updateCustomStorage,
  type CustomStorageInput,
  type Journal,
} from '../domain'

type Apply = (fn: (j: Journal, now: number) => Journal) => Journal

export interface CustomStorageHandlers {
  onAddCustom: (input: CustomStorageInput) => string
  onUpdateCustom: (id: string, patch: Partial<CustomStorageInput>) => void
  onDeleteCustom: (id: string) => void
}

export function customStorageHandlers(apply: Apply): CustomStorageHandlers {
  return {
    onAddCustom: (input) => {
      let id = ''
      apply((j, now) => {
        const added = addCustomStorage(j, input, now)
        id = added.id
        return added.journal
      })
      return id
    },
    onUpdateCustom: (id, patch) => apply((j, now) => updateCustomStorage(j, id, patch, now)),
    onDeleteCustom: (id) => apply((j, now) => deleteCustomStorage(j, id, now)),
  }
}
