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

- [ ] The gear button shows in the header on every account and in the empty state; it opens the Settings sheet.
- [ ] Tapping `Українська` switches the sheet title, the header labels and `<html lang>` to Ukrainian at once, without
      a reload; the sheet stays open.
- [ ] After a reload the chosen language stays; `trade-journal:ui:lang` holds `"uk"` or `"en"`.
- [ ] The device-language hint shows on first use and disappears after a choice.
- [ ] About shows `0.1.0` (the `package.json` version), and both links open the right GitHub pages in a new tab.
- [ ] Keyboard: Tab reaches both language options and both links; Escape closes the sheet; focus returns to the gear.
- [ ] Screen reader (VoiceOver): the gear is read as "Settings" / "Налаштування"; the language options are read as
      radio buttons with their checked state.
- [ ] At 320 px width the header still shows the gear and the Backup button without overlap.

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

## Status

| Status      | Progress % | Time spent | Tokens spent |
| ----------- | ---------- | ---------- | ------------ |
| Not started | 0%         | 0h         | 0            |
