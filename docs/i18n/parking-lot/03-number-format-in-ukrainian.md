# Should the Ukrainian UI show numbers as `1 234,56 $` instead of `$1,234.56`?

- **Raised in:** task 03 (`src/domain/format.ts:8,31,42`, plan D8)
- **Why it matters:** The normal Ukrainian format uses a space for thousands, a comma for decimals, and puts the
  currency after the number (`1 234,56 $`). The app today always shows `$1,234.56`. Every amount in the app is in US
  dollars, and crypto exchanges, CoinGecko and most Telegram channels show prices in the `1,234.56` style, even in
  Ukrainian. Mixing the two styles in one person's head (exchange vs journal) can cause misreading, for example
  `1,812` read as one point eight.
- **Options:**
  - A — keep `$1,234.56` in both languages (recommended). Same as exchanges; no change to `format.ts` and its tests;
    the input parser already accepts `0,5` and `0.5` (`src/ui/numbers.ts:19-40`).
  - B — Ukrainian style in the Ukrainian UI: `format.ts` takes the locale from the UI language
    (`NUMBER_LOCALE` becomes a parameter) and the dollar sign moves after the number. About 40 test expectations get a
    second Ukrainian variant. Coin quantities would show `0,03457`.
  - C — a separate "Number format" switch in Settings, independent of the language. Most flexible, more UI.
- **What the code does meanwhile:** option A. The locale lives in one constant (`NUMBER_LOCALE`, task 03), so B is a
  small change later.
- **Status:** Decided (2026-10-12): A — money stays **`$1,234.56`** in both languages (also `+6.7%`, `0.03457`). No
  Ukrainian number style and no separate switch. Applied in `docs/i18n/plan.md` D8.
