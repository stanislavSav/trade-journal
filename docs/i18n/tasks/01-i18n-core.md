# 01 — i18n core: catalogs, plurals, detection, `useT`

> **Depends on:** — · **Spec refs:** [plan §3 D2–D6, D15](../plan.md), [plan §6](../plan.md) · **Estimate:** 1 day

## Goal

The app has a working, typed translation layer: `useT()` returns the messages of the active language, the language
comes from the stored choice or the device, and `<html lang>` follows it. No visible text changes yet.

## Context to load

- [plan §3 and §6](../plan.md) — decisions D2–D6, D15 and the catalog layout.
- `src/ui/App.tsx` — where the provider goes (around `ErrorBoundary`).
- `src/state/useStoredString.ts` — guarded `localStorage` access; reuse it for `trade-journal:ui:lang`.
- `src/ui/JournalApp.tsx:44` — an existing device preference (`trade-journal:ui:account`), same pattern.
- `vite.config.ts:49-53` — tests run in Node (`environment: 'node'`).

## Scope

**In:**

- `src/i18n/types.ts`: `export type Lang = 'en' | 'uk'`, `export const LANGS: Lang[]`.
- `src/i18n/plural.ts`: `pluralEn({ one, other })` and `pluralUk({ one, few, many, other })`. Each returns
  `(n: number) => string`. The forms are functions of `n` or strings with the number added by the caller — pick one
  style and use it everywhere. Use `new Intl.PluralRules('en' | 'uk')`, created once per module.
- `src/i18n/en.ts`: `export const en = { … }` (no `as const`, so values widen to `string`) and
  `export type Messages = typeof en`. Start with the groups from plan §6 and only the few keys this task needs
  (`common.close`, one plural example). Task 04 fills the rest.
- `src/i18n/uk.ts`: `export const uk: Messages = { … }` with the same keys.
- `src/i18n/detect.ts`: `detectLanguage(languages: readonly string[]): Lang` (pure) — the first entry starting with
  `uk` gives `'uk'`, the first starting with `en` gives `'en'`, else `'en'`. Case-insensitive. Plus
  `parseStoredLang(value: string | null): Lang | null`.
- `src/i18n/I18nProvider.tsx`: context `{ lang, t, setLang, chosen }` where `chosen` is true when a stored value exists.
  - Stored value from `useStoredString('trade-journal:ui:lang')`; if it is not `'en'`/`'uk'`, use
    `detectLanguage(navigator.languages ?? [navigator.language])`.
  - `setLang` writes the key (only on an explicit choice, D6).
  - Sets `document.documentElement.lang` during the first render (before paint) and on every change.
- `src/i18n/index.ts`: exports `useT()`, `useLang()`, `I18nProvider`, `Lang`, `Messages`.
- `src/ui/App.tsx`: `<I18nProvider><ErrorBoundary><JournalApp/></ErrorBoundary></I18nProvider>`.
- `src/i18n/catalog.test.ts`, `src/i18n/plural.test.ts`, `src/i18n/detect.test.ts`.

**Out:** the Settings sheet (task 02); error codes (task 03); moving the UI strings (task 04).

## Steps

1. Write `plural.test.ts` first: for Ukrainian, `1 → one`, `2,3,4 → few`, `5…20 → many`, `21 → one`, `22 → few`,
   `11,12,14 → many`, `0 → many`; for English `1 → one`, `0, 2 → other`.
2. Write `detect.test.ts`: `['uk-UA']→uk`, `['UK']→uk`, `['ru-RU','uk-UA']→uk`, `['de-DE','en-US']→en`,
   `['en-GB','uk']→en`, `['ru-RU']→en`, `[]→en`; `parseStoredLang('uk')→'uk'`, `('fr')→null`, `(null)→null`.
3. Write `catalog.test.ts`: walk `en` and `uk` recursively and assert:
   - the same key paths in both;
   - the same `typeof` at each path (string / function / array);
   - every string (and every array item) is non-empty after `trim()`;
   - functions have the same `.length`;
   - for each function, calling it with sample parameters returns a non-empty string (keep a small map of sample
     parameters per key path, or call plural functions with 1, 2, 5).
4. Implement the files. Keep `I18nProvider` small: no effects for the language itself, only for `document` side
   effects.
5. Wrap `App` and run the app: nothing visible changes.

## Acceptance criteria

- [x] `src/i18n/` exists with the files above; `useT()` returns `en` or `uk`.
- [x] Removing any key from `uk.ts` makes `npm run typecheck` fail (try it once, then restore).
- [x] `catalog.test.ts` fails if a value in `uk.ts` is `''` (try it once, then restore).
- [x] Plural tests pass for the Ukrainian one / few / many cases listed in step 1.
- [x] Detection tests pass for the cases in step 2.
- [x] With an empty `localStorage` and a Ukrainian device language, `document.documentElement.lang` is `uk`; with
      `trade-journal:ui:lang = "en"` it is `en`.
- [x] Nothing is written to `trade-journal:ui:lang` until `setLang` is called.

## Verification

```sh
npm test
npm run typecheck
npm run build
```

Manual: `npm run dev`; in DevTools → Application → Local Storage set `trade-journal:ui:lang` to `uk`, reload, check
`<html lang="uk">` in the Elements panel; delete the key, set the browser language to Ukrainian (Chrome: Settings →
Languages, move Ukrainian to the top), reload, check `lang="uk"` again.

## Hand-off log

_(Append a dated entry before you stop, even mid-task: what is done, what is next, surprises.)_

- **2026-10-12** — Done. `src/i18n/` has `types.ts`, `plural.ts`, `detect.ts`, `en.ts`, `uk.ts`, `I18nProvider.tsx`,
  `index.ts` and three tests (`plural`, `detect`, `catalog`). `App.tsx` wraps `ErrorBoundary` in `I18nProvider`.
  - Plural style: every form is a function of the count (`one: (n) => ${n} нова` as a template literal), so a message decides where the
    number goes. The catalogs start with `common.close` and `backup.merged` (the plural example; task 04 uses it for
    the merge toast).
  - `detect.ts` also has `resolveLang(stored, languages)` → `{ lang, chosen }`, so the provider logic is tested in
    Node without a DOM.
  - `<html lang>` is set in a layout effect (before paint, on every change). Nothing is written to
    `trade-journal:ui:lang` until `setLang`.
  - The catalog test calls every function with a stand-in parameter (a Proxy that reads as 1, 2 or 5), so it needs no
    per-key sample map. Keep catalog functions to template strings and plurals; a function that calls a string
    method on a parameter would break the test.
  - Checked: deleting a key in `uk.ts` fails `tsc`; `''` fails the catalog test. Headless Chrome with device language
    `uk-UA` and empty storage gives `lang="uk"`; with the key set to `en` it gives `lang="en"`.
  - Next: task 02 (Settings sheet).

## Status

| Status      | Progress % | Time spent | Tokens spent |
| ----------- | ---------- | ---------- | ------------ |
| Done        | 100%       | 1h         | —            |
