# 03 — Storage picker and custom storages

> **Depends on:** 02 · **Spec refs:** [plan §3 D7, defaults "Picker", "Custom storage form", "Rename / delete a custom
> storage", "Kinds"; §4; §5.3; §5.4; §6.5](../plan.md) · **Estimate:** 1.5 days

## Goal

A reusable sheet where the user picks any number of storages for a bag (search, groups, multi-select), and can add,
rename and delete their own custom storages. The sheet returns the chosen ids; the caller saves them.

## Context to load

- [plan §5.3 and §5.4](../plan.md): the wireframes are the contract.
- `src/ui/Sheet.tsx` (whole file) and `src/ui/modal.ts:31-44` (layer stack, Escape closes only the top sheet).
- `src/ui/EditTradeSheet.tsx:24-32` and `:118-124`: the two-tap delete pattern.
- `src/ui/fields.tsx` (`Field`) and `src/ui/AddAccountSheet.tsx` for a small form inside a sheet.
- `src/ui/styles.css`: `.chip-btn` (738-757), `.list` / `.row` (347-445), `.form-card`.
- Task 02: `src/storage-tags/resolve.ts` (`storageLookup`, `storageSearch`), `src/storage-tags/StorageIcon.tsx`.
- Task 01: `addCustomStorage`, `updateCustomStorage`, `deleteCustomStorage`, `CUSTOM_COLOURS`, `CUSTOM_NAME_MAX`.
- The i18n dictionaries `src/i18n/en.ts`, `src/i18n/uk.ts` and `useT()` (feature #2) for how keys are named.

## Scope

**In:**

- `src/ui/StoragePickerSheet.tsx`:
  - Props: `journal`, `title`, `initial: string[]`, `onSave(ids: string[])`, `onClose()`, and the three custom-storage
    callbacks (`onAddCustom(input) → id`, `onUpdateCustom(id, patch)`, `onDeleteCustom(id)`), which may throw; the
    message is shown in the form.
  - Draft selection in local state; **Save** calls `onSave(draft)`; **Close** discards.
  - Search box (`type="search"`, `enterKeyHint="search"`), filters every group with `storageSearch`.
  - Selected chips row under the search (tap ✕ to remove).
  - Groups in this order: **Used in this journal** (ids on any live bag, all accounts, known only), **Exchanges**,
    **DEX**, **Hot wallets**, **Cold wallets**, **Custom**. Alphabetical inside a group (`localeCompare` with the
    current UI language). A storage in "Used" is not repeated in its kind group. Empty groups are hidden.
  - Each row is a `button` with `role="checkbox"` and `aria-checked`, 28 px icon, name, kind label (only in "Used"
    and "Custom"), a check mark when selected. Custom rows have a separate ⋯ button (`aria-label` "Edit <name>").
  - No match: "No storage called "<q>"." plus **Add "<q>" as custom**, which opens the form with the name filled in.
  - Sticky **Save** button at the bottom of the sheet body.
- `src/ui/CustomStorageForm.tsx`: the second view (‹ Back), modes *new* and *edit*:
  - Name input (`maxLength` 30, `autoFocus`), kind as a segmented choice (default `other`), colour as 8 round radio
    buttons (`role="radiogroup"`), live preview with `StorageIcon`.
  - Errors: empty name; name already used by a live custom storage **or by a predefined storage** (case-insensitive)
    → "This name is already in the list". (The predefined check lives here, not in the domain.)
  - *New*: **Add** → back to the list with the new storage selected and the search cleared.
  - *Edit*: **Save**, and "Used by N bags" + **Delete storage** (two taps: "Tap again to delete"). After delete the
    storage leaves the list and the draft selection.
- Wiring in `src/ui/JournalApp.tsx`: three handlers that call `apply(...)` with the task 01 actions. No caller opens the
  picker yet except a temporary dev entry if needed (remove it before Done).
- All strings in `en.ts` and `uk.ts`: sheet title, search placeholder, group labels, kind labels, form labels, errors,
  buttons, "Used by {n} bags" with correct Ukrainian plural forms (use whatever plural helper feature #2 provides).
- Styles for the picker rows, the selected-chips row and the colour swatches. Touch targets ≥ 44 px.

**Out:** where the picker is opened from and what is saved to the bag (task 04).

## Steps

1. Build the list view with static data, then search, then selection, then the form view.
2. Add the strings in both languages.
3. Wire the custom-storage handlers to the domain actions.

## Acceptance criteria

- [ ] With `initial = ['binance', 'ledger']` both rows are checked and both chips show; Close returns nothing; Save
      returns the edited list in the order the user selected.
- [ ] Typing "led" shows only matching rows across all groups; an alias from the catalogue (for example "huobi")
      finds the renamed storage.
- [ ] "Used in this journal" lists exactly the known storages on live bags; unknown or deleted ids do not appear.
- [ ] Add custom: empty name and a predefined name ("binance", any case) are refused with the message; a valid one is
      created, selected, and appears under Custom with its letter badge in the chosen colour.
- [ ] Edit custom: rename shows at once in the list; delete needs two taps, shows the bag count before, and removes the
      row and the selection.
- [ ] Escape closes only the picker when it is opened over another sheet (the layer stack works).
- [ ] Keyboard: Tab reaches the search, each row, the ⋯ buttons and Save; Space toggles a row.
- [ ] Every new string exists in `en.ts` and `uk.ts` (the typed dictionary makes a missing key a type error).
- [ ] `npm test`, `npm run typecheck` and `npm run build` pass.

## Verification

```sh
npm test
npm run typecheck
npm run build
```

Manual (`npm run dev`, iPhone-size viewport and a desktop window): every acceptance item above, once in English and once
in Ukrainian; the sheet scrolls with the on-screen keyboard open (`useVisualViewport` in `Sheet`).

## Hand-off log

_(Append a dated entry before you stop, even mid-task: what is done, what is next, surprises.)_

## Status

| Status      | Progress % | Time spent | Tokens spent |
| ----------- | ---------- | ---------- | ------------ |
| Not started | 0%         | 0h         | 0            |
