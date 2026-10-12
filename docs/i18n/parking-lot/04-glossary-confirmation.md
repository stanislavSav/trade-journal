# Are the proposed Ukrainian words in the glossary right?

- **Raised in:** task 04 (`src/i18n/uk.ts`; glossary in `docs/i18n/plan.md` §8.1)
- **Why it matters:** The glossary is the contract for every later feature (list sorting, storage tags, demo, a
  possible branded copy). Changing a word later means changing it in many places and in the owner's community's habits.
  The words below are proposals from the planning session; the owner is the native speaker.
- **Options** (recommendation first in each row; the bag and account terms have their own items):

  | English            | Proposal               | Alternatives |
  | ------------------ | ---------------------- | ------------ |
  | Realized (P/L)     | Реалізований P/L / short "Реалізовано" | Зафіксований прибуток · PnL |
  | Unrealized (P/L)   | Нереалізований P/L / "Нереалізовано"   | Плаваючий P/L |
  | Open P/L           | P/L відкритих          | Поточний P/L |
  | P/L in general     | `P/L` (Latin)          | `PnL` · `П/З` |
  | Backup (header)    | Бекап                  | Копія · Резервна копія (too long for the header) |
  | Load backup        | Завантажити копію      | Відкрити копію · Імпортувати копію |
  | Asset / Coin field | Монета                 | Актив |
  | Holding            | Залишок                | Кількість · У наявності |
  | Cost               | Собівартість           | Вартість входу |
  | Proceeds           | Виручка                | Отримано |
  | Avg cost           | Сер. ціна              | Середня ціна входу |
  | BUY / SELL badges  | КУПІВЛЯ / ПРОДАЖ       | КУП / ПРОД (shorter) |
  | About              | Про застосунок         | Про додаток |
  | no live price      | без актуальної ціни    | без ціни онлайн |

- **Note (2026-10-12):** three terms are now decided in their own items: Bag = «Позиція»
  ([04-term-for-bag.md](04-term-for-bag.md)), Account = «Портфель» ([04-term-for-account.md](04-term-for-account.md)),
  and the polite Ви forms ([04-formal-or-informal-address.md](04-formal-or-informal-address.md)). The words in the
  table above still wait for the owner's review in task 05.
- **What the code does meanwhile:** the proposals (first column) are in `uk.ts`.
- **Status:** Open
