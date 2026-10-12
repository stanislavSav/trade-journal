import { describe, expect, it } from 'vitest'
import { addTrade, emptyJournal, type Journal } from '../domain'
import { applyBagStorages, customStorageHandlers } from './storageHandlers'

// The same contract as useJournal().apply: run fn on the latest journal; nothing changes when it throws.
function fakeApply() {
  let journal: Journal = emptyJournal()
  let now = 1_000
  const apply = (fn: (j: Journal, now: number) => Journal) => (journal = fn(journal, ++now))
  return { apply, current: () => journal }
}

describe('customStorageHandlers', () => {
  it('adds, renames and deletes a custom storage through apply', () => {
    const { apply, current } = fakeApply()
    const h = customStorageHandlers(apply)
    const id = h.onAddCustom({ name: 'Safe box', kind: 'other', colour: '#0e7c86' })
    expect(id).toMatch(/^custom-/)
    expect(current().storages).toEqual([expect.objectContaining({ id, name: 'Safe box' })])
    h.onUpdateCustom(id, { name: 'Vault' })
    expect(current().storages[0]).toMatchObject({ id, name: 'Vault' })
    h.onDeleteCustom(id)
    expect(current().storages[0]).toMatchObject({ id, deleted: true })
  })

  it('throws the domain error and leaves the journal unchanged', () => {
    const { apply, current } = fakeApply()
    const h = customStorageHandlers(apply)
    h.onAddCustom({ name: 'Safe box', kind: 'other', colour: '#0e7c86' })
    const before = current()
    expect(() => h.onAddCustom({ name: 'SAFE BOX', kind: 'other', colour: '#0e7c86' })).toThrow(
      expect.objectContaining({ code: 'storageNameTaken' }),
    )
    expect(current()).toBe(before)
  })
})

describe('applyBagStorages', () => {
  it('saves a changed list and reports whether anything changed', () => {
    const { apply, current } = fakeApply()
    apply(
      (j, now) =>
        addTrade(j, { accountId: 'cs', symbol: 'BTC', bag: {}, side: 'buy', date: null, qty: 1, total: 10 }, now)
          .journal,
    )
    const bagId = current().bags[0]!.id
    expect(applyBagStorages(apply, bagId, ['binance'])).toBe(true)
    expect(current().bags[0]!.storageIds).toEqual(['binance'])
    const before = current()
    expect(applyBagStorages(apply, bagId, ['binance'])).toBe(false)
    expect(current()).toBe(before)
    expect(applyBagStorages(apply, bagId, [])).toBe(true)
    expect(current().bags[0]!.storageIds).toEqual([])
  })
})
