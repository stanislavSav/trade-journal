# Are the app icons in `public/` the owner's own work, so they can be MIT-licensed?

- **Raised in:** task 02 (`public/favicon.svg`, `public/apple-touch-icon.png`, `public/pwa-*.png`,
  `public/maskable-icon-512x512.png`)
- **Why it matters:** `LICENSE` covers every file in the repo. If an icon came from a stock set or was made with a
  tool whose terms limit reuse, the MIT licence would promise rights the owner does not have. The planning session
  could not find out where the icons came from.
- **Options:**
  - A — the owner confirms they are his own (or generated with no extra terms): nothing to do (recommended if true).
  - B — they come from a set with its own licence: add a line to the README ("Icons: <source>, <licence>") and keep
    the set's licence file next to them.
  - C — unclear: replace them with new own icons before task 02 is done.
- **What the code does meanwhile:** nothing changes; task 02 ships `LICENSE` as planned.
- **Status:** Open
