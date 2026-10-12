import { describe, expect, it } from 'vitest'
import { emptyJournal } from '../domain/journal'
import type { Bag, Journal } from '../domain/types'
import { CATALOGUE } from './catalogue'
import { iconUrl } from './icons'
import { badgeLetter, bagStorages, storageList, storageLookup, storageSearch, textColour } from './resolve'

const journal: Journal = {
  ...emptyJournal(),
  storages: [
    { id: 'custom-1', name: 'Safe box', kind: 'other', colour: '#0e7c86', updatedAt: 1 },
    { id: 'custom-2', name: 'Old safe', kind: 'other', colour: '#c9262e', updatedAt: 2, deleted: true },
  ],
}
const bag = (storageIds?: string[]): Bag => ({
  id: 'b1',
  accountId: 'cs',
  symbol: 'BTC',
  name: 'Jun 26',
  updatedAt: 1,
  ...(storageIds ? { storageIds } : {}),
})
const names = (infos: { name: string }[]) => infos.map((s) => s.name)

describe('storageLookup', () => {
  const lookup = storageLookup(journal)

  it('finds predefined storages with their logo, and live custom storages', () => {
    expect(lookup('binance')).toMatchObject({ name: 'Binance', kind: 'cex', custom: false, iconUrl: expect.any(String) })
    expect(lookup('htx')).toMatchObject({ name: 'HTX', iconUrl: null, aliases: ['huobi'] })
    expect(lookup('custom-1')).toEqual({
      id: 'custom-1',
      name: 'Safe box',
      kind: 'other',
      colour: '#0e7c86',
      iconUrl: null,
      custom: true,
      aliases: [],
    })
  })

  it('returns null for an unknown id and for a deleted custom storage', () => {
    expect(lookup('kuna')).toBeNull()
    expect(lookup('custom-2')).toBeNull()
  })
})

describe('storageList', () => {
  it('lists the catalogue in order, then the live custom storages', () => {
    const list = storageList(journal)
    expect(list).toHaveLength(CATALOGUE.length + 1)
    expect(list.slice(0, 3).map((s) => s.id)).toEqual(['binance', 'coinbase', 'kraken'])
    expect(list.at(-1)!.id).toBe('custom-1')
  })
})

describe('bagStorages', () => {
  const lookup = storageLookup(journal)

  it('keeps known ids in the stored order, without duplicates', () => {
    expect(names(bagStorages(bag(['ledger', 'custom-2', 'binance', 'kuna', 'ledger', 'custom-1']), lookup))).toEqual([
      'Ledger',
      'Binance',
      'Safe box',
    ])
  })

  it('gives nothing for a bag without tags', () => {
    expect(bagStorages(bag(), lookup)).toEqual([])
    expect(bagStorages(bag([]), lookup)).toEqual([])
  })
})

describe('storageSearch', () => {
  const all = storageList(journal)

  it('matches old names, ids and names in any case', () => {
    expect(names(storageSearch('huobi', all))).toEqual(['HTX'])
    expect(names(storageSearch('LEDG', all))).toEqual(['Ledger'])
    expect(names(storageSearch('bitkeep', all))).toEqual(['Bitget Wallet'])
    expect(names(storageSearch('paraswap', all))).toEqual(['Velora'])
    expect(names(storageSearch('crypto-com', all))).toEqual(['Crypto.com'])
    expect(names(storageSearch('safe b', all))).toEqual(['Safe box'])
  })

  it('ignores accents in the query and the names', () => {
    const custom = [{ ...all.at(-1)!, name: 'Café Ёлка' }]
    expect(names(storageSearch('cafe елка', custom))).toEqual(['Café Ёлка'])
    expect(names(storageSearch('bínance', all))).toEqual(['Binance', 'Binance Wallet'])
  })

  it('returns everything for an empty query', () => {
    expect(storageSearch('  ', all)).toEqual(all)
  })
})

describe('icons and badges', () => {
  it('has a URL for a logo tile and null for a storage without one', () => {
    expect(iconUrl('ledger')).toEqual(expect.any(String))
    expect(iconUrl('htx')).toBeNull()
    expect(iconUrl('paper-backup')).toBeNull()
  })

  it('picks a readable text colour and the first letter or digit', () => {
    expect(textColour('#000000')).toBe('#ffffff')
    expect(textColour('#ffef46')).toBe('#000000')
    expect(badgeLetter('safe box')).toBe('S')
    expect(badgeLetter("  'my vault")).toBe('M')
    expect(badgeLetter('ёлка')).toBe('Ё')
    expect(badgeLetter('—')).toBe('?')
  })
})
