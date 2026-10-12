# 04 — Bag screen tags and Stored at in Add trade

> **Depends on:** 03 · **Spec refs:** [plan §3 D1, D5, defaults "Editing tags", "Prefill"; §5.2; §5.5;
> §6 seams](../plan.md) · **Estimate:** 1 day

## Goal

The user sees and edits a bag's storages on the bag screen, sees the storage icon before the symbol when there is
exactly one, and can choose storages when a trade starts a new bag.

## Context to load

- [plan §5.2 and §5.5](../plan.md): wireframes.
- `src/ui/BagDetail.tsx` (whole file): header block at lines 52-62.
- `src/ui/JournalApp.tsx`: `BagDetail` props (149-167), `saveTrade` (79-84), `SheetState` (32-37).
- `src/ui/AddTradeSheet.tsx`: state (52-63), `submit` (100-123, bag input on line 111), `BagField` use (151-159).
- `src/ui/BagField.tsx` and `src/ui/bagChoice.ts` (`NEW_BAG`): when the trade starts a new bag. Note: with no open bag
  of the coin, `BagField` renders nothing and a buy silently starts a new bag (`BagField.tsx:20-21`).
- Task 03: `StoragePickerSheet` props. Task 02: `StorageIcon`, `storageLookup`, `bagStorages`.
- Task 01: `setBagStorages`, `NewTradeInput.bag.storageIds`.

## Scope

**In:**

- `src/ui/StorageTags.tsx`: the "Stored at" block for the bag screen — label, chips (16 px icon + name, not
  interactive), "Not set" when empty, and an **Edit** (or **Add** when empty) text button.
- `BagDetail`: the 28 px `StorageIcon` before the symbol in the `h1` when `bagStorages(...)` has exactly one entry
  (the `h1` text stays the symbol; add a visually hidden ", <storage name>" after it); the `StorageTags` block under
  the coin line; a new prop `onEditStorages()`.
- `JournalApp`: `SheetState` gets `{ kind: 'storages'; bagId: string }`; the picker opens over the bag screen; Save
  calls `apply((j, now) => setBagStorages(j, bagId, ids, now))` and closes the picker; a toast "Storage updated".
- `AddTradeSheet`:
  - A **Stored at** row (chips + **Choose…**) shown only when the trade will start a **new** bag: `side === 'buy'` and
    (`choice === NEW_BAG` or there are no bag options).
  - Its own state `storageIds: string[]`, initialised from a new optional prop `presetStorageIds` (task 05 passes the
    active single-storage filter; until then nothing is passed).
  - **Choose…** opens `StoragePickerSheet` stacked over the Add trade sheet (two sheets; the layer stack handles
    Escape and the page lock).
  - `submit` passes `storageIds` in `bag: { newBagName, storageIds }` only for a new bag.
- Strings in `en.ts` and `uk.ts`: "Stored at", "Not set", "Edit", "Add", "Choose…", "Storage updated".
- Styles for the block, chips and the header icon.

**Out:** list rows, filter chips, summary totals and passing the filter preset (task 05).

## Steps

1. `StorageTags` + `BagDetail` header icon, wired to the picker.
2. The Add trade field and the stacked picker.
3. Strings in both languages.

## Acceptance criteria

- [x] A bag with one tag shows its 28 px icon before the symbol and one chip; with two tags, no header icon and two
      chips; with none, "Not set" and **Add**.
- [x] Edit → change → Save updates the bag at once; Close changes nothing. The bag's `updatedAt` changes only on Save
      with a real change (check in dev tools `localStorage['trade-journal:journal:v1']`).
- [x] A bag tagged with a custom storage that is later deleted shows "Not set" (or only its other tags).
- [x] Add trade, buy, new coin: the Stored at row shows; choose Binance; save → the new bag has
      `storageIds: ["binance"]`.
- [x] Add trade into an existing bag, and every sell: no Stored at row; the bag's tags do not change.
- [x] Switching the bag choice from "New bag…" to an existing bag hides the row and the chosen storages are not saved.
- [x] Escape with the picker open over Add trade closes only the picker; Escape again closes Add trade.
- [x] Every new string exists in both dictionaries.
- [x] `npm test`, `npm run typecheck` and `npm run build` pass.

## Verification

```sh
npm test
npm run typecheck
npm run build
```

Manual (`npm run dev`, iPhone-size viewport): the acceptance items above in English and Ukrainian; VoiceOver (or the
browser's accessibility tree) reads the header as "BTC, Binance".

## Hand-off log

_(Append a dated entry before you stop, even mid-task: what is done, what is next, surprises.)_

- **2026-10-12** — Done, on the same parallel branch as task 03 (edits in `JournalApp.tsx` kept to a few separate
  lines; no change in `styles.css`).
  - `src/ui/StorageTags.tsx`: the "Stored at" block (label, Edit / Add with `aria-describedby` on the label, chips or
    "Not set") and `StorageChips`, which the Add trade row reuses. Styles in `src/ui/storage-tags.css`.
  - `BagDetail` gets `storages` (the result of `bagStorages`, computed in `JournalApp` with one memoised
    `storageLookup`) and `onEditStorages`. With exactly one tag the 28 px icon comes before the symbol, and a
    visually hidden ", Binance" after it: the `h1` text is "BTC, Binance" plus the status badge.
  - `JournalApp`: `SheetState` `{ kind: 'storages'; bagId }`; the picker opens over the bag screen. Save calls
    `applyBagStorages` (new in `storageHandlers.ts`) and shows "Storage updated" only when the list really changed.
  - **Surprise:** `useJournal().apply` saved even when an edit returned the same journal, and every save sets
    `lastChangeAt` (the "not backed up" dot). `apply` now returns early when the journal did not change, so a Save
    without a change writes nothing (`updatedAt` and the backup state stay as they were; checked in the browser).
  - `AddTradeSheet`: props `presetStorageIds` (optional, for task 05) and `storageEdits` (the custom-storage
    callbacks). The Stored at row shows when `side === 'buy'` and (`choice === NEW_BAG` or no bag options); its ids
    go into `bag.storageIds` only for a new bag. The picker is rendered inside the Add trade `Sheet` but **outside its
    `<form>`**: React sends events from a portal up the React tree, so a submit in the picker's own form would
    otherwise reach the Add trade form.
  - The picker's `onSave` may throw now (for example a bag removed in another tab); the error shows above Save.
  - Manual check in headless Chrome (non-demo for the `localStorage` checks, and `?demo`), 430 px and 320 px, English
    and Ukrainian, light and dark: every criterion above. Escape over the bag screen closes only the picker.
    New parking-lot item: [04-generic-entry-names](../parking-lot/04-generic-entry-names.md) (the two non-brand
    catalogue names stay English in the Ukrainian UI meanwhile).
  - Build: main JS chunk 301.1 kB → 331.5 kB (the catalogue data and the picker; now that a screen imports them),
    95 logo files emitted and listed in `dist/sw.js`.
  - Tests: 297 → 298 (`applyBagStorages`). UI behaviour is checked by hand (test environment is `node`).
  - Next: task 05 (list icon, filter chips, filtered totals; pass `presetStorageIds` from the active chip).

## Status

| Status      | Progress % | Time spent | Tokens spent |
| ----------- | ---------- | ---------- | ------------ |
| Done        | 100%       | 1.5h       | —            |
