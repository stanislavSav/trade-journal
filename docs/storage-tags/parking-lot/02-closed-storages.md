# Should the catalogue also list storages that have closed (Kuna, EXMO, FTX, Zonda), so that old bags can be tagged where they really were?

- **Raised in:** planning, for task 02 ([catalogue.md](../catalogue.md), "Not included" notes)
- **Why it matters:** the catalogue lists only storages that operate in October 2026. But the journal holds history, and
  closed bags may have been bought on exchanges that no longer exist. Two of them were popular in Ukraine: **Kuna**
  (wound down in 2025 after a court block) and **EXMO** (closing since July 2026). FTX and Zonda (zondacrypto, ex-BitBay)
  closed with frozen customer funds. The same will happen again: a storage in today's list can close next year, and its
  id must keep working for the bags that use it.
- **Options:**
  - A — closed storages stay in the catalogue with "(closed)" after the name, and are shown only in search and in "Used
    in this journal", not in the kind groups (recommended). Add Kuna and EXMO now; keep any future closed storage the
    same way. No logos for them (their brand kits are gone): letter badge.
  - B — the catalogue holds live storages only; the user adds a closed one as a custom storage. Simple, but then a
    storage that closes later must stay in the list anyway (its id is on bags), so the rule is not really simpler.
  - C — keep closed storages without any marker.
- **What the code does meanwhile:** B for Kuna, EXMO, FTX and Zonda (not in the catalogue; the user can add them as
  custom storages). Ids are never removed from the catalogue, so a storage that closes later keeps working as it is.
- **Status:** Decided (2026-10-12): B — closed exchanges (Kuna, EXMO, FTX, Zonda) are **not listed**; users add them
  as custom storages. A listed storage that closes later keeps its catalogue row, because bags use its id. Applied in
  plan D9 and [catalogue.md](../catalogue.md).
