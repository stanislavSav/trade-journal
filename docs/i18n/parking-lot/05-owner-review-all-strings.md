# Do all Ukrainian texts in the app read right?

- **Raised in:** task 05 (`src/i18n/uk.ts`, owner review)
- **Why it matters:** The Ukrainian catalog was written without a native speaker. Before the feature is announced,
  the owner reads every Ukrainian text once, in the app and in the table below, and marks what to change. The open
  word choices have their own items ([glossary](04-glossary-confirmation.md),
  [month names](03-default-bag-name-language.md), [Russian devices](01-russian-language-devices.md),
  [iPhone help text](04-iphone-help-text-in-ukrainian.md)); this item is for everything else.
- **How to review:** open the app, Settings → Українська, and click through every screen; or read the table. To
  change a text, edit `src/i18n/uk.ts` (the key is in the first column). `npm test` checks that no key is missing.
- **Texts changed during the layout check (task 05)** so that they fit a 320 px screen. Please confirm:
  - `trade.editTitle`: «Редагувати угоду BTC» → **«Змінити угоду BTC»** (the old one was cut off).
  - `trade.totalPlaceholderBuy`: «сплачено, з комісією» → **«сплачено з комісією»**.
  - `trade.totalPlaceholderSell`: «отримано, після комісії» → **«чиста виручка»** (the old one was cut off).
  - `list.costNoPrice` «собівартість · без ціни» now wraps onto two lines on narrow screens.
- **Other choices made while translating** (not in the planning glossary): «Кількість» as the field label (fits at
  320 px, so «К-сть» is not needed), «Немає мережі» for "Offline", «Ціни оновлюються» for "Refreshing prices",
  «Підсумок портфеля» for the summary card (screen readers only), «Тип угоди» for "Side", «Макс.» for "Max",
  «у журналі» for "in journal" (coin suggestions).
- **Options:**
  - A — keep the texts as they are, change single texts where the owner marks them (recommended).
  - B — a full rewrite by another native speaker before the announcement.
- **What the code does meanwhile:** option A; the texts below are in `uk.ts`. Function texts show sample values
  (BTC, 0.5, 14:02, …).
- **Status:** Open

## All texts (generated from `src/i18n/en.ts` and `src/i18n/uk.ts`, 2026-10-12)

| Key | English | Українська |
| --- | --- | --- |
| `common.close` | Close | Закрити |
| `common.cancel` | Cancel | Скасувати |
| `common.save` | Save | Зберегти |
| `common.back` | Back | Назад |
| `common.somethingWrong` | Something went wrong | Щось пішло не так |
| `header.accounts` | Accounts | Портфелі |
| `header.addAccount` | Add account | Додати портфель |
| `header.settings` | Settings | Налаштування |
| `header.backup` | Backup | Бекап |
| `header.backupUnsaved` | Backup, has changes not backed up | Бекап, є зміни без резервної копії |
| `summary.label` | Portfolio summary | Підсумок портфеля |
| `summary.value` | Value | Вартість |
| `summary.withoutPrice` | 1 of 4 without price | 1 з 4 без ціни |
| `summary.openPl` | Open P/L | P/L відкритих |
| `summary.realized` | Realized | Реалізовано |
| `summary.pricesAt` | prices 14:02 | ціни 14:02 |
| `summary.refresh` | Refresh prices | Оновити ціни |
| `summary.refreshing` | Refreshing prices | Ціни оновлюються |
| `list.label` | Bags | Позиції |
| `list.open` | Open | Відкриті |
| `list.closed` | Closed | Закриті |
| `list.emptyOpen` | No open bags. Tap + to add a trade. | Відкритих позицій немає. Натисніть +, щоб додати угоду. |
| `list.emptyClosed` | No closed bags yet. | Закритих позицій поки немає. |
| `list.qtyAvg` | 0.5 · avg 53,333 | 0.5 · сер. 53,333 |
| `list.costNoPrice` | cost · no price | собівартість · без ціни |
| `list.hasWarnings` | Has warnings | Є попередження |
| `list.hasWarningsSr` | , has warnings | , є попередження |
| `bag.open` | Open | Відкрита |
| `bag.closed` | Closed | Закрита |
| `bag.noLivePrice` | no live price | без актуальної ціни |
| `bag.holding` | Holding | Залишок |
| `bag.avgCost` | Avg cost | Сер. ціна |
| `bag.cost` | Cost | Собівартість |
| `bag.price` | Price | Ціна |
| `bag.value` | Value | Вартість |
| `bag.unrealized` | Unrealized | Нереалізовано |
| `bag.invested` | Invested | Вкладено |
| `bag.proceeds` | Proceeds | Виручка |
| `bag.realized` | Realized | Реалізовано |
| `bag.dates` | Dates | Дати |
| `bag.checkTrades` | Check these trades | Перевірте ці угоди |
| `bag.oversold` | Sold 0.5 more than held | Продано на 0.5 більше, ніж було в позиції |
| `bag.oversoldOn` | Sold 0.5 more than held on 21.07.26 | 21.07.26: продано на 0.5 більше, ніж було в позиції |
| `bag.buyMore` | Buy more | Докупити |
| `bag.sell` | Sell | Продати |
| `bag.trades` | Trades | Угоди |
| `bag.rename` | Rename | Перейменувати |
| `bag.nameLabel` | Bag name | Назва позиції |
| `trade.addTitle` | Add trade | Додати угоду |
| `trade.editTitle` | Edit BTC trade | Змінити угоду BTC |
| `trade.side` | Side | Тип угоди |
| `trade.buy` | BUY | КУПІВЛЯ |
| `trade.sell` | SELL | ПРОДАЖ |
| `trade.account` | Account | Портфель |
| `trade.asset` | Asset | Монета |
| `trade.bag` | Bag | Позиція |
| `trade.bagClosed` | Long-term (closed) | Long-term (закрита) |
| `trade.holdingHint` | holding 0.5 · avg 53,333 | залишок 0.5 · сер. 53,333 |
| `trade.newBag` | New bag… | Нова позиція… |
| `trade.newBagName` | Name | Назва |
| `trade.noBagToSell` | No open BTC bag in CS to sell from | У портфелі CS немає відкритої позиції BTC для продажу |
| `trade.date` | Date | Дата |
| `trade.unknownDate` | Unknown date, shown as ? | Дата невідома, показується як ? |
| `trade.unknown` | Unknown | Невідома |
| `trade.today` | Today | Сьогодні |
| `trade.qty` | Qty | Кількість |
| `trade.max` | Max | Макс. |
| `trade.total` | Total $ | Сума $ |
| `trade.totalPlaceholderBuy` | paid, fees included | сплачено з комісією |
| `trade.totalPlaceholderSell` | received, after fees | чиста виручка |
| `trade.price` | Price | Ціна |
| `trade.auto` | (auto) | (авто) |
| `trade.sellPl` | P/L on this sell | P/L цього продажу |
| `trade.holdOnly` | You hold only 0.5 | У вас лише 0.5 |
| `trade.notNumber` | Not a number | Це не число |
| `trade.notPositive` | Must be more than 0 | Має бути більше 0 |
| `trade.dateInFuture` | Date is in the future | Дата в майбутньому |
| `trade.readAs` | read as $1,812 | прочитано як $1,812 |
| `trade.missingAsset` | asset | монету |
| `trade.missingQty` | qty | кількість |
| `trade.missingTotal` | total | суму |
| `trade.enter` | Enter … | Введіть … |
| `trade.addNote` | Add note | Додати нотатку |
| `trade.note` | Note | Нотатка |
| `trade.saveChanges` | Save changes | Зберегти зміни |
| `trade.deleteTrade` | Delete trade | Видалити угоду |
| `trade.tapAgainToDelete` | Tap again to delete | Натисніть ще раз, щоб видалити |
| `trade.months` | Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec | Січ Лют Бер Квіт Трав Черв Лип Серп Вер Жовт Лист Груд |
| `trade.newBagDefault` | New | Нова |
| `trade.bought` | Bought 0.5 BTC | Куплено 0.5 BTC |
| `trade.sold` | Sold 0.5 BTC | Продано 0.5 BTC |
| `trade.updated` | Trade updated | Угоду оновлено |
| `trade.deleted` | Trade deleted | Угоду видалено |
| `search.coinNoLivePrice` | Long-term · no live price | Long-term · без актуальної ціни |
| `search.newCoinPick` | New coin · pick it from the list for a live price | Нова монета · оберіть її зі списку, щоб бачити актуальну ціну |
| `search.newCoinNoPrice` | New coin · no live price | Нова монета · без актуальної ціни |
| `search.typeHint` | Type a symbol or name | Введіть символ або назву |
| `search.suggestions` | Suggestions | Підказки |
| `search.inJournal` | in journal | у журналі |
| `search.searching` | Searching… | Пошук… |
| `search.unavailable` | Search unavailable (…). You can still save. | Пошук недоступний (…). Угоду все одно можна зберегти. |
| `search.noCoins` | No coins found | Монет не знайдено |
| `account.title` | Add account | Додати портфель |
| `account.name` | Name | Назва |
| `account.placeholder` | e.g. Family | напр. Сім’я |
| `account.exists` | This account already exists | Такий портфель уже існує |
| `account.add` | Add account | Додати портфель |
| `account.none` | No accounts yet. | Портфелів поки немає. |
| `backup.title` | Backup | Резервна копія |
| `backup.lastBackup` | Last backup | Остання копія |
| `backup.none` | No backup yet | Копій ще немає |
| `backup.changesSince` | changes since then | є зміни після неї |
| `backup.save` | Save backup | Зберегти копію |
| `backup.saving` | Saving… | Збереження… |
| `backup.saved` | Backup saved | Копію збережено |
| `backup.downloaded` | Downloaded trades.json | Завантажено trades.json |
| `backup.iphoneHelp` | On iPhone choose Save to Files → iCloud Drive → Trades and replace trades.json. | На iPhone оберіть збереження у Файли → iCloud Drive → Trades і замініть trades.json. |
| `backup.load` | Load backup | Завантажити копію |
| `backup.loading` | Loading… | Завантаження… |
| `backup.loadHelp` | Loading merges the file into this device. Trades that are only here are kept. | Файл об’єднається з даними на цьому пристрої. Угоди, які є лише тут, збережуться. |
| `backup.merged (1)` | Merged: 1 new, 0 updated | Об’єднано: 1 нова, 0 оновлених |
| `backup.merged (3)` | Merged: 3 new, 0 updated | Об’єднано: 3 нові, 0 оновлених |
| `backup.merged (5)` | Merged: 5 new, 0 updated | Об’єднано: 5 нових, 0 оновлених |
| `backup.saveFailed` | …. Save a backup now. | …. Збережіть резервну копію зараз. |
| `settings.title` | Settings | Налаштування |
| `settings.language` | Language | Мова |
| `settings.languageHint` | Until you choose, the app follows the language of this device. | Поки ви не оберете, застосунок використовує мову цього пристрою. |
| `settings.about` | About | Про застосунок |
| `settings.dataStays` | Your data stays on this device. No account, no server, no tracking. Prices come from CoinGecko. | Ваші дані зберігаються лише на цьому пристрої. Без облікового запису, без сервера, без стеження. Ціни — з CoinGecko. |
| `settings.sourceCode` | Source code on GitHub | Вихідний код на GitHub |
| `settings.licence` | MIT licence | Ліцензія MIT |
| `settings.opensInNewTab` | (opens in a new tab) | (відкриється в новій вкладці) |
| `crash.stillStored` | Your trades are still stored on this device. | Ваші угоди досі збережені на цьому пристрої. |
| `crash.saveBackup` | Save backup | Зберегти копію |
| `crash.reload` | Reload | Перезавантажити |
| `crash.backupSaved` | Backup saved | Копію збережено |
| `errors.symbolRequired` | Symbol is required | Вкажіть символ монети |
| `errors.accountNotFound` | Account not found | Портфель не знайдено |
| `errors.bagOtherOwner` | Bag "Long-term" belongs to another account or coin | Позиція «Long-term» належить іншому портфелю або іншій монеті |
| `errors.sideInvalid` | Side must be buy or sell | Тип угоди має бути «купівля» або «продаж» |
| `errors.dateInvalid` | Date must be YYYY-MM-DD | Дата має бути у форматі РРРР-ММ-ДД |
| `errors.qtyInvalid` | Quantity must be a positive number | Кількість має бути додатним числом |
| `errors.totalInvalid` | Total must be a positive number | Сума має бути додатним числом |
| `errors.bagNotFound` | Bag not found | Позицію не знайдено |
| `errors.tradeNotFound` | Trade not found | Угоду не знайдено |
| `errors.bagNameRequired` | Bag name is required | Введіть назву позиції |
| `errors.accountNameRequired` | Account name is required | Введіть назву портфеля |
| `errors.backupNotJournal` | This file is not a Trade Journal backup | Цей файл не є резервною копією Trade Journal |
| `errors.backupVersion` | This backup is from a newer version of the app (version 3) | Цю копію створено новішою версією застосунку (версія 3) |
| `errors.backupDamaged` | The backup file is damaged | Файл резервної копії пошкоджено |
| `errors.storageFull` | Could not save on this device (storage is full or blocked) | Не вдалося зберегти на цьому пристрої (сховище переповнене або заблоковане) |
| `errors.shareFailed` | Could not open the share sheet | Не вдалося відкрити меню «Поділитися» |
| `errors.fileUnreadable` | Could not read the file | Не вдалося прочитати файл |
| `errors.fileNotJson` | File is not valid JSON | Файл не є коректним JSON |
| `errors.searchOffline` | Could not reach CoinGecko | Не вдалося з’єднатися з CoinGecko |
| `errors.searchRateLimited` | Rate limited by CoinGecko, try again in a minute | Забагато запитів до CoinGecko, спробуйте за хвилину |
| `errors.searchHttp` | Coin search failed (HTTP 503) | Помилка пошуку монет (HTTP 503) |
| `errors.searchFailed` | Search failed | Пошук не вдався |
| `errors.deviceOffline` | Offline | Немає мережі |
| `prices.offline` | Could not reach CoinGecko | Не вдалося з’єднатися з CoinGecko |
| `prices.rateLimited` | Rate limited | Забагато запитів до CoinGecko |
| `prices.http` | Price update failed (HTTP 503) | Не вдалося оновити ціни (HTTP 503) |
| `prices.badResponse` | Price update failed (bad response) | Не вдалося оновити ціни (неправильна відповідь) |
| `prices.failed` | Price update failed | Не вдалося оновити ціни |
| `prices.showingFrom` | showing prices from 14:02 | показано ціни станом на 14:02 |
| `prices.noPricesYet` | no prices yet | цін ще немає |
