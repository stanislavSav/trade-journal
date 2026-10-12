# Some brand kits set rules that a small logo tile cannot meet (minimum size, "no mark without the wordmark"). Is that acceptable?

- **Raised in:** task 02 (`scripts/storage-icons.mjs`, the official logo files in `scripts/storage-icons/official/`)
- **Why it matters:** the owner decided to ship real logos even where the brand terms ask for permission first (plan
  D8). That decision is about permission. A few kits also set **drawing rules** that the app breaks because of the
  tile size (18 px in list rows, 28 px in the picker), or because the app shows the symbol without the wordmark:
  - **Orca:** minimum logo height 50 px.
  - **Raydium:** symbol minimum 24 px on screen.
  - **MEXC:** the kit says "do not use the logomark alone without the wordmark", but it also gives a size rule for the
    mark alone (16 px), so the kit contradicts itself.
  - **Aster:** the kit has no symbol-only file; the app shows the round symbol of the "symbol + ASTER" file by
    cropping the view (the drawing is not changed). The kit also has the symbol alone as a PNG ("Aster Roundel").
  - **NGRAVE:** the kit has PNG files only; the app shows the colour gem of the logo on ngrave.io, cropped the same
    way, on a black tile (the kit shows the gem on black).
  - **Phemex** and **XT.COM:** no symbol-only file; the symbol is cropped from the site logo in the same way.
  - **WhiteBIT:** the rules say "use on a dark background", but the kit zip has only dark marks for white
    backgrounds. The app uses the dark mark on a white tile, as in the zip.
  - **Bitfinex:** kit files are "strictly for editorial, news, and media coverage".
- **Options:**
  - A — keep these logos as they are (recommended). It is the same nominative use as the rest; the rules are written
    for marketing material, not for a 18 px label next to the name.
  - B — show a letter badge for the brands whose rule is broken (Orca, Raydium, MEXC, Aster, NGRAVE, Phemex, XT.COM).
    One line per brand in the source table of the script, plus the row in catalogue.md.
- **What the code does meanwhile:** A.
- **Status:** Open
