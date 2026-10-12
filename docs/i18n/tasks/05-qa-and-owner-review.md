# 05 — QA in both languages, docs, owner review

> **Depends on:** 04 · **Spec refs:** [plan §8, §8.1, §9, §10](../plan.md),
> [parking lot](../parking-lot/README.md) · **Estimate:** 0.5 day (plus the owner's review time)

## Goal

Ukrainian is ready to show to other people: no text overflows on a small phone, the owner has confirmed (or changed)
the glossary, and the docs describe the feature.

## Context to load

- [plan §8.1](../plan.md) — glossary; [parking lot index](../parking-lot/README.md) — the open word choices.
- `src/i18n/uk.ts` — the full catalog.
- `docs/CONTEXT.md` — the project glossary; `README.md` — the user README.

## Scope

**In:**

- Layout check of every screen in both languages at 320 px, 375 px and 390 px width, and on a real iPhone (Safari and
  the installed app). Fix overflow with shorter words from the glossary or with CSS (`overflow-wrap`, smaller label
  font), not by cutting meaning.
- VoiceOver pass in Ukrainian: header, list tabs, a bag row, the trade form, a toast.
- Owner review session: walk the parking-lot items that are still open
  ([glossary](../parking-lot/04-glossary-confirmation.md),
  [month names](../parking-lot/03-default-bag-name-language.md),
  [Russian devices](../parking-lot/01-russian-language-devices.md),
  [iPhone help text](../parking-lot/04-iphone-help-text-in-ukrainian.md)). Record each answer as
  `Decided (date): …` and apply it in `uk.ts` / code. Already decided on 2026-10-12 (only check that `uk.ts` follows
  them): [bag = Позиція](../parking-lot/04-term-for-bag.md), [account = Портфель](../parking-lot/04-term-for-account.md),
  [polite Ви](../parking-lot/04-formal-or-informal-address.md),
  [`$1,234.56` in both languages](../parking-lot/03-number-format-in-ukrainian.md).
- Docs: add a "Languages" line to `README.md` (what languages exist, where to switch); add a Ukrainian column or a
  link to plan §8.1 in `docs/CONTEXT.md` so later features use the same words; set plan status to `Shipped`.
- Ask the lead to update the roadmap row in `docs/README.md` (feature 2 now introduces the Settings sheet; feature 3
  adds to it).

**Out:** new strings or features.

## Steps

1. Layout pass, fix, repeat.
2. VoiceOver pass.
3. Owner review; apply answers.
4. Docs.

## Acceptance criteria

- [x] No clipped or overlapping text at 320 px in either language (list, bag screen, all sheets, header).
      _(Checked in headless Chrome at 320, 375 and 390 px. Waiting for the owner: the same check on a real iPhone.)_
- [ ] VoiceOver reads Ukrainian labels with a Ukrainian voice (`<html lang="uk">`). _(Waiting for the owner: needs an
      iPhone. Prepared: `<html lang="uk">` is set, and the accessibility tree has Ukrainian names and roles.)_
- [ ] Every i18n parking-lot item is `Decided` or explicitly left `Open` by the owner with the default kept.
      _(Waiting for the owner. Review material: [05-owner-review-all-strings.md](../parking-lot/05-owner-review-all-strings.md).)_
- [x] `README.md` mentions the language switch; `docs/CONTEXT.md` points to the glossary.
- [ ] Plan status is `Shipped`; the board shows all tasks `Done`. _(Plan is `Shipped`; this task stays `Blocked` until
      the owner review is done.)_

## Verification

```sh
npm test
npm run typecheck
npm run build
```

Manual: the layout and VoiceOver passes above on an iPhone; one full English click-through to confirm nothing changed.

## Hand-off log

_(Append a dated entry before you stop, even mid-task: what is done, what is next, surprises.)_

- **2026-10-12** — Everything that does not need the owner is done; the task waits for the owner review.
  - Layout pass in headless Chrome (a script clicks through 19 screens and states and reports clipped text) at 320,
    375 and 390 px, both languages. 375 and 390 px were clean. At 320 px in Ukrainian three things were fixed:
    - the edit sheet title «Редагувати угоду BTC» was cut off → «Змінити угоду BTC»;
    - the Total placeholders were cut off → «сплачено з комісією» / «чиста виручка»;
    - «собівартість · без ціни» under an unpriced bag pushed «1,000 · сер. 0.5000» out of the row → `.row-side` is
      at most 45 % of the row and its note wraps; «без ціни» is joined by a no-break space.
    English has no layout change.
  - Seen but not changed (not caused by this feature): in desktop Chrome at 320 px the native date input next to the
    Unknown / Невідома chip shows only part of the date, in both languages. iOS draws its own date control.
  - Screen readers: `<html lang="uk">` is set; the Chrome accessibility tree shows Ukrainian names for the header
    buttons, tabs («Портфелі», «Позиції»), bag rows, the trade form (radio group «Тип угоди», fields) and the toast
    (polite live region). A real VoiceOver pass needs an iPhone.
  - Docs: a Languages line in `README.md` (Features); `docs/CONTEXT.md` points to plan §8.1 and has Settings and UI
    language; plan status `Shipped` with a note that the word review is open; plan §8.1 has the new word choices.
  - Owner review material: [05-owner-review-all-strings.md](../parking-lot/05-owner-review-all-strings.md) — all
    166 texts side by side (EN / UK) and the texts changed during the layout check.
  - **Waiting for the owner** (then set this task `Done`):
    1. Read the Ukrainian texts (in the app or in the table) and decide the open parking-lot items: glossary, month
       names, Russian devices, iPhone help text, all texts. Record `Decided (date): …`, apply in `uk.ts`.
    2. On an iPhone (Safari and the installed app): the layout at the phone's width, and a VoiceOver pass in
       Ukrainian (header, list tabs, a bag row, the trade form, a toast).
    3. One English click-through on the iPhone.

## Status

| Status      | Progress % | Time spent | Tokens spent |
| ----------- | ---------- | ---------- | ------------ |
| Blocked (waiting for the owner review) | 90% | 1h | — |
