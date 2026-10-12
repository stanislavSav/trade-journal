# Should links support `?lang=uk` (e.g. `?demo&lang=uk`) for sharing with the Ukrainian community?

- **Raised in:** task 04 (README links; i18n plan §11)
- **Why it matters:** The owner may post the demo link in a Ukrainian Telegram group. People whose phones are in
  English or Russian would see the English UI first (i18n plan D5) and must find Settings to switch. A link that
  opens in Ukrainian would help the first impression, and a branded copy (whitelabel) could use it too.
- **Options:**
  - A — no parameter for now (recommended). One tap in Settings fixes it, and the device language already covers most
    people with Ukrainian phones.
  - B — `?lang=uk` sets the language for this visit only (not stored), so a link never changes someone's saved
    choice. About 10 lines in the i18n provider; both `?demo` and normal links can use it.
  - C — `?lang=uk` stores the choice like a tap in Settings. Simpler for the user, but a link changes a preference.
- **What the code does meanwhile:** option A.
- **Status:** Open
