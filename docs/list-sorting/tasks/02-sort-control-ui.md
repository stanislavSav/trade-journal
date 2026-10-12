# 02 — Sort button, sort sheet and the saved choice

> **Depends on:** 01, feature 2 ([docs/i18n/plan.md](../../i18n/plan.md): `useT()`, dictionaries) ·
> **Spec refs:** [plan §3 defaults, §4, §5, §6](../plan.md) · **Estimate:** 1 day

## Goal

Each list (Open, Closed) has a small **Sort** button that shows the current choice and opens a sort sheet. The choice
is saved per list on the device and comes back after a reload, in every account. All new text is in English and
Ukrainian.

## Context to load

- [../plan.md](../plan.md) §3 (defaults), §4 (flow), §5 (wireframes and strings), §6 (seams).
- Task 01's hand-off log and `src/ui/bagSort.ts`.
- `src/state/useStoredString.ts` (guarded localStorage string).
- `src/ui/JournalApp.tsx`: `SheetState` (`:32-37`), `listTab` (`:59`), the sheets block (`:169-203`).
- `src/ui/BagList.tsx` (segmented control `:24-40`, list `:41-61`).
- `src/ui/Sheet.tsx`, `src/ui/AddAccountSheet.tsx` (small sheet example).
- `src/ui/styles.css`: `.segmented` (`:315-345`), `.text-btn`, `.card`, `.row`.
- Feature 2's i18n: `src/i18n/en.ts`, `src/i18n/uk.ts`, `useT()`. The Ukrainian word for *bag* is «позиція» and the
  texts use the polite Ви form (docs/i18n/plan.md D17, D18).

## Scope

**In:**

- `src/ui/useBagSort.ts` (new): `useBagSort()` → `{ sorts, pick(tab, key) }` over two `useStoredString` keys
  `trade-journal:ui:sort:open` and `trade-journal:ui:sort:closed`, using `parseSort` / `formatSort` / `nextSort`.
- `src/ui/SortSheet.tsx` (new): wireframe plan §5.2.
- `BagList.tsx`: the sort button row under the segmented control (wireframe plan §5.1), hidden when the shown list is
  empty.
- `JournalApp.tsx`: `sorts` from `useBagSort`; `sortBags(…, sorts.open)` / `sorts.closed` (replacing task 01's
  `DEFAULT_SORT`); `SheetState` kind `{ kind: 'sort'; tab: ListTab }`.
- Strings in both dictionaries (plan §5.3). CSS for the button row and the sheet options.

**Out:**

- Storage filter chips (feature 5; leave the left side of the button row free).
- Showing the sort value in each row ([parking lot](../parking-lot/02-show-sort-value-in-row.md)).

## Steps

1. `useBagSort`: read both keys with `useStoredString`, parse with `parseSort(raw, tab)`. `pick(tab, key)` computes
   `nextSort(sorts[tab], key)` and stores `formatSort(...)`.
2. Strings: add the plan §5.3 keys to `en.ts` and `uk.ts` (follow feature 2's key style). A helper (in `bagSort.ts` or
   next to the component) maps a `BagSort` to the short label (`"Value ↓"`, `"Gain % ↓"`, `"Name A–Z"`) and to the long
   `aria-label` (`"Sort: Value, largest first"`; latest action uses newest / oldest first).
3. `BagList`: new props `sort: BagSort` (of the shown tab) and `onSortClick()`. A row under `.segmented` with the
   button on the right: muted 13–15 px text, at least 44 px tall tap area, `aria-haspopup="dialog"`.
4. `SortSheet`: props `tab`, `sort`, `onPick(key)`, `onClose()`. Title per tab. A card with the options of
   `SORT_KEYS[tab]` (five on Open, four on Closed: no Value) in `role="radiogroup"`; each option `role="radio"`,
   `aria-checked`; the active one shows its direction text and a ✓.
   Under the card: the flip hint, the "Invested" hint for this tab, and the unknown-last hint.
   On tap: `onPick(key)` then `onClose()`.
5. `JournalApp`: `const { sorts, pick } = useBagSort()`; rows sorted with `sorts`; `onSortClick` →
   `setSheet({ kind: 'sort', tab: listTab })`; render `SortSheet` for that kind.
6. CSS in `src/ui/styles.css`, light and dark mode, using existing variables (`--muted`, `--fill`, …).
7. Manual checks below on desktop and on the iPhone.

## Acceptance criteria

- [ ] Under Open / Closed there is a small button showing the current sort ("Value ↓" on Open and "Latest action ↓"
      on Closed by default).
- [ ] The Open sort sheet lists Value, Gain %, Invested, Latest action, Name; the Closed sort sheet lists Gain %,
      Invested, Latest action, Name (no Value). The active one is marked and shows its direction.
- [ ] Tapping another option sorts by it in its first direction; tapping the active option reverses it; the sheet
      closes after each tap.
- [ ] Open and Closed keep separate choices; switching account keeps them; a reload keeps them
      (`localStorage` keys `trade-journal:ui:sort:open` / `:closed`, values like `gain:desc`).
- [ ] A garbage value in either key shows the default and does not crash.
- [ ] Rows without a price (Value, Gain %) or without any dated trade (Latest action) stay at the end in both
      directions.
- [ ] In Ukrainian, every text of the button and the sheet is Ukrainian (symbols and bag names stay as typed).
- [ ] The button has an `aria-label` with the full meaning; options are announced as radio buttons with checked state.
- [ ] The button row is hidden when the shown list is empty.
- [ ] `npm test`, `npm run typecheck`, `npm run build` pass.

## Verification

```sh
npm test && npm run typecheck && npm run build
npm run dev   # open the printed URL with ?demo
```

Manual (dev, `?demo`, account "Demo"):

1. Open list default: the same order as before this feature (by value, FAKE without a price last). Button says
   "Value ↓". Sort → Value again: smallest value first, FAKE still last.
2. Sort → Gain %: priced bags by `unrealizedPct`, FAKE (no price) last. Tap Gain % again: reversed, FAKE still last.
3. Sort → Name: BTC, ETH, FAKE, SOL. Again: Z–A.
4. Closed tab: default "Latest action ↓": DOGE then BTC Swing. The sheet has no Value. Change it; switch back to Open:
   Open kept its own choice.
5. Reload the page: both choices are still there. Switch to account "Test": the same choices apply.
6. In DevTools set `localStorage['trade-journal:ui:sort:open'] = 'nonsense'` and reload: Open shows "Value ↓". Set
   `localStorage['trade-journal:ui:sort:closed'] = 'value:desc'` and reload: Closed shows "Latest action ↓".
7. Switch the language to Ukrainian: button and sheet texts are Ukrainian.
8. iPhone (live app after deploy): the button is easy to tap, the sheet opens as a bottom sheet, the choice survives
   closing and reopening the installed app.

## Hand-off log

_(Append a dated entry before you stop, even mid-task: what is done, what is next, surprises.)_

## Status

| Status      | Progress % | Time spent | Tokens spent |
| ----------- | ---------- | ---------- | ------------ |
| Not started | 0%         | 0h         | 0            |
