# Which author name should the rewritten commits show?

- **Raised in:** task 01 / [history-rewrite-runbook.md](../history-rewrite-runbook.md) step 2.2
- **Why it matters:** before the rewrite, both commits showed the work GitHub handle as the name, not only the work
  email. The name is public on every commit, and the work handle linked the personal repo to the work account.
- **Options:**
  - A — `Stanislav Savchuk` (recommended: the same name as in `LICENSE`, says who wrote it, links to no account).
  - B — `stanislavSav` (the personal GitHub handle).
  - C — keep the old name and change only the email.
- **What the code does meanwhile:** —
- **Status:** Decided (2026-10-12): A. The rewrite used `Stanislav Savchuk <103412957+stanislavSav@users.noreply.github.com>`
  for author and committer, and the repo-local git config uses the same identity (rules in `CLAUDE.md`).
