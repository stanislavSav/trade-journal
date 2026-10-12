# Ukrainian / English (i18n) — tasks

Work units derived from [../plan.md](../plan.md). Tasks are **sequential**. Task N may assume that tasks 1…N-1 are
`Done`. Each file is a self-contained brief: hand one file to a fresh agent session and it has what it needs.

## Progress board

Keep this table in step with the `## Status` table at the bottom of each task file. **The task file is the source of
truth.** Update both in the same change.

| #   | Task                                                                      | Depends on | Status      | Progress |
| --- | ------------------------------------------------------------------------- | ---------- | ----------- | -------- |
| 01  | [i18n core: catalogs, plurals, detection, `useT`](01-i18n-core.md)        | —          | Done        | 100%     |
| 02  | [Settings sheet: gear button, Language, About](02-settings-sheet.md)      | 01         | Done        | 100%     |
| 03  | [Domain messages as data (error codes, warnings, price problems)](03-domain-messages-as-data.md) | 01 | Done | 100% |
| 04  | [Translate every screen](04-translate-every-screen.md)                    | 02, 03     | Done        | 100%     |
| 05  | [QA in both languages, docs, owner review](05-qa-and-owner-review.md)     | 04         | Not started | 0%       |

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

- Single package at the repo root (`type: module`). Scripts: `npm test` (Vitest, `vitest run`), `npm run typecheck`
  (`tsc --noEmit`), `npm run build` (type check + Vite build into `dist/`), `npm run dev`.
- Tests are Vitest in a **Node** environment (no DOM, no Testing Library), co-located as `src/**/*.test.ts`. Test pure
  functions; check screens by hand with `npm run dev`.
- Every new or changed UI string goes into **both** `src/i18n/en.ts` and `src/i18n/uk.ts` (G4). Use the glossary in
  [plan §8.1](../plan.md). Never translate stored data (account, bag and coin names, notes, `trades.json`).
- Device preferences use `localStorage` keys with the prefix `trade-journal:ui:` (G5), read and written through
  `src/state/useStoredString.ts` (it guards private mode).
- No new runtime dependencies without a line in plan §7.
- No servers, no tracking (G7). The only network calls stay `api.coingecko.com`.
- Never commit trade data: `trades*.json` is in `.gitignore`.
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
