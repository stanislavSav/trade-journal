# Remove an account — tasks

Work units derived from [../plan.md](../plan.md). Tasks are **sequential**. Task N may assume that tasks 1…N-1 are
`Done`, and that feature 2 ([docs/i18n/plan.md](../../i18n/plan.md)) is `Shipped`. Each file is a self-contained
brief: hand one file to a fresh agent session and it has what it needs.

## Progress board

Keep this table in step with the `## Status` table at the bottom of each task file. **The task file is the source of
truth.** Update both in the same change.

| #   | Task                                                                        | Depends on      | Status      | Progress |
| --- | --------------------------------------------------------------------------- | --------------- | ----------- | -------- |
| 01  | [`removeAccount` and `countAccountData` in the domain](01-remove-account-domain.md) | —               | Not started | 0%       |
| 02  | [Accounts section in Settings and the confirmation sheet](02-settings-accounts-ui.md) | 01, feature 2   | Not started | 0%       |

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
- Domain code (`src/domain/`) is pure: it returns a new `Journal` and never mutates its input. Every journal change in
  the UI goes through `useJournal().apply` (`src/state/useJournal.ts:58-68`).
- Deletions are tombstones (`deleted: true`, `updatedAt: now`), never removal from the array (G6 in
  [docs/README.md](../../README.md)).
- Every new UI string goes into both `src/i18n/en.ts` and `src/i18n/uk.ts` (G4). Use `useT()`.
- Device-only preferences use `localStorage` keys with the prefix `trade-journal:ui:` (G5).
- Tests are co-located as `*.test.ts`.
- Commit with the repo-local identity (noreply email); never write the work email into a file.
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
