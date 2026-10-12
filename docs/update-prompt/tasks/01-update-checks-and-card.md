# 01 — Background checks, update card, build id

> **Depends on:** — · **Spec refs:** [plan §3–§6](../plan.md) · **Estimate:** 0.5 day

## Goal

The app finds a new version without a restart and tells the user with a card that has a **Refresh** button.
Settings → About shows which build is running.

## Context to load

- [../plan.md](../plan.md) (all of it; it is short).
- `src/main.tsx` (service-worker registration), `vite.config.ts` (`VitePWA`, `define`), `src/vite-env.d.ts`.
- `node_modules/vite-plugin-pwa/dist/client/build/register.js`: the auto-update branch calls `onNeedReload` when given.
- `src/ui/Toast.tsx` and `.toast-region` in `src/ui/styles.css` (portal and position to follow).
- `src/ui/SettingsSheet.tsx` (About section), `src/i18n/en.ts` / `uk.ts`.

## Scope

**In:** `src/pwa/updates.ts` (+ test), `src/ui/UpdateBanner.tsx`, `src/main.tsx`, `src/ui/App.tsx` or `JournalApp.tsx`
(mount the banner), `src/ui/SettingsSheet.tsx`, `src/ui/styles.css`, `vite.config.ts`, `src/vite-env.d.ts`, i18n.

**Out:** release notes (plan §2).

## Steps

1. `vite.config.ts`: add `__APP_BUILD__` (short commit id + ISO date); declare it in `src/vite-env.d.ts`.
2. `src/pwa/updates.ts`: `shouldCheck`, the store, `startUpdateChecks()` with `onNeedReload` and the triggers from plan
   D2, and `checkForUpdates()` that returns `'latest' | 'downloading' | 'offline' | 'unsupported'`.
3. `src/main.tsx`: call `startUpdateChecks()`.
4. `UpdateBanner`: portal card, slide-up transition, Refresh (`location.reload()`) and Later.
5. Settings → About: build line; Check for updates row that shows a toast with the result.
6. Strings in EN and UK.
7. Tests for `shouldCheck` and the store; `npm test`, `npm run typecheck`, `npm run build`.

## Acceptance criteria

- [x] `registerType` stays `autoUpdate`; the new client never reloads by itself, it shows the card (`onNeedReload`).
- [x] A check runs on start, on `visibilitychange` → visible, on `online` and every 30 min while visible; never more
      than once per 60 s; never while offline.
- [x] The card slides up over sheets, in EN and UK, with Refresh and Later; reduced motion turns the animation off.
- [x] Settings → About shows `Build <date> · <sha>` and a Check for updates row with a result toast.
- [x] `npm test`, `npm run typecheck`, `npm run build` pass.

## Verification

```sh
npm test && npm run typecheck && npm run build
```

Manual: `npm run build && npm run preview`, open the app, change a string, build again, focus the tab again: the card
slides up; Refresh shows the new text. On the iPhone after the deploy: open the app, wait, the card appears.

## Hand-off log

_(Append a dated entry before you stop, even mid-task: what is done, what is next, surprises.)_

**2026-10-12 — done.** Found the real cause of the stuck iPhone while testing: without `injectRegister: 'auto'`,
vite-plugin-pwa does not set `skipWaiting`/`clientsClaim`, so new workers waited forever (plan D1). Set both in
`vite.config.ts`. Added `src/pwa/updates.ts` + `updateState.ts` (+ test), `UpdateBanner`, Settings → About build link
and Check for updates, EN/UK strings. Verified in headless Chrome with two local builds served by a static server: a
waiting worker from an older build was replaced by the next build after a "visibilitychange"; the card slid up (EN/UK,
light/dark, over the Settings sheet); Refresh loaded the new build id; Check for updates showed "latest". Owner check
left: the iPhone after the deploy.

**2026-10-12 — owner follow-up (plan D8).** Added the **What changed** link (card and Settings → About; GitHub compare
from the running commit to `main`, `src/pwa/changes.ts` + test) and the README section "Updates and your own copy"
(fork at a checked commit, own GitHub Pages, Sync fork after reading the compare page). Checked in headless Chrome: the
card with the link over Settings in dark mode; the Settings link points to `compare/<commit>...main`.

## Status

| Status      | Progress % | Time spent | Tokens spent |
| ----------- | ---------- | ---------- | ------------ |
| Done        | 100%       | —          | —            |
