# After the force-push, must the old commits also disappear from GitHub's cache?

- **Raised in:** task 01 / [history-rewrite-runbook.md](../history-rewrite-runbook.md) §3 and §5
- **Why it matters:** the force-push on 2026-10-12 removed the old commits from `main`, but GitHub can keep them
  reachable by their hash for some time (for example `github.com/stanislavSav/trade-journal/commit/e91e3a8`). Anyone
  who saved such a link could still see the work email. The contributors graph (Insights → Contributors) can also show
  the old author for a while before it refreshes. Only GitHub Support can purge cached commits fully. The repo is new
  and had 2 commits, so the risk is small.
- **Options:**
  - A — open the old commit URL once (task 01 step 7). If it still opens after a few days, ask GitHub Support
    (support.github.com, request to remove cached views of sensitive data) to purge it (recommended: one form, no
    downside).
  - B — accept it; the old commits are not linked from anywhere, and the cache expires by itself over time.
- **What the code does meanwhile:** nothing; no ticket is opened. Task 01 records what the URL and the contributors
  graph show.
- **Status:** Open
