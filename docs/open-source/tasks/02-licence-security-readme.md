# 02 — LICENSE, SECURITY.md and a README for strangers

> **Depends on:** 01 · **Spec refs:** [plan §2, §3 D2 D6 D7, §5, §6](../plan.md), [docs/README.md](../../README.md)
> G2, G7 · **Estimate:** 0.5 day

## Goal

A stranger who opens the repo understands in one minute what the app is, that it keeps data only in their browser,
how to install and try it, how to develop it, and that they may reuse it under MIT.

## Context to load

- [../plan.md](../plan.md) §5 (README wireframe) and §6 (the facts the README may use).
- `README.md` today: keep the "How data works" section, it is correct.
- `package.json`: has `"private": true` and no `license` field.
- `src/prices/index.ts:17` (CoinGecko API base), `:55` (coin search), `:121` (prices).
- `vite.config.ts` (`base: '/trade-journal/'`, CoinGecko calls are `NetworkOnly`).
- `src/storage/index.ts:9-12` (localStorage keys), `.gitignore` (`trades*.json`).
- `src/state/demo.ts:4-5` (`?demo` works only in `npm run dev` today).
- `CLAUDE.md` at the repo root: the commit rules (the README links to it).

## Scope

**In:**

- `LICENSE` (new), `SECURITY.md` (new), `README.md` (rewrite), `package.json` (`"license": "MIT"`).

**Out:**

- Real screenshots ([parking lot](../parking-lot/02-screenshots-source.md)); leave a commented placeholder.
- The live `?demo` link (feature 6 adds it; leave a placeholder sentence).
- GitHub settings (task 03).

## Steps

1. Check the commit identity: `git config --local user.email` must be
   `103412957+stanislavSav@users.noreply.github.com`, and `git config core.hooksPath` must be `.githooks` (rules in
   `CLAUDE.md`).
2. `LICENSE`: the standard MIT text (as on `https://choosealicense.com/licenses/mit/`) with the line
   `Copyright (c) 2026 Stanislav Savchuk`.
3. `package.json`: add `"license": "MIT"`. Keep `"private": true` (it only blocks `npm publish`).
4. `SECURITY.md`, short, plain English:
   - **Supported version:** only the latest `main`; the live app updates itself.
   - **How to report:** GitHub → Security tab → "Report a vulnerability" (private; task 03 turns it on). Please do not
     open a public issue for a security problem.
   - **Threat model (short):**
     - There is no server and no account. Your journal lives only in this browser's `localStorage` on this device.
       Anyone who can use your unlocked device and browser profile can read it.
     - The only network calls go to `api.coingecko.com` (prices and coin search). CoinGecko sees your IP address and
       which coins you look up, not your quantities or totals.
     - The backup `trades.json` is plain, not encrypted JSON with all your trades. Protect the file like a bank
       statement (for example, keep it in your private iCloud Drive; do not post it).
     - Load backup only reads files you pick; a broken or foreign file is rejected, not run.
     - In scope: anything that leaks journal data off the device or runs foreign code in the app. Out of scope:
       attacks that need an unlocked device, CoinGecko's own security.
5. `README.md`, sections in this order (see plan §5):
   1. `# Trade Journal` + one paragraph: a private crypto trade journal PWA; group buys and sells into bags, see average
      cost and realized / unrealized P/L, live prices from CoinGecko. Link to
      `https://stanislavsav.github.io/trade-journal/`.
   2. Screenshot placeholder as an HTML comment: `<!-- Screenshots: list, bag, add trade. Sample data only. -->`.
   3. `## Features`: bags with average cost; open and closed bags; live prices; backups that merge and never lose
      trades; works offline after the first visit; installs to the iPhone Home Screen.
   4. `## Privacy`: the four facts from the threat model above, in two or three sentences. Link to `SECURITY.md`.
   5. `## Install on iPhone`: open the live link in Safari → tap **Share** → **Add to Home Screen** → **Add**. On a
      desktop browser, the app works in a tab, or use the browser's install button if it shows one.
   6. `## Try it`: open the live app; your data stays on your device. Add the sentence "A demo link with sample data
      is coming." Feature 6 ([docs/demo-data/plan.md](../../demo-data/plan.md)) replaces this sentence with the
      `?demo` link.
   7. `## How data works`: today's section, unchanged.
   8. `## Develop`: today's commands plus `npm run typecheck`; `npm run dev` then open the printed URL with `?demo` for
      sample data (dev only today). Add "After cloning, run `git config core.hooksPath .githooks` once" and a link to
      the commit rules in [`CLAUDE.md`](../../../CLAUDE.md) at the repo root. Do not copy the rules into the README;
      link them, so there is one source.
   9. `## Deploy`: today's text, with the real URL `https://stanislavsav.github.io/trade-journal/` and "for a fork:
      `https://<your-user>.github.io/trade-journal/`".
   10. `## Licence`: "MIT, see LICENSE."
6. Read the README once as a stranger: no word that only the owner understands (no "CS" account, no iCloud folder
   name as a rule — keep the iCloud steps as an example).
7. Commit as one change ("Open source: MIT licence, security policy, README for strangers").

## Acceptance criteria

- [x] `LICENSE` is the MIT text with `Copyright (c) 2026 Stanislav Savchuk`; GitHub shows "MIT license" in the repo
      sidebar after the push.
- [x] `package.json` has `"license": "MIT"`.
- [x] `SECURITY.md` has the four parts: supported version, how to report, threat model, scope. GitHub shows
      "Security policy" in the sidebar.
- [x] `README.md` has the sections of step 5 in that order; every privacy claim matches plan §6 (no server, no
      tracking, only CoinGecko, plain-JSON backup).
- [x] No file contains the work email or the employer's domain
      (`git grep -niF "<work email domain>"` prints nothing).
- [x] The commit author is the noreply address (`git log -1 --format='%an <%ae>'`).
- [x] `npm test`, `npm run typecheck`, `npm run build` pass (no code changed, but CI runs them on push).

## Verification

```sh
npm test && npm run typecheck && npm run build
git log -1 --format='%an <%ae>'
head -3 LICENSE
grep -n '"license"' package.json
```

Manual: after the push, open `github.com/stanislavSav/trade-journal`: the README renders, the sidebar shows "MIT
license" and "Security policy", every link in the README opens.

## Hand-off log

_(Append a dated entry before you stop, even mid-task: what is done, what is next, surprises.)_

**2026-10-12 — done** in commit 45d2a00: LICENSE (MIT), SECURITY.md, README rewritten, `"license": "MIT"`. Tests (168), typecheck and build pass.

## Status

| Status      | Progress % | Time spent | Tokens spent |
| ----------- | ---------- | ---------- | ------------ |
| Done        | 100%       | —          | —            |
