# Should the two generic catalogue entries ("Paper / steel backup", "Other hardware wallet") get Ukrainian names?

- **Raised in:** task 04 (`src/storage-tags/catalogue.ts`, the picker and the bag screen in Ukrainian)
- **Why it matters:** plan D7 says brand names are not translated. These two entries are not brands, so in the
  Ukrainian UI they stand out as the only English words in the picker and on the bag screen (for example
  «Сховище: Paper / steel backup»).
- **Options:**
  - A — translate them (recommended): «Паперова / сталева копія» and «Інший апаратний гаманець». The catalogue keeps
    the English name; `storageList` takes the two display names from the dictionaries (`t.storage`), and search also
    matches the English name, so both words find the entry. A small change in `resolve.ts` and its callers.
  - B — keep the English names, like the brand names.
- **What the code does meanwhile:** B. The names come from `catalogue.ts` as they are.
- **Status:** Open
