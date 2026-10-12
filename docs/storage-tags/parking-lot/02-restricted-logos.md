# Should the app show the logos of brands whose terms ask for permission first (Ledger, Trezor, MEXC, Gemini, …), or a letter badge for them?

- **Raised in:** planning, for task 02 ([catalogue.md](../catalogue.md), the 13 rows were marked `LETTER (R)` until
  this decision; `scripts/storage-icons.mjs`)
- **Why it matters:** the owner decided on real logos (plan D4). For most brands that is fine: the drawing comes from
  Simple Icons (CC0) or Web3 Icons (MIT), or from the brand's own kit, and the app uses the logo only to name the place
  where the user keeps coins. But 13 brands say in their terms that third parties need permission, or may not use the
  logo at all:
  - **Ledger** (terms of use §I.B): "Ledger's trademarks and logos may not be used for products or services that are
    not respectively manufactured or offered by Ledger … you agree not to reproduce … any or all of Ledger's
    trademarks, logos".
  - **Trezor** (website terms §7.2): "The trademarks may not be used by you without prior, written, consent by Trezor
    Company s.r.o." (The Trezor logo is in Simple Icons under CC0, but CC0 covers only the drawing.)
  - **MEXC** (prior approval for public use), **Bitfinex** (media use only), **Gemini** (ask before using on websites or
    products), **PayPal** (prior written consent), **Cash App** (only Cash App and its licensees), **Bitvavo** (no right
    granted), **LBank** (no commercial use), **Paradex** ("don't use in your own products and services"), **Aster**
    (approval needed), **Orca** (contact before external use), **Satochip** (authorised purposes only).

  Ledger and Trezor are the two most used cold wallets, so the owner will notice the letter badge.
  This is not legal advice. Showing a small unmodified logo next to the brand name, in a free personal app with no
  ads and no claim of partnership, is the usual "nominative use" case. But it goes against the written terms of these
  brands.
- **Options:**
  - A — letter badge for these 13 until a brand gives permission (recommended for a public, open-source repo: feature #1
    publishes the code, so the logos are distributed, not only shown on one phone). Asking for permission is one e-mail
    per brand. If a brand agrees, task 02 moves its row to the logo source in brackets.
  - B — ship all logos, including these 13, and remove one when a brand objects. It is one file per brand, and stored
    data does not change.
  - C — ship logos only on the owner's own build (for example a flag in a local `.env`), and letter badges in the public
    repo and on the public site.
- **What the code does meanwhile:** A. The icon script has a `RESTRICTED` list with these ids and makes no tile for
  them, so `StorageIcon` draws a letter badge in the brand colour. Switching one brand to B is one line in the script
  and one row in catalogue.md.
- **Status:** Decided (2026-10-12): B — **real logos for all brands**, including these 13. There is no `RESTRICTED`
  list and no letter badge because of brand terms. The `NOTICE.md` file and the trademark sentence stay. If a brand
  asks to remove its logo, reply promptly and swap it to its letter badge (a one-line change in the icon script and
  one row in catalogue.md). Letter badges stay only where no logo source exists and for custom storages. Applied in
  plan D8, §6.4, §9, [catalogue.md](../catalogue.md) and task 02.
