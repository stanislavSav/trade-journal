# Should `parseJournal` keep fields and collections it does not know, so that data from a newer app version survives on an older one?

- **Raised in:** planning, for task 01 (`src/domain/journal.ts:21-53`, `parseJournal`)
- **Why it matters:** today the parser builds each record field by field and drops everything else. This feature is the
  first one that adds data (`Bag.storageIds`, `Journal.storages`), and the device that still runs an older version
  drops it when it loads a backup (plan §9, rows 1–3). Every later feature that adds data has the same problem. If the
  parser kept unknown fields from now on, the *next* new field would survive on a device that runs this version.
  It does not help this feature: the version that is installed today drops the tags whatever we do now.
- **Options:**
  - A — keep unknown fields from now on (recommended, but as its own small change after this feature). Each record
    keeps a copy of the fields it did not read; unknown top-level collections are kept as they are and written back.
    Merge keeps unknown fields of the winning copy. Cost: about half a day with tests; the type of a parsed record gets
    an "extra fields" part.
  - B — keep the strict parser and rely on the auto-update of the PWA plus the release note "open every device once".
    Simple, and enough for one user with two or three devices.
  - C — bump `version` to 2 whenever data is added, so an old app refuses a newer backup with "Unsupported backup
    version" instead of silently dropping data. Safe, but the old device cannot load anything until it updates.
- **What the code does meanwhile:** B for this feature, plus the merge carry-over rule in plan §6.3, which protects
  tags against the most likely loss (an old device renaming a tagged bag).
- **Status:** Open
