# Where do the README screenshots come from, and when?

- **Raised in:** task 02 (`README.md`, screenshot placeholder)
- **Why it matters:** screenshots make a stranger understand the app in seconds, but they must never show the
  owner's real trades. Sample data already exists for `npm run dev` with `?demo` (`src/state/demo.ts`), but the
  screens will change in features 2–5 (language, Settings, sort control, storage tags), so screenshots taken now get
  old soon.
- **Options:**
  - A — take them after feature 6 ships, from the live `?demo` link, so they show every feature (recommended).
  - B — take them now from `npm run dev` + `?demo`, and retake after feature 5.
  - C — no screenshots, only text.
- **What the code does meanwhile:** the README has the HTML comment placeholder
  `<!-- Screenshots: list, bag, add trade. Sample data only. -->`. Feature 6 should add the screenshots task.
- **Status:** Open
