# docs/

Plans, task briefs and decisions for the Trade Journal app. No app code lives here. Start here, then follow the index.

The structure (plan, tasks, parking lot; templates in `docs/_templates/`) is reused from the owner's other projects.

## Layout

```
docs/
├── README.md          ← this file: index, rules and the roadmap
├── CONTEXT.md         ← glossary: the words the app and these docs use
├── _templates/        ← copy these to start a feature, a task, a parking lot or a runbook
└── <feature>/         ← one folder per feature (shape below)
```

## Feature docs: spec-driven shape

```
<feature>/
├── plan.md            ← the spec: why, scope, decisions table, diagrams, wireframes, risks, rollout
├── mockups/           ← optional: interactive HTML mockups + README.md
├── parking-lot/       ← open questions raised while building: README.md (format + index) + one file per question
└── tasks/
    ├── README.md      ← progress board + how to pick up a task
    ├── 01-….md        ← one self-contained brief per task, in the order they must be done
    └── …
```

- `plan.md` starts with a status line (`Planned` · `In progress` · `Shipped` · `Superseded`), the owner and the date.
- Each task file is written so that a fresh agent session can execute it from the file alone: goal, context to load,
  scope in/out, steps, acceptance criteria, verification, a hand-off log, and the status table.
- Task status values: `Not started` · `In progress` · `Blocked` · `Done` · `Cancelled`. The task file is the source of
  truth; the board in `tasks/README.md` mirrors it.
- When the code disagrees with the plan, update the plan first.
- A question that comes up while building goes to `parking-lot/` as its own file, saying what the code does meanwhile;
  work does not stop for it. When the owner decides, set its **Status** to `Decided (date): …`, apply the decision, and
  keep the file as the record.

Templates: [`_templates/feature-plan.md`](_templates/feature-plan.md), [`_templates/task.md`](_templates/task.md),
[`_templates/parking-lot.md`](_templates/parking-lot.md), [`_templates/runbook.md`](_templates/runbook.md).

## Naming

- Folders and files are **kebab-case**. The only uppercase names are `README.md` and `CONTEXT.md`.
- Task files are numbered (`01-…`). Parking-lot files start with the task number that raised them.
- Write the full repo path (`docs/storage-tags/plan.md`) when code refers to a doc, so `git grep` finds it.

## Roadmap (October 2026)

Features are built in this order. A feature may assume that every feature above it is `Shipped`. The order matters
because later features add UI text in two languages (needs i18n) and the demo data shows every new feature.

| #   | Feature                                            | What the user gets                                                     | Status  |
| --- | -------------------------------------------------- | ---------------------------------------------------------------------- | ------- |
| 1   | [Open source](open-source/plan.md)                 | MIT licence, a README for strangers, work email removed from history   | Shipped |
| 2   | [Ukrainian / English](i18n/plan.md)                | The whole app in Ukrainian or English; new Settings sheet with the switch | Shipped |
| 3   | [Remove an account](account-removal/plan.md)       | Accounts section in Settings; remove an account with its bags and trades | Planned |
| 4   | [List sorting](list-sorting/plan.md)               | Sort open bags by value, gain %, invested, latest action or name; closed bags by the last four | Planned |
| 5   | [Storage tags](storage-tags/plan.md)               | Tag where each bag is kept (Binance, Ledger, …), icons, filter chips   | Planned |
| 6   | [Demo data](demo-data/plan.md)                     | `?demo` link on the live app and a sample backup file for testers      | Planned |

Whitelabel (branded copies of the app) is planned privately and is not part of this repo yet.

## Decisions that apply to every feature

| #   | Question                                   | Decision                                                                                     |
| --- | ------------------------------------------ | -------------------------------------------------------------------------------------------- |
| G1  | Where does the public repo live?           | Stays at `github.com/stanislavSav/trade-journal`; live app at `stanislavsav.github.io/trade-journal/`. |
| G2  | Licence                                    | MIT, copyright holder Stanislav Savchuk.                                                     |
| G3  | Commit author email                        | GitHub noreply address of `stanislavSav`. The two existing commits are rewritten (runbook in `open-source/`). |
| G4  | Languages                                  | English and Ukrainian. Every new UI string is added in both languages from feature 2 on.     |
| G5  | Device-only preferences (sort, filter, language, selected account) | `localStorage`, key prefix `trade-journal:ui:`. Not in backups.         |
| G6  | Data that must travel between devices      | In the journal and therefore in backups, merged by id + `updatedAt` with tombstones (`src/domain/journal.ts`). |
| G7  | Servers, accounts, tracking                | None. The app stays a static PWA; the only network call stays CoinGecko prices.             |
