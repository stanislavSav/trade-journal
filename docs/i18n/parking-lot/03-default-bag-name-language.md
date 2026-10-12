# Which Ukrainian month abbreviations should new default bag names use?

- **Raised in:** task 03 (`src/domain/actions.ts:23,174-178`, plan D11)
- **Why it matters:** A bag created without a name gets a default name from its first trade date: `Jun 26` today. Plan
  D11 decides that a **new** bag gets the default name in the UI language at creation time (old bags keep their stored
  names). The name is stored data: it travels in backups and is shown in the list, so it should look natural at the
  start of a line, and short.
- **Options:**
  - A — capitalised, no dot, 3–4 letters (recommended): `Січ 26`, `Лют 26`, `Бер 26`, `Квіт 26`, `Трав 26`,
    `Черв 26`, `Лип 26`, `Серп 26`, `Вер 26`, `Жовт 26`, `Лист 26`, `Груд 26`. Mirrors `Jun 26`.
  - B — dictionary abbreviations with a dot, lower case: `черв. 26` (what `Intl.DateTimeFormat('uk', { month: 'short' })`
    gives). Correct style, but a lower-case name looks odd at the start of a row.
  - C — numbers only in every language: `06.26`. Language-neutral, matches the `DD.MM.YY` dates, but changes what
    English users get today.
  - D — keep English month names in every language (no D11). Simplest; mixed-language names in a Ukrainian UI.
  - The no-date default: `Нова`, because "Bag" is «Позиція» (feminine; decided in
    [04-term-for-bag.md](04-term-for-bag.md)).
- **What the code does meanwhile:** option A, with `Нова` for no date.
- **Status:** Open
