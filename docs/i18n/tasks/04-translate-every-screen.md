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

- [ ] The grep in step 5 finds only names, symbols, `CoinGecko`, `GitHub`, `iCloud Drive`, `trades.json`, the asset
      placeholder `BTC, SOL, Hyperliquid…`, and the language names in Settings.
- [ ] `uk.ts` has no English sentence (read it once from top to bottom).
- [ ] Plural toast in Ukrainian: loading a backup with 1, 3 and 5 new trades shows "1 нова", "3 нові", "5 нових".
- [ ] A new bag created in Ukrainian without a name gets the Ukrainian default name; switching back to English does not
      rename it.
- [ ] In English every screen reads exactly as on `main` (no wording change slipped in).
- [ ] The catalog test, plural test and `errorText` test pass.

## Verification

```sh
npm test
npm run typecheck
npm run build
```

Manual: the click-through in step 6, once in each language, on desktop and on an iPhone.

## Hand-off log

_(Append a dated entry before you stop, even mid-task: what is done, what is next, surprises.)_

## Status

| Status      | Progress % | Time spent | Tokens spent |
| ----------- | ---------- | ---------- | ------------ |
| Not started | 0%         | 0h         | 0            |
