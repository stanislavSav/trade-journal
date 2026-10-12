# Does "Add to Home Screen" on iOS from the `?demo` page install the demo or the real app?

- **Raised in:** task 04 (manifest `start_url`, `vite.config.ts:23`; plan D18)
- **Why it matters:** The manifest says `start_url: /trade-journal/` (no `?demo`). Chrome and Android use the manifest,
  so an install from the demo page opens the real app. iOS Safari has a history of using the URL of the current page
  instead. If it does, a tester who adds the demo to the home screen gets an icon that always opens the demo, and may
  think their trades are saved (the banner says they are not).
- **Options:**
  - A — accept it (recommended if iOS does keep `?demo`): the banner and Exit demo are always visible on the list
    screen; Exit demo inside the installed app loads the real app in the same window.
  - B — in demo mode, hide the app from installing: not possible on iOS (no API).
  - C — in demo mode, replace the URL with `history.replaceState` to drop `?demo` after start, so "Add to Home Screen"
    sees the plain URL. Then a reload leaves the demo (it reads the URL again), which breaks "reload resets the demo".
- **What the code does meanwhile:** A. The real behaviour must be checked on an iPhone in task 04.
  Checked so far (2026-10-12, desktop Chrome): the built manifest has `start_url: /trade-journal/`, so a Chrome
  install from the demo page opens the real app. The iPhone run is still to do.
- **Status:** Waiting for device run
