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

- [x] README has the two routes, the merge warning and the removal hint. The live links work only after the owner
      pushes and the deploy runs; on `npm run preview` both URLs work (`?demo` and `sample-backup.json`).
- [ ] The iOS home-screen result is recorded in the parking lot. **Owner, on an iPhone** (needs the deployed site).
- [ ] Offline `?demo` works on the iPhone. **Owner, on an iPhone.** Checked in desktop headless Chrome: with the
      service worker installed and the network off, `?demo` loads with cached prices.
- [ ] The sample file downloads and loads on the iPhone. **Owner, on an iPhone.** Checked in desktop headless Chrome
      (download URL, Load backup twice, remove the Demo accounts in Settings).
- [x] Plan status `Shipped`; board all `Done`.

## Verification

```sh
npm test
npm run typecheck
npm run build
```

Manual: the device checks in step 2.

## Hand-off log

_(Append a dated entry before you stop, even mid-task: what is done, what is next, surprises.)_

- **2026-10-12** — Done, except the iPhone checks, which need the owner and the deployed site. README "Try it" now
  has the demo link, the sample file (site and GitHub), the merge warning and how to remove the `Demo…` accounts; the
  "Develop" section says to run `npm test -- -u` after changing `src/state/demoData.ts`.
  Checked in headless Chrome on `npm run preview`: the manifest `start_url` is `/trade-journal/` (no `?demo`, so a
  Chrome install opens the real app); offline `?demo` loads from the service worker with cached prices; after loading
  the sample, Settings → Accounts removes `Demo Swing`.
  **Owner, after the deploy:** the iPhone steps in step 2 (Safari demo + Exit demo, Add to Home Screen from `?demo` →
  record in [04-ios-home-screen-from-demo.md](../parking-lot/04-ios-home-screen-from-demo.md), offline `?demo`, the
  sample file from the Files app in a private tab). Also check the storage chips in the demo when the storage-tags UI
  is on `main`.

  Text for Telegram (English):

  > Want to try my trade journal? Two safe ways:
  > 1. Demo with sample data, nothing is saved and your own data is not touched:
  >    https://stanislavsav.github.io/trade-journal/?demo
  > 2. To test backups: download https://stanislavsav.github.io/trade-journal/sample-backup.json and load it with
  >    Backup → Load backup. It merges into the data in that browser, so use a private window.

  Text for Telegram (Ukrainian):

  > Хочете спробувати мій журнал угод? Є два безпечні способи:
  > 1. Демо з прикладом даних: нічого не зберігається, Ваші власні дані не змінюються:
  >    https://stanislavsav.github.io/trade-journal/?demo
  > 2. Щоб перевірити резервні копії: завантажте https://stanislavsav.github.io/trade-journal/sample-backup.json і
  >    відкрийте його через «Бекап → Завантажити копію». Файл об’єднається з даними в цьому браузері, тому
  >    відкрийте застосунок у приватному вікні.

## Status

| Status      | Progress % | Time spent | Tokens spent |
| ----------- | ---------- | ---------- | ------------ |
| Done        | 100%       | 0.5h       | —            |
