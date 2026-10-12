# Four brands that were planned with a logo now show a letter badge. Should we ask them for a usable logo file?

- **Raised in:** task 02 (`scripts/storage-icons.mjs`, [catalogue.md](../catalogue.md) "Changes made in task 02")
- **Why it matters:** the plan expected 101 logos; 97 ship. The other four have a logo source, but the file cannot be
  used as a small square tile:
  - **Sparrow Wallet** (`REPO`): the SVG in the repository is a traced drawing of about 100 small shapes, 15 KB after
    clean-up. The budget is 6 KB per file.
  - **SeedSigner** (`REPO`): the repository has only the "SEED SIGNER" wordmark, which is not readable at 18–28 px.
  - **COLDCARD** (`KIT`): the Coinkite media kit has only the wide "COLDCARD" wordmark (about 5:1).
  - **Bitstamp** (`W3I`): the Web3 Icons tile shows the old green "B" with a bar; the current mark is dark green
    without the bar, and Bitstamp publishes no SVG (only a PNG favicon).
- **Options:**
  - A — keep the letter badges (recommended for now). Each badge uses the brand colour, so it still reads as the brand.
  - B — ask each project for a square SVG mark (Sparrow and SeedSigner are open-source projects; an issue in their
    repository is enough). When a file arrives, add it to `scripts/storage-icons/official/`, add one line to the source
    table, and set the catalogue row back to `REPO` / `KIT`.
  - C — draw a simplified Sparrow tile by hand from the traced file. Not recommended: the plan says nothing is redrawn
    by hand (plan §8.9).
- **What the code does meanwhile:** A.
- **Status:** Open
