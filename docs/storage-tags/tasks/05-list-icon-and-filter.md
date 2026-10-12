# 05 — List icon, filter chips and filtered totals

> **Depends on:** 04 · **Spec refs:** [plan §3 D2, D3, D5, D6, defaults "Chip order", "Chip row position", "Summary
> caption", "One filter for all accounts", "Prefill", "Prices"; §5.1; §6.1; §8.6](../plan.md) · **Estimate:** 1 day

## Goal

On the overview, a bag with exactly one storage shows its icon before the symbol, and a row of filter chips shows only
the bags of one storage (or Mixed, or No tag). The Open / Closed counts and the summary card follow the filter. The
chosen chip is remembered on the device.

## Context to load

- [plan §5.1 and §6.1](../plan.md).
- `src/ui/JournalApp.tsx:43-57` (account, summary, prices, positions, totals) and `:124-128` (panel).
- `src/ui/portfolioView.ts`: `openPositions` (56-71), `openTotals` (73-87), `geckoIdsFor` (34-41).
- `src/domain/portfolio.ts:105-124`: `summarizeAccount`, `realized` over all bags (line 121).
- `src/ui/BagList.tsx` (whole file), `src/ui/BagRows.tsx` (`Title`, lines 5-16), `src/ui/SummaryCard.tsx`.
- The sort step from feature #4 (find it in `JournalApp` / `BagList` as shipped; see `docs/list-sorting/plan.md`).
- `src/state/useStoredString.ts`; the account preference on `JournalApp.tsx:44` for the pattern.
- `src/ui/styles.css:167-195` (`.account-tabs` scroll) and `:738-757` (`.chip-btn`).
- Task 02: `storageLookup`, `bagStorages`, `StorageIcon`. Task 04: `AddTradeSheet` prop `presetStorageIds`.

## Scope

**In:**

- `src/storage-tags/filter.ts` (pure) with the seam from plan §6: `StorageFilter`, `filterKey`, `parseFilterKey`,
  `filterChips`, `matchesFilter`. Rules:
  - A bag's *known* tags are `bagStorages(bag, lookup)`. 0 → "none", 1 → that storage, 2+ → "mixed".
  - `filterChips(open + closed of the account)`: `[]` when no bag has a known tag; else All, single storages sorted by
    name, then Mixed and No tag only if a bag is in that group.
  - The active filter is the stored one if it is in the chips, else All. The stored value is **not** overwritten by
    this fallback.
- `src/ui/StorageFilterBar.tsx`: the chip row (`role="group"`, `aria-label` "Filter by storage"; each chip a
  `button` with `aria-pressed`), 16 px icons, horizontal scroll, the selected chip scrolled into view on mount.
- `JournalApp`:
  - `useStoredString('trade-journal:ui:storage-filter')`.
  - Filter `summary.open` and `summary.closed` **before** the sort step and before `openPositions`.
  - `totals = openTotals(openPositions(filteredOpen, …))`; `realized` = sum of `realized` over filtered open + closed.
  - Prices still from `geckoIdsFor(summary.open, coins)` (unfiltered).
  - Pass `presetStorageIds` to `AddTradeSheet` when the active filter is a single storage.
- `SummaryCard`: optional `caption` prop shown under Value ("Only Binance", "Only mixed storage", "Only bags without a
  tag").
- `BagRows` `Title`: the 18 px `StorageIcon` before the symbol when exactly one known tag; visually hidden
  ", <storage name>" for screen readers.
- `BagList` empty texts when a filter hides everything: "No open bags in Binance." / "No closed bags in Binance."
- Strings in `en.ts` and `uk.ts`: "All", "Mixed", "No tag", "Filter by storage", the captions, the empty texts.
- Tests: `src/storage-tags/filter.test.ts`; a test for the filtered realized sum (pure helper, e.g.
  `realizedOf(summaries)` in `src/ui/portfolioView.ts`).
- Add the terms "Custom storage" and "Storage filter" to `docs/CONTEXT.md`.

**Out:** filter by kind (plan §11).

## Steps

1. `filter.ts` with tests.
2. `JournalApp` data flow, then `StorageFilterBar`, `SummaryCard` caption, row icon, empty texts.
3. Strings; glossary.

## Acceptance criteria

- [ ] Tests: chips for bags tagged `[binance]`, `[binance]`, `[ledger]`, `[binance, ledger]`, untagged →
      All · Binance · Ledger · Mixed · No tag. Without the mixed and untagged bags → All · Binance · Ledger. All
      untagged → `[]`.
- [ ] Tests: `[binance, <deleted custom>]` counts as Binance; `[<unknown id>]` counts as No tag.
- [ ] Tests: `parseFilterKey` maps `null`, `''`, `'storage:'`, `'garbage'` to All.
- [ ] Choosing Binance shows only Binance bags in Open and Closed; the tab counts change; Value, Open P/L and Realized
      equal the sums over those bags; the caption reads "Only Binance".
- [ ] The chip survives a reload. Switching to an account without Binance bags shows All; switching back shows Binance
      again.
- [ ] An account with no tagged bag shows no chip row, and the screen looks exactly as before this feature.
- [ ] The sort from feature #4 still works inside a filter (sort by gain % within Binance).
- [ ] Changing the chip does not start a price request (network tab).
- [ ] Add trade from a Binance-filtered list, buying a new coin: Stored at is prefilled with Binance and the new bag
      stays visible after saving.
- [ ] A bag with exactly one tag shows the 18 px icon before its symbol in both tabs; mixed and untagged bags do not.
- [ ] Every new string exists in both dictionaries.
- [ ] `npm test`, `npm run typecheck` and `npm run build` pass.

## Verification

```sh
npm test
npm run typecheck
npm run build
```

Manual (`npm run dev`, iPhone-size viewport and desktop): the acceptance items above in English and Ukrainian, light and
dark mode; the chip row scrolls sideways with many storages and the page itself does not scroll sideways.

## Hand-off log

_(Append a dated entry before you stop, even mid-task: what is done, what is next, surprises.)_

## Status

| Status      | Progress % | Time spent | Tokens spent |
| ----------- | ---------- | ---------- | ------------ |
| Not started | 0%         | 0h         | 0            |
