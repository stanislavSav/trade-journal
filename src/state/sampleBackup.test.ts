// public/sample-backup.json is generated from the demo journal (docs/demo-data/plan.md D14, D15).
// After changing src/state/demoData.ts, move DEMO_SAMPLE_DATE forward and run `npm test -- -u`.
// In CI (process.env.CI) Vitest never writes the file, so a drifted file fails the deploy.
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { emptyJournal, mergeJournals, parseJournal } from '../domain'
import { DEMO_SAMPLE_DATE, demoJournal } from './demoData'
import { countMergedTrades } from './mergeCounts'

const SAMPLE_PATH = '../../public/sample-backup.json'
// The same shape as a real backup (src/storage/index.ts exportBackup), plus a final newline.
const text = JSON.stringify(demoJournal(DEMO_SAMPLE_DATE), null, 2) + '\n'

describe('public/sample-backup.json', () => {
  it('matches the demo journal of DEMO_SAMPLE_DATE', async () => {
    await expect(text).toMatchFileSnapshot(SAMPLE_PATH)
  })

  // Checks the file on disk on its own, so it still passes during the `-u` run that rewrites it.
  it('loads with the real backup parser, nothing dropped', () => {
    const json: unknown = JSON.parse(readFileSync(new URL(SAMPLE_PATH, import.meta.url), 'utf8'))
    expect(parseJournal(json)).toEqual(json)
  })

  it('merges into a fresh device once; loading it again adds and updates nothing', () => {
    const sample = parseJournal(JSON.parse(text))
    const fresh = emptyJournal()
    const once = mergeJournals(fresh, sample)
    expect(countMergedTrades(fresh, once)).toEqual({ added: sample.trades.length, updated: 0 })
    const twice = mergeJournals(once, sample)
    expect(countMergedTrades(once, twice)).toEqual({ added: 0, updated: 0 })
    expect(twice).toEqual(once)
    expect(twice.accounts.find((a) => a.id === 'cs')).toEqual(fresh.accounts[0])
  })

  it('never touches the default account', () => {
    expect(demoJournal(DEMO_SAMPLE_DATE).accounts.map((a) => a.id)).not.toContain('cs')
  })
})
