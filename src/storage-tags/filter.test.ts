import { describe, expect, it } from 'vitest'
import { emptyJournal } from '../domain/journal'
import { summarizeBag } from '../domain/portfolio'
import type { Bag, BagSummary, Journal } from '../domain/types'
import { activeFilter, filterChips, filterKey, matchesFilter, parseFilterKey, type StorageFilter } from './filter'
import { storageLookup } from './resolve'

const bag = (id: string, storageIds?: string[]): Bag => ({
  id,
  accountId: 'cs',
  symbol: 'BTC',
  name: id,
  updatedAt: 1,
  ...(storageIds ? { storageIds } : {}),
})
const summary = (b: Bag): BagSummary => summarizeBag(b, [])

const journal: Journal = {
  ...emptyJournal(),
  storages: [
    { id: 'custom-safe', name: 'Family safe', kind: 'other', colour: '#0e7c86', updatedAt: 1 },
    { id: 'custom-gone', name: 'Old safe', kind: 'other', colour: '#c9262e', updatedAt: 2, deleted: true },
  ],
}
const lookup = storageLookup(journal)
const keys = (chips: StorageFilter[]) => chips.map(filterKey)
const chipsFor = (...bags: Bag[]) => keys(filterChips(bags.map(summary), lookup))

const binance1 = bag('b1', ['binance'])
const binance2 = bag('b2', ['binance'])
const ledger = bag('b3', ['ledger'])
const mixed = bag('b4', ['binance', 'ledger'])
const untagged = bag('b5', [])
const neverTagged = bag('b6')

describe('filterChips', () => {
  it('lists All, the single storages by name, then Mixed and No tag', () => {
    expect(chipsFor(ledger, binance1, binance2, mixed, untagged)).toEqual([
      'all',
      'storage:binance',
      'storage:ledger',
      'mixed',
      'none',
    ])
  })

  it('shows Mixed and No tag only when a bag is in that group', () => {
    expect(chipsFor(binance1, binance2, ledger)).toEqual(['all', 'storage:binance', 'storage:ledger'])
    expect(chipsFor(mixed, neverTagged)).toEqual(['all', 'mixed', 'none'])
  })

  it('is empty when no bag has a known tag', () => {
    expect(chipsFor(untagged, neverTagged)).toEqual([])
    expect(chipsFor(bag('b7', ['from-a-newer-app']), bag('b8', ['custom-gone']))).toEqual([])
    expect(chipsFor()).toEqual([])
  })

  it('counts a deleted custom storage as no tag, and an unknown id as no tag', () => {
    expect(chipsFor(bag('b7', ['binance', 'custom-gone']))).toEqual(['all', 'storage:binance'])
    expect(chipsFor(binance1, bag('b8', ['from-a-newer-app']))).toEqual(['all', 'storage:binance', 'none'])
  })

  it('sorts custom storages by name with the catalogue ones, ignoring case', () => {
    expect(chipsFor(bag('b1', ['custom-safe']), bag('b2', ['okx']), bag('b3', ['bybit']))).toEqual([
      'all',
      'storage:bybit',
      'storage:custom-safe',
      'storage:okx',
    ])
  })

  it('counts a repeated id once', () => {
    expect(chipsFor(bag('b1', ['ledger', 'ledger']))).toEqual(['all', 'storage:ledger'])
  })
})

describe('matchesFilter', () => {
  const pick = (f: StorageFilter, bags: Bag[]) => bags.filter((b) => matchesFilter(b, f, lookup)).map((b) => b.id)
  const bags = [binance1, ledger, mixed, untagged, neverTagged, bag('b7', ['binance', 'custom-gone'])]

  it('keeps every bag for All', () => {
    expect(pick({ kind: 'all' }, bags)).toEqual(['b1', 'b3', 'b4', 'b5', 'b6', 'b7'])
  })

  it('keeps bags whose only known tag is the storage', () => {
    expect(pick({ kind: 'storage', id: 'binance' }, bags)).toEqual(['b1', 'b7'])
    expect(pick({ kind: 'storage', id: 'ledger' }, bags)).toEqual(['b3'])
  })

  it('keeps bags with 2+ known tags for Mixed and bags without a known tag for No tag', () => {
    expect(pick({ kind: 'mixed' }, bags)).toEqual(['b4'])
    expect(pick({ kind: 'none' }, bags)).toEqual(['b5', 'b6'])
  })
})

describe('filterKey and parseFilterKey', () => {
  it('round-trips every kind', () => {
    const all: StorageFilter[] = [{ kind: 'all' }, { kind: 'mixed' }, { kind: 'none' }, { kind: 'storage', id: 'okx' }]
    for (const f of all) expect(parseFilterKey(filterKey(f))).toEqual(f)
    expect(parseFilterKey('storage:custom-1234')).toEqual({ kind: 'storage', id: 'custom-1234' })
  })

  it('maps anything unknown to All', () => {
    for (const raw of [null, '', 'storage:', 'garbage', 'ALL', 'Mixed', ' none']) {
      expect(parseFilterKey(raw)).toEqual({ kind: 'all' })
    }
  })
})

describe('activeFilter', () => {
  const chips = filterChips([binance1, ledger].map(summary), lookup)

  it('uses the stored filter when it is one of the chips', () => {
    expect(activeFilter('storage:ledger', chips)).toEqual({ kind: 'storage', id: 'ledger' })
  })

  it('falls back to All when the stored chip is not there, or there are no chips', () => {
    expect(activeFilter('storage:okx', chips)).toEqual({ kind: 'all' })
    expect(activeFilter('mixed', chips)).toEqual({ kind: 'all' })
    expect(activeFilter('storage:ledger', [])).toEqual({ kind: 'all' })
    expect(activeFilter(null, chips)).toEqual({ kind: 'all' })
  })
})
