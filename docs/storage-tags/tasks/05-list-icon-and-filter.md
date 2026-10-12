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
  - `useStoredString(deviceKey('storage-filter'))` (a raw `trade-journal:ui:` key fails `src/state/demo.test.ts`).
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

- [x] Tests: chips for bags tagged `[binance]`, `[binance]`, `[ledger]`, `[binance, ledger]`, untagged →
      All · Binance · Ledger · Mixed · No tag. Without the mixed and untagged bags → All · Binance · Ledger. All
      untagged → `[]`.
- [x] Tests: `[binance, <deleted custom>]` counts as Binance; `[<unknown id>]` counts as No tag.
- [x] Tests: `parseFilterKey` maps `null`, `''`, `'storage:'`, `'garbage'` to All.
- [x] Choosing Binance shows only Binance bags in Open and Closed; the tab counts change; Value, Open P/L and Realized
      equal the sums over those bags; the caption reads "Only Binance".
- [x] The chip survives a reload. Switching to an account without Binance bags shows All; switching back shows Binance
      again.
- [x] An account with no tagged bag shows no chip row, and the screen looks exactly as before this feature.
- [x] The sort from feature #4 still works inside a filter (sort by gain % within Binance).
- [x] Changing the chip does not start a price request (network tab).
- [x] Add trade from a Binance-filtered list, buying a new coin: Stored at is prefilled with Binance and the new bag
      stays visible after saving.
- [x] A bag with exactly one tag shows the 18 px icon before its symbol in both tabs; mixed and untagged bags do not.
- [x] Every new string exists in both dictionaries.
- [x] `npm test`, `npm run typecheck` and `npm run build` pass.

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

- **2026-10-12** — Done.
  - `src/storage-tags/filter.ts`: the seam of plan §6 plus `activeFilter(raw, chips)` (the D3 fallback as a pure,
    tested step). `filterChips` takes the UI language as a third argument and sorts names with `Intl.Collator`, like
    the picker. Plan §6 updated.
  - `JournalApp`: `useStoredString(deviceKey('storage-filter'))`, so the demo has its own key. Filter
    `summary.open` / `summary.closed` first, then `openPositions` and `sortBags`; realized is `realizedOf` over the
    filtered bags (with All it stays `summary.realized`, so an account without tags shows exactly the old numbers).
    Prices still come from the unfiltered open list. `presetStorageIds` goes to `AddTradeSheet` while a
    single-storage chip is on (also from the bag screen's Buy more, where it only matters if the user picks
    "New bag").
  - `StorageFilterBar` (`role="group"`, `aria-pressed` chips, 16 px icons). It is keyed by account, so on mount and
    on every account switch the remembered chip is scrolled into view inside the row (the page does not move). Own
    pill style `.storage-filter-chip` in `storage-tags.css` (selected = `--accent-fill`); the row runs edge to edge
    under the account tabs.
  - `SummaryCard` `caption`: one line under Value, caption on the left and "1 of 2 without price" on the right.
  - Row icon (18 px) and the visually hidden ", Binance" in `BagRows` `Title`; `BagList` gets `filter` + `lookup`
    for the icon and the filtered empty texts. The bag-screen header icon was already done in task 04.
  - Text helpers `filterChipLabel` / `filterCaption` / `filterEmptyText` in `src/ui/storageText.ts` (tested). 13
    new strings in the `storage` group of both dictionaries (Ukrainian: «Усі», «Змішані», «Без мітки», «Лише …»,
    «Немає відкритих позицій у …»).
  - Manual check in headless Chrome over CDP, dev server, `?demo` and a non-demo profile with the sample backup
    plus an extra untagged account: 390 px EN light and UK dark, 320 px UK, 1100 px desktop dark. Every criterion
    above holds. Demo account: All 4 open / 3 closed, Realized +$2,060; Binance 0 / 3, −$90 with "Only Binance" and
    "No open bags in Binance."; Mixed +$2,150; No tag $0. Sort by gain % and by name inside Binance reorders only the
    Binance bags. Chip taps start no CoinGecko request (CDP network log). Switching to Demo Family with Rabby stored
    shows All; back on Demo Swing, Rabby is selected and scrolled into view. The demo filter key and the real key
    are separate. No page scroll sideways at 320 px.
  - Tests: 331 → 349. Main JS chunk 346.1 kB → 350.6 kB.
  - Next: task 06.

## Status

| Status      | Progress % | Time spent | Tokens spent |
| ----------- | ---------- | ---------- | ------------ |
| Done        | 100%       | 1h         | —            |
