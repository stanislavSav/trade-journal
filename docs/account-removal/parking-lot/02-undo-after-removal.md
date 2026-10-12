# Should there be an Undo right after removing an account?

- **Raised in:** task 02 (`src/ui/RemoveAccountSheet.tsx`, toast in `src/ui/JournalApp.tsx`)
- **Why it matters:** the removal cannot be undone in the app, and loading an older backup does not bring it back
  (the tombstones are newer, plan §6.3 E6). The only way back is a clean browser + an old backup (plan §6.3, "How to
  recover by hand"), which loses later changes on that device.
- **Options:**
  - A — no Undo (recommended): typing the exact name is already a strong guard, the sheet shows the counts and offers
    **Save backup now**, and an Undo adds a second write with newer timestamps that must also sync correctly.
  - B — a toast with **Undo** for about 5 seconds. Undo would write the same records back with `deleted` removed and a
    new `updatedAt` (`restoreAccount(journal, removedIds, now)`). Needs the list of ids the removal changed, and a
    test that a backup saved between remove and undo still merges right.
- **What the code does meanwhile:** A: no Undo; the confirmation text says it cannot be undone.
- **Status:** Open
