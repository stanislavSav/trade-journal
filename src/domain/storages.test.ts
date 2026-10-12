import { describe, expect, it } from 'vitest'
import { emptyJournal, mergeJournals, parseJournal } from './journal'
import { contrastRatio, CUSTOM_COLOURS, MAX_STORAGE_TAGS, normaliseStorageIds } from './storages'
import type { Bag, CustomStorage, Journal } from './types'

const bagOf = (id: string, updatedAt: number, extra: Partial<Bag> = {}): Bag => ({
  id,
  accountId: 'cs',
  symbol: 'BTC',
  name: 'Jun 26',
  updatedAt,
  ...extra,
})
const storageOf = (id: string, updatedAt: number, extra: Partial<CustomStorage> = {}): CustomStorage => ({
  id,
  name: 'Safe box',
  kind: 'other',
  colour: '#0e7c86',
  updatedAt,
  ...extra,
})
function journalOf(parts: Partial<Omit<Journal, 'version'>>): Journal {
  return { version: 1, accounts: [], coins: [], bags: [], trades: [], storages: [], ...parts }
}

// A literal copy of a backup written before storage tags existed.
const OLD_BACKUP = {
  version: 1,
  accounts: [{ id: 'cs', name: 'CS', updatedAt: 1780000000000 }],
  coins: [{ id: 'BTC', symbol: 'BTC', name: 'Bitcoin', geckoId: 'bitcoin', updatedAt: 1780000000000 }],
  bags: [{ id: 'b1', accountId: 'cs', symbol: 'BTC', name: 'Jun 26', updatedAt: 1780000000000 }],
  trades: [
    {
      id: 't1',
      bagId: 'b1',
      side: 'buy',
      date: '2026-06-03',
      qty: 0.011,
      total: 750,
      note: 'first entry',
      createdAt: 1780000000000,
      updatedAt: 1780000000000,
    },
  ],
}

describe('normaliseStorageIds', () => {
  it('removes duplicates and keeps the order', () => {
    expect(normaliseStorageIds(['binance', 'ledger', 'binance'])).toEqual(['binance', 'ledger'])
    expect(normaliseStorageIds([])).toEqual([])
  })

  it('rejects anything that is not a list of non-empty strings', () => {
    for (const bad of ['binance', null, {}, [1], [''], ['binance', null]]) {
      expect(() => normaliseStorageIds(bad)).toThrow('storageIds must be a list of ids')
    }
  })

  it(`allows at most ${MAX_STORAGE_TAGS} ids after duplicates are removed`, () => {
    const ten = Array.from({ length: 10 }, (_, i) => `s${i}`)
    expect(normaliseStorageIds([...ten, 's0'])).toEqual(ten)
    expect(() => normaliseStorageIds([...ten, 's10'])).toThrow('at most 10')
  })
})

describe('contrastRatio and CUSTOM_COLOURS', () => {
  it('measures black on white as 21 and a colour on itself as 1, in either order', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21)
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21)
    expect(contrastRatio('#0a64d8', '#0a64d8')).toBe(1)
  })

  it('has 8 distinct colours, each readable with white text', () => {
    expect(new Set(CUSTOM_COLOURS).size).toBe(8)
    for (const colour of CUSTOM_COLOURS) {
      expect(colour).toMatch(/^#[0-9a-f]{6}$/)
      expect(contrastRatio(colour, '#ffffff')).toBeGreaterThanOrEqual(4.5)
    }
  })
})

describe('parseJournal with storage tags', () => {
  it('reads an old backup as before, with an empty storages list', () => {
    const parsed = parseJournal(structuredClone(OLD_BACKUP))
    expect(parsed).toEqual({ ...OLD_BACKUP, storages: [] })
    expect('storageIds' in parsed.bags[0]!).toBe(false)
  })

  it('round-trips tagged bags, an empty tag list and live and tombstoned custom storages', () => {
    const journal = journalOf({
      bags: [
        bagOf('b1', 1, { storageIds: ['binance', 'custom-1'] }),
        bagOf('b2', 2, { storageIds: [] }),
        bagOf('b3', 3),
      ],
      storages: [storageOf('custom-1', 4), storageOf('custom-2', 5, { name: 'Old', deleted: true, kind: 'cold' })],
    })
    expect(parseJournal(JSON.parse(JSON.stringify(journal)))).toEqual(journal)
  })

  it('removes duplicate tag ids instead of rejecting them', () => {
    const json = { ...OLD_BACKUP, bags: [{ ...OLD_BACKUP.bags[0], storageIds: ['ledger', 'ledger', 'binance'] }] }
    expect(parseJournal(json).bags[0]!.storageIds).toEqual(['ledger', 'binance'])
  })

  it.each([
    ['storageIds is not a list', { storageIds: 'binance' }, 'Bag 1: storageIds must be a list of ids'],
    ['an id is empty', { storageIds: ['binance', ''] }, 'Bag 1: storageIds must be a list of ids'],
    ['more than 10 ids', { storageIds: Array.from({ length: 11 }, (_, i) => `s${i}`) }, 'Bag 1: storageIds can have'],
  ])('rejects a bag when %s', (_, extra, message) => {
    const json = { ...OLD_BACKUP, bags: [{ ...OLD_BACKUP.bags[0], ...extra }] }
    expect(() => parseJournal(json)).toThrow(message)
  })

  it.each([
    ['a bad kind', [storageOf('custom-1', 1, { kind: 'bank' as never })], 'Storage 1: kind must be one of'],
    ['a bad colour', [storageOf('custom-1', 1, { colour: 'teal' })], 'Storage 1: colour must be #rrggbb'],
    ['an empty name', [storageOf('custom-1', 1, { name: '' })], 'Storage 1: name must be a non-empty string'],
    ['a duplicate id', [storageOf('custom-1', 1), storageOf('custom-1', 2)], 'Storage 2: duplicate id "custom-1"'],
  ])('rejects a custom storage with %s', (_, storages, message) => {
    expect(() => parseJournal({ ...OLD_BACKUP, storages })).toThrow(message)
  })

  it('rejects storages that is not a list, but still requires the old collections', () => {
    expect(() => parseJournal({ ...OLD_BACKUP, storages: null })).toThrow('storages missing')
    const { bags: _bags, ...noBags } = OLD_BACKUP
    expect(() => parseJournal(noBags)).toThrow('Not a trade journal backup: bags missing')
  })
})

describe('mergeJournals with storage tags', () => {
  it('keeps the older tags when the newer copy has no storageIds, in both orders', () => {
    const tagged = journalOf({ bags: [bagOf('b1', 1, { storageIds: ['binance'] })] })
    const renamedByOldApp = journalOf({ bags: [bagOf('b1', 2, { name: 'Renamed' })] })
    const expected = [bagOf('b1', 2, { name: 'Renamed', storageIds: ['binance'] })]
    expect(mergeJournals(renamedByOldApp, tagged).bags).toEqual(expected)
    expect(mergeJournals(tagged, renamedByOldApp).bags).toEqual(expected)
  })

  it('lets a newer empty list win over older tags', () => {
    const tagged = journalOf({ bags: [bagOf('b1', 1, { storageIds: ['binance'] })] })
    const cleared = journalOf({ bags: [bagOf('b1', 2, { storageIds: [] })] })
    expect(mergeJournals(tagged, cleared).bags).toEqual([bagOf('b1', 2, { storageIds: [] })])
    expect(mergeJournals(cleared, tagged).bags).toEqual([bagOf('b1', 2, { storageIds: [] })])
  })

  it('carries tags onto a newer tombstone written by an old app', () => {
    const tagged = journalOf({ bags: [bagOf('b1', 1, { storageIds: ['ledger'] })] })
    const tombstone = journalOf({ bags: [bagOf('b1', 2, { deleted: true })] })
    expect(mergeJournals(tagged, tombstone).bags).toEqual([bagOf('b1', 2, { deleted: true, storageIds: ['ledger'] })])
  })

  it('merges custom storages by id and updatedAt; a newer tombstone wins', () => {
    const a = journalOf({ storages: [storageOf('custom-1', 1), storageOf('custom-2', 5, { name: 'A new' })] })
    const b = journalOf({ storages: [storageOf('custom-1', 3, { deleted: true }), storageOf('custom-2', 2)] })
    const expected = [storageOf('custom-1', 3, { deleted: true }), storageOf('custom-2', 5, { name: 'A new' })]
    expect(mergeJournals(a, b).storages).toEqual(expected)
    expect(mergeJournals(b, a).storages).toEqual(expected)
  })

  it('merges with an empty journal from an old backup', () => {
    const local = journalOf({ storages: [storageOf('custom-1', 1)] })
    expect(mergeJournals(local, parseJournal(OLD_BACKUP)).storages).toEqual([storageOf('custom-1', 1)])
    expect(mergeJournals(emptyJournal(), local).storages).toEqual([storageOf('custom-1', 1)])
  })
})
