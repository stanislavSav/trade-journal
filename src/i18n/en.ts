// English messages: the source catalog. `Messages` is its type, so uk.ts must have exactly the same keys and
// parameters (plan D2). Values are strings, string lists, or functions with named parameters (plan D3).
// Numbers are formatted by the caller and passed in as strings; only whole counts for plurals are numbers.
import { pluralEn } from './plural'

const newTrades = pluralEn({ one: (n) => `${n} new`, other: (n) => `${n} new` })
const updatedTrades = pluralEn({ one: (n) => `${n} updated`, other: (n) => `${n} updated` })

export const en = {
  common: {
    close: 'Close',
  },
  header: {
    accounts: 'Accounts',
    addAccount: 'Add account',
    settings: 'Settings',
    backup: 'Backup',
    backupUnsaved: 'Backup, has changes not backed up',
  },
  backup: {
    merged: (p: { added: number; updated: number }) => `Merged: ${newTrades(p.added)}, ${updatedTrades(p.updated)}`,
  },
  settings: {
    title: 'Settings',
    language: 'Language',
    languageHint: 'Until you choose, the app follows the language of this device.',
    about: 'About',
    dataStays: 'Your data stays on this device. No account, no server, no tracking. Prices come from CoinGecko.',
    sourceCode: 'Source code on GitHub',
    licence: 'MIT licence',
    opensInNewTab: '(opens in a new tab)',
  },
}

export type Messages = typeof en
