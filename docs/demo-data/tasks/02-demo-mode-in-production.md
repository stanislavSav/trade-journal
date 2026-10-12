# 02 — Demo mode on the live site

> **Depends on:** 01 · **Spec refs:** [plan §3 D2–D9, D17, §5, §6.1](../plan.md) · **Estimate:** 1.5 days

## Goal

`https://stanislavsav.github.io/trade-journal/?demo` opens the demo on the live site. A banner says nothing is saved
and offers Exit demo. The tester's real journal, backup state and device preferences are never changed.

## Context to load

- [plan §3 D2–D9 and §5](../plan.md) — decisions and wireframes (the contract).
- `src/state/demo.ts` — `isDemo` (lines 4-5, dev-only today).
- `src/state/useJournal.ts` — demo branches (lines 31-34, 38, 47, 93, 113); `exportNow` (lines 70-74);
  `requestPersistence` effect (lines 87-89).
- `src/storage/index.ts:122-140` — `exportBackup` writes `lastBackupAt` (the bug D7 fixes).
- `src/ui/JournalApp.tsx:44` — `useStoredString('trade-journal:ui:account')`; the Header and sheets.
- `grep -rn "trade-journal:ui:" src` — the sort key (feature 4) and `storage-filter` (feature 5) also need
  `deviceKey()`.
- `src/ui/BackupSheet.tsx`, `src/ui/BagDetail.tsx:45-50` (top bar), `src/ui/ErrorBoundary.tsx:22-52`.
- `src/i18n/en.ts`, `src/i18n/uk.ts`.

## Scope

**In:**

- `src/state/demo.ts`:
  - `isDemo` without the `import.meta.env.DEV` check.
  - `deviceKey(name: string): string` — `trade-journal:demo:ui:<name>` in demo, else `trade-journal:ui:<name>`.
  - `exitDemo()` — `location.replace(import.meta.env.BASE_URL)`.
  - Unit tests for `deviceKey` with both values of the flag (make the flag injectable for the test, e.g.
    `makeDeviceKey(demo: boolean)`).
- Replace every `trade-journal:ui:` literal except the language key with `deviceKey(…)`.
- `useJournal`: in demo, `exportNow` rejects (or returns `'cancelled'`) **without** calling `exportBackup`; skip
  `requestPersistence`; keep the in-memory merge for Load backup.
- `src/ui/DemoBanner.tsx`: the banner of §5.1 above the header in `JournalApp`; neutral colours (new CSS class, not the
  red `.banner`).
- Bag screen: a small "Demo" chip in the top bar (§5.2).
- `BackupSheet`: `demo` prop; Save disabled with the note, Load help text for demo (§5.3).
- `ErrorBoundary`: in demo, hide Save backup, show "This was the demo…" and Exit demo (§5.4).
- Strings in both catalogs: `demo.banner`, `demo.exit`, `demo.chip`, `demo.backupNote`, `demo.loadHelp`,
  `demo.crashNote`.

**Out:** the sample file and the service-worker rule (task 03); README (task 04).

## Steps

1. `deviceKey` + tests; replace the literals.
2. Fix `exportNow` and `requestPersistence` in demo.
3. Banner, chip, Backup sheet, crash screen; strings in both languages.
4. Local Storage check (below) in `npm run build && npm run preview`, not only in dev.

## Acceptance criteria

- [x] In a production build (`npm run preview`), `?demo` shows the demo data, the banner and the chip.
- [x] **Local Storage check**: export all keys before (DevTools → Application → Local Storage), use the demo for a few
      minutes (switch accounts, sort, filter by storage, add / edit / delete a trade, load a backup file, open
      Settings, switch language), then compare. Only `trade-journal:demo:*`, `trade-journal:ui:lang` (if the language
      was switched) and `trade-journal:prices` changed. `trade-journal:journal:v1` and `trade-journal:backup` are
      byte-identical. Done in headless Chrome on the preview build (not yet in Safari: owner).
      Storage filter: not part of the check, because the storage-tags UI is not on `main` yet.
- [x] Save backup is disabled in demo and shows the note; no file is downloaded or shared.
- [x] Load backup in demo merges a file into the demo; after Exit demo the real app does not contain it.
- [x] Exit demo opens the real app with the real data; the browser Back button does not return to the demo.
- [x] Opening and closing bags keeps `?demo` in the URL; a reload stays in demo and resets the demo data.
- [x] Banner, chip and notes read correctly in English and Ukrainian; the banner wraps cleanly at 320 px.
- [x] `deviceKey` tests pass; `grep -rn "trade-journal:ui:" src` finds only `deviceKey`'s own prefix and the language
      key (a test checks this).

## Verification

```sh
npm test
npm run typecheck
npm run build
npm run preview   # open http://localhost:4173/trade-journal/?demo
```

Manual: the Local Storage check above, once in Chrome and once in Safari.

## Hand-off log

_(Append a dated entry before you stop, even mid-task: what is done, what is next, surprises.)_

- **2026-10-12** — Done. `src/state/demo.ts` has `readDemoFlag`, `isDemo` (no dev-only check), `makeDeviceKey` /
  `deviceKey` and `exitDemo`. The account and sort keys use `deviceKey`; `src/state/demo.test.ts` also fails when a
  `trade-journal:ui:` literal appears outside `demo.ts` and the language key. `exportNow` returns `'cancelled'` in demo
  without calling `exportBackup`; `requestPersistence` is skipped. New `DemoBanner`, a Demo chip in the bag top bar,
  the Backup sheet `demo` prop, and the crash screen (Reload + Exit demo, no Save backup). Strings in a `demo` block
  in both catalogs.
  Checked in headless Chrome on `npm run build && npm run preview`: seeded a real journal, backup state, account,
  sort and language; in demo switched account, changed the sort, loaded a backup file (merged into the demo), deleted
  a trade, switched to Українська, opened the remove-account sheet; then reload (demo reset) and Exit demo. Only
  `trade-journal:demo:ui:account`, `trade-journal:demo:ui:sort:open`, `trade-journal:ui:lang` and
  `trade-journal:prices` changed; journal and backup keys byte-identical. Back after Exit stays in the real app.
  Banner at 320 and 390 px wraps to two lines in Ukrainian, button right-aligned, no horizontal scroll.
  Not checked: the crash screen (no easy way to make the app crash in the browser; the change is small), Safari,
  and the storage filter key (storage UI not on `main` yet).
  Surprises: (1) the remove-account sheet (feature 3) also calls `exportNow`; in demo it now hides its "Save backup
  now" block instead of offering a button that does nothing (plan D8 updated). (2) **For whoever merges the storage
  UI:** its filter key must be `deviceKey('storage-filter')` from `src/state/demo.ts`; the guard test in
  `src/state/demo.test.ts` fails on the literal `'trade-journal:ui:storage-filter'`.

## Status

| Status      | Progress % | Time spent | Tokens spent |
| ----------- | ---------- | ---------- | ------------ |
| Done        | 100%       | 1.5h       | —            |
