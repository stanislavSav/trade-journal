# Parking lot — List sorting

Open questions and decisions that came up during planning and implementation and need the owner. Implementation does
not stop for them; each item says what was done in the meantime, so the code is never blocked on an answer.

## How to add an item

One file per item, named `<task-number>-<short-slug>.md` (for example `01-open-default-order.md`), with:

```
# <Question, as one sentence>

- **Raised in:** task NN (file or code path)
- **Why it matters:** …
- **Options:** A … / B … (recommendation first)
- **What the code does meanwhile:** …
- **Status:** Open
```

When the owner decides, set **Status** to `Decided (YYYY-MM-DD): …`, apply the decision, and leave the file as a record.
Update the index below in the same change.

## Index

| Item                                                                                                              | Task | Status |
| ----------------------------------------------------------------------------------------------------------------- | ---- | ------ |
| [Should the Open list keep today's "by value" order as its default, which means a fifth sort key "Value"?](01-open-default-order.md) | 01   | Decided (2026-10-12): Value key, Open default Value ↓ |
| [Should a row show the value it is sorted by (for example the latest date) when that value is not on the row today?](02-show-sort-value-in-row.md) | 02   | Open   |
