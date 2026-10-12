# 04 — README "How to test" and device checks

> **Depends on:** 02, 03 · **Spec refs:** [plan §3 D17, D18, D20, §9, §10](../plan.md) · **Estimate:** 0.5 day

## Goal

A person who gets the repo link or a message from the owner knows two safe ways to try the app, and the owner has
checked both on real devices.

## Context to load

- [plan §3 D17, D18, D20](../plan.md).
- `README.md` — after feature 1 it has a "Try it" section (`docs/open-source/plan.md` §5 wireframe) and "How data
  works".
- `docs/account-removal/plan.md` — how a tester removes the `Demo…` accounts after loading the sample.
- Parking lot: [iOS home screen](../parking-lot/04-ios-home-screen-from-demo.md),
  [lang parameter](../parking-lot/04-lang-url-parameter.md).

## Scope

**In:**

- README "How to test" (inside or right after "Try it"):
  - **Try the demo**: `https://stanislavsav.github.io/trade-journal/?demo` — sample data, nothing is saved, your own
    data is not touched, Exit demo returns to your app.
  - **Test backups with the sample file**: download
    `https://stanislavsav.github.io/trade-journal/sample-backup.json` (or from GitHub:
    `https://github.com/stanislavSav/trade-journal/blob/main/public/sample-backup.json` → "Download raw file"), then
    Backup → Load backup.
  - A clear warning: **Loading the sample file merges it into the data in that browser.** Use a private window, a
    test device, or the demo link. To remove it: Settings → Accounts → remove `Demo`, `Demo Family`, `Demo Swing`.
  - One line for developers: the sample file is generated; run `npm test -- -u` after changing
    `src/state/demoData.ts`.
- A short text the owner can paste into Telegram (EN and UK), kept in the task's hand-off log, not in the repo.
- Device checks (below); record results in the parking-lot items.

**Out:** screenshots (feature 1's parking lot decides); in-app entry points (parked).

## Steps

1. Write the README section.
2. Device checks on the live site after deploy:
   - iPhone Safari: open `?demo`, use it, Exit demo. Then open `?demo` again and Share → Add to Home Screen; open the
     icon: does it start in demo or in the real app? Record in
     [04-ios-home-screen-from-demo.md](../parking-lot/04-ios-home-screen-from-demo.md).
   - Android Chrome (if available) or desktop Chrome: install from the `?demo` page; the installed app opens the real
     app (manifest `start_url`).
   - Offline: open the app once online, switch to airplane mode, open `?demo` → the demo loads (prices: cached or
     "no prices yet").
   - Sample file: download it on the iPhone (Files app) and load it in a private Safari tab.
3. Update plan status to `Shipped` and the board.

## Acceptance criteria

- [ ] README has the two routes, the merge warning and the removal hint; links work on the live site.
- [ ] The iOS home-screen result is recorded in the parking lot.
- [ ] Offline `?demo` works on the iPhone.
- [ ] The sample file downloads and loads on the iPhone.
- [ ] Plan status `Shipped`; board all `Done`.

## Verification

```sh
npm test
npm run typecheck
npm run build
```

Manual: the device checks in step 2.

## Hand-off log

_(Append a dated entry before you stop, even mid-task: what is done, what is next, surprises.)_

## Status

| Status      | Progress % | Time spent | Tokens spent |
| ----------- | ---------- | ---------- | ------------ |
| Not started | 0%         | 0h         | 0            |
