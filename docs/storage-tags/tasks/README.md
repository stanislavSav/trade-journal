# Storage tags — tasks

Work units derived from [../plan.md](../plan.md). Tasks are **sequential**. Task N may assume that tasks 1…N-1 are
`Done`. Each file is a self-contained brief: hand one file to a fresh agent session and it has what it needs.

## Progress board

Keep this table in step with the `## Status` table at the bottom of each task file. **The task file is the source of
truth.** Update both in the same change.

| #   | Task                                                                          | Depends on | Status      | Progress |
| --- | ----------------------------------------------------------------------------- | ---------- | ----------- | -------- |
| 01  | [Domain model, parse and merge](01-domain-model-parse-merge.md)                | —          | Done        | 100%     |
| 02  | [Catalogue module and logo pipeline](02-catalogue-and-icons.md)               | 01         | Done        | 100%     |
| 03  | [Storage picker and custom storages](03-picker-and-custom-storages.md)       | 02         | Done        | 100%     |
| 04  | [Bag screen tags and Stored at in Add trade](04-bag-screen-and-add-trade.md)  | 03         | Done        | 100%     |
| 05  | [List icon, filter chips and filtered totals](05-list-icon-and-filter.md)     | 04         | Not started | 0%       |
| 06  | [QA and hardening](06-qa.md)                                                  | 05         | Not started | 0%       |

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

**A question for the owner** goes to [../parking-lot/](../parking-lot/README.md) as its own file. Do not stop: write
what the code does meanwhile, and go on.

## Repo rules every task inherits

- Repo root: `/Users/stan/Personal/trade-journal` (React 19, Vite 8, TypeScript 7, Vitest 5, `type: module`). Run from
  the root: `npm test`, `npm run typecheck`, `npm run build`. CI (`.github/workflows/`) runs `npm test` and
  `npm run build` on Node 22.
- Features #2 (Ukrainian / English) and #4 (list sorting) are `Shipped` before task 01 starts. Every new UI string goes
  into **both** dictionaries, `src/i18n/en.ts` and `src/i18n/uk.ts`, and is read with `useT()`. Storage brand names are
  never translated.
- Device-only preferences use `localStorage` keys with the prefix `trade-journal:ui:` (G5) and the guarded
  `useStoredString` hook (`src/state/useStoredString.ts`).
- Data that must reach other devices goes into the journal and is merged by id + `updatedAt` with tombstones (G6).
  Never delete a record; set `deleted: true`.
- No new network calls (G7). Logos are bundled files.
- Domain code (`src/domain/`, `src/storage-tags/` except `.tsx`) is pure: no React, no `localStorage`, no `Date.now()`
  (time comes in as `now`).
- Tests are Vitest, co-located as `*.test.ts`. The test environment is `node` (`vite.config.ts`), so UI behaviour is
  checked by hand and listed in each task's manual checks.
- Plain, short English in code comments and UI text. Leave work uncommitted for review unless the owner says otherwise.
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
