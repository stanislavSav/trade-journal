# Parking lot — Demo data

Open questions and decisions that came up during planning and implementation and need the owner. Implementation does
not stop for them; each item says what was done in the meantime, so the code is never blocked on an answer.

## How to add an item

One file per item, named `<task-number>-<short-slug>.md` (for example `02-language-shared-in-demo.md`), with:

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

| Item                                                                                                                  | Task | Status                 |
| --------------------------------------------------------------------------------------------------------------------- | ---- | ---------------------- |
| [Should the demo's names and note be in Ukrainian when the UI is Ukrainian?](01-demo-content-language.md)             | 01   | Open                   |
| [Should the demo share the real language preference, or keep its own like every other preference?](02-language-shared-in-demo.md) | 02 | Open        |
| [Should the app itself offer "Try demo" and "Download sample backup"?](02-in-app-demo-entry.md)                      | 02   | Open                   |
| [Does "Add to Home Screen" on iOS from the `?demo` page install the demo or the real app?](04-ios-home-screen-from-demo.md) | 04 | Waiting for device run |
| [Should links support `?lang=uk` (e.g. `?demo&lang=uk`) for sharing with the Ukrainian community?](04-lang-url-parameter.md) | 04 | Open             |
