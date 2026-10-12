# 02 — Catalogue module and logo pipeline

> **Depends on:** 01 · **Spec refs:** [plan §3 D4, D8, D9, defaults "Logo sources", "Icon look"; §6 seams (catalogue.ts,
> resolve.ts); §6.4; §7; §8.5, 8.9; §9 rows "A brand may ask to remove its logo", "Precache grows", "Dark brand
> colours"](../plan.md), [catalogue.md](../catalogue.md) · **Estimate:** 1.5 days

## Goal

The app knows every predefined storage from [catalogue.md](../catalogue.md), has a committed square logo tile for each
one that has a usable logo source, and can draw any storage (predefined or custom) as an icon — logo or letter badge —
offline.

## Context to load

- [catalogue.md](../catalogue.md): the tables (id, name, kind, colour, icon source) and the "How to add a storage"
  section. **The catalogue file is the source of truth for ids, names and colours.**
- [plan §6.4](../plan.md): the pipeline, budget, `?no-inline` import and precache change.
- `vite.config.ts` (whole file; `workbox.globPatterns` is on line 39).
- `src/ui/icons.tsx` for the existing icon conventions (`aria-hidden`, sizes).
- `src/ui/styles.css:1-70` for the colour tokens (`--sep`, dark mode block).
- Task 01's `src/domain/storages.ts` (`contrastRatio`, `CUSTOM_ID_PREFIX`, `StorageKind`).

## Scope

**In:**

- devDependencies, exact versions: `simple-icons@16.35.0`, `@web3icons/core@4.0.58` (or newer; then re-check every slug
  in the catalogue still exists and update catalogue.md).
- `scripts/storage-icons.mjs` and `npm run icons` (`"icons": "node scripts/storage-icons.mjs"`):
  - A source table inside the script: `id → { from: 'simple-icons', slug } | { from: 'web3icons', set: 'exchanges' |
    'wallets' | 'tokens' | 'networks', name } | { from: 'official', file }` (`official` covers both `KIT` and `REPO`
    rows), copied from the "Icon" column of catalogue.md.
  - Every row with an `SI`, `W3I`, `KIT` or `REPO` source gets a tile, also the 13 brands whose terms ask for
    permission first (plan D8, [parking lot 02-restricted-logos](../parking-lot/02-restricted-logos.md)). There is no
    "restricted" list. Removing one brand later is deleting its row from this table (plan §9).
  - Simple Icons: build a 24×24 tile (`<rect>` in the icon's hex + the glyph scaled to 70 % and centred, fill white or
    black by `contrastRatio`).
  - Web3 Icons: read the `background` variant string from `dist/svgs/<set>/background/<name>.svg.js`, make `id=` and
    `url(#…)` references unique by prefixing the storage id, drop `class` attributes.
  - Official: read `scripts/storage-icons/official/<id>.svg` (hand-added from the kit or repo URL in catalogue.md),
    same clean-up. Record the download URL and date in `NOTICE.md`.
  - Strip comments, metadata, `width`/`height` (keep `viewBox`), `<script>`, `on*=` attributes; fail loudly if any file
    is > 6 KB or the total is > 200 KB.
  - Write `src/storage-tags/icons/<id>.svg` and `src/storage-tags/icons/NOTICE.md` (id, source, source name/slug,
    licence, package version; the full MIT notice of Web3 Icons; the trademark sentence from plan §6.4).
- `src/storage-tags/catalogue.ts`: `PredefinedStorage[]` with every **live** row of catalogue.md, in catalogue order,
  including `aliases` where the catalogue lists old names.
- `src/storage-tags/icons.ts`: `iconUrl(id): string | null` from
  `import.meta.glob('./icons/*.svg', { eager: true, query: '?no-inline', import: 'default' })`. If `?no-inline` does not
  work with `import.meta.glob` in the installed Vite, use `build.assetsInlineLimit` as a callback that returns `false`
  for files under `src/storage-tags/icons/` and note it in the hand-off log.
- `src/storage-tags/resolve.ts`: `StorageInfo`, `storageLookup(journal)` (catalogue + live custom storages; tombstoned
  custom → `null`), `bagStorages(bag, lookup)`, `storageSearch(query, infos)` (case- and accent-insensitive match on
  name, id and aliases).
- `src/storage-tags/StorageIcon.tsx` (moved from `src/ui/`, see hand-off log): `<StorageIcon info size />`. Logo →
  `<img src alt="" width height decoding="async">`; `paper-backup` and `other-hardware` → a generic stroke icon (two
  icons in the same file, in the style of `src/ui/icons.tsx`: a sheet with a key, and a small device); no logo → letter badge (`<span>` with the first letter of the name, upper case, white or black by contrast on
  `info.colour`). Both are square with `border-radius: 22%` and an inset `1px var(--sep)` ring. `aria-hidden`; the
  caller provides the text.
- `vite.config.ts`: `globPatterns: ['**/*.{js,css,html}', 'assets/*.svg']`.
- `.storage-icon` styles in `src/storage-tags/storage-icon.css`, imported by `StorageIcon.tsx`.
- Tests: `src/storage-tags/catalogue.test.ts`, `src/storage-tags/resolve.test.ts`.

**Out:** where icons appear in the UI (tasks 03–05). Picking the 8 custom colours (task 01).

## Steps

1. Install the two devDependencies. Write the script with the Simple Icons and Web3 Icons sources first; run it; look at
   every tile in a scratch HTML page in light and dark mode.
2. Hand-add the SVGs of the `KIT` and `REPO` rows (download from the URL in the Notes column; keep the brand's own
   colours; respect the notes column). For each "Check" row, compare the Web3 Icons tile with the brand's current logo
   and switch to `KIT` or `LETTER` when they differ. Replace each `#5b5b60` placeholder colour with the colour from the
   kit or favicon, and mark its source. Where a kit cannot be reached or has no usable SVG, switch that
   row to `LETTER` in catalogue.md and add a parking-lot file only if the owner must decide. Terms that ask for
   permission are **not** a reason to switch (plan D8).
3. Write `catalogue.ts` from the tables, then `icons.ts`, `resolve.ts`, `StorageIcon.tsx`.
4. Change `globPatterns`; build; check `dist/sw.js` lists the `assets/*.svg` files.

## Acceptance criteria

- [x] `catalogue.ts` has exactly the live rows of catalogue.md (same ids, names, kinds, colours). Test: ids are unique,
      match `^[a-z0-9]+(-[a-z0-9]+)*$`, never start with `custom-`; colours match `^#[0-9a-f]{6}$`; every kind is one of
      `cex`, `dex`, `hot`, `cold`.
- [x] Test: every file in `src/storage-tags/icons/*.svg` is named after a catalogue id; each is ≤ 6 KB; the total is
      ≤ 200 KB; no file contains `<script`, `on[a-z]+=` or `href="http`.
- [x] `npm run icons` is repeatable: running it twice gives no git diff.
- [x] `NOTICE.md` lists every icon file with its source and licence and contains the Web3 Icons MIT notice.
- [x] A tile exists for every catalogue row whose icon source is `SI`, `W3I`, `KIT` or `REPO`, including Ledger, Trezor
      and the other brands named in plan D8 (test compares the files with the source table of the script).
- [x] The "Icon licensing summary" table in catalogue.md matches the files that were really produced.
- [x] `storageLookup` returns `null` for an unknown id and for a tombstoned custom storage; `bagStorages` drops unknown
      ids and keeps order (tests).
- [x] `storageSearch('huobi')` finds HTX; `storageSearch('LEDG')` finds Ledger; an empty query returns everything
      (tests; use the actual aliases from catalogue.md).
- [x] `npm run build`: the main JS chunk grows by less than 25 KB (the catalogue data), not by the logos. Note the
      before/after sizes in the hand-off log.
- [x] `dist/sw.js` precache manifest contains the logo files (`grep -c 'assets/.*\.svg' dist/sw.js` ≥ number of icon
      files). Checked with a temporary import (no screen uses the icons before task 03): 95 entries for 97 files,
      because two pairs have the same content and Vite emits one file each (Binance / Binance Wallet,
      Uniswap / Uniswap Wallet).
- [x] Manual: a scratch page (not committed) or the dev tools shows every tile at 18 px and 28 px, light and dark; dark
      tiles (OKX, Trezor) have a visible edge. Done for the 97 logo tiles (headless Chrome screenshot). Letter badges
      and the two generic icons are drawn by React and are seen for the first time in task 03.
- [x] `npm test`, `npm run typecheck` and `npm run build` pass.

## Verification

```sh
npm run icons && git status --short src/storage-tags/icons   # second run: no changes
npm test
npm run typecheck
npm run build
ls dist/assets/*.svg | wc -l
grep -o 'assets/[^"]*\.svg' dist/sw.js | wc -l
```

Offline check: `npm run build && npm run preview`, open the app once, then turn the network off in dev tools and reload:
logos still show (after task 05 they are visible in the list; before that, check the Cache Storage entries).

## Hand-off log

_(Append a dated entry before you stop, even mid-task: what is done, what is next, surprises.)_

- **2026-10-12** — Done, on a branch built in parallel with features #2–#4 (so no edits in `src/ui/`).
  - **97 logo tiles** (plan expected 101): Simple Icons 11, Web3 Icons 45, brand kits 37 (including official site
    files where no kit is online), project repositories 4. 35 letter badges, 2 generic icons. 134,412 bytes in total;
    the largest file is `curve.svg` (6,100 bytes). catalogue.md has the per-row details and a "Changes made in task 02"
    list; its summary table matches the files.
  - Every kit and repository file was downloaded by hand into `scripts/storage-icons/official/` (the source table in
    the script records each URL). Four rows fell back to `LETTER` (Sparrow, SeedSigner, COLDCARD, Bitstamp) and the
    placeholder colours were replaced (parking lot
    [02-letter-badge-fallbacks](../parking-lot/02-letter-badge-fallbacks.md)). Kit rules that a small tile cannot
    meet: [02-kit-rules-at-small-size](../parking-lot/02-kit-rules-at-small-size.md).
  - Script options beyond the plan: `background` (swap a W3I tile colour where only the colour changed: Kraken,
    Gemini), `viewBox` (show only the symbol of a symbol + wordmark file), `scale`, `places` (decimals; Curve uses 1 to
    fit 6 KB), `bg: null` (the file already is a full tile). `<style>` rules become attributes; `@media` rules are
    dropped (Nexo's icon turns light in dark mode, which a tile with its own background must not do). `xlink:href`
    becomes `href`. Every tile passes `xmllint`.
  - `?no-inline` works with `import.meta.glob` in Vite 8 (checked with ctx7); no `assetsInlineLimit` callback needed.
  - **Moved out of `src/ui/`:** `StorageIcon.tsx`, its CSS (`storage-icon.css`) and the two generic icons live in
    `src/storage-tags/`, so this branch does not touch files the i18n work rewrites. `textColour` and `badgeLetter`
    are in `resolve.ts` (pure, tested). `StorageInfo` has an `aliases` field and there is a `storageList(journal)`
    helper for the picker. Plan §6 and task 03 updated.
  - Main JS chunk: 277.27 kB before, 294.43 kB with a temporary import of `storageList` and `StorageIcon` (+17.2 kB,
    the catalogue data). The logos stay separate files. Without that import, nothing uses the new code yet, so the
    build is unchanged until task 03.
  - README: the trademark sentence and a link to `NOTICE.md` under "Licence".
  - Tests: 205 → 221 (`catalogue.test.ts` reads catalogue.md and the script's source table; `resolve.test.ts`).
  - Next: task 03. It must import `StorageIcon` from `src/storage-tags/StorageIcon.tsx`.

## Status

| Status      | Progress % | Time spent | Tokens spent |
| ----------- | ---------- | ---------- | ------------ |
| Done        | 100%       | 3h         | —            |
