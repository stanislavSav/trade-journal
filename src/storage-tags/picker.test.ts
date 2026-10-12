import { describe, expect, it } from 'vitest'
import { emptyJournal } from '../domain/journal'
import type { Bag, Journal } from '../domain/types'
import { bagsUsingStorage, pickerGroups, storageNameTaken, usedStorageIds } from './picker'
import { storageList, storageLookup } from './resolve'

const bag = (id: string, storageIds?: string[], deleted = false): Bag => ({
  id,
  accountId: id === 'b3' ? 'family' : 'cs',
  symbol: 'BTC',
  name: 'Jun 26',
  updatedAt: 1,
  ...(storageIds ? { storageIds } : {}),
  ...(deleted ? { deleted } : {}),
})

const journal: Journal = {
  ...emptyJournal(),
  bags: [
    bag('b1', ['binance', 'custom-gone', 'from-a-newer-app']),
    bag('b2', ['ledger']),
    bag('b3', ['custom-1', 'binance']),
    bag('b4', ['okx'], true),
    bag('b5', []),
    bag('b6'),
  ],
  storages: [
    { id: 'custom-1', name: 'Safe box', kind: 'cold', colour: '#0e7c86', updatedAt: 1 },
    { id: 'custom-2', name: 'Bank', kind: 'other', colour: '#c9262e', updatedAt: 1 },
    { id: 'custom-gone', name: 'Old safe', kind: 'other', colour: '#c9262e', updatedAt: 2, deleted: true },
  ],
}
const infos = storageList(journal)
const used = usedStorageIds(journal, storageLookup(journal))
const keys = (groups: { key: string }[]) => groups.map((g) => g.key)
const groupOf = (groups: ReturnType<typeof pickerGroups>, key: string) =>
  groups.find((g) => g.key === key)?.items.map((s) => s.id) ?? []

describe('usedStorageIds', () => {
  it('lists the known storages of live bags in every account, without unknown or deleted ids', () => {
    expect([...used].sort()).toEqual(['binance', 'custom-1', 'ledger'])
  })
})

describe('pickerGroups', () => {
  const all = pickerGroups(infos, used, '', 'en')

  it('keeps the fixed group order', () => {
    expect(keys(all)).toEqual(['used', 'cex', 'dex', 'hot', 'cold', 'custom'])
  })

  it('shows a used storage only in "Used", and custom storages of any kind under "Custom"', () => {
    expect(groupOf(all, 'used')).toEqual(['binance', 'ledger', 'custom-1'])
    expect(groupOf(all, 'cex')).not.toContain('binance')
    expect(groupOf(all, 'cold')).not.toContain('ledger')
    expect(groupOf(all, 'cold')).not.toContain('custom-1')
    expect(groupOf(all, 'custom')).toEqual(['custom-2'])
    expect(all.flatMap((g) => g.items)).toHaveLength(infos.length)
  })

  it('sorts each group by name in the UI language', () => {
    for (const group of all) {
      const names = group.items.map((s) => s.name)
      expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base', numeric: true })))
    }
  })

  it('filters every group with the search and hides empty groups', () => {
    const led = pickerGroups(infos, used, 'led', 'en')
    for (const s of led.flatMap((g) => g.items)) {
      expect([s.name, s.id, ...s.aliases].some((text) => text.toLowerCase().includes('led'))).toBe(true)
    }
    expect(groupOf(led, 'used')).toEqual(['ledger'])
    expect(groupOf(pickerGroups(infos, used, 'huobi', 'en'), 'cex')).toEqual(['htx'])
    expect(pickerGroups(infos, used, 'kunaa', 'en')).toEqual([])
  })
})

describe('storageNameTaken', () => {
  it('refuses predefined names and live custom names in any case, but not the storage itself', () => {
    expect(storageNameTaken('binance', infos)).toBe(true)
    expect(storageNameTaken('  BINANCE ', infos)).toBe(true)
    expect(storageNameTaken('safe BOX', infos)).toBe(true)
    expect(storageNameTaken('Safe Box', infos, 'custom-1')).toBe(false)
    expect(storageNameTaken('Old safe', infos)).toBe(false)
    expect(storageNameTaken('Kuna', infos)).toBe(false)
    expect(storageNameTaken('', infos)).toBe(false)
  })
})

describe('bagsUsingStorage', () => {
  it('counts live bags in every account', () => {
    expect(bagsUsingStorage(journal, 'binance')).toBe(2)
    expect(bagsUsingStorage(journal, 'okx')).toBe(0)
    expect(bagsUsingStorage(journal, 'custom-1')).toBe(1)
  })
})
