# 01 — `removeAccount` and `countAccountData` in the domain

> **Depends on:** — · **Spec refs:** [plan §3 D1 D7 D8 and defaults, §6.1, §6.3](../plan.md) · **Estimate:** 0.5 day

## Goal

One pure function removes an account with all its bags and trades as tombstones, so the removal survives every merge;
a second one tells the UI how much will be deleted. Both are covered by tests, including the merge edge cases.

## Context to load

- [../plan.md](../plan.md) §3, §6.1 (signatures), §6.3 (edge cases E1–E8).
- `src/domain/types.ts` (`Synced`, `Account`, `Bag`, `Trade`, `Journal`).
- `src/domain/actions.ts`: `putById` (`:89-93`), `deleteTrade` (`:121-129`, tombstone shape), `addAccount`
  (`:156-163`, revives a tombstoned id).
- `src/domain/journal.ts`: `mergeJournals` (`:133-150`), `emptyJournal` (`:13-15`).
- `src/domain/portfolio.ts`: `summarizeAccount` (`:105-124`, ignores deleted bags).
- `src/domain/actions.test.ts`: test style (`NOW = 1_780_000_000_000`, `emptyJournal()` as a start).

## Scope

**In:**

- `countAccountData(journal, accountId): { bags: number; trades: number }` in `src/domain/actions.ts`.
- `removeAccount(journal, accountId, now): Journal` in `src/domain/actions.ts`.
- Tests in `src/domain/actions.test.ts` (or a new `src/domain/removeAccount.test.ts` if the file gets long).

**Out:**

- Any UI, strings, Settings (task 02).
- Orphan clean-up after merges ([parking lot](../parking-lot/01-orphans-after-merge.md)).

## Steps

1. `countAccountData`:
   - `bagIds` = ids of **all** bags with `accountId` (live or deleted).
   - `bags` = number of live bags with `accountId`.
   - `trades` = number of live trades with `bagId` in `bagIds`.
   - Unknown account → `{ bags: 0, trades: 0 }` (no throw: the UI may render while a merge removes it).
2. `removeAccount`:
   - Find the live account with `id === accountId`; else `throw new Error('Account not found')`.
   - Account → `{ ...account, deleted: true, updatedAt: now }` via `putById`.
   - Every **live** bag with `accountId` → tombstone with `updatedAt: now`.
   - Every **live** trade with `bagId` in `bagIds` (from step 1, so trades of already-deleted bags too) → tombstone.
   - Already-deleted records: unchanged (same object, same `updatedAt`).
   - `coins` unchanged (same array).
   - Do not mutate the input.
3. Add JSDoc comments (plain English, one or two lines) like the rest of `actions.ts`.
4. Tests (each one a small `it`):
   1. Removes the account, its bags and their trades: all `deleted: true`, `updatedAt: NOW`.
   2. Other accounts' bags and trades and all coins are untouched (`toBe` the same objects / `toEqual` before).
   3. Already-deleted bag/trade keep their old `updatedAt`.
   4. A live trade whose bag is already deleted (an orphan) is tombstoned too.
   5. Throws `Account not found` for an unknown id and for an already-removed account.
   6. Does not mutate the input (`structuredClone` before, `toEqual` after).
   7. After removal: `summarizeAccount(j, id)` has no open and no closed bags, and `countAccountData` is `{0, 0}`.
   8. `countAccountData` counts live bags and trades of the account only.
   9. Merge E1/E6: `mergeJournals(removed, old)` and `mergeJournals(old, removed)` both keep the account removed and all
      its bags and trades deleted.
   10. Merge E2 (documents today's behaviour): `old` gets a new trade in an existing bag of the account (with
       `addTrade` at `NOW - 1`); after the merge the trade is live but its bag and account are deleted, and
       `summarizeAccount` does not show it.
   11. Re-add E5: `addAccount(removed, 'Family', NOW + 1)` revives the id with no live bags.
   12. Removing the last account leaves `accounts.every((a) => a.deleted)` true.

## Acceptance criteria

- [x] `removeAccount` and `countAccountData` are exported from `src/domain` (through `src/domain/index.ts`).
- [x] All tests of step 4 exist and pass.
- [x] `removeAccount` changes no record that was already deleted and never touches `coins`.
- [x] One call gives every tombstone the same `updatedAt` (`now`).
- [x] `npm test`, `npm run typecheck`, `npm run build` pass.

## Verification

```sh
npm test -- src/domain
npm test && npm run typecheck && npm run build
```

No manual check: there is no UI yet.

## Hand-off log

_(Append a dated entry before you stop, even mid-task: what is done, what is next, surprises.)_

- **2026-10-12** — Done. `countAccountData` and `removeAccount` are appended at the end of `src/domain/actions.ts`
  (with a private helper `accountBagIds`), so they are exported through `src/domain/index.ts`. The 12 tests of step 4
  are in a new file `src/domain/removeAccount.test.ts` (13 `it`s: test 8 is split into "counts" and "unknown account
  gives zeros"), so `actions.test.ts` stays as it is. The sample journal is built by hand (fixed ids, one orphan trade,
  one already-deleted bag and trade) so every case is deterministic.
  - **Error message:** `removeAccount` throws `new Error('Account not found')`, as this task says. This branch was built
    before feature 2 (i18n) moved domain errors to error codes. **Convert to AppError code when merging with i18n**
    (use the same code as `addTrade`'s "Account not found"), and update the `toThrow` checks in
    `removeAccount.test.ts`.
  - No surprises. Next: task 02 (needs feature 2 shipped: Settings sheet, `useT()`).

## Status

| Status      | Progress % | Time spent | Tokens spent |
| ----------- | ---------- | ---------- | ------------ |
| Done        | 100%       | 0.5h       | —            |
