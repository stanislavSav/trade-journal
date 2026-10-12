# Parking lot — storage tags

Open questions and decisions that came up during planning and implementation and need the owner. Implementation does
not stop for them; each item says what was done in the meantime, so the code is never blocked on an answer.

## How to add an item

One file per item, named `<task-number>-<short-slug>.md` (for example `03-picker-sort-order.md`), with:

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

| Item                                                                                                                                                         | Task | Status |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---- | ------ |
| [Should `parseJournal` keep fields and collections it does not know, so that data from a newer app version survives on an older one?](01-keep-unknown-fields.md) | 01   | Open   |
| [Should the app show the logos of brands whose terms ask for permission first (Ledger, Trezor, MEXC, Gemini, …), or a letter badge for them?](02-restricted-logos.md) | 02   | Decided (2026-10-12): real logos for all brands |
| [Should the catalogue also list storages that have closed (Kuna, EXMO, FTX, Zonda), so that old bags can be tagged where they really were?](02-closed-storages.md) | 02   | Decided (2026-10-12): not listed, add as custom storage |
| [Some brand kits set rules that a small logo tile cannot meet (minimum size, "no mark without the wordmark"). Is that acceptable?](02-kit-rules-at-small-size.md) | 02   | Open   |
| [Four brands that were planned with a logo now show a letter badge. Should we ask them for a usable logo file?](02-letter-badge-fallbacks.md) | 02   | Open   |
| [Should the two generic catalogue entries ("Paper / steel backup", "Other hardware wallet") get Ukrainian names?](04-generic-entry-names.md) | 04   | Open   |
