# 01 — Domain model, parse and merge

> **Depends on:** — (features #2 and #4 shipped) · **Spec refs:** [plan §3 D1, defaults "Data model", "Backup
> format", "No tags is written as an empty list", "Unknown ids", "Kinds", "Maximum 10 tags"; §6 seams; §6.2; §6.3;
> §8.1–8.4, 8.7; §9 rows 1–3](../plan.md) · **Estimate:** 1 day

## Goal

The journal can store storage tags on bags and custom storages, load every old backup unchanged, and merge so that tags
survive an old app version on another device. No UI yet.

## Context to load

- `src/domain/types.ts` (whole file, 91 lines): `Synced`, `Bag` (lines 33-37), `Journal` (lines 51-57).
- `src/domain/journal.ts` (whole file): `emptyJournal` (13-15), `parseJournal` (21-53), `fields` (64-110), `parseList`
  (114-126; line 116 throws on a missing list), `mergeJournals` (133-141), `mergeById` (143-150).
- `src/domain/actions.ts`: `NewTradeInput` (7-19), `addTrade` new-bag branch (40-50), `checkTradeValues` (65-71),
  `putById` (90-93), `renameBag` (131-136), `newId` (180-182).
- `src/domain/journal.test.ts` and `src/domain/actions.test.ts` for the test style (`bagOf`, `tradeOf` helpers).
- `src/state/useJournal.ts:76-85`: the local journal is `a` in `mergeJournals(a, b)`.
- `src/storage/index.ts:33-43`: a stored journal that fails to parse becomes an empty journal.
- [plan §6.3](../plan.md) for the exact parse and merge rules.

## Scope

**In:**

- `src/domain/types.ts`:
  - `export type StorageKind = 'cex' | 'dex' | 'hot' | 'cold' | 'other'` and `export const STORAGE_KINDS`.
  - `Bag.storageIds?: string[]` with the doc comment from plan §6 ("Absent = never set …; [] = no tags").
  - `CustomStorage extends Synced { name; kind; colour }`.
  - `Journal.storages: CustomStorage[]` (required in the type).
- `src/domain/storages.ts` (new, exported from `src/domain/index.ts`):
  - `MAX_STORAGE_TAGS = 10`, `CUSTOM_NAME_MAX = 30`, `CUSTOM_ID_PREFIX = 'custom-'`.
  - `CUSTOM_COLOURS`: 8 hex colours. Each must have a contrast ratio ≥ 4.5 with white text (start from
    `#0a64d8 #1a7f37 #c9262e #a55800 #7b3fe4 #0e7c86 #b8336a #5b5b60` and adjust if the test fails).
  - `normaliseStorageIds(ids: unknown): string[]` — the shared rule used by parse and actions: an array of non-empty
    strings, duplicates removed, order kept, at most `MAX_STORAGE_TAGS`; throws otherwise.
  - `contrastRatio(hexA, hexB)` helper (used here in tests, and by task 02 for glyph colour).
- `src/domain/journal.ts`:
  - `emptyJournal()` returns `storages: []`.
  - `parseJournal`: `storageIds` per plan §6.3; `storages` through a new optional list reader (missing → `[]`).
    The four old collections stay required (the test "rejects a backup with a missing collection" stays green).
  - `mergeJournals`: `storages` merged by id; for bags, the carry-over rule ("winner without `storageIds` takes the
    other copy's field"). Keep `mergeById` generic; add a small bag-specific post step.
- `src/domain/actions.ts`:
  - `NewTradeInput.bag` becomes `{ bagId: string } | { newBagName?: string; storageIds?: string[] }`. A new bag gets
    `storageIds` only when the list is non-empty (a new bag with no choice stays without the field).
  - `setBagStorages(journal, bagId, ids, now)`: live bag only; writes the normalised list, **`[]` included**; bumps
    `updatedAt`. No-op (returns the same journal) when the list is unchanged.
  - `addCustomStorage(journal, { name, kind, colour }, now)` → `{ journal, id }`. Name trimmed, 1–30 characters, must
    not equal (case-insensitive, trimmed) the name of another **live** custom storage. Id `custom-${newId()}`.
  - `updateCustomStorage(journal, id, patch, now)` with the same checks; live record only.
  - `deleteCustomStorage(journal, id, now)`: tombstone. Bags are not changed.
  - Each action validates exactly what the parser accepts.
- Fix the `Journal` literals that stop compiling: `src/state/demo.ts:24`, `src/storage/index.test.ts:4` and `:44`,
  `src/domain/journal.test.ts:6` and `:112`, `src/domain/portfolio.test.ts:174`.
- Tests (see acceptance criteria).

**Out:** the catalogue and logos (task 02); checking that an id exists in the catalogue (the domain does not know the
catalogue; the UI only offers known ids); duplicate checks against **predefined** names (task 03 does that in the UI);
any UI.

## Steps

1. Write the failing tests first for parse (old backup, new fields, bad values) and merge (carry-over in both orders).
2. Types, then `storages.ts`, then parse, then merge, then actions.
3. Fix the literals the compiler reports.
4. Run the three verification commands.

## Acceptance criteria

- [ ] An old backup (no `storageIds`, no `storages`) parses to the same journal as before, plus `storages: []`. Test
      uses a literal copy of today's backup shape.
- [ ] `parseJournal(JSON.parse(JSON.stringify(j)))` equals `j` for a journal with tagged bags, a bag with
      `storageIds: []`, live and tombstoned custom storages.
- [ ] Parse rejects with a readable message: `storageIds` not an array, an empty-string id, more than 10 ids, a custom
      storage with a bad `kind`, a bad `colour`, a duplicate custom id. Duplicate tag ids are removed, not rejected.
- [ ] `bags` missing still throws `Not a trade journal backup: bags missing`; `storages` missing does not throw.
- [ ] Merge: a newer bag copy **without** `storageIds` takes the older copy's `storageIds` — tested with the newer copy
      as `a` and as `b`. A newer copy with `storageIds: []` wins over an older `['binance']`.
- [ ] Merge: custom storages merge by id and `updatedAt`; a newer tombstone wins.
- [ ] `setBagStorages` writes `[]` explicitly, bumps `updatedAt`, rejects a deleted bag, and returns the same object
      when nothing changed.
- [ ] `addTrade` with a new bag and `storageIds: ['binance', 'binance', 'ledger']` stores `['binance', 'ledger']`;
      with no `storageIds` the bag has no field.
- [ ] `renameBag` and `deleteTrade` keep `storageIds` (test).
- [ ] Custom storage actions: empty name, 31-character name, duplicate live name (any case), unknown kind and a colour
      outside `CUSTOM_COLOURS` throw; renaming to the same name with other casing of **itself** is allowed; a name of
      a tombstoned storage can be reused.
- [ ] Every `CUSTOM_COLOURS` entry has contrast ≥ 4.5 against `#ffffff` (test).
- [ ] `npm test`, `npm run typecheck` and `npm run build` pass.

## Verification

```sh
npm test
npm run typecheck
npm run build
```

Manual: start `npm run dev`, load an existing `trades.json` (Backup → Load). The toast shows the usual counts and
nothing in the UI changes.

## Hand-off log

_(Append a dated entry before you stop, even mid-task: what is done, what is next, surprises.)_

## Status

| Status      | Progress % | Time spent | Tokens spent |
| ----------- | ---------- | ---------- | ------------ |
| Not started | 0%         | 0h         | 0            |
