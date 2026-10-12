# Should the app itself offer "Try demo" and "Download sample backup"?

- **Raised in:** task 02 (`src/ui/SettingsSheet.tsx`, plan §2 Out)
- **Why it matters:** Today the plan puts both routes only in the README and in messages the owner shares. A person
  who already uses the app (or a community member who got the plain app link) cannot find the demo from inside it.
  An in-app link could also confuse a user into loading sample data into real data.
- **Options:**
  - A — README and shared links only (recommended for now). Nothing in the app can mix sample data into real data by
    mistake.
  - B — Settings → About gets "Try the demo ↗" (opens `?demo` in a new tab). Safe, because the demo saves nothing.
  - C — B plus "Download sample backup" in Settings. Easier for testers, but invites loading it into real data.
- **What the code does meanwhile:** option A.
- **Status:** Open
