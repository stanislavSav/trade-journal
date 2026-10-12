// Ukrainian messages. Words follow the glossary in docs/i18n/plan.md §8.1: Bag = «Позиція», Account = «Портфель»,
// polite Ви forms (D17, D18). Numbers keep the $1,234.56 format (D8).
import type { Messages } from './en'
import { pluralUk } from './plural'

// A trade is «угода» (feminine).
const newTrades = pluralUk({
  one: (n) => `${n} нова`,
  few: (n) => `${n} нові`,
  many: (n) => `${n} нових`,
  other: (n) => `${n} нової`,
})
const updatedTrades = pluralUk({
  one: (n) => `${n} оновлена`,
  few: (n) => `${n} оновлені`,
  many: (n) => `${n} оновлених`,
  other: (n) => `${n} оновленої`,
})

export const uk: Messages = {
  common: {
    close: 'Закрити',
    somethingWrong: 'Щось пішло не так',
  },
  header: {
    accounts: 'Портфелі',
    addAccount: 'Додати портфель',
    settings: 'Налаштування',
    backup: 'Бекап',
    backupUnsaved: 'Бекап, є зміни без резервної копії',
  },
  bag: {
    oversold: (p) => `Продано на ${p.qty} більше, ніж було в позиції`,
    oversoldOn: (p) => `${p.date}: продано на ${p.qty} більше, ніж було в позиції`,
  },
  trade: {
    notNumber: 'Це не число',
    notPositive: 'Має бути більше 0',
    dateInFuture: 'Дата в майбутньому',
    readAs: (p) => `прочитано як ${p.value}`,
  },
  backup: {
    merged: (p) => `Об’єднано: ${newTrades(p.added)}, ${updatedTrades(p.updated)}`,
  },
  settings: {
    title: 'Налаштування',
    language: 'Мова',
    languageHint: 'Поки ви не оберете, застосунок використовує мову цього пристрою.',
    about: 'Про застосунок',
    dataStays:
      'Ваші дані зберігаються лише на цьому пристрої. Без облікового запису, без сервера, без стеження. Ціни — з CoinGecko.',
    sourceCode: 'Вихідний код на GitHub',
    licence: 'Ліцензія MIT',
    opensInNewTab: '(відкриється в новій вкладці)',
  },
  errors: {
    symbolRequired: 'Вкажіть символ монети',
    accountNotFound: 'Портфель не знайдено',
    bagOtherOwner: (p) => `Позиція «${p.name}» належить іншому портфелю або іншій монеті`,
    sideInvalid: 'Тип угоди має бути «купівля» або «продаж»',
    dateInvalid: 'Дата має бути у форматі РРРР-ММ-ДД',
    qtyInvalid: 'Кількість має бути додатним числом',
    totalInvalid: 'Сума має бути додатним числом',
    bagNotFound: 'Позицію не знайдено',
    tradeNotFound: 'Угоду не знайдено',
    bagNameRequired: 'Введіть назву позиції',
    accountNameRequired: 'Введіть назву портфеля',
    backupNotJournal: 'Цей файл не є резервною копією Trade Journal',
    backupVersion: (p) => `Цю копію створено новішою версією застосунку (версія ${p.version})`,
    backupDamaged: 'Файл резервної копії пошкоджено',
    storageFull: 'Не вдалося зберегти на цьому пристрої (сховище переповнене або заблоковане)',
    shareFailed: 'Не вдалося відкрити меню «Поділитися»',
    fileUnreadable: 'Не вдалося прочитати файл',
    fileNotJson: 'Файл не є коректним JSON',
    searchOffline: 'Не вдалося з’єднатися з CoinGecko',
    searchRateLimited: 'Забагато запитів до CoinGecko, спробуйте за хвилину',
    searchHttp: (p) => `Помилка пошуку монет (HTTP ${p.status})`,
    searchFailed: 'Пошук не вдався',
    deviceOffline: 'Немає мережі',
  },
  prices: {
    offline: 'Не вдалося з’єднатися з CoinGecko',
    rateLimited: 'Забагато запитів до CoinGecko',
    http: (p) => `Не вдалося оновити ціни (HTTP ${p.status})`,
    badResponse: 'Не вдалося оновити ціни (неправильна відповідь)',
    failed: 'Не вдалося оновити ціни',
    showingFrom: (p) => `показано ціни станом на ${p.time}`,
    noPricesYet: 'цін ще немає',
  },
}
