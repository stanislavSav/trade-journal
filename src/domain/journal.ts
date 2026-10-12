import { AppError } from './errors'
import type { Journal, Side, Synced } from './types'

/** Lower-case slug used as the Account id, e.g. "CS" -> "cs", "My Fund" -> "my-fund". */
export function accountIdFor(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-|-$/g, '')
}

/** A fresh journal with one account "CS" (id "cs", updatedAt 0 so any backup overrides it). */
export function emptyJournal(): Journal {
  return { version: 1, accounts: [{ id: 'cs', name: 'CS', updatedAt: 0 }], coins: [], bags: [], trades: [] }
}

/**
 * Validate unknown JSON (e.g. a loaded backup file) and return a Journal.
 * Throws an AppError (backupNotJournal, backupVersion or backupDamaged) when the shape is wrong; its message and
 * `detail` say where, in English (docs/i18n/plan.md D13).
 */
export function parseJournal(json: unknown): Journal {
  if (!isObject(json) || !('version' in json)) throw new AppError('backupNotJournal', 'Not a trade journal backup')
  if (json.version !== 1) {
    const version = String(json.version)
    throw new AppError('backupVersion', `Unsupported backup version: ${version}`, { version })
  }
  return {
    version: 1,
    accounts: parseList(json, 'accounts', 'Account', (f) => ({ ...f.synced(), name: f.string('name') })),
    coins: parseList(json, 'coins', 'Coin', (f) => ({
      ...f.synced(),
      symbol: f.id('symbol'),
      name: f.string('name'),
      geckoId: f.stringOrNull('geckoId'),
    })),
    bags: parseList(json, 'bags', 'Bag', (f) => ({
      ...f.synced(),
      accountId: f.id('accountId'),
      symbol: f.id('symbol'),
      name: f.string('name'),
    })),
    trades: parseList(json, 'trades', 'Trade', (f) => {
      const note = f.optionalString('note')
      return {
        ...f.synced(),
        bagId: f.id('bagId'),
        side: f.side(),
        date: f.date(),
        qty: f.positive('qty'),
        total: f.positive('total'),
        ...(note === undefined ? {} : { note }),
        createdAt: f.number('createdAt'),
      }
    }),
  }
}

type Obj = Record<string, unknown>

function isObject(value: unknown): value is Obj {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

// Typed field readers for one record; each throws backupDamaged with the detail "<where>: <problem>".
function fields(record: Obj, where: string) {
  const fail = (problem: string): never => damaged(`${where}: ${problem}`)
  const id = (key: string): string => {
    const v = record[key]
    return typeof v === 'string' && v !== '' ? v : fail(`${key} must be a non-empty string`)
  }
  const number = (key: string): number => {
    const v = record[key]
    return typeof v === 'number' && Number.isFinite(v) ? v : fail(`${key} must be a number`)
  }
  return {
    id,
    number,
    string: (key: string): string => {
      const v = record[key]
      return typeof v === 'string' ? v : fail(`${key} must be a string`)
    },
    stringOrNull: (key: string): string | null => {
      const v = record[key]
      return typeof v === 'string' || v === null ? v : fail(`${key} must be a string or null`)
    },
    optionalString: (key: string): string | undefined => {
      const v = record[key]
      return typeof v === 'string' || v === undefined ? v : fail(`${key} must be a string`)
    },
    positive: (key: string): number => {
      const v = record[key]
      return typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : fail(`${key} must be a positive number`)
    },
    side: (): Side => {
      const v = record.side
      return v === 'buy' || v === 'sell' ? v : fail('side must be "buy" or "sell"')
    },
    date: (): string | null => {
      const v = record.date
      return v === null || (typeof v === 'string' && ISO_DATE.test(v)) ? v : fail('date must be YYYY-MM-DD or null')
    },
    synced: (): Synced => {
      const base = { id: id('id'), updatedAt: number('updatedAt') }
      const deleted = record.deleted
      if (deleted === undefined) return base
      return { ...base, deleted: typeof deleted === 'boolean' ? deleted : fail('deleted must be true or false') }
    },
  }
}

type Fields = ReturnType<typeof fields>

function damaged(detail: string): never {
  throw new AppError('backupDamaged', detail, { detail })
}

function parseList<T extends Synced>(json: Obj, key: string, label: string, parse: (f: Fields) => T): T[] {
  const list = json[key]
  if (!Array.isArray(list)) {
    throw new AppError('backupNotJournal', `Not a trade journal backup: ${key} missing`, { detail: `${key} missing` })
  }
  const seen = new Set<string>()
  return list.map((item: unknown, i) => {
    const where = `${label} ${i + 1}`
    if (!isObject(item)) damaged(`${where}: not an object`)
    const record = parse(fields(item, where))
    if (seen.has(record.id)) damaged(`${where}: duplicate id "${record.id}"`)
    seen.add(record.id)
    return record
  })
}

/**
 * Combine two journals. Records are matched by id per collection (accounts, coins, bags, trades);
 * the copy with the higher updatedAt wins (tombstones included). On a tie, keep `a`.
 * Result collections are sorted by id so merging is deterministic.
 */
export function mergeJournals(a: Journal, b: Journal): Journal {
  return {
    version: 1,
    accounts: mergeById(a.accounts, b.accounts),
    coins: mergeById(a.coins, b.coins),
    bags: mergeById(a.bags, b.bags),
    trades: mergeById(a.trades, b.trades),
  }
}

function mergeById<T extends Synced>(a: T[], b: T[]): T[] {
  const byId = new Map<string, T>()
  for (const record of [...a, ...b]) {
    const current = byId.get(record.id)
    if (!current || record.updatedAt > current.updatedAt) byId.set(record.id, record)
  }
  return [...byId.values()].sort((x, y) => (x.id < y.id ? -1 : x.id > y.id ? 1 : 0))
}
