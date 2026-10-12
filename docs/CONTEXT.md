# Trade Journal — glossary

The words the app, the code and these docs use. No implementation detail here; the shared data contract is
`src/domain/types.ts`.

The app is in English and Ukrainian. The Ukrainian word for each term is in the glossary in
[i18n/plan.md §8.1](i18n/plan.md); use the same words in every new string, and add every new string to both
`src/i18n/en.ts` and `src/i18n/uk.ts` (decision G4).

| Term             | Meaning                                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------------------------- |
| **Journal**      | Everything the app stores: accounts, coins, bags, trades (and, from the storage-tags feature, storages).  |
| **Account**      | A portfolio owner, shown as a tab at the top (e.g. "CS", "Family"). Its id is the lower-case name slug. Ukrainian UI: «Портфель». |
| **Coin**         | A coin symbol (BTC) with its name and the CoinGecko id used for its live price. Also called an *asset* in user talk. |
| **Bag**          | One trade idea for one coin in one account: a group of buys and sells with its own average cost. Each row in the Open / Closed list is a bag. Ukrainian UI: «Позиція». |
| **Trade**        | One buy or sell inside a bag: date, quantity and the USD total paid or received.                           |
| **Open / Closed**| A bag is *open* while it still holds coins; *closed* when everything bought has been sold.                |
| **Average cost** | The cost method: each sell takes coins out at the bag's average price. Gives *realized* P/L on sells and *unrealized* P/L on what is held. |
| **Value**        | For an open bag: what the coins still held are worth now (holding × live price). Unknown without a price.  |
| **Invested**     | For an open bag in the list: cost of the coins still held. For a closed bag: total of all buys.            |
| **Latest action**| The date of the newest buy or sell in a bag.                                                               |
| **Storage**      | A place where coins are kept: a centralised exchange (CEX), a decentralised exchange (DEX), a hot wallet or a cold wallet. Predefined ones ship with the app; the user can add custom ones. |
| **Storage tag**  | A storage attached to a bag. A bag can have several. With exactly one tag, its icon shows before the coin symbol. |
| **Backup**       | The `trades.json` file. *Save backup* writes it; *Load backup* merges it into the device's journal.       |
| **Tombstone**    | A record marked `deleted: true` instead of being removed, so the deletion survives a merge.                |
| **Settings**     | The sheet behind the gear button in the header: Language and About (feature 3 adds Accounts). Ukrainian UI: «Налаштування». |
| **UI language**  | English or Ukrainian. Follows the device until the user picks one in Settings; then it is a device preference. Stored data (names, notes) is never translated. |
| **Device preference** | A setting stored only on one device (sort order, storage filter, language). Not in backups.          |
| **Demo mode**    | The app opened with `?demo`: sample data, nothing saved, the user's real data untouched.                   |
| **Whitelabel / brand** | A copy of the app with another name, icon, colours and links (a branded copy, e.g. for a community). |
