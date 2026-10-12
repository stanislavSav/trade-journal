import { describe, expect, it } from 'vitest'
import { emptyJournal } from '../domain/journal'
import { en } from '../i18n/en'
import { uk } from '../i18n/uk'
import { storageLookup } from '../storage-tags/resolve'
import { filterCaption, filterChipLabel, filterEmptyText } from './storageText'

const lookup = storageLookup(emptyJournal())
const binance = { kind: 'storage', id: 'binance' } as const

describe('filter texts', () => {
  it('names the chips', () => {
    expect(filterChipLabel(en, { kind: 'all' }, lookup)).toBe('All')
    expect(filterChipLabel(en, binance, lookup)).toBe('Binance')
    expect(filterChipLabel(uk, { kind: 'none' }, lookup)).toBe('Без мітки')
  })

  it('shows a caption only when the filter is not All', () => {
    expect(filterCaption(en, { kind: 'all' }, lookup)).toBeNull()
    expect(filterCaption(en, binance, lookup)).toBe('Only Binance')
    expect(filterCaption(en, { kind: 'mixed' }, lookup)).toBe('Only mixed storage')
    expect(filterCaption(en, { kind: 'none' }, lookup)).toBe('Only bags without a tag')
  })

  it('says which filter hides the bags of an empty tab', () => {
    expect(filterEmptyText(en, { kind: 'all' }, lookup, 'open')).toBeNull()
    expect(filterEmptyText(en, binance, lookup, 'open')).toBe('No open bags in Binance.')
    expect(filterEmptyText(en, binance, lookup, 'closed')).toBe('No closed bags in Binance.')
    expect(filterEmptyText(uk, binance, lookup, 'closed')).toBe('Немає закритих позицій у Binance.')
  })
})
