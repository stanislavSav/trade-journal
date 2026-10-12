import { describe, expect, it } from 'vitest'
import { addTrade, deleteTrade, renameBag, type NewTradeInput } from './actions'
import { emptyJournal, parseJournal } from './journal'
import { addCustomStorage, deleteCustomStorage, setBagStorages, updateCustomStorage } from './storageActions'
import type { Journal } from './types'

const NOW = 1_780_000_000_000

const btcBuy: NewTradeInput = {
  accountId: 'cs',
  symbol: 'btc',
  bag: {},
  side: 'buy',
  date: '2026-06-03',
  qty: 0.011,
  total: 750,
}

function oneBag(storageIds?: string[]): { journal: Journal; bagId: string; tradeId: string } {
  const { journal, tradeId } = addTrade(emptyJournal(), { ...btcBuy, bag: { storageIds } }, NOW)
  return { journal, bagId: journal.bags[0]!.id, tradeId }
}

const safeBox = { name: 'Safe box', kind: 'other', colour: '#0e7c86' } as const

describe('addTrade with storage tags', () => {
  it('stores the normalised tags on a new bag', () => {
    const { journal } = oneBag(['binance', 'binance', 'ledger'])
    expect(journal.bags[0]!.storageIds).toEqual(['binance', 'ledger'])
  })

  it('leaves the field out when no tags are given', () => {
    expect('storageIds' in oneBag().journal.bags[0]!).toBe(false)
    expect('storageIds' in oneBag([]).journal.bags[0]!).toBe(false)
  })

  it('rejects a bad list', () => {
    expect(() => oneBag(['binance', ''])).toThrow('storageIds must be a list of ids')
  })
})

describe('renameBag and deleteTrade keep the tags', () => {
  it('keeps storageIds on rename and on the tombstone', () => {
    const { journal, bagId, tradeId } = oneBag(['ledger'])
    expect(renameBag(journal, bagId, 'Swing', NOW + 1).bags[0]!.storageIds).toEqual(['ledger'])
    const deleted = deleteTrade(journal, tradeId, NOW + 1).bags[0]!
    expect(deleted).toMatchObject({ deleted: true, storageIds: ['ledger'] })
  })
})

describe('setBagStorages', () => {
  it('writes the normalised list and bumps updatedAt', () => {
    const { journal, bagId } = oneBag()
    const after = setBagStorages(journal, bagId, ['okx', 'ledger', 'okx'], NOW + 5)
    expect(after.bags[0]).toMatchObject({ storageIds: ['okx', 'ledger'], updatedAt: NOW + 5 })
  })

  it('writes an empty list explicitly', () => {
    const { journal, bagId } = oneBag(['binance'])
    const after = setBagStorages(journal, bagId, [], NOW + 5)
    expect(after.bags[0]).toMatchObject({ storageIds: [], updatedAt: NOW + 5 })
  })

  it('writes [] on a bag that never had tags', () => {
    const { journal, bagId } = oneBag()
    expect(setBagStorages(journal, bagId, [], NOW + 5).bags[0]!.storageIds).toEqual([])
  })

  it('returns the same journal when nothing changed', () => {
    const { journal, bagId } = oneBag(['binance', 'ledger'])
    expect(setBagStorages(journal, bagId, ['binance', 'ledger', 'binance'], NOW + 5)).toBe(journal)
  })

  it('rejects a deleted or unknown bag and a bad list', () => {
    const { journal, bagId, tradeId } = oneBag()
    const gone = deleteTrade(journal, tradeId, NOW + 1)
    expect(() => setBagStorages(gone, bagId, ['binance'], NOW + 5)).toThrow('Bag not found')
    expect(() => setBagStorages(journal, 'missing', ['binance'], NOW + 5)).toThrow('Bag not found')
    const eleven = Array.from({ length: 11 }, (_, i) => `s${i}`)
    expect(() => setBagStorages(journal, bagId, eleven, NOW + 5)).toThrow('at most 10')
  })
})

describe('custom storages', () => {
  it('adds a trimmed custom storage with a custom- id that survives a backup', () => {
    const { journal, id } = addCustomStorage(emptyJournal(), { ...safeBox, name: '  Safe box ' }, NOW)
    expect(id).toMatch(/^custom-[0-9a-f-]{36}$/)
    expect(journal.storages).toEqual([{ id, name: 'Safe box', kind: 'other', colour: '#0e7c86', updatedAt: NOW }])
    expect(parseJournal(JSON.parse(JSON.stringify(journal)))).toEqual(journal)
  })

  it('rejects an empty or too long name, a live duplicate name, an unknown kind and a colour off the list', () => {
    const { journal } = addCustomStorage(emptyJournal(), safeBox, NOW)
    expect(() => addCustomStorage(journal, { ...safeBox, name: '  ' }, NOW)).toThrow('Storage name is required')
    expect(() => addCustomStorage(journal, { ...safeBox, name: 'x'.repeat(31) }, NOW)).toThrow('at most 30')
    expect(addCustomStorage(emptyJournal(), { ...safeBox, name: 'x'.repeat(30) }, NOW).journal.storages).toHaveLength(1)
    expect(() => addCustomStorage(journal, { ...safeBox, name: ' SAFE BOX ' }, NOW)).toThrow('already exists')
    expect(() => addCustomStorage(journal, { ...safeBox, name: 'Bank', kind: 'bank' as never }, NOW)).toThrow(
      'Unknown storage kind',
    )
    expect(() => addCustomStorage(journal, { ...safeBox, name: 'Bank', colour: '#123456' }, NOW)).toThrow(
      'Pick one of the storage colours',
    )
  })

  it('lets a name of a deleted storage be used again', () => {
    const first = addCustomStorage(emptyJournal(), safeBox, NOW)
    const deleted = deleteCustomStorage(first.journal, first.id, NOW + 1)
    const again = addCustomStorage(deleted, safeBox, NOW + 2)
    expect(again.journal.storages.filter((s) => !s.deleted).map((s) => s.name)).toEqual(['Safe box'])
  })

  it('updates name, kind and colour; renaming to its own name in other casing is allowed', () => {
    const { journal, id } = addCustomStorage(emptyJournal(), safeBox, NOW)
    const after = updateCustomStorage(journal, id, { name: 'SAFE BOX', kind: 'cold', colour: '#c9262e' }, NOW + 5)
    expect(after.storages).toEqual([{ id, name: 'SAFE BOX', kind: 'cold', colour: '#c9262e', updatedAt: NOW + 5 }])
    expect(updateCustomStorage(journal, id, { kind: undefined }, NOW + 5).storages[0]).toMatchObject(safeBox)
  })

  it('checks updates like additions', () => {
    const one = addCustomStorage(emptyJournal(), safeBox, NOW)
    const two = addCustomStorage(one.journal, { ...safeBox, name: 'Bank' }, NOW)
    expect(() => updateCustomStorage(two.journal, two.id, { name: 'safe box' }, NOW)).toThrow('already exists')
    expect(() => updateCustomStorage(two.journal, two.id, { name: '' }, NOW)).toThrow('Storage name is required')
    expect(() => updateCustomStorage(two.journal, two.id, { colour: '#000000' }, NOW)).toThrow('Pick one')
    expect(() => updateCustomStorage(two.journal, 'custom-x', { name: 'X' }, NOW)).toThrow('Storage not found')
  })

  it('keeps a stored colour that is not on the list when only the name changes', () => {
    const journal = { ...emptyJournal(), storages: [{ id: 'custom-1', updatedAt: 1, ...safeBox, colour: '#123456' }] }
    expect(updateCustomStorage(journal, 'custom-1', { name: 'Vault' }, NOW).storages[0]!.colour).toBe('#123456')
  })

  it('throws AppErrors with codes the UI can translate', () => {
    const code = (c: string, params?: object) => expect.objectContaining({ code: c, ...(params && { params }) })
    const { journal, id } = addCustomStorage(emptyJournal(), safeBox, NOW)
    expect(() => addCustomStorage(journal, { ...safeBox, name: ' ' }, NOW)).toThrow(code('storageNameRequired'))
    expect(() => addCustomStorage(journal, { ...safeBox, name: 'x'.repeat(31) }, NOW)).toThrow(
      code('storageNameTooLong', { max: 30 }),
    )
    expect(() => addCustomStorage(journal, { ...safeBox, name: 'SAFE BOX' }, NOW)).toThrow(
      code('storageNameTaken', { name: 'SAFE BOX' }),
    )
    expect(() => addCustomStorage(journal, { ...safeBox, name: 'B', kind: 'x' as never }, NOW)).toThrow(
      code('storageKindInvalid'),
    )
    expect(() => updateCustomStorage(journal, id, { colour: '#000000' }, NOW)).toThrow(code('storageColourInvalid'))
    expect(() => deleteCustomStorage(journal, 'custom-x', NOW)).toThrow(code('storageNotFound'))
    const bag = oneBag()
    expect(() => setBagStorages(bag.journal, 'missing', [], NOW)).toThrow(code('bagNotFound'))
    expect(() => setBagStorages(bag.journal, bag.bagId, [''], NOW)).toThrow(code('storageIdsInvalid'))
    const eleven = Array.from({ length: 11 }, (_, i) => `s${i}`)
    expect(() => setBagStorages(bag.journal, bag.bagId, eleven, NOW)).toThrow(code('storageTooMany', { max: 10 }))
  })

  it('deletes with a tombstone and leaves bags unchanged', () => {
    const added = addCustomStorage(emptyJournal(), safeBox, NOW)
    const { journal } = addTrade(added.journal, { ...btcBuy, bag: { storageIds: [added.id] } }, NOW)
    const after = deleteCustomStorage(journal, added.id, NOW + 5)
    expect(after.storages[0]).toMatchObject({ id: added.id, deleted: true, updatedAt: NOW + 5 })
    expect(after.bags).toBe(journal.bags)
    expect(() => deleteCustomStorage(after, added.id, NOW + 6)).toThrow('Storage not found')
  })
})
