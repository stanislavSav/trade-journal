# List sorting — tasks

Work units derived from [../plan.md](../plan.md). Tasks are **sequential**. Task N may assume that tasks 1…N-1 are
`Done`, and that features 2 and 3 ([docs/i18n/plan.md](../../i18n/plan.md),
[docs/account-removal/plan.md](../../account-removal/plan.md)) are `Shipped`. Each file is a self-contained brief:
hand one file to a fresh agent session and it has what it needs.

## Progress board

Keep this table in step with the `## Status` table at the bottom of each task file. **The task file is the source of
truth.** Update both in the same change.

| #   | Task                                                                   | Depends on    | Status      | Progress |
| --- | ---------------------------------------------------------------------- | ------------- | ----------- | -------- |
| 01  | [`sortBags` and the sort helpers](01-sort-bags-function.md)            | —             | Not started | 0%       |
| 02  | [Sort button, sort sheet and the saved choice](02-sort-control-ui.md)  | 01, feature 2 | Not started | 0%       |

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

- Repo root: `/Users/stan/Personal/trade-journal`. React 19 + Vite + TypeScript, npm.
- Scripts: `npm test` (Vitest, `environment: 'node'`: no DOM, so test pure functions, not components),
  `npm run typecheck`, `npm run build`.
- Device-only preferences use `localStorage` keys with the prefix `trade-journal:ui:` and are not in backups (G5 in
  [docs/README.md](../../README.md)). Every access is guarded (`src/state/useStoredString.ts`).
- Every new UI string goes into both `src/i18n/en.ts` and `src/i18n/uk.ts` (G4). Use `useT()`.
- Tests are co-located as `*.test.ts`.
- Commit rules: `CLAUDE.md` at the repo root.
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
