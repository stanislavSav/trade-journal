# Which Ukrainian word should the app use for "Bag"?

- **Raised in:** task 04 (`src/i18n/uk.ts`; CONTEXT.md "Bag")
- **Why it matters:** "Bag" is the main object of the app: each row in Open / Closed is a bag, and the word appears in
  the form ("Bag", "New bag…"), the list empty states and the bag screen. The Ukrainian word also sets grammatical
  gender, so "Open / Closed / New" change with it: позиція → відкрита / закрита / нова; бег → відкритий / закритий /
  новий.
- **Options:**
  - A — **Позиція** (recommended). Every trader understands it; "Відкриті / Закриті позиції" is the normal trading
    phrase. Downside: a "position" usually means everything held in one coin, while a bag can be one of several for the
    same coin.
  - B — **Бег** (from "bag"). Community slang ("бегхолдер", "тримати бег"), fun and close to the English UI; may look
    unserious or unclear to new users and in a branded offer.
  - C — **Угода** (trade idea). Clashes with "Trade" = угода.
  - D — **Пакет** / **Мішок**. Literal; sounds odd.
- **What the code does meanwhile:** option A, feminine agreement everywhere.
- **Status:** Decided (2026-10-12): A — **Позиція** (feminine). Plural «позиції». Examples: «Нова позиція…», «Відкриті
  позиції», «Закриті позиції», badge «Відкрита» / «Закрита», no-date default name «Нова». Applied in
  `docs/i18n/plan.md` (D18, glossary §8.1) and in the Ukrainian strings of account removal, list sorting and demo data.
