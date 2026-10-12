# Should a row show the value it is sorted by (for example the latest date) when that value is not on the row today?

- **Raised in:** task 02 (`src/ui/BagRows.tsx:18-42`, `OpenRow`)
- **Why it matters:** an open row shows quantity, average price, value and gain %, but no date and, when priced, no
  cost. Sorted by **Latest action** or **Invested**, the Open list can look random, because the number it is sorted by
  is not visible. Closed rows already show the dates and the buy total, so they are fine.
- **Options:**
  - A — no change to rows; the sort button names the order (recommended for the first version: rows stay calm, and
    the bag screen shows everything).
  - B — when Open is sorted by Latest action, add the latest date to the row's meta line ("0.75 · avg $53,333 ·
    12 Sep"); when sorted by Invested and the row has a price, add "cost $40,000".
- **What the code does meanwhile:** A. Rows are unchanged.
- **Status:** Open
