// English messages: the source catalog. `Messages` is its type, so uk.ts must have exactly the same keys and
// parameters (plan D2). Values are strings, string lists, or functions with named parameters (plan D3).
// Numbers are formatted by the caller and passed in as strings; only whole counts for plurals are numbers.
import type { ErrorCode } from '../domain/errors'
import { pluralEn } from './plural'

const newTrades = pluralEn({ one: (n) => `${n} new`, other: (n) => `${n} new` })
const updatedTrades = pluralEn({ one: (n) => `${n} updated`, other: (n) => `${n} updated` })

export const en = {
  common: {
    close: 'Close',
    somethingWrong: 'Something went wrong',
  },
  header: {
    accounts: 'Accounts',
    addAccount: 'Add account',
    settings: 'Settings',
    backup: 'Backup',
    backupUnsaved: 'Backup, has changes not backed up',
  },
  bag: {
    oversold: (p: { qty: string }) => `Sold ${p.qty} more than held`,
    oversoldOn: (p: { qty: string; date: string }) => `Sold ${p.qty} more than held on ${p.date}`,
  },
  trade: {
    notNumber: 'Not a number',
    notPositive: 'Must be more than 0',
    dateInFuture: 'Date is in the future',
    readAs: (p: { value: string }) => `read as ${p.value}`,
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
  // One entry per ErrorCode (src/domain/errors.ts). The English texts match AppError.message, except the three
  // backup headlines (plan D13), which show the technical detail under them.
  errors: {
    symbolRequired: 'Symbol is required',
    accountNotFound: 'Account not found',
    bagOtherOwner: (p: { name: string }) => `Bag "${p.name}" belongs to another account or coin`,
    sideInvalid: 'Side must be buy or sell',
    dateInvalid: 'Date must be YYYY-MM-DD',
    qtyInvalid: 'Quantity must be a positive number',
    totalInvalid: 'Total must be a positive number',
    bagNotFound: 'Bag not found',
    tradeNotFound: 'Trade not found',
    bagNameRequired: 'Bag name is required',
    accountNameRequired: 'Account name is required',
    backupNotJournal: 'This file is not a Trade Journal backup',
    backupVersion: (p: { version: string }) => `This backup is from a newer version of the app (version ${p.version})`,
    backupDamaged: 'The backup file is damaged',
    storageFull: 'Could not save on this device (storage is full or blocked)',
    shareFailed: 'Could not open the share sheet',
    fileUnreadable: 'Could not read the file',
    fileNotJson: 'File is not valid JSON',
    searchOffline: 'Could not reach CoinGecko',
    searchRateLimited: 'Rate limited by CoinGecko, try again in a minute',
    searchHttp: (p: { status: number }) => `Coin search failed (HTTP ${p.status})`,
    searchFailed: 'Search failed',
    deviceOffline: 'Offline',
  } satisfies Record<ErrorCode, string | ((p: never) => string)>,
  // Why the last price refresh failed (PriceProblem), then how old the prices on screen are.
  prices: {
    offline: 'Could not reach CoinGecko',
    rateLimited: 'Rate limited',
    http: (p: { status: number }) => `Price update failed (HTTP ${p.status})`,
    badResponse: 'Price update failed (bad response)',
    failed: 'Price update failed',
    showingFrom: (p: { time: string }) => `showing prices from ${p.time}`,
    noPricesYet: 'no prices yet',
  },
}

export type Messages = typeof en
