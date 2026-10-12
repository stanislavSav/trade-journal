# 03 — Domain messages as data (error codes, warnings, price problems)

> **Depends on:** 01 · **Spec refs:** [plan §3 D8, D9, D11, D12, D13, D16](../plan.md), [plan §8](../plan.md) ·
> **Estimate:** 1.5 days

## Goal

No English sentence that a user can see is built outside `src/ui/` and `src/i18n/`. Domain, storage and price code
return **codes and numbers**; the UI turns them into text in the active language. English behaviour stays the same.

## Context to load

- [plan §3 D12, D13, D16](../plan.md).
- `src/domain/actions.ts` — 11 `throw new Error(…)` (lines 28, 29, 37, 67-70, 75, 117, 133, 145, 159);
  `MONTHS` (line 23) and `defaultBagName` (lines 174-178); `addTrade` uses it at line 45.
- `src/domain/journal.ts:21-126` — `parseJournal` and its error templates (`fail`, `parseList`).
- `src/domain/portfolio.ts:53,68` — the oversold warning string; `src/domain/types.ts:74` — `warnings: string[]`.
- `src/storage/index.ts:48,131,148,154` — storage errors.
- `src/prices/index.ts:58-61,105-133,174` — search errors, `formatFetchedAt`, `withError`.
- `src/ui/useCoinSearch.ts:32-33` — "Offline" / "Search failed".
- `src/ui/formValues.ts` — "Not a number", "Must be more than 0", "Date is in the future", "read as …".
- `src/domain/format.ts:8,31,42` and `src/ui/numbers.ts:49` — the hard-coded `'en-US'`.
- Tests that assert English text: `src/domain/actions.test.ts`, `src/domain/journal.test.ts`,
  `src/domain/portfolio.test.ts:103,126`, `src/storage/index.test.ts`, `src/prices/index.test.ts:139-173,234-236`.

## Scope

**In:**

- `src/domain/errors.ts`:
  - `export type ErrorCode = 'symbolRequired' | 'accountNotFound' | 'bagOtherOwner' | 'sideInvalid' | 'dateInvalid'
    | 'qtyInvalid' | 'totalInvalid' | 'bagNotFound' | 'tradeNotFound' | 'bagNameRequired' | 'accountNameRequired'
    | 'backupNotJournal' | 'backupVersion' | 'backupDamaged' | 'storageFull' | 'shareFailed' | 'fileUnreadable'
    | 'fileNotJson' | 'searchOffline' | 'searchRateLimited' | 'searchHttp'` (adjust names if you find a better fit;
    keep one code per user-visible meaning).
  - `export class AppError extends Error { code; params }` — `message` is the **same English text as today**.
  - `export function isAppError(e: unknown): e is AppError`.
  - Export from `src/domain/index.ts`.
- Replace every `throw new Error(…)` in `actions.ts`, `journal.ts` and `storage/index.ts` with `AppError`. For
  `parseJournal`: "Not a trade journal backup…" → `backupNotJournal`; "Unsupported backup version" → `backupVersion`
  with `{ version }`; every `"<where>: <problem>"` → `backupDamaged` with `{ detail: '<where>: <problem>' }` (D13).
- `BagWarning` in `types.ts`: `{ kind: 'oversold'; qty: number; date: string | null }`. `BagSummary.warnings:
  BagWarning[]`. `portfolio.ts` pushes data. Update `src/ui/BagDetail.tsx:90-99` to render a temporary English
  sentence (task 04 translates it) and keep `src/ui/BagRows.tsx:9` (`warnings.length`) working.
- `PriceProblem` in `src/prices/index.ts`: `{ kind: 'offline' | 'rateLimited' | 'http' | 'badResponse' | 'failed';
  status?: number }`. `PriceSnapshot.error: PriceProblem | null`. Remove `formatFetchedAt`; the UI composes
  "Rate limited — showing prices from 14:02" from `error` + `fetchedAt` using `formatStamp` (`src/ui/time.ts:17`), so
  no device-locale month names remain (D9). Update `SummaryCard.tsx:54` to show a temporary English text.
- `searchCoins` throws `AppError` (`searchOffline`, `searchRateLimited`, `searchHttp` with `{ status }`).
  `useCoinSearch` keeps `error: ErrorCode | null` (or the `AppError`) instead of a string.
- `formValues.ts`: `Amount.error` becomes a code (`'notNumber' | 'notPositive'`), `dateError` returns
  `'future' | null`, `readAsHint` returns the formatted number (or null) and the UI adds the words.
- `defaultBagName(date, months = EN_MONTHS, newName = 'New')`. Export `EN_MONTHS`. `addTrade` keeps calling it with the
  defaults, so the domain stays English-only; the UI passes the resolved name (task 04).
- `format.ts` / `numbers.ts`: move `'en-US'` into one exported constant `NUMBER_LOCALE` (D8). No output change.
- `src/i18n/errorText.ts`: `errorText(t: Messages, err: unknown): { text: string; detail?: string }`. Add the
  `errors.*` keys to `en.ts` and `uk.ts` (English = today's texts; Ukrainian per glossary). Unit test it.
- Update the tests listed above. Most `toThrow('…')` tests stay as they are (the message did not change); add one test
  per file that checks the `code`.

**Out:** replacing the UI's `err.message` with `errorText` everywhere and translating screens (task 04).

## Steps

1. Add `errors.ts` and its test (`AppError` keeps `message`, `name`, `code`, `params`; `instanceof Error` is true).
2. Convert `actions.ts`, then `journal.ts`, then `storage/index.ts`. Run `npm test` after each.
3. Change `warnings` to `BagWarning[]`; fix `portfolio.test.ts:103,126` to assert data
   (`{ kind: 'oversold', qty: 0.5, date: '2026-07-21' }`).
4. Change `PriceSnapshot.error`; fix `prices/index.test.ts` to assert `{ kind: 'rateLimited' }` etc.
5. Change `formValues.ts` return values; update the two callers (`AddTradeSheet.tsx`, `EditTradeSheet.tsx`) so the
   screen still shows the same English text.
6. Add `errorText` and the `errors.*` catalog entries in both languages.
7. Run the app in English and compare with `main`: every message must read exactly as before (except the price-error
   time, which is now `formatStamp` style).

## Acceptance criteria

- [ ] `grep -rn "new Error(" src/domain src/storage src/prices` finds no user-visible message (only `AppError`).
- [ ] `grep -rn "toLocaleString(undefined\|toLocaleTimeString(undefined" src` finds nothing.
- [ ] `BagSummary.warnings` is `BagWarning[]`; the bag screen still lists the warning in English.
- [ ] `PriceSnapshot.error` is `PriceProblem | null`; the summary card still shows the problem and the time of the last
      prices.
- [ ] `defaultBagName('2026-06-03')` is still `Jun 26`; `defaultBagName('2026-06-03', UK_MONTHS)` uses the given list.
- [ ] `errorText` test: an `AppError('qtyInvalid')` gives the catalog text in each language; `backupDamaged` gives a
      headline plus `detail`; a plain `Error('x')` gives the generic headline with detail `x`.
- [ ] All existing tests pass (updated where the type changed).

## Verification

```sh
npm test
npm run typecheck
npm run build
```

Manual (English): load a broken JSON file in Backup → "Load backup" (e.g. `{"version":1}`) and a file with a negative
`qty`; switch the network off and press refresh prices; type an unknown coin with the network off. Each message reads as
on `main`.

## Hand-off log

_(Append a dated entry before you stop, even mid-task: what is done, what is next, surprises.)_

## Status

| Status      | Progress % | Time spent | Tokens spent |
| ----------- | ---------- | ---------- | ------------ |
| Not started | 0%         | 0h         | 0            |
