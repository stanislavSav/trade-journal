# 01 — Rich, deterministic demo journal

> **Depends on:** — (features 1–5 shipped) · **Spec refs:** [plan §3 D10–D13, D19, §6.2](../plan.md) ·
> **Estimate:** 1 day

## Goal

`demoJournal(today)` returns the same journal every time for the same `today`, shows every case the UI can show
(§6.2), uses storage tags, and never contains a trade after `today`.

## Context to load

- [plan §6.2](../plan.md) — the content table (the contract; adjust storage ids to the real catalogue).
- `src/state/demo.ts` — today's dev-only data (lines 7-53) and `isDemo` (lines 4-5).
- `src/domain/types.ts` — `Journal`, `Bag` (with `storageIds?` from feature 5), `Trade`, the custom storage type.
- `docs/storage-tags/plan.md` §6 — predefined catalogue ids, custom storage shape, kinds `cex · dex · hot · cold ·
  other`.
- `src/domain/journal.ts` — `parseJournal` (the result must pass it), `accountIdFor`.
- `src/domain/portfolio.ts` — `summarizeAccount`, to check open / closed / warnings in tests.
- `src/domain/format.ts` — `todayIso`.

## Scope

**In:**

- `src/state/demoData.ts`:
  - `export const DEMO_SAMPLE_DATE = '2026-10-01'`.
  - `export function demoJournal(today: string): Journal` — pure; no `Date.now()`, no `crypto.randomUUID()`.
  - Rows as data (one row per trade: bag key, side, days-before-today or `null`, qty, total, optional note), plus a bag
    table (id, account, symbol, name, storage ids) and the coins (symbol, name, geckoId).
  - Fixed ids (`demo`, `demo-family`, `demo-swing`, `demo-bag-01`…`15`, `demo-trade-001`…,
    `custom-demo-family-safe`; plan §6.2 note).
  - `createdAt` / `updatedAt` from the reference date: e.g. `Date.UTC(<today>) - 86_400_000 * daysBefore + rowIndex`
    for trades, and the reference date at 00:00 UTC + index for accounts, coins, bags, storages. Unknown-date trades
    use the bag's first known date for their timestamps.
  - A small pure helper `isoDaysBefore(iso, n)` that works in UTC (no DST bugs).
- `src/state/demo.ts`: keep `isDemo` (task 02 changes it); `useJournal` calls `demoJournal(todayIso())`. Remove the old
  rows.
- `src/state/demoData.test.ts`.

**Out:** production demo mode, banner, prefixes (task 02); the sample file (task 03).

## Steps

1. Write the test first:
   - `demoJournal(DEMO_SAMPLE_DATE)` deep-equals a second call (determinism).
   - `parseJournal(JSON.parse(JSON.stringify(j)))` deep-equals `j`.
   - 3 accounts, 15 bags; per account, `summarizeAccount` gives the open / closed split of §6.2 (10 open, 5 closed in
     total).
   - At least one bag with a warning; one coin with `geckoId: null`; at least one trade with `date: null`; a bag with
     ≥ 2 sells while still open (partial sells); a bag with exactly one storage tag, one with two, one with none, and
     one with the custom storage.
   - No trade date is after `today`, for `today` = `DEMO_SAMPLE_DATE` and for `today` = `'2027-03-01'`.
   - With `today` moved by 10 days, every known trade date moves by 10 days (relative dates).
   - No account id is `cs`; every account name starts with `Demo`.
   - Every id is unique within its collection.
2. Write `demoData.ts` from the §6.2 table. Pick numbers that look real (buy prices near each coin's typical price
   over the last year). Check every geckoId once with the app's coin search in `npm run dev`.
3. Wire `useJournal` to `demoJournal(todayIso())`.
4. Open `npm run dev` → `/?demo` and click through all three accounts.

## Acceptance criteria

- [x] All tests in step 1 pass (`src/state/demoData.test.ts`, 12 tests).
- [x] `src/state/demoData.ts` has no call to `Date.now`, `new Date()` without an argument, `Math.random` or
      `crypto.randomUUID` (a test reads the source and checks it).
- [x] In `npm run dev` with `?demo`: the three accounts show; Open and Closed tabs both have bags; the LINK bag shows
      the warning; FAKE shows "no live price". Storage chips: **not checked**, because the storage-tags UI (feature 5
      tasks 02–05) is not on `main` yet. The data has single tags, two tags (Mixed), `[]`, no field, and the custom
      storage; check the chips when the storage UI lands.
- [x] The plan §6.2 table matches the code (plan updated: real catalogue ids and the `custom-` id prefix).

## Verification

```sh
npm test
npm run typecheck
npm run build
```

Manual: `npm run dev`, open `http://localhost:5173/trade-journal/?demo`, check every account, a closed bag, the
oversold bag, the storage filter chips and the sort options in both languages.

## Hand-off log

_(Append a dated entry before you stop, even mid-task: what is done, what is next, surprises.)_

- **2026-10-12** — Done. `src/state/demoData.ts` builds the journal from three tables (accounts, bags, trade rows)
  with fixed ids and timestamps; `useJournal` calls `demoJournal(todayIso())`; the old rows in `src/state/demo.ts`
  are gone (it keeps only `isDemo`, still dev-only until task 02). Surprises: (1) the storage-tags domain requires
  custom ids to start with `custom-`, so the custom storage is `custom-demo-family-safe` (plan updated). (2) The
  storage-tags UI is still being built in parallel, so the storage chips could not be checked in the browser.
  (3) Live prices (October 2026) are lower than the first ADA and TON buy prices I picked; I lowered those so the
  demo does not show three −60 % bags. Every gecko id returned a live price in `npm run dev` (only FAKE has none).
  Next: task 02.

## Status

| Status      | Progress % | Time spent | Tokens spent |
| ----------- | ---------- | ---------- | ------------ |
| Done        | 100%       | 1h         | —            |
