# After Load backup, should the message also count bags and storages that changed, not only trades?

- **Raised in:** task 06 (`src/state/mergeCounts.ts`, the toast after Load backup)
- **Why it matters:** the message "Merged: N new, M updated" counts **trades** only. A backup that changes only bag
  names, storage tags or custom storages says "Merged: 0 new, 0 updated", even though the tags on screen changed.
  Seen in test matrix row 9: the old app renamed a bag, the new app loaded that backup, the rename arrived, and the
  message said "0 new, 0 updated". Users may think the file did nothing.
- **Options:**
  - A — keep counting trades, and add a second short line when bags or storages changed, for example "Bags and
    storages updated" (recommended: small change, the trade numbers stay as people know them).
  - B — count every record (accounts, coins, bags, trades, storages) in the two numbers. Simple, but "37 new" then
    mixes trades with other records and is harder to read.
  - C — keep it as it is.
- **What the code does meanwhile:** C. The merge itself is right; only the message leaves out non-trade changes.
- **Status:** Open
