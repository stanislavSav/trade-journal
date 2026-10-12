# What should happen to trades and bags that another device added to a removed account, once the backups merge?

- **Raised in:** task 01 / [plan §6.3](../plan.md) edge cases E2–E5 (`src/domain/journal.ts:133-150`,
  `src/state/mergeCounts.ts:9-22`)
- **Why it matters:** the merge works per record. If device B adds or edits a trade in the removed account before it
  loads the removal, that trade (and a new bag, if B started one) survives the merge, but its account or bag is
  deleted. Nothing shows it, yet the toast says "Merged: 1 new". If an account with the same name is added later, new
  bags from B appear in it again. It needs two devices and edits before a sync, so it should be rare.
- **Options:**
  - A — accept and document (recommended for now): rare, nothing is lost (the data is still in the journal), and the
    behaviour is covered by a test in task 01. Optionally, `countMergedTrades` could stop counting trades that are
    not visible, so the toast does not promise something the user cannot see (small change in
    `src/state/mergeCounts.ts`).
  - B — after every merge, tombstone live bags of deleted accounts and live trades of deleted bags
    (`pruneOrphans(journal, now)` in `useJournal.mergeBackup`). The journal stays clean, but B's new trade is deleted
    without a word, and the merge then writes new tombstones (one more change to back up).
  - C — after a merge, if orphans exist, show "N trades belong to a removed account" with **Restore account** (revive
    the account and the bags) or **Delete**. Most honest, most work.
- **What the code does meanwhile:** A without the toast change: orphans stay in the journal, hidden; the merge toast
  counts them.
- **Status:** Open
