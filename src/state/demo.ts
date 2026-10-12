// Dev-only preview data (open the app with ?demo in `vite dev`). Every number here is made up.
import { addAccount, addTrade, type Journal, type Side } from '../domain'

export const isDemo =
  import.meta.env.DEV && typeof location !== 'undefined' && new URLSearchParams(location.search).has('demo')

type Row = [account: string, symbol: string, name: string, geckoId: string | null, bag: string, side: Side, date: string | null, qty: number, total: number]

const rows: Row[] = [
  ['demo', 'BTC', 'Bitcoin', 'bitcoin', 'Long-term', 'buy', '2026-01-10', 0.5, 25_000],
  ['demo', 'BTC', 'Bitcoin', 'bitcoin', 'Long-term', 'buy', '2026-03-02', 0.25, 15_000],
  ['demo', 'BTC', 'Bitcoin', 'bitcoin', 'Swing', 'buy', '2026-05-01', 0.1, 9_000],
  ['demo', 'BTC', 'Bitcoin', 'bitcoin', 'Swing', 'sell', '2026-06-01', 0.1, 10_000],
  ['demo', 'ETH', 'Ethereum', 'ethereum', 'Main', 'buy', '2026-02-01', 10, 20_000],
  ['demo', 'ETH', 'Ethereum', 'ethereum', 'Main', 'sell', '2026-04-01', 4, 12_000],
  ['demo', 'SOL', 'Solana', 'solana', 'Jul 26', 'buy', null, 100, 10_000],
  ['demo', 'DOGE', 'Dogecoin', 'dogecoin', 'Fun', 'buy', '2026-07-01', 10_000, 1_000],
  ['demo', 'DOGE', 'Dogecoin', 'dogecoin', 'Fun', 'sell', '2026-08-01', 10_000, 800],
  ['demo', 'FAKE', 'Fake Coin', null, 'Test bag', 'buy', '2026-09-01', 1_000, 500],
  ['test', 'ETH', 'Ethereum', 'ethereum', 'Main', 'buy', '2026-06-15', 1, 3_000],
]

export function demoJournal(): Journal {
  let journal: Journal = { version: 1, accounts: [], coins: [], bags: [], trades: [], storages: [] }
  let now = Date.UTC(2026, 0, 1)
  journal = addAccount(journal, 'Demo', now++)
  journal = addAccount(journal, 'Test', now++)
  const bagIds = new Map<string, string>()
  for (const [accountId, symbol, coinName, geckoId, bagName, side, date, qty, total] of rows) {
    const key = `${accountId}/${symbol}/${bagName}`
    const known = bagIds.get(key)
    const result = addTrade(
      journal,
      {
        accountId,
        symbol,
        coinName,
        geckoId,
        bag: known ? { bagId: known } : { newBagName: bagName },
        side,
        date,
        qty,
        total,
        note: symbol === 'FAKE' ? 'Demo data, not a real trade' : undefined,
      },
      now++,
    )
    journal = result.journal
    const bagId = journal.trades.find((t) => t.id === result.tradeId)?.bagId
    if (bagId) bagIds.set(key, bagId)
  }
  return journal
}
