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

- [ ] A bag with one tag shows its 28 px icon before the symbol and one chip; with two tags, no header icon and two
      chips; with none, "Not set" and **Add**.
- [ ] Edit → change → Save updates the bag at once; Close changes nothing. The bag's `updatedAt` changes only on Save
      with a real change (check in dev tools `localStorage['trade-journal:journal:v1']`).
- [ ] A bag tagged with a custom storage that is later deleted shows "Not set" (or only its other tags).
- [ ] Add trade, buy, new coin: the Stored at row shows; choose Binance; save → the new bag has
      `storageIds: ["binance"]`.
- [ ] Add trade into an existing bag, and every sell: no Stored at row; the bag's tags do not change.
- [ ] Switching the bag choice from "New bag…" to an existing bag hides the row and the chosen storages are not saved.
- [ ] Escape with the picker open over Add trade closes only the picker; Escape again closes Add trade.
- [ ] Every new string exists in both dictionaries.
- [ ] `npm test`, `npm run typecheck` and `npm run build` pass.

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

## Status

| Status      | Progress % | Time spent | Tokens spent |
| ----------- | ---------- | ---------- | ------------ |
| Not started | 0%         | 0h         | 0            |
