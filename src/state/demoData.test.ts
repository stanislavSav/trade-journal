import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { parseJournal, summarizeAccount, summarizeBag, type Journal } from '../domain'
import { CATALOGUE } from '../storage-tags/catalogue'
import { DEMO_SAMPLE_DATE, demoJournal, isoDaysBefore } from './demoData'

const j = demoJournal(DEMO_SAMPLE_DATE)

function knownDates(journal: Journal): string[] {
  return journal.trades.flatMap((t) => (t.date === null ? [] : [t.date]))
}

describe('isoDaysBefore', () => {
  it('counts calendar days in UTC, across months, years and DST changes', () => {
    expect(isoDaysBefore('2026-10-01', 0)).toBe('2026-10-01')
    expect(isoDaysBefore('2026-10-01', 1)).toBe('2026-09-30')
    expect(isoDaysBefore('2026-03-30', 1)).toBe('2026-03-29')
    expect(isoDaysBefore('2026-11-02', 7)).toBe('2026-10-26')
    expect(isoDaysBefore('2026-01-01', 1)).toBe('2025-12-31')
    expect(isoDaysBefore('2024-03-01', 1)).toBe('2024-02-29')
  })
})

describe('demoJournal', () => {
  it('is the same for the same day', () => {
    expect(demoJournal(DEMO_SAMPLE_DATE)).toEqual(j)
  })

  it('survives a backup round trip through parseJournal', () => {
    expect(parseJournal(JSON.parse(JSON.stringify(j)))).toEqual(j)
  })

  it('has 3 Demo accounts and 15 bags, 10 open and 5 closed (plan §6.2)', () => {
    expect(j.accounts.map((a) => a.id)).toEqual(['demo', 'demo-family', 'demo-swing'])
    expect(j.bags).toHaveLength(15)
    const split = j.accounts.map((a) => {
      const s = summarizeAccount(j, a.id)
      return [a.id, s.open.length, s.closed.length]
    })
    expect(split).toEqual([
      ['demo', 4, 3],
      ['demo-family', 3, 1],
      ['demo-swing', 3, 1],
    ])
    const closed = j.accounts.flatMap((a) => summarizeAccount(j, a.id).closed.map((s) => s.bag.id)).sort()
    expect(closed).toEqual(['demo-bag-04', 'demo-bag-05', 'demo-bag-06', 'demo-bag-11', 'demo-bag-14'])
  })

  it('never uses the default account and names every account Demo…', () => {
    for (const a of j.accounts) {
      expect(a.id).not.toBe('cs')
      expect(a.name.startsWith('Demo')).toBe(true)
    }
  })

  it('shows every case the UI can show', () => {
    const summaries = j.bags.map((b) => summarizeBag(b, j.trades))
    const byId = new Map(summaries.map((s) => [s.bag.id, s]))
    // oversold warning on LINK
    expect(byId.get('demo-bag-06')?.warnings).toEqual([{ kind: 'oversold', qty: 10, date: expect.any(String) }])
    expect(summaries.filter((s) => s.warnings.length > 0)).toHaveLength(1)
    // a coin without a live price, with the one note
    expect(j.coins.filter((c) => c.geckoId === null).map((c) => c.symbol)).toEqual(['FAKE'])
    expect(j.trades.filter((t) => t.note !== undefined).map((t) => t.note)).toEqual(['Demo data, not a real trade'])
    // unknown dates
    expect(j.trades.filter((t) => t.date === null).length).toBeGreaterThanOrEqual(1)
    // partial sells while still open
    const partial = summaries.filter((s) => s.status === 'open' && s.trades.filter((t) => t.side === 'sell').length >= 2)
    expect(partial.map((s) => s.bag.id)).toContain('demo-bag-02')
    // storage tags: one, two, none, custom
    const tagCounts = j.bags.map((b) => b.storageIds?.length ?? 0)
    expect(tagCounts).toContain(1)
    expect(tagCounts).toContain(2)
    expect(tagCounts).toContain(0)
    expect(j.storages.map((s) => s.id)).toEqual(['custom-demo-family-safe'])
    expect(j.bags.some((b) => b.storageIds?.includes('custom-demo-family-safe'))).toBe(true)
  })

  it('uses only storage ids that exist (catalogue or the custom one)', () => {
    const known = new Set([...CATALOGUE.map((s) => s.id), ...j.storages.map((s) => s.id)])
    for (const b of j.bags) for (const id of b.storageIds ?? []) expect(known.has(id), id).toBe(true)
  })

  it('never has a trade after today', () => {
    for (const today of [DEMO_SAMPLE_DATE, '2027-03-01', '2026-01-01']) {
      for (const d of knownDates(demoJournal(today))) expect(d <= today).toBe(true)
    }
  })

  it('moves every known date with today', () => {
    const later = demoJournal(isoDaysBefore(DEMO_SAMPLE_DATE, -10))
    expect(knownDates(later)).toEqual(knownDates(j).map((d) => isoDaysBefore(d, -10)))
  })

  it('keeps every timestamp at or before the end of today', () => {
    const endOfDay = Date.parse(`${DEMO_SAMPLE_DATE}T00:00:00Z`) + 86_400_000
    for (const list of [j.accounts, j.coins, j.bags, j.trades, j.storages]) {
      for (const r of list) expect(r.updatedAt).toBeLessThan(endOfDay)
    }
  })

  it('has unique ids in every collection and links every trade to a bag and every bag to an account and coin', () => {
    for (const list of [j.accounts, j.coins, j.bags, j.trades, j.storages]) {
      expect(new Set(list.map((r) => r.id)).size).toBe(list.length)
    }
    const accounts = new Set(j.accounts.map((a) => a.id))
    const coins = new Set(j.coins.map((c) => c.id))
    const bags = new Set(j.bags.map((b) => b.id))
    for (const b of j.bags) {
      expect(accounts.has(b.accountId)).toBe(true)
      expect(coins.has(b.symbol)).toBe(true)
    }
    for (const t of j.trades) expect(bags.has(t.bagId)).toBe(true)
  })

  it('stays pure: no clock, no random ids', () => {
    const source = readFileSync(new URL('./demoData.ts', import.meta.url), 'utf8')
    expect(source).not.toMatch(/Date\.now|new Date\(\)|Math\.random|randomUUID/)
  })
})
