# 02 — Settings sheet: gear button, Language, About

> **Depends on:** 01 · **Spec refs:** [plan §3 D7, §5 wireframes, defaults (version)](../plan.md) · **Estimate:** 1 day

## Goal

A gear button in the header opens a Settings sheet. The user can switch between English and Українська and the whole
app follows at once. The About section shows the version, the GitHub link, the MIT licence and that data stays on the
device.

## Context to load

- [plan §5.1–5.3](../plan.md) — wireframes (the contract).
- `src/ui/Header.tsx` — the header (account bar + Backup button, lines 14-52).
- `src/ui/JournalApp.tsx:32-37,188-203` — `SheetState` and how the Backup and Account sheets open.
- `src/ui/Sheet.tsx` — the sheet component (title, Close, focus handling).
- `src/ui/BagList.tsx:24-40` and the `.segmented` CSS in `src/ui/styles.css` — reuse for the language switch.
- `src/ui/icons.tsx` — add a gear icon in the same style (inline SVG, `currentColor`).
- `vite.config.ts` and `package.json` (`"version": "0.1.0"`).
- [docs/open-source/plan.md](../../open-source/plan.md) — feature 1 adds `LICENSE`; the licence link points to it.

## Scope

**In:**

- `GearIcon` in `src/ui/icons.tsx`.
- `Header`: new prop `onSettings`; an `icon-btn` with the gear, `aria-label={t.header.settings}`, between the account
  bar and Backup.
- `SheetState` gets `{ kind: 'settings' }`.
- `src/ui/SettingsSheet.tsx`:
  - **Language**: a segmented control with `role="radiogroup"`; options `English` and `Українська` (each in its own
    language, from a constant, not from the catalog). `aria-checked` on the active one. Tap calls `setLang`. The hint
    "Until you choose, the app follows the language of this device." shows only while `chosen` is false.
  - **About**: app name, version, the privacy line, two links (`https://github.com/stanislavSav/trade-journal` and
    `https://github.com/stanislavSav/trade-journal/blob/main/LICENSE`), `target="_blank"` and `rel="noopener noreferrer"`.
  - Leave a clear place between Language and About where feature 3 adds the Accounts section (order: Language,
    Accounts, About; see docs/account-removal/plan.md).
- Version: `define: { __APP_VERSION__: JSON.stringify(<version from package.json>) }` in `vite.config.ts`, declared in
  `src/vite-env.d.ts` (create it if missing) as `declare const __APP_VERSION__: string`. Read `package.json` in the
  config with `fs` or a JSON import, whichever the type check accepts.
- All new strings in `en.ts` **and** `uk.ts` (`settings.*`, `header.settings`). Use the Ukrainian wording from plan
  §5.3 (owner reviews it in task 05).
- CSS for the sheet sections in `src/ui/styles.css`, reusing `.card`, `.segmented`, `.help`.

**Out:** translating the rest of the app (task 04). Account removal (feature 3).

## Steps

1. Add the icon, the header button and the sheet state.
2. Build `SettingsSheet` with the two sections.
3. Add `__APP_VERSION__`.
4. Add the strings to both catalogs; run the catalog test.
5. Check by hand in both languages at 320 px and 390 px width.

## Acceptance criteria

- [x] The gear button shows in the header on every account and in the empty state; it opens the Settings sheet.
- [x] Tapping `Українська` switches the sheet title, the header labels and `<html lang>` to Ukrainian at once, without
      a reload; the sheet stays open.
- [x] After a reload the chosen language stays; `trade-journal:ui:lang` holds `"uk"` or `"en"`.
- [x] The device-language hint shows on first use and disappears after a choice.
- [x] About shows `0.1.0` (the `package.json` version), and both links open the right GitHub pages in a new tab.
- [x] Keyboard: Tab reaches both language options and both links; Escape closes the sheet; focus returns to the gear.
- [x] Screen reader (VoiceOver): the gear is read as "Settings" / "Налаштування"; the language options are read as
      radio buttons with their checked state. _(Checked in the Chrome accessibility tree; the VoiceOver pass on an
      iPhone is part of task 05.)_
- [x] At 320 px width the header still shows the gear and the Backup button without overlap.

## Verification

```sh
npm test
npm run typecheck
npm run build
```

Manual: `npm run dev`; open Settings; switch the language both ways; reload; check Local Storage; check at 320 px
(DevTools device toolbar) and on an iPhone in Safari.

## Hand-off log

_(Append a dated entry before you stop, even mid-task: what is done, what is next, surprises.)_

- **2026-10-12** — Done. `GearIcon`, the gear `icon-btn` in `Header` (between the account bar and Backup), sheet
  state `{ kind: 'settings' }`, and `src/ui/SettingsSheet.tsx` with Language and About. `__APP_VERSION__` comes from
  `package.json` through `define` in `vite.config.ts` (read with `fs`), declared in `src/vite-env.d.ts`.
  - The criterion "the header labels switch" needs the header in the catalog, so `Header.tsx` and the `Close` button
    of `Sheet.tsx` are translated here already (`header.*`, `common.close`). Task 04 does not need to touch them.
  - The language buttons have `lang="en"` / `lang="uk"`, so a screen reader says each name in its own voice. The
    radiogroup uses `aria-label` (not the upper-case section title) for its name. The links carry a hidden
    "(opens in a new tab)".
  - `.segmented` CSS now also matches `[role='radio']` / `[aria-checked='true']`.
  - A comment in `SettingsSheet.tsx` marks where feature 3 adds the Accounts section.
  - Checked in headless Chrome at 320 px and 390 px: the switch changes the sheet, the header labels and
    `<html lang>` at once, the sheet stays open, the key holds `"uk"` after a reload, the hint disappears after a
    choice, Escape closes and focus returns to the gear, Tab reaches both options and both links. At 320 px the header
    has no overlap (the account tabs scroll, as before). Not yet checked on a real iPhone (task 05).
  - Next: task 03.

## Status

| Status      | Progress % | Time spent | Tokens spent |
| ----------- | ---------- | ---------- | ------------ |
| Done        | 100%       | 1h         | —            |
