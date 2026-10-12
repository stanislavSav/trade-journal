// The demo journal: `?demo` on the live site and public/sample-backup.json (docs/demo-data/plan.md §6.2).
// Pure and deterministic: the same `today` always gives the same journal, with fixed ids and timestamps, so the
// sample file is byte-stable and loading it twice adds nothing. Every number is made up.
// When the demo data changes, move DEMO_SAMPLE_DATE forward and run `npm test -- -u` (plan D11, D15).
import type { Bag, Coin, CustomStorage, Journal, Side, Trade } from '../domain'

/** The fixed "today" of the sample file and the tests. */
export const DEMO_SAMPLE_DATE = '2026-10-01'

const DAY_MS = 86_400_000

function dayStartMs(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number]
  return Date.UTC(y, m - 1, d)
}

/** The ISO date `n` days before `iso` (negative `n` goes forward). Works in UTC, so there are no DST jumps. */
export function isoDaysBefore(iso: string, n: number): string {
  return new Date(dayStartMs(iso) - n * DAY_MS).toISOString().slice(0, 10)
}

const ACCOUNTS: [id: string, name: string][] = [
  ['demo', 'Demo'],
  ['demo-family', 'Demo Family'],
  ['demo-swing', 'Demo Swing'],
]

const COINS: [symbol: string, name: string, geckoId: string | null][] = [
  ['BTC', 'Bitcoin', 'bitcoin'],
  ['ETH', 'Ethereum', 'ethereum'],
  ['SOL', 'Solana', 'solana'],
  ['DOGE', 'Dogecoin', 'dogecoin'],
  ['LINK', 'Chainlink', 'chainlink'],
  ['FAKE', 'Fake Coin', null],
  ['ADA', 'Cardano', 'cardano'],
  ['XRP', 'XRP', 'ripple'],
  ['HYPE', 'Hyperliquid', 'hyperliquid'],
  ['PEPE', 'Pepe', 'pepe'],
  ['TON', 'Toncoin', 'the-open-network'],
]

const FAMILY_SAFE = 'custom-demo-family-safe'

const STORAGES: Omit<CustomStorage, 'updatedAt'>[] = [
  { id: FAMILY_SAFE, name: 'Family safe', kind: 'other', colour: '#1a7f37' },
]

// Bag number (01…15) → account, coin, name and storage tags. `undefined` tags = never set (old data).
const BAGS: [no: number, account: string, symbol: string, name: string, storageIds: string[] | undefined][] = [
  [1, 'demo', 'BTC', 'Long-term', ['ledger']],
  [2, 'demo', 'ETH', 'Main', ['binance', 'ledger']],
  [3, 'demo', 'SOL', 'Unknown date', []],
  [4, 'demo', 'BTC', 'Swing', ['binance']],
  [5, 'demo', 'DOGE', 'Fun', ['binance']],
  [6, 'demo', 'LINK', 'Oversold', ['binance']],
  [7, 'demo', 'FAKE', 'Test coin', undefined],
  [8, 'demo-family', 'BTC', 'Kids fund', [FAMILY_SAFE]],
  [9, 'demo-family', 'ETH', 'Staking', ['ledger']],
  [10, 'demo-family', 'ADA', 'DCA', ['binance']],
  [11, 'demo-family', 'XRP', 'Two sells', ['binance']],
  [12, 'demo-swing', 'HYPE', 'Breakout', ['rabby']],
  [13, 'demo-swing', 'PEPE', 'Meme', ['binance']],
  [14, 'demo-swing', 'SOL', 'Breakout', ['jupiter']],
  [15, 'demo-swing', 'TON', 'Airdrop', ['keeper']],
]

// One row per trade, in a fixed order (it gives the ids and the timestamp tie-breaks).
// daysBefore: days before `today`; null = unknown date.
const TRADES: [bag: number, side: Side, daysBefore: number | null, qty: number, total: number, note?: string][] = [
  [1, 'buy', 420, 0.2, 12_400],
  [1, 'buy', 300, 0.15, 10_500],
  [1, 'buy', 120, 0.1, 9_800],
  [2, 'buy', 360, 5, 15_500],
  [2, 'sell', 200, 1.5, 5_700],
  [2, 'sell', 30, 1, 4_200],
  [3, 'buy', null, 40, 5_600],
  [3, 'buy', 90, 20, 3_400],
  [4, 'buy', 150, 0.05, 4_600],
  [4, 'sell', 110, 0.05, 5_250],
  [5, 'buy', 250, 10_000, 3_200],
  [5, 'sell', 180, 10_000, 2_100],
  [6, 'buy', 100, 50, 900],
  [6, 'sell', 60, 60, 1_260],
  [7, 'buy', 40, 1_000, 500, 'Demo data, not a real trade'],
  [8, 'buy', 180, 0.00588, 500],
  [8, 'buy', 150, 0.00568, 500],
  [8, 'buy', 120, 0.00526, 500],
  [8, 'buy', 90, 0.0049, 500],
  [8, 'buy', 60, 0.00463, 500],
  [8, 'buy', 30, 0.00446, 500],
  [9, 'buy', 300, 2, 6_400],
  [10, 'buy', 150, 300, 114],
  [10, 'buy', 115, 300, 126],
  [10, 'buy', 80, 300, 135],
  [10, 'buy', 45, 300, 120],
  [10, 'buy', 10, 300, 108],
  [11, 'buy', 280, 1_000, 2_100],
  [11, 'sell', 200, 400, 1_040],
  [11, 'sell', 140, 600, 1_740],
  [12, 'buy', 45, 50, 1_900],
  [12, 'buy', 20, 30, 1_320],
  [13, 'buy', 75, 100_000_000, 1_234],
  [14, 'buy', 130, 15, 2_850],
  [14, 'sell', 125, 15, 2_475],
  [15, 'buy', 35, 400, 960],
  [15, 'sell', null, 200, 560],
]

const pad = (n: number, width: number) => String(n).padStart(width, '0')
const bagId = (no: number) => `demo-bag-${pad(no, 2)}`

/**
 * The demo journal with every trade placed relative to `today` (ISO date). Records made "on" `today` get
 * `today` 00:00 UTC plus their index as `updatedAt`, so anything a tester does later wins a merge (plan D11).
 */
export function demoJournal(today: string): Journal {
  const start = dayStartMs(today)
  const stamp = (i: number) => start + i

  // Unknown-date trades take the bag's first known day for their timestamps.
  const firstKnown = new Map<number, number>()
  for (const [bag, , daysBefore] of TRADES) {
    if (daysBefore !== null) firstKnown.set(bag, Math.max(firstKnown.get(bag) ?? 0, daysBefore))
  }

  const trades = TRADES.map(([bag, side, daysBefore, qty, total, note], i): Trade => {
    const at = start - (daysBefore ?? firstKnown.get(bag) ?? 0) * DAY_MS + i
    return {
      id: `demo-trade-${pad(i + 1, 3)}`,
      updatedAt: at,
      bagId: bagId(bag),
      side,
      date: daysBefore === null ? null : isoDaysBefore(today, daysBefore),
      qty,
      total,
      ...(note === undefined ? {} : { note }),
      createdAt: at,
    }
  })

  return {
    version: 1,
    accounts: ACCOUNTS.map(([id, name], i) => ({ id, name, updatedAt: stamp(i) })),
    coins: COINS.map(([symbol, name, geckoId], i): Coin => ({ id: symbol, symbol, name, geckoId, updatedAt: stamp(i) })),
    bags: BAGS.map(
      ([no, accountId, symbol, name, storageIds], i): Bag => ({
        id: bagId(no),
        updatedAt: stamp(i),
        accountId,
        symbol,
        name,
        ...(storageIds === undefined ? {} : { storageIds }),
      }),
    ),
    trades,
    storages: STORAGES.map((s, i) => ({ ...s, updatedAt: stamp(i) })),
  }
}
