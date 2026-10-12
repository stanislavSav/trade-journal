# Should the Open list keep today's "by value" order as its default, which means a fifth sort key "Value"?

- **Raised in:** task 01 (`src/ui/portfolioView.ts:55-71`, `openPositions`)
- **Why it matters:** today the Open list is ordered by current market value (priced bags first, then unpriced bags by
  cost). The owner's four keys have no "value"; the planned default is **Invested ↓** (cost of the coins still held).
  For most bags the order is close, but a bag that grew a lot (or fell a lot) moves: e.g. a bag bought for 1,000 that is
  worth 10,000 now is above a bag bought for 5,000 today, and below it with Invested ↓. Unpriced bags also mix in by
  cost instead of sitting at the end.
- **Options:**
  - A — keep the four keys; default Open = Invested ↓ (recommended: exactly the owner's list, simple; the value is
    still shown on every row).
  - B — add a fifth key **Value** (open: `pos.value`, unknown without a price; closed: proceeds) and make it the Open
    default, so nothing changes for the owner until he picks another sort.
- **What the code does meanwhile:** A. `DEFAULT_SORT.open = { key: 'invested', dir: 'desc' }`.
- **Status:** Decided (2026-10-12): B — a fifth key **Value** (current market value of an open bag; priced bags first,
  unpriced bags last, ordered among themselves by cost as today). Open default = **Value ↓**, so today's order from
  `src/ui/portfolioView.ts` stays. Value is offered on the **Open tab only**: the option list is per tab, and the
  Closed tab offers Gain %, Invested, Latest action and Name (no "proceeds" sort). Closed default stays Latest
  action ↓. Applied in plan D1, D10–D12, §5, §6.1 and tasks 01–02.
