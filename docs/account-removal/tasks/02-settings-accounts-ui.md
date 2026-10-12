# 02 — Accounts section in Settings and the confirmation sheet

> **Depends on:** 01, feature 2 ([docs/i18n/plan.md](../../i18n/plan.md): Settings sheet, `useT()`) ·
> **Spec refs:** [plan §3, §4, §5, §6.1, §6.2, §8](../plan.md) · **Estimate:** 1 day

## Goal

From Settings, the user can remove any account. A confirmation sheet shows what will be deleted, offers to save a
backup, and enables **Remove account** only when the account name is typed exactly. After removal the app shows the
first remaining account (or the empty state) and a toast. Every new text exists in English and Ukrainian.

## Context to load

- [../plan.md](../plan.md) §3 (decisions and defaults), §5 (wireframes and the strings table), §6.1, §6.2.
- Task 01's hand-off log (`removeAccount`, `countAccountData`).
- Feature 2's Settings sheet and i18n: `src/i18n/en.ts`, `src/i18n/uk.ts`, `useT()`, the plural helper, and the
  Settings sheet component (read its hand-off logs in `docs/i18n/tasks/`). Take the Ukrainian words for *account*,
  *bag*, *trade* from `src/i18n/uk.ts`. The owner decided them on 2026-10-12: «портфель» (masculine), «позиція»
  (feminine), «угода», with the polite Ви form (docs/i18n/plan.md D17, D18; plan §5.3 uses them).
- `src/ui/JournalApp.tsx`: `SheetState` (`:32-37`), selected account (`:43-46`), `createAccount` (`:99-103`), empty
  state (`:129-136`), sheets (`:188-203`).
- `src/ui/AddAccountSheet.tsx`: a small form sheet with `Sheet` + `Field` (copy its shape).
- `src/ui/Sheet.tsx` (title, Close, portal), `src/ui/fields.tsx` (`Field`).
- `src/ui/portfolioView.ts:26-28` (`liveAccounts`, header order by name).
- `src/state/useJournal.ts:70-74` (`exportNow`), `src/state/useStoredString.ts`.
- `src/ui/styles.css`: look for existing danger / text-button styles before adding new ones.

## Scope

**In:**

- `src/ui/AccountsSection.tsx` (new): list of live accounts with "N bags · M trades" and a **Remove** button each.
- `src/ui/RemoveAccountSheet.tsx` (new): wireframe plan §5.2.
- `src/ui/accountName.ts` (new, small) with a pure `nameMatches(typed: string, name: string): boolean` (trim, NFC,
  case-sensitive) and its test `src/ui/accountName.test.ts`.
- Settings sheet (from feature 2): render `AccountsSection` between Language and About.
- `JournalApp.tsx`: new `SheetState` kind `{ kind: 'removeAccount'; accountId: string }`; handlers (remove, back to
  Settings, export).
- Strings in `src/i18n/en.ts` and `src/i18n/uk.ts` (plan §5.3).
- CSS for the section and the danger button, reusing existing classes where possible.

**Out:**

- Rename, undo, orphan clean-up (plan §11).
- Changes to `removeAccount` (task 01; if a bug shows up, fix it there with a test).

## Steps

1. `nameMatches` + tests: `'Family'` vs `' Family '` → true; `'family'` vs `'Family'` → false; NFC vs NFD of a
   Cyrillic name with «й» → true; empty → false.
2. Strings: add the keys of plan §5.3 to both dictionaries (follow feature 2's key naming if it differs). Counts use
   the plural helper. The build (or a test from feature 2) must fail on a missing key.
3. `AccountsSection`: props `accounts: Account[]`, `journal: Journal`, `onRemove(accountId)`. One row per account:
   name, counts (`countAccountData`), a red text button **Remove** with `aria-label` "Remove account {name}". With no
   accounts: "No accounts.".
4. `RemoveAccountSheet`: props `account`, `counts`, `onExport: () => Promise<'shared' | 'downloaded' | 'cancelled'>`,
   `onConfirm()`, `onClose()`.
   - Title "Remove "{name}"". Warning card with counts and "cannot be undone … older backup will not bring it back".
   - **Save backup now** (secondary): calls `onExport`; on `'shared'` or `'downloaded'` show "Backup saved"; on
     `'cancelled'` show nothing; on error show the error text.
   - Name input: `autoComplete="off"`, `autoCapitalize="off"`, `autoCorrect="off"`, `spellCheck={false}`, no
     `autoFocus` (the keyboard would hide the warning on a phone).
   - **Remove account**: danger style, `disabled` until `nameMatches`. Submit on Enter only when it matches.
5. `JournalApp`:
   - From Settings, `onRemove(id)` → `setSheet({ kind: 'removeAccount', accountId: id })` (replaces Settings).
   - Confirm sheet **Close** → back to Settings (`setSheet({ kind: 'settings' })`, or the kind feature 2 uses).
   - Confirm → `apply((j, now) => removeAccount(j, id, now))`; then compute `liveAccounts(next)`; if one is left,
     `rememberAccount(first.id)`; `setSheet(null)`; toast "Account "{name}" removed".
   - If the account is already gone when the sheet renders (another tab removed it), close the sheet.
6. CSS: section header like feature 2's other sections; row layout like `.row`; danger button colour from the
   existing negative tone (`tone()` in `src/ui/numbers.ts` uses it). Respect light and dark mode.
7. Manual checks (below) on desktop and on the iPhone.

## Acceptance criteria

- [ ] Settings shows an **Accounts** section with every live account, its bag and trade counts, and **Remove**.
- [ ] The confirmation sheet shows the right counts, the warning, **Save backup now**, the name field and a disabled
      **Remove account**.
- [ ] **Remove account** is enabled only when the typed text equals the name (trimmed, case-sensitive);
      `nameMatches` tests pass.
- [ ] After removal: the account tab is gone; the first remaining account (by name) is selected; the toast shows; the
      Backup button shows the unsaved dot.
- [ ] Removing the last account shows "No accounts yet." with **Add account**; adding an account with the same name
      gives an empty account.
- [ ] **Close** on the confirmation sheet goes back to Settings; nothing is deleted.
- [ ] **Save backup now** opens the share sheet (iPhone) or downloads `trades.json` (desktop) and shows "Backup saved".
- [ ] Every new text appears in English and in Ukrainian when the language is switched; no English text left in the
      Ukrainian UI of this feature.
- [ ] The Ukrainian section title is «Портфелі» and every Ukrainian text says «портфель» (never «рахунок»), with the
      right case and gender ("Видалити портфель", "Портфель «…» видалено").
- [ ] Screen reader: each **Remove** button says which account; the confirm button's disabled state is announced.
- [ ] `npm test`, `npm run typecheck`, `npm run build` pass.

## Verification

```sh
npm test && npm run typecheck && npm run build
npm run dev   # open the printed URL with ?demo: accounts "Demo" and "Test" with sample data
```

Manual checks (dev with `?demo`, then the live app on the iPhone with a throwaway account):

1. Settings → Accounts lists "Demo" and "Test" with counts (demo data: `src/state/demo.ts`).
2. Remove "Test": type "test" → button stays disabled; type "Test" → enabled; confirm → "Test" tab gone, toast.
3. Remove "Demo" (the last account) → empty state; **Add account** "Demo" → empty account.
4. Switch the language to Ukrainian and repeat step 2 on a new account: all texts are Ukrainian, plural forms are
   right for 1, 3 and 5 bags.
5. Two devices (or two browser profiles): add account "Tmp" with one trade on A, save backup, load on B. Remove
   "Tmp" on A, save backup, load on B → "Tmp" is gone on B.
6. With the bag screen open the header is inert, so Settings cannot be opened over a bag (check that it stays so).

## Hand-off log

_(Append a dated entry before you stop, even mid-task: what is done, what is next, surprises.)_

## Status

| Status      | Progress % | Time spent | Tokens spent |
| ----------- | ---------- | ---------- | ------------ |
| Not started | 0%         | 0h         | 0            |
