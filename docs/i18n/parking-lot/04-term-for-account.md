# Which Ukrainian word should the app use for "Account"?

- **Raised in:** task 04 (`src/i18n/uk.ts`; CONTEXT.md "Account")
- **Why it matters:** An account in this app is a portfolio owner shown as a tab ("CS", "Family"), not a login and not
  a bank account. The word shows in "Add account", the trade form, the empty state ("No accounts yet") and, from
  feature 3, in "Remove account".
- **Options:**
  - A — **Портфель** (recommended). Says what it is: a set of holdings of one owner. "Додати портфель" reads well.
  - B — **Рахунок**. Matches brokerage language ("брокерський рахунок"), but people may think of a bank account.
  - C — **Акаунт**. Close to the English, but sounds like a login, and the app has no logins (G7).
- **Note:** [docs/account-removal/plan.md](../../account-removal/plan.md) (feature 3) wrote "Рахунки" for its Accounts
  section. It now uses «Портфелі».
- **What the code does meanwhile:** option A.
- **Status:** Decided (2026-10-12): A — **Портфель** (masculine). Plural «Портфелі», genitive plural «портфелів».
  Examples: «Додати портфель», «Немає портфелів», «Видалити портфель», «Портфель «CS» видалено». «Рахунок» and
  «Акаунт» are not used for this meaning anywhere. Applied in `docs/i18n/plan.md` (D18, glossary §8.1) and
  `docs/account-removal/plan.md` §5.3.
