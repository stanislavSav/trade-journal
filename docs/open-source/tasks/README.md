# Open source — tasks

Work units derived from [../plan.md](../plan.md). Tasks are **sequential**. Task N may assume that tasks 1…N-1 are
`Done`. Each file is a self-contained brief: hand one file to a fresh agent session and it has what it needs.

## Progress board

Keep this table in step with the `## Status` table at the bottom of each task file. **The task file is the source of
truth.** Update both in the same change.

| #   | Task                                                                     | Depends on | Status      | Progress |
| --- | ------------------------------------------------------------------------ | ---------- | ----------- | -------- |
| 01  | [Audit files and history for personal data](01-audit-personal-data.md) | —          | Not started | 0%       |
| 02  | [LICENSE, SECURITY.md and a README for strangers](02-licence-security-readme.md) | 01         | Not started | 0%       |
| 03  | [GitHub repo settings](03-github-repo-settings.md)                       | 02         | Not started | 0%       |

## How to pick up a task (also for a new agent session)

1. Take the lowest-numbered task that is not `Done`. Tasks that are `Blocked` say why in their status table.
2. Read, in this order: its **Context to load** list, the plan sections named in **Spec refs**, and the
   **Hand-off log** of the previous task.
3. Set the task to `In progress` here and in the file.
4. Do the work. Tick the acceptance criteria as you go.
5. Before you stop, even mid-task, append a dated entry to the task's **Hand-off log**: what is done, what is next, and
   any surprise. A session that stops without this entry has lost its work for the next session.
6. When every acceptance criterion holds, set `Done` in both places.

**If the code disagrees with the plan**, stop and update [../plan.md](../plan.md) (and this board, if the order
changes) before you continue. Plan, tasks, and code must not drift apart.

## Repo rules every task inherits

- Repo root: `/Users/stan/Personal/trade-journal`. Node 22 in CI (`.github/workflows/deploy.yml`), npm.
- Scripts: `npm test` (Vitest), `npm run typecheck`, `npm run build` (type check + Vite build).
- Every push to `main` redeploys the live app on GitHub Pages.
- The history rewrite was done on 2026-10-12 (see the [runbook](../history-rewrite-runbook.md) run log); it is not
  part of these tasks.
- Commit rules live in `CLAUDE.md` at the repo root (commit `d540f39`). Commits use the repo-local identity
  (Stanislav Savchuk + the `stanislavSav` noreply email). Check with `git config --local user.email` before you commit.
- Force-pushes and GitHub settings changes are done by the owner; a task prepares the commands.
- Never write the work email or the employer's name into any file: the repo is public.
- Leave work uncommitted for review, unless the owner says otherwise.
- Status values: `Not started` · `In progress` · `Blocked` · `Done` · `Cancelled`.

## Task file shape

```
# NN — Title
> Depends on · Spec refs · Estimate
## Goal
## Context to load
## Scope (In / Out)
## Steps
## Acceptance criteria   (checkboxes)
## Verification
## Hand-off log          (dated entries, newest last)
## Status                (table below)
```

```
| Status      | Progress % | Time spent | Tokens spent |
|-------------|------------|------------|--------------|
| Not started | 0%         | 0h         | 0            |
```
