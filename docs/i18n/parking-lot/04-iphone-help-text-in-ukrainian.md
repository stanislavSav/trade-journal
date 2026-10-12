# What should the iPhone backup help text say in Ukrainian, given iOS shows its own labels in the device language?

- **Raised in:** task 04 (`src/ui/BackupSheet.tsx:68`)
- **Why it matters:** The help under "Save backup" says: "On iPhone choose Save to Files → iCloud Drive → Trades and
  replace trades.json." "Save to Files" is an iOS share-sheet label. iOS shows it in the **device** language, not in
  the app language. A user with a Ukrainian app on an English iPhone sees "Save to Files"; a user with a Ukrainian
  iPhone sees the Ukrainian iOS label. The exact Ukrainian iOS wording was not checked on a device during planning.
- **Options:**
  - A — Write the Ukrainian iOS label as iOS shows it on a Ukrainian iPhone (recommended; confirm on a device). The
    folder name `Trades` and `trades.json` stay as they are (they are names the user created).
  - B — Describe the step without quoting iOS labels: "Оберіть збереження у Файли → iCloud Drive → Trades і замініть
    trades.json". Works for both device languages, slightly vaguer.
- **What the code does meanwhile:** option B, until the owner checks the Ukrainian iOS label on his iPhone.
- **Status:** Open
