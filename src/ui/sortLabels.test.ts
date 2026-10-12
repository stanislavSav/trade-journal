import { describe, expect, it } from 'vitest'
import { en } from '../i18n/en'
import { uk } from '../i18n/uk'
import { DEFAULT_SORT } from './bagSort'
import { sortAriaLabel, sortDirLong, sortLabel } from './sortLabels'

describe('sort labels', () => {
  it('show the defaults as "Value ↓" and "Latest action ↓"', () => {
    expect(sortLabel(en, DEFAULT_SORT.open)).toBe('Value ↓')
    expect(sortLabel(en, DEFAULT_SORT.closed)).toBe('Latest action ↓')
  })

  it('use arrows for numbers and dates, A–Z / Z–A for names', () => {
    expect(sortLabel(en, { key: 'gain', dir: 'asc' })).toBe('Gain % ↑')
    expect(sortLabel(en, { key: 'name', dir: 'asc' })).toBe('Name A–Z')
    expect(sortLabel(en, { key: 'name', dir: 'desc' })).toBe('Name Z–A')
  })

  it('spell out the direction for screen readers', () => {
    expect(sortAriaLabel(en, DEFAULT_SORT.open)).toBe('Sort: Value, largest first')
    expect(sortAriaLabel(en, { key: 'invested', dir: 'asc' })).toBe('Sort: Invested, smallest first')
    expect(sortAriaLabel(en, { key: 'latest', dir: 'desc' })).toBe('Sort: Latest action, newest first')
    expect(sortAriaLabel(en, { key: 'latest', dir: 'asc' })).toBe('Sort: Latest action, oldest first')
    expect(sortDirLong(en, { key: 'name', dir: 'desc' })).toBe('Z to A')
  })

  it('are Ukrainian in the Ukrainian catalog', () => {
    expect(sortLabel(uk, DEFAULT_SORT.open)).toBe('Вартість ↓')
    expect(sortLabel(uk, DEFAULT_SORT.closed)).toBe('Остання дія ↓')
    expect(sortAriaLabel(uk, { key: 'gain', dir: 'desc' })).toBe('Сортування: Дохідність %, спочатку найбільші')
    expect(sortAriaLabel(uk, { key: 'latest', dir: 'asc' })).toBe('Сортування: Остання дія, спочатку найстаріші')
  })
})
