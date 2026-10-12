// Journal edits for storage tags. Like actions.ts: pure, each returns a new Journal, `now` becomes updatedAt.
// They accept exactly what parseJournal accepts, so every saved journal can be restored from a backup.
// Spec: docs/storage-tags/plan.md §6 (seams) and §6.3.
import { newId } from './actions'
import { AppError } from './errors'
import { CUSTOM_COLOURS, CUSTOM_ID_PREFIX, CUSTOM_NAME_MAX, normaliseStorageIds } from './storages'
import { STORAGE_KINDS, type CustomStorage, type Journal, type StorageKind, type Synced } from './types'

export interface CustomStorageInput {
  name: string
  kind: StorageKind
  colour: string // one of CUSTOM_COLOURS
}

/**
 * Set the storage tags of a live bag. `[]` is written as `[]` ("no tags", see plan §3).
 * Returns the same journal when the normalised list is unchanged.
 */
export function setBagStorages(journal: Journal, bagId: string, storageIds: string[], now: number): Journal {
  const bag = journal.bags.find((b) => b.id === bagId && !b.deleted)
  if (!bag) throw new AppError('bagNotFound', 'Bag not found')
  const ids = normaliseStorageIds(storageIds)
  if (bag.storageIds && sameList(bag.storageIds, ids)) return journal
  return { ...journal, bags: putById(journal.bags, { ...bag, storageIds: ids, updatedAt: now }) }
}

/** Add a custom storage. Returns the journal and the new id (`custom-<uuid>`). */
export function addCustomStorage(
  journal: Journal,
  input: CustomStorageInput,
  now: number,
): { journal: Journal; id: string } {
  const id = `${CUSTOM_ID_PREFIX}${newId()}`
  const record: CustomStorage = { id, ...checkCustomStorage(journal, input, id), updatedAt: now }
  return { journal: { ...journal, storages: putById(journal.storages, record) }, id }
}

/** Change the name, kind or colour of a live custom storage. */
export function updateCustomStorage(
  journal: Journal,
  id: string,
  patch: Partial<CustomStorageInput>,
  now: number,
): Journal {
  const current = liveStorage(journal, id)
  const fields = checkCustomStorage(journal, { ...current, ...definedOnly(patch) }, id, current.colour)
  return { ...journal, storages: putById(journal.storages, { ...current, ...fields, updatedAt: now }) }
}

/** Tombstone a custom storage. Bags keep its id; it is then ignored (plan §3, "Unknown ids"). */
export function deleteCustomStorage(journal: Journal, id: string, now: number): Journal {
  const current = liveStorage(journal, id)
  return { ...journal, storages: putById(journal.storages, { ...current, deleted: true, updatedAt: now }) }
}

// `keptColour`: the stored colour may stay even if it is not in CUSTOM_COLOURS (a backup may carry any #rrggbb).
function checkCustomStorage(
  journal: Journal,
  input: CustomStorageInput,
  selfId: string,
  keptColour?: string,
): CustomStorageInput {
  const name = input.name.trim()
  if (!name) throw new AppError('storageNameRequired', 'Storage name is required')
  if ([...name].length > CUSTOM_NAME_MAX) {
    throw new AppError('storageNameTooLong', `Storage name can have at most ${CUSTOM_NAME_MAX} characters`, {
      max: CUSTOM_NAME_MAX,
    })
  }
  const key = name.toLowerCase()
  if (journal.storages.some((s) => !s.deleted && s.id !== selfId && s.name.trim().toLowerCase() === key)) {
    throw new AppError('storageNameTaken', `A storage called "${name}" already exists`, { name })
  }
  if (!STORAGE_KINDS.includes(input.kind)) throw new AppError('storageKindInvalid', 'Unknown storage kind')
  if (input.colour !== keptColour && !CUSTOM_COLOURS.includes(input.colour)) {
    throw new AppError('storageColourInvalid', 'Pick one of the storage colours')
  }
  return { name, kind: input.kind, colour: input.colour }
}

function liveStorage(journal: Journal, id: string): CustomStorage {
  const storage = journal.storages.find((s) => s.id === id && !s.deleted)
  if (!storage) throw new AppError('storageNotFound', 'Storage not found')
  return storage
}

function sameList(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((x, i) => x === b[i])
}

function definedOnly<T extends object>(patch: T): Partial<T> {
  return Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined)) as Partial<T>
}

// Same as putById in actions.ts (not exported there): replace the record with the same id, or append it.
function putById<T extends Synced>(list: T[], record: T): T[] {
  const index = list.findIndex((x) => x.id === record.id)
  return index === -1 ? [...list, record] : list.map((x, i) => (i === index ? record : x))
}
