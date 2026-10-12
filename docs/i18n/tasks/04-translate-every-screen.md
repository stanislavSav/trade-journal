# 04 — Translate every screen

> **Depends on:** 02, 03 · **Spec refs:** [plan §3 D3, D4, D10, D11, D13, D17, D18](../plan.md),
> [plan §6.1 inventory, §8.1 glossary](../plan.md) · **Estimate:** 2 days

## Goal

Every user-visible string in the app comes from the catalogs, and the Ukrainian catalog is complete. A user who picks
Українська sees no English text except names (stored data, coin symbols, CoinGecko, GitHub) and the technical detail
of a broken backup file.

## Context to load

- [plan §6.1](../plan.md) — the string inventory, file by file.
- [plan §8.1](../plan.md) — the glossary. Bag, Account, the Ви form and the number format are decided (D8, D17, D18).
  Terms still marked "?" use the proposal; the owner confirms them in task 05
  ([parking lot](../parking-lot/README.md)).
- `src/i18n/en.ts`, `src/i18n/uk.ts`, `src/i18n/errorText.ts` (tasks 01–03).
- Every file in `src/ui/*.tsx`, plus `src/ui/formValues.ts`, `src/ui/useCoinSearch.ts`, `src/state/useJournal.ts:52`.

## Scope

**In:**

- Replace every literal in JSX text, `aria-label`, `title`, `placeholder`, `label=` props, `Sheet title=`, and toast
  text with `t.…`. Files: `JournalApp`, `Header`, `SummaryCard`, `BagList`, `BagRows`, `BagDetail`, `BagName`,
  `BagField`, `TradeRow`, `AddTradeSheet`, `EditTradeSheet`, `AddAccountSheet`, `AssetField`, `NoteField`,
  `fields.tsx`, `Sheet`, `BackupSheet`, `ErrorBoundary`.
- Every `catch` that shows `err.message` uses `errorText(t, err)` (list in plan §6 "Seams"). Load backup shows the
  headline, and the `detail` (if any) in smaller text under it.
- `useJournal` stores the save error as the error object (or code), not a string, so the banner
  (`JournalApp.tsx:119-123`) translates it.
- Plurals (D4): merge toast (`JournalApp.tsx:196`, added / updated), "N of M without price" (`SummaryCard.tsx:27`).
- Lists: "Enter asset, qty and total" (`AddTradeSheet.tsx:47-50,222`) uses
  `new Intl.ListFormat(lang, { type: 'conjunction' })`.
- Default bag name (D11): `AddTradeSheet` passes the UI language months (`t.trade.months`) and `t.trade.newBagDefault`
  to `defaultBagName` for the placeholder **and** sends the resolved name as `newBagName` when the user leaves the
  field empty, so the stored name is in the UI language.
- The bag warning (`BagWarning`) and price problems (`PriceProblem`) get their sentences from the catalog.
- BUY / SELL in `fields.tsx:79` and `TradeRow.tsx:9` come from the catalog.
- Fill `uk.ts` completely with the glossary terms, Bag = «Позиція», Account = «Портфель» (D18) and the polite Ви
  form (D17). These three are decided; do not use «Рахунок», «Акаунт» or "ти" forms.

**Out:** changing number or date formats (D8, D9). Translating stored data (D10). The manifest (D14).

## Steps

1. Work file by file in the order of the inventory table. After each file, run the catalog test.
2. Name keys by meaning, not by English words (`trade.totalPlaceholderBuy`, not `trade.paidFeesIncluded`).
3. When a sentence contains a value, make it a function with named parameters (D3). Format numbers before passing them.
4. Fill `uk.ts`. Where the glossary has "?", use the proposal and add nothing new to the parking lot unless a new
   question appears.
5. Search for leftovers:
   `grep -rnE ">[^<{]*[A-Za-z]{3,}[^<{]*<|(aria-label|title|placeholder|label)=\"[A-Za-z]" src/ui` and read each hit.
6. Switch to Українська and click through every screen and state (list empty / full, bag open / closed / with
   warning / no live price, add buy, add sell, edit, delete confirm, backup, load a broken file, add account, settings,
   price error, coin search offline).

## Acceptance criteria

- [x] The grep in step 5 finds only names, symbols, `CoinGecko`, `GitHub`, `iCloud Drive`, `trades.json`, the asset
      placeholder `BTC, SOL, Hyperliquid…`, and the language names in Settings.
- [x] `uk.ts` has no English sentence (read it once from top to bottom).
- [x] Plural toast in Ukrainian: loading a backup with 1, 3 and 5 new trades shows "1 нова", "3 нові", "5 нових".
- [x] A new bag created in Ukrainian without a name gets the Ukrainian default name; switching back to English does not
      rename it.
- [x] In English every screen reads exactly as on `main` (no wording change slipped in). _(Except the planned D13
      change: Load backup errors are now a headline plus the technical detail; see plan D13.)_
- [x] The catalog test, plural test and `errorText` test pass.

## Verification

```sh
npm test
npm run typecheck
npm run build
```

Manual: the click-through in step 6, once in each language, on desktop and on an iPhone.

## Hand-off log

_(Append a dated entry before you stop, even mid-task: what is done, what is next, surprises.)_

- **2026-10-12** — Done.
  - `en.ts` / `uk.ts` are complete and grouped as in plan §6 (`common`, `header`, `summary`, `list`, `bag`, `trade`,
    `search`, `account`, `backup`, `settings`, `crash`, `errors`, `prices`). Every file in Scope reads from `useT()`.
  - Every `catch` keeps the `Error` in state (`asError`, new in `src/domain/errors.ts`) and renders it with
    `FormError` (`src/ui/fields.tsx`): the translated text, plus the English detail in smaller grey text
    (`.error-detail`). Load backup now shows the D13 headlines. Because the error object is kept, a shown error
    follows a language switch. `useJournal.saveError` is an `Error`; the banner uses `backup.saveFailed`.
  - `AddAccountSheet` shows only the text in its field message (no detail; account errors have none).
  - Plurals: the merge toast. "N of M without price" needs no plural in either language (plan D4 note).
  - "Enter asset, qty and total": `joinList(lang, words)` (`src/i18n/joinList.ts`, tested). English uses `en-GB`
    so there is no comma before "and", as before (plan §3 defaults note).
  - Default bag name: `AddTradeSheet` computes `defaultBagName(date, t.trade.months, t.trade.newBagDefault)` for the
    placeholder and sends it as `newBagName` when the field is empty.
  - The crash screen shows a failed backup as a red `FormError` (before: grey help text).
  - Qty label in Ukrainian is «Кількість» (fits at 390 px); task 05 checks 320 px and falls back to «К-сть» if needed.
  - Grep from step 5: only the asset placeholder and "Trade Journal" in About remain. `src/state/demo.ts` has English
    sample names; they are stored data (D10), and feature 6 owns the demo data.
  - Click-through in headless Chrome at 390 px, both languages: list open / closed, bag open / closed / no live
    price / with warning, add buy (empty, new bag), sell with "You hold only", edit, delete confirm, backup, three
    broken files, add account (exists), settings, price error, coin search offline, empty state, merge toasts for 1,
    3 and 5 new trades ("1 нова", "3 нові", "5 нових"), a new bag in Ukrainian without a name ("Жовт 26"; it stays
    after switching to English, because the name is stored). English texts match `main` apart from D13. Not checked
    on an iPhone (task 05).
  - Next: task 05.

## Status

| Status      | Progress % | Time spent | Tokens spent |
| ----------- | ---------- | ---------- | ------------ |
| Done        | 100%       | 2h         | —            |
