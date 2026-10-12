<!--
Copy this file to `<feature>/parking-lot/README.md`. Each open question gets its own file next to it, named
`<task-number>-<short-slug>.md`, using the item format below. Reference example: docs/storage-tags/parking-lot/.
-->

# Parking lot — <feature name>

Open questions and decisions that came up during implementation and need the owner. Implementation does not stop for
them; each item says what was done in the meantime, so the code is never blocked on an answer.

## How to add an item

One file per item, named `<task-number>-<short-slug>.md` (for example `03-offline-sync-scope.md`), with:

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

| Item | Task | Status |
| ---- | ---- | ------ |
