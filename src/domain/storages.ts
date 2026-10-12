// Storage tags: shared rules for Bag.storageIds and custom storages.
// Used by the parser (journal.ts) and by the actions (storageActions.ts), so both accept the same data.
// Spec: docs/storage-tags/plan.md §6.3.
import type { Bag } from './types'

/** At most this many tags per bag. */
export const MAX_STORAGE_TAGS = 10
/** Longest name of a custom storage, in characters (after trim). */
export const CUSTOM_NAME_MAX = 30
/** Every custom storage id starts with this, so it never clashes with a catalogue id. */
export const CUSTOM_ID_PREFIX = 'custom-'
/** The colours a user can pick for a custom storage. Each has contrast ≥ 4.5 with white text. */
export const CUSTOM_COLOURS: readonly string[] = [
  '#0a64d8',
  '#1a7f37',
  '#c9262e',
  '#a55800',
  '#7b3fe4',
  '#0e7c86',
  '#b8336a',
  '#5b5b60',
]

const HEX_COLOUR = /^#[0-9a-fA-F]{6}$/

/** True for a colour written as `#rrggbb`. */
export function isHexColour(value: unknown): value is string {
  return typeof value === 'string' && HEX_COLOUR.test(value)
}

/**
 * The one rule for a list of storage ids: an array of non-empty strings, at most MAX_STORAGE_TAGS
 * after duplicates are removed (first one kept, order kept). Throws otherwise.
 */
export function normaliseStorageIds(ids: unknown): string[] {
  if (!Array.isArray(ids) || !ids.every((id) => typeof id === 'string' && id !== '')) {
    throw new Error('storageIds must be a list of ids')
  }
  const unique = [...new Set(ids as string[])]
  if (unique.length > MAX_STORAGE_TAGS) throw new Error(`storageIds can have at most ${MAX_STORAGE_TAGS} ids`)
  return unique
}

/**
 * Merge step for bags (plan §6.3): when the winning copy has no `storageIds` and the other copy has them,
 * the winner takes them. This keeps tags that an old app version dropped. `[]` is a real choice and is kept.
 */
export function carryStorageIds(merged: Bag[], a: Bag[], b: Bag[]): Bag[] {
  const tagged = new Map<string, string[]>()
  for (const bag of [...a, ...b]) if (bag.storageIds) tagged.set(bag.id, bag.storageIds)
  return merged.map((bag) => {
    const ids = bag.storageIds ? undefined : tagged.get(bag.id)
    return ids ? { ...bag, storageIds: ids } : bag
  })
}

/** WCAG contrast ratio of two `#rrggbb` colours, from 1 (same) to 21 (black on white). */
export function contrastRatio(hexA: string, hexB: string): number {
  const [light, dark] = [luminance(hexA), luminance(hexB)].sort((x, y) => y - x) as [number, number]
  return (light + 0.05) / (dark + 0.05)
}

function luminance(hex: string): number {
  if (!isHexColour(hex)) throw new Error(`Not a #rrggbb colour: ${hex}`)
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
