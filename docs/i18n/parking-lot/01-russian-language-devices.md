# Should a phone set to Russian (and not Ukrainian) open in English or in Ukrainian?

- **Raised in:** task 01 (`src/i18n/detect.ts`, plan D5)
- **Why it matters:** Many people in Ukraine still have phones set to Russian. The rule in plan D5 looks for the first
  `uk*` or `en*` entry in `navigator.languages`. A phone with only `ru-RU` (no `uk`, no `en`) gets **English**. For a
  branded copy for a Ukrainian crypto community (whitelabel), Ukrainian may be the better first guess. There is no
  Russian catalog and none is planned.
- **Options:**
  - A — English when neither `uk` nor `en` is in the list (recommended for this repo). Neutral, matches the source
    language, and the user switches once in Settings.
  - B — Ukrainian when the list contains `ru` (or `be`) and no `en`. Better guess for this audience, but it is a
    political and personal choice that the app makes for the user.
  - C — Leave it to the brand: the main build uses A; a branded build sets a default language (plan §11,
    `VITE_DEFAULT_LANG`).
- **What the code does meanwhile:** option A. `detectLanguage(['ru-RU'])` returns `'en'`, covered by a test.
- **Status:** Open
