# Should the demo share the real language preference, or keep its own like every other preference?

- **Raised in:** task 02 (`src/state/demo.ts` `deviceKey`, plan D6)
- **Why it matters:** The lead's default was "device preferences in demo use a separate key prefix". The plan makes one
  exception: the language key `trade-journal:ui:lang` is shared. So a tester who switches to Українська in the demo
  finds the real app in Українська after Exit demo. That is a change to the tester's real device, even if a small one.
- **Options:**
  - A — share the language (recommended). Language belongs to the person, not to the portfolio; switching it back is
    one tap; the person most likely wants the same language in both.
  - B — demo keeps its own language key (`trade-journal:demo:ui:lang`), starting from the real choice or the device
    language. Strict "demo changes nothing" rule, but leaving the demo can switch the language back unexpectedly.
- **What the code does meanwhile:** option A.
- **Status:** Open
