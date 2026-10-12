// The storage edits the UI makes, bound to the journal (docs/storage-tags/plan.md §6).
// Kept out of JournalApp so that file only opens the picker. Each handler throws what the action throws.
import {
  addCustomStorage,
  deleteCustomStorage,
  setBagStorages,
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

/** Save the storage tags of a bag. Returns false when the list did not change (then nothing is written). */
export function applyBagStorages(apply: Apply, bagId: string, ids: string[]): boolean {
  let changed = false
  apply((j, now) => {
    const next = setBagStorages(j, bagId, ids, now)
    changed = next !== j
    return next
  })
  return changed
}
