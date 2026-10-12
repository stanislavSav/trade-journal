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
  },
  header: {
    accounts: 'Портфелі',
    addAccount: 'Додати портфель',
    settings: 'Налаштування',
    backup: 'Бекап',
    backupUnsaved: 'Бекап, є зміни без резервної копії',
  },
  backup: {
    merged: (p) => `Об'єднано: ${newTrades(p.added)}, ${updatedTrades(p.updated)}`,
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
}
