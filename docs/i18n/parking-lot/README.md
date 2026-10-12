# Parking lot — Ukrainian / English (i18n)

Open questions and decisions that came up during planning and implementation and need the owner. Implementation does
not stop for them; each item says what was done in the meantime, so the code is never blocked on an answer.

Most items here are **word choices**. The owner is a native Ukrainian speaker; the proposals come from the planning
session and need his ear.

## How to add an item

One file per item, named `<task-number>-<short-slug>.md` (for example `04-term-for-bag.md`), with:

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
| [Should a phone set to Russian (and not Ukrainian) open in English or in Ukrainian?](01-russian-language-devices.md) | 01   | Open   |
| [Should the Ukrainian UI show numbers as `1 234,56 $` instead of `$1,234.56`?](03-number-format-in-ukrainian.md)  | 03   | Decided (2026-10-12): `$1,234.56` in both languages |
| [Which Ukrainian month abbreviations should new default bag names use?](03-default-bag-name-language.md)          | 03   | Open   |
| [Are the proposed Ukrainian words in the glossary right?](04-glossary-confirmation.md)                            | 04   | Open   |
| [Which Ukrainian word should the app use for "Bag"?](04-term-for-bag.md)                                          | 04   | Decided (2026-10-12): Позиція |
| [Which Ukrainian word should the app use for "Account"?](04-term-for-account.md)                                  | 04   | Decided (2026-10-12): Портфель |
| [Should the Ukrainian UI address the user as "ви" or "ти"?](04-formal-or-informal-address.md)                     | 04   | Decided (2026-10-12): polite Ви |
| [What should the iPhone backup help text say in Ukrainian, given iOS shows its own labels in the device language?](04-iphone-help-text-in-ukrainian.md) | 04 | Open |
| [Do all Ukrainian texts in the app read right?](05-owner-review-all-strings.md) (full EN/UK table for the owner review) | 05 | Open |
