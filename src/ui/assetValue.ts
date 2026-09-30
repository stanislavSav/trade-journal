export interface AssetPick {
  symbol: string
  name: string
  geckoId: string | null
}

export interface AssetValue {
  text: string
  pick: AssetPick | null // set when chosen from the suggestions
}

export const assetSymbol = (v: AssetValue) => v.text.trim().toUpperCase()

/** The pick only counts while the text still shows its symbol. */
export function currentPick(v: AssetValue): AssetPick | null {
  return v.pick && v.pick.symbol === assetSymbol(v) ? v.pick : null
}
