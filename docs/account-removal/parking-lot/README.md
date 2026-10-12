# Parking lot — Remove an account

Open questions and decisions that came up during planning and implementation and need the owner. Implementation does
not stop for them; each item says what was done in the meantime, so the code is never blocked on an answer.

## How to add an item

One file per item, named `<task-number>-<short-slug>.md` (for example `01-orphans-after-merge.md`), with:

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

| Item                                                                                                                          | Task | Status |
| ----------------------------------------------------------------------------------------------------------------------------- | ---- | ------ |
| [What should happen to trades and bags that another device added to a removed account, once the backups merge?](01-orphans-after-merge.md) | 01   | Open   |
| [Should there be an Undo right after removing an account?](02-undo-after-removal.md)                                          | 02   | Open   |
