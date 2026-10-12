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
  - the file parses with `parseJournal`;
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

- [ ] `public/sample-backup.json` is committed and `git check-ignore public/sample-backup.json` prints nothing.
- [ ] `npm test` fails when the demo data changes without `-u`, and passes after `npm test -- -u`.
- [ ] `CI=true npm test` does not write the file (check `git status` after a forced mismatch).
- [ ] The sample file is not in the precache list; the denylist is in `dist/sw.js`.
- [ ] With the service worker active, the sample URL shows the JSON.
- [ ] Loading the sample twice in a fresh browser adds the trades once; the second load reports 0 new, 0 updated.

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

## Status

| Status      | Progress % | Time spent | Tokens spent |
| ----------- | ---------- | ---------- | ------------ |
| Not started | 0%         | 0h         | 0            |
