// Turns storage ids (catalogue ids and custom-<uuid>) into what the UI shows.
// Pure; spec: docs/storage-tags/plan.md §6.
import { contrastRatio } from '../domain/storages'
import type { Bag, CustomStorage, Journal, StorageKind } from '../domain/types'
import { CATALOGUE } from './catalogue'
import { iconUrl } from './icons'

export interface StorageInfo {
  id: string
  name: string
  kind: StorageKind
  colour: string // '#rrggbb'
  iconUrl: string | null // null → letter badge (or the generic icon of paper-backup / other-hardware)
  custom: boolean
  aliases: readonly string[] // extra names for search; [] for custom storages
}

export type StorageLookup = (id: string) => StorageInfo | null

const PREDEFINED: readonly StorageInfo[] = CATALOGUE.map((s) => ({
  id: s.id,
  name: s.name,
  kind: s.kind,
  colour: s.colour,
  iconUrl: iconUrl(s.id),
  custom: false,
  aliases: s.aliases ?? [],
}))

const customInfo = (s: CustomStorage): StorageInfo => ({
  id: s.id,
  name: s.name,
  kind: s.kind,
  colour: s.colour,
  iconUrl: null,
  custom: true,
  aliases: [],
})

/** Every storage the user can pick: the catalogue (in catalogue order), then the live custom storages. */
export function storageList(journal: Journal): StorageInfo[] {
  const custom = journal.storages.filter((s) => !s.deleted).map(customInfo)
  return [...PREDEFINED, ...custom]
}

/** Lookup by id. Unknown ids and tombstoned custom storages give null (they are kept on bags but not shown). */
export function storageLookup(journal: Journal): StorageLookup {
  const byId = new Map(storageList(journal).map((s) => [s.id, s]))
  return (id) => byId.get(id) ?? null
}

/** The known storages of a bag, without duplicates, in the stored order. */
export function bagStorages(bag: Bag, lookup: StorageLookup): StorageInfo[] {
  const seen = new Set<string>()
  const out: StorageInfo[] = []
  for (const id of bag.storageIds ?? []) {
    const info = seen.has(id) ? null : lookup(id)
    seen.add(id)
    if (info) out.push(info)
  }
  return out
}

/** Storages whose name, id or alias contains the query (ignores case and accents). An empty query keeps all. */
export function storageSearch(query: string, infos: readonly StorageInfo[]): StorageInfo[] {
  const q = fold(query)
  if (!q) return [...infos]
  return infos.filter((s) => [s.name, s.id, ...s.aliases].some((text) => fold(text).includes(q)))
}

function fold(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim()
}

/** White or black, whichever reads better on the colour. */
export function textColour(background: string): '#ffffff' | '#000000' {
  return contrastRatio(background, '#ffffff') >= contrastRatio(background, '#000000') ? '#ffffff' : '#000000'
}

/** First letter or digit of the name, upper case ("?" when there is none). */
export function badgeLetter(name: string): string {
  return /[\p{L}\p{N}]/u.exec(name)?.[0]?.toLocaleUpperCase() ?? '?'
}
