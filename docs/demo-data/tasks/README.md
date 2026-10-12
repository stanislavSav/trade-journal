# Demo data — tasks

Work units derived from [../plan.md](../plan.md). Tasks are **sequential**. Task N may assume that tasks 1…N-1 are
`Done`. Each file is a self-contained brief: hand one file to a fresh agent session and it has what it needs.

This feature starts after features 1–5 are `Shipped` ([docs/README.md](../../README.md) roadmap): the app has
`useT()` and the Settings sheet (feature 2), account removal (feature 3), list sorting (feature 4) and storage tags
(feature 5).

## Progress board

Keep this table in step with the `## Status` table at the bottom of each task file. **The task file is the source of
truth.** Update both in the same change.

| #   | Task                                                                          | Depends on | Status      | Progress |
| --- | ----------------------------------------------------------------------------- | ---------- | ----------- | -------- |
| 01  | [Rich, deterministic demo journal](01-deterministic-demo-journal.md)          | —          | Done        | 100%     |
| 02  | [Demo mode on the live site](02-demo-mode-in-production.md)                   | 01         | Done        | 100%     |
| 03  | [Sample backup file and service-worker rule](03-sample-backup-file.md)        | 01         | Done        | 100%     |
| 04  | [README "How to test" and device checks](04-readme-and-device-checks.md)      | 02, 03     | Done        | 100%     |

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

**If a question comes up** that the owner must answer, add a file to [../parking-lot/](../parking-lot/README.md), do
the recommended option meanwhile, and continue.

## Repo rules every task inherits

- Single package at the repo root (`type: module`). Scripts: `npm test` (Vitest, `vitest run`), `npm run typecheck`,
  `npm run build`, `npm run dev`. `npm test -- -u` updates file snapshots (the sample backup).
- Tests are Vitest in a **Node** environment (no DOM), co-located as `src/**/*.test.ts`.
- Every UI string goes into **both** `src/i18n/en.ts` and `src/i18n/uk.ts` (G4), using the glossary in
  [docs/i18n/plan.md](../../i18n/plan.md) §8.1. Demo **content** (names, the note) stays English (plan D19).
- Device preferences: build every key with `deviceKey(name)` from `src/state/demo.ts`, never with a
  `trade-journal:ui:` literal. The only exception is the language key (plan D6).
- In demo mode, nothing may write `trade-journal:journal:v1` or `trade-journal:backup` (plan D3).
- **From this feature on, a feature that adds data extends `demoJournal()` in `src/state/demoData.ts`, moves
  `DEMO_SAMPLE_DATE` forward, and regenerates `public/sample-backup.json` with `npm test -- -u`.**
- Never commit real trade data: `trades*.json` is in `.gitignore`. The sample file is `sample-backup.json`.
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
