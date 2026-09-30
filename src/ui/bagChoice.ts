import { openBagsFor, type AccountSummary, type BagSummary, type Journal, type Side } from '../domain'

/** Select value for "New bag…". */
export const NEW_BAG = '__new__'

/**
 * Bags a trade can go into: the open bags of this coin (largest first). A buy started from a
 * closed bag's "Buy more" also offers that bag, so it can be reopened.
 */
export function bagOptions(
  journal: Journal,
  account: AccountSummary,
  symbol: string,
  side: Side,
  presetBagId: string | undefined,
): BagSummary[] {
  if (!symbol) return []
  const byId = new Map([...account.open, ...account.closed].map((s) => [s.bag.id, s]))
  const options = openBagsFor(journal, account.accountId, symbol)
    .map((b) => byId.get(b.id))
    .filter((s): s is BagSummary => s !== undefined)
  if (side === 'buy' && presetBagId && !options.some((s) => s.bag.id === presetBagId)) {
    const extra = byId.get(presetBagId)
    if (extra && extra.bag.symbol === symbol) options.push(extra)
  }
  return options
}

/** The user's choice if it is still possible, else the default (largest bag, or a new bag for buys). */
export function resolveBagChoice(choice: string | null, options: BagSummary[], side: Side): string | null {
  if (side === 'buy' && choice === NEW_BAG && options.length > 0) return NEW_BAG
  if (choice && options.some((s) => s.bag.id === choice)) return choice
  if (options[0]) return options[0].bag.id
  return side === 'buy' ? NEW_BAG : null
}

/** Sells that match the holding up to float noise count as "sell everything". */
export function snapToHeld(qty: number, held: number | null): number {
  return held !== null && Math.abs(qty - held) <= held * 1e-9 + 1e-12 ? held : qty
}

export function exceedsHeld(qty: number | null, held: number | null): boolean {
  return held !== null && qty !== null && qty > held * (1 + 1e-9) + 1e-12
}
