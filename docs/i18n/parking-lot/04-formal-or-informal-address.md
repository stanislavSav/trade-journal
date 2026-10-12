# Should the Ukrainian UI address the user as "ви" or "ти"?

- **Raised in:** task 04 (`src/i18n/uk.ts`, plan D17)
- **Why it matters:** A few strings speak to the user: "Tap again to delete", "Your trades are still stored on this
  device", "Until you choose…", the iPhone backup help. Ukrainian must pick "ви" (polite) or "ти" (informal). Some
  Ukrainian fintech apps use "ти" for a friendly tone; most utilities use "ви". A branded copy (whitelabel) may
  prefer its own tone.
- **Options:**
  - A — "ви", and imperative forms that avoid the pronoun where possible (recommended): "Натисніть ще раз, щоб
    видалити", "Ваші угоди досі збережені на цьому пристрої".
  - B — "ти": "Натисни ще раз, щоб видалити", "Твої угоди досі збережені…". Friendlier; must be used consistently.
- **What the code does meanwhile:** option A.
- **Status:** Decided (2026-10-12): A — polite **Ви** forms everywhere: "Натисніть…", "Введіть…", "Збережіть…",
  "Ваші угоди…". Where possible, an imperative form without the pronoun. In UI text the pronoun has a capital letter
  only at the start of a sentence ("Ваші угоди…", but "Поки ви не оберете…"). "ти" forms are not used. Applied in
  `docs/i18n/plan.md` D17.
