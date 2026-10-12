# Should the demo's names and note be in Ukrainian when the UI is Ukrainian?

- **Raised in:** task 01 (`src/state/demoData.ts`, plan D19)
- **Why it matters:** A Ukrainian tester sees a Ukrainian UI with English data: accounts `Demo`, `Demo Family`,
  `Demo Swing`, bags `Long-term`, `Kids fund`, `Breakout`, the custom storage `Family safe`, and one note. Real users
  type names in their own language, so Ukrainian demo data would look more natural for a Ukrainian audience.
  But the demo data is stored data (never translated, i18n plan D10), and the sample file is one file for everyone.
- **Options:**
  - A — English demo content in both UI languages (recommended for now). One source, one sample file, simple tests.
  - B — `demoJournal(today, lang)`: names and the note come from a small per-language table; the live `?demo` uses
    the UI language at start; the sample file stays English. The demo then changes language only on reload, and the
    ids stay the same, so nothing else changes.
  - C — Two sample files (`sample-backup.json`, `sample-backup-uk.json`) as well as B.
- **What the code does meanwhile:** option A.
- **Status:** Open
