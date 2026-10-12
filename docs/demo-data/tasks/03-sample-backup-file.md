# 03 — Sample backup file and service-worker rule

> **Depends on:** 01 · **Spec refs:** [plan §3 D11, D14–D16, §8](../plan.md) · **Estimate:** 0.5 day

## Goal

`public/sample-backup.json` exists, is generated from `demoJournal(DEMO_SAMPLE_DATE)`, loads cleanly with Load backup,
and a test fails when it drifts. Opening its URL on a device with the installed app downloads or shows the JSON, not
the app.

## Context to load

- [plan §3 D11, D14–D16](../plan.md).
- `src/state/demoData.ts` (task 01) — `demoJournal`, `DEMO_SAMPLE_DATE`.
- `src/storage/index.ts:122-123` — the backup file format (`JSON.stringify(journal, null, 2)`).
- `src/domain/journal.ts` — `parseJournal`, `mergeJournals`.
- `src/state/mergeCounts.ts` — `countMergedTrades`.
- `vite.config.ts:35-48` — the `workbox` options (`globPatterns`, `navigateFallback`).
- `.gitignore` — `trades*.json`.
- Vitest docs: `expect(…).toMatchFileSnapshot(path)` (async, path relative to the test file; `-u` updates; in CI it
  never writes and fails on mismatch).

## Scope

**In:**

- `src/state/sampleBackup.test.ts`:
  - `const text = JSON.stringify(demoJournal(DEMO_SAMPLE_DATE), null, 2) + '\n'`
  - `await expect(text).toMatchFileSnapshot('../../public/sample-backup.json')`
  - the file parses with `parseJournal` and nothing is dropped (`parseJournal(json)` equals `json`; checked against
    the file alone, so the test still passes during the `-u` run that rewrites it);
  - **merge safety**: merging the sample into `emptyJournal()` and then merging it again gives
    `countMergedTrades(...)` = `{ added: 0, updated: 0 }` on the second merge, and the result still has the `cs`
    account untouched;
  - none of the sample's account ids collide with `cs`.
- Generate the file once with `npm test -- -u`; commit it.
- `vite.config.ts`: add `navigateFallbackDenylist: [/\/sample-backup\.json$/]` to `workbox`.
- Confirm in `dist/` after `npm run build` that the file is in `dist/sample-backup.json` and **not** listed in the
  precache manifest inside `dist/sw.js`.

**Out:** README text (task 04).

## Steps

1. Write the test; run `npm test -- -u` to create the file; run `npm test` again (green, no write).
2. Change one number in `demoData.ts`, run `npm test` → it fails; revert.
3. Add the denylist; build; check `dist/sw.js` (search for `sample-backup` — it must appear only in the denylist
   regex, not in the precache list).
4. `npm run preview`: load the app once (service worker installs), then open
   `http://localhost:4173/trade-journal/sample-backup.json` in the address bar → the JSON shows, not the app.
5. In a private window: open the preview app, Backup → Load backup → pick `public/sample-backup.json` → toast
   "Merged: N new, 0 updated"; load it again → "Merged: 0 new, 0 updated".

## Acceptance criteria

- [x] `public/sample-backup.json` is committed and `git check-ignore public/sample-backup.json` prints nothing.
- [x] `npm test` fails when the demo data changes without `-u`, and passes after `npm test -- -u`.
- [x] `CI=true npm test` does not write the file (check `git status` after a forced mismatch).
- [x] The sample file is not in the precache list; the denylist is in `dist/sw.js`.
- [x] With the service worker active, the sample URL shows the JSON.
- [x] Loading the sample twice in a fresh browser adds the trades once; the second load reports 0 new, 0 updated.

## Verification

```sh
npm test
npm run typecheck
npm run build
npm run preview
```

Manual: steps 4 and 5 above.

## Hand-off log

_(Append a dated entry before you stop, even mid-task: what is done, what is next, surprises.)_

- **2026-10-12** — Done. `src/state/sampleBackup.test.ts` (4 tests) keeps `public/sample-backup.json` (13.6 KB,
  37 trades) in step with `demoJournal(DEMO_SAMPLE_DATE)`. Checked: a changed number fails `npm test` and
  `CI=true npm test` (and CI leaves the file unchanged: `git diff` empty); `npm test -- -u` rewrites it.
  `vite.config.ts` has `navigateFallbackDenylist: [/\/sample-backup\.json$/]`; `dist/sw.js` has the regex and no
  `sample-backup` precache entry (10 entries, as before). In headless Chrome on `npm run preview` with the service
  worker in control: `/trade-journal/sample-backup.json` shows the JSON (`application/json`, same bytes as the repo
  file); other in-scope URLs still get the app. A fresh profile: Load backup → "Merged: 37 new, 0 updated", again →
  "Merged: 0 new, 0 updated"; tabs CS, Demo, Demo Family, Demo Swing.
  Surprise: the first draft compared the parsed file with the current demo journal; that would fail during the `-u`
  run after a data change, so the parse test now checks the file on its own.

## Status

| Status      | Progress % | Time spent | Tokens spent |
| ----------- | ---------- | ---------- | ------------ |
| Done        | 100%       | 0.5h       | —            |
