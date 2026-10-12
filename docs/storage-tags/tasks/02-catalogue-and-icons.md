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
- `src/ui/StorageIcon.tsx`: `<StorageIcon info size />`. Logo → `<img src alt="" width height decoding="async">`;
  `paper-backup` and `other-hardware` → a generic stroke icon (two new icons in `src/ui/icons.tsx`: a sheet with a key,
  and a small device); no logo → letter badge (`<span>` with the first letter of the name, upper case, white or black by contrast on
  `info.colour`). Both are square with `border-radius: 22%` and an inset `1px var(--sep)` ring. `aria-hidden`; the
  caller provides the text.
- `vite.config.ts`: `globPatterns: ['**/*.{js,css,html}', 'assets/*.svg']`.
- `.storage-icon` styles in `src/ui/styles.css`.
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

- [ ] `catalogue.ts` has exactly the live rows of catalogue.md (same ids, names, kinds, colours). Test: ids are unique,
      match `^[a-z0-9]+(-[a-z0-9]+)*$`, never start with `custom-`; colours match `^#[0-9a-f]{6}$`; every kind is one of
      `cex`, `dex`, `hot`, `cold`.
- [ ] Test: every file in `src/storage-tags/icons/*.svg` is named after a catalogue id; each is ≤ 6 KB; the total is
      ≤ 200 KB; no file contains `<script`, `on[a-z]+=` or `href="http`.
- [ ] `npm run icons` is repeatable: running it twice gives no git diff.
- [ ] `NOTICE.md` lists every icon file with its source and licence and contains the Web3 Icons MIT notice.
- [ ] A tile exists for every catalogue row whose icon source is `SI`, `W3I`, `KIT` or `REPO`, including Ledger, Trezor
      and the other brands named in plan D8 (test compares the files with the source table of the script).
- [ ] The "Icon licensing summary" table in catalogue.md matches the files that were really produced.
- [ ] `storageLookup` returns `null` for an unknown id and for a tombstoned custom storage; `bagStorages` drops unknown
      ids and keeps order (tests).
- [ ] `storageSearch('huobi')` finds HTX; `storageSearch('LEDG')` finds Ledger; an empty query returns everything
      (tests; use the actual aliases from catalogue.md).
- [ ] `npm run build`: the main JS chunk grows by less than 25 KB (the catalogue data), not by the logos. Note the
      before/after sizes in the hand-off log.
- [ ] `dist/sw.js` precache manifest contains the logo files (`grep -c 'assets/.*\.svg' dist/sw.js` ≥ number of icon
      files).
- [ ] Manual: a scratch page (not committed) or the dev tools shows every tile at 18 px and 28 px, light and dark; dark
      tiles (OKX, Trezor) have a visible edge.
- [ ] `npm test`, `npm run typecheck` and `npm run build` pass.

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

## Status

| Status      | Progress % | Time spent | Tokens spent |
| ----------- | ---------- | ---------- | ------------ |
| Not started | 0%         | 0h         | 0            |
