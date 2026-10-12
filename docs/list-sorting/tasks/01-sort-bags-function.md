# 01 — `sortBags` and the sort helpers

> **Depends on:** — · **Spec refs:** [plan §3 D1–D12 and defaults, §6.1](../plan.md) · **Estimate:** 0.5 day

## Goal

One pure function orders the rows of the Open or Closed list by value (Open only), gain %, invested, latest action or
name, with unknown values always last and a stable tie order. Small helpers read, write and toggle the saved choice. All of it is tested,
and the list keeps today's look until task 02 adds the control.

## Context to load

- [../plan.md](../plan.md) §3 (D1–D12, defaults, why not `createdAt`) and §6.1 (signatures, value table).
- `src/domain/types.ts:62-83` (`BagSummary`, `PositionValue`).
- `src/domain/portfolio.ts`: `summarizeBag` (`:43-102`: `cost`, `invested`, `realized`, `lastDate`),
  `summarizeAccount` (`:105-124`), `byLastDateDesc` (`:134-139`), `valuePosition` (`:142-149`).
- `src/ui/portfolioView.ts:12-16` (`OpenPosition`), `:55-71` (`openPositions`, today's open order).
- `src/ui/BagList.tsx:6` (`ListTab`).
- `src/domain/portfolio.test.ts` for how summaries are built in tests.

## Scope

**In:**

- `src/ui/bagSort.ts` (new): `SortKey`, `SortDir`, `BagSort`, `SortableRow`, `SORT_KEYS`, `DEFAULT_SORT`, `FIRST_DIR`,
  `sortBags`, `parseSort`, `formatSort`, `nextSort` (plan §6.1).
- `src/ui/bagSort.test.ts` (new).
- `src/ui/portfolioView.ts`: remove the `.sort(...)` in `openPositions` and fix its doc comment.
- `src/ui/JournalApp.tsx`: apply `sortBags` with `DEFAULT_SORT` for both lists, so the screen order is defined by
  `sortBags` from now on (no control yet).

**Out:**

- The sort button, sort sheet, saving to `localStorage`, strings (task 02).
- Changing `summarizeAccount` (its order is used by `openBagsFor`).

## Steps

1. Write `bagSort.ts`:
   - A `valueOf(row, key)` helper returning `number | string | null` per the plan's value table. Open vs closed comes
     from `row.summary.status`.
   - Name compare: `Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })`, symbol first, then bag name.
     Create the collator once at module level.
   - `sortBags`: copy the array; compare by (1) unknown last, (2) main value in `sort.dir`, (3) name A–Z, (4) `bag.id`.
     For the `name` key, step 2 is the name compare in `sort.dir`, then `bag.id`. For the `value` key, the unknown
     (unpriced) rows are ordered among themselves by `summary.cost` largest first, then name, then `bag.id` (plan D10),
     in both directions.
   - `SORT_KEYS`: `open: ['value', 'gain', 'invested', 'latest', 'name']`, `closed: ['gain', 'invested', 'latest',
     'name']`. `DEFAULT_SORT`: `open: { key: 'value', dir: 'desc' }`, `closed: { key: 'latest', dir: 'desc' }`.
   - `parseSort(raw, tab)`: accept only `"<key>:<dir>"` with a known dir and a key from `SORT_KEYS[tab]`; anything
     else → `DEFAULT_SORT[tab]`.
   - `nextSort(current, key)`: same key → flip `dir`; other key → `{ key, dir: FIRST_DIR[key] }`.
2. `openPositions`: drop the sort; keep building `{ summary, coin, pos }`.
3. `JournalApp`: `openRows = useMemo(() => sortBags(positions, DEFAULT_SORT.open), …)`,
   `closedRows = useMemo(() => sortBags(summary.closed.map((s) => ({ summary: s })), DEFAULT_SORT.closed), …)`.
   `BagList` gets the closed rows as `{ summary }[]` and passes `row.summary` to `ClosedRow`. `openTotals` still gets
   `positions` (order does not matter there).
4. Tests (`bagSort.test.ts`), with small hand-made summaries:
   1. Value ↓ on open rows: largest `pos.value` first; rows without a price last, ordered among themselves by `cost`
      largest first; with Value ↑ the priced rows are smallest first and the unpriced rows are still last (still by
      `cost` ↓).
   2. Gain ↓ on open rows: highest `unrealizedPct` first; rows without a price last; also last with Gain ↑.
   3. Gain on closed rows: `realized / invested`; a closed row with `invested === 0` is last.
   4. Invested ↓ open uses `cost`; closed uses `invested` (a closed bag with big buys but `cost` 0 sorts by buys).
   5. Latest ↓: newest `lastDate` first; a bag with only unknown-date trades is last in both directions; a bag with one
      dated and one undated trade uses the dated one.
   6. Latest does **not** use `createdAt`: a bag whose trade was created last but has an older date sorts by the date.
   7. Name A–Z: by symbol, then bag name; `"Jun 3"` before `"Jun 26"`; Z–A reverses.
   8. Ties: equal values ordered by name A–Z in both directions, then by `bag.id`; shuffled input gives the same output.
   9. Does not mutate the input array.
   10. `DEFAULT_SORT.closed` gives the same order as today's `summarizeAccount(...).closed` for a sample journal with
       unknown dates (only ties may differ: today by `bag.id`, now by name).
   11. `DEFAULT_SORT.open` gives the same order as today's `openPositions` sort (priced by value ↓, then unpriced by
       cost ↓) for a sample with priced and unpriced bags (only ties may differ).
   12. `parseSort`: `null`, `""`, `"gain"`, `"gain:up"`, `"size:desc"` → default of the tab; `"name:asc"` → name asc;
       `"value:desc"` → value desc on `open`, but the Closed default (latest desc) on `closed`.
   13. `formatSort(parseSort(x, tab))` round-trips for every key in `SORT_KEYS[tab]` and every dir.
   14. `nextSort`: same key flips; other key uses `FIRST_DIR` (`name` → `asc`, others → `desc`).
   15. `SORT_KEYS.closed` does not contain `value`; `SORT_KEYS.open` contains all five keys, `value` first.

## Acceptance criteria

- [ ] `src/ui/bagSort.ts` exports the API of plan §6.1 with JSDoc in plain English.
- [ ] All tests of step 4 pass.
- [ ] `openPositions` no longer sorts; `sortBags` is the only place that orders list rows.
- [ ] The Open list shows Value ↓ order (the same as before this task) and the Closed list shows Latest action ↓ order
      (the defaults).
- [ ] `npm test`, `npm run typecheck`, `npm run build` pass.

## Verification

```sh
npm test -- src/ui/bagSort
npm test && npm run typecheck && npm run build
npm run dev   # open the printed URL with ?demo
```

Manual (dev, `?demo`, account "Demo", data from `src/state/demo.ts`):

- Open: the same order as before this task: priced bags by current value (it depends on the live prices), then FAKE
  Test bag (no price) last.
- Closed: DOGE Fun (latest 2026-08-01), then BTC Swing (2026-06-01) — the same as before this task.

## Hand-off log

_(Append a dated entry before you stop, even mid-task: what is done, what is next, surprises.)_

## Status

| Status      | Progress % | Time spent | Tokens spent |
| ----------- | ---------- | ---------- | ------------ |
| Not started | 0%         | 0h         | 0            |
