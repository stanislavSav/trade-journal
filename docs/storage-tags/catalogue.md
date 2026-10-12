# Storage tags — predefined catalogue

> **Checked:** 2026-10-12 (status, names, colours, brand kits) · **Plan:** [plan.md](plan.md) §6.4 ·
> **Used by:** task 02 (`src/storage-tags/catalogue.ts`, `scripts/storage-icons.mjs`)

This file is the source of truth for the predefined storages: ids, names, kinds, colours and where each logo comes
from. `src/storage-tags/catalogue.ts` must contain exactly the rows below. Change this file first, then the code.

**Size:** 39 exchanges · 33 DEXes · 37 hot wallets · 25 cold wallets (2 of them generic) = **134 storages**.

## How to read the tables

- **id** — stable, lower case, `a–z`, `0–9`, `-`. **Never change or reuse an id**: bags store it. When a brand is renamed,
  change `name` and add the old name to the aliases.
- **Colour** — the brand colour as `#rrggbb`. It is the tile background behind the logo, and the badge colour when there
  is no logo. Source codes: **BK** brand kit · **SI** Simple Icons · **W3I** Web3 Icons · **FAV** main colour of the
  official favicon or touch icon on 2026-10-12 (measured, not a published value) · **CSS** official site CSS · **?**
  not verified: use the placeholder `#5b5b60` until task 02 takes the colour from the brand kit or the favicon.
- **Icon** — where the logo file comes from (plan §6.4):
  - `SI:<slug>` — Simple Icons 16.35.0, drawing under **CC0-1.0**.
  - `W3I:<set>/<name>` — Web3 Icons (`@web3icons/core`) 4.0.58, `background` variant, drawing under **MIT**.
  - `KIT` — an SVG from the brand's own kit (URL in Notes), added by hand. **No open licence**: trademark, used only to
    name the service (nominative use), unchanged, in a colour pair the kit allows.
  - `REPO` — the logo file from the project's open-source repository (licence in Notes). Code licences cover copyright
    only; the name and logo stay trademarks.
  - `LETTER` — no logo source exists; `StorageIcon` draws a letter badge in the colour.
  - `OWN` — a generic icon drawn for this app (no brand), in the style of `src/ui/icons.tsx`.
- **Every logo is a trademark of its owner**, whatever the drawing licence. CC0 and MIT cover the drawing, not the mark.
- **Terms that ask for permission.** The Notes of 13 rows quote brand terms that ask for permission first, or limit
  third-party use of the logo: MEXC, Bitfinex, Gemini, Bitvavo, PayPal, Cash App, LBank, Orca, Paradex, Aster, Ledger,
  Trezor, Satochip. The owner decided on 2026-10-12 to ship their real logos too
  ([plan D8](plan.md), [parking lot 02-restricted-logos](parking-lot/02-restricted-logos.md)). If a brand asks to
  remove its logo, set its row to `LETTER` (plan §9).
- "Check" in Notes means: Web3 Icons may show an older logo; compare with the brand's current logo in task 02 and use
  the kit (or `LETTER`) if they differ.

## Exchanges (CEX) — kind `cex`

| id           | Name       | Colour            | Website                 | Icon                             | Notes                                                                                                                                      |
| ------------ | ---------- | ----------------- | ----------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| binance      | Binance    | `#f0b90b` SI      | binance.com             | `SI:binance`                     | Most used in Ukraine (92 % in a 2025 trader survey). Style guide via binance.com/en/press.                                                |
| coinbase     | Coinbase   | `#0052ff` SI      | coinbase.com            | `SI:coinbase`                    | Kit coinbase.com/press: no rotation, recolour or effects; Coinbase may end any use.                                                        |
| kraken       | Kraken     | `#7132f5` FAV     | kraken.com              | `W3I:exchanges/kraken`           | Check: W3I uses the older purple `#5741d9`. Logos only on request (kraken.com/press).                                                       |
| okx          | OKX        | `#000000` SI      | okx.com                 | `SI:okx`                         | Black tile: needs the ring in dark mode.                                                                                                   |
| bybit        | Bybit      | `#f7a600` W3I     | bybit.com               | `W3I:exchanges/bybit`            | Kit: bybit.com/en/press (Brand Assets).                                                                                                    |
| bitget       | Bitget     | `#00f0ff` W3I     | bitget.com              | `W3I:exchanges/bitget`           | No exchange kit found (the wallet kit forbids stretch, tilt, recolour).                                                                    |
| kucoin       | KuCoin     | `#01bc8d` SI      | kucoin.com              | `SI:kucoin`                      | Kit: kucoin.com/announcement/en-media-kit.                                                                                                 |
| gate         | Gate       | `#2354e6` W3I     | gate.com                | `KIT`                            | Renamed from Gate.io on 2025-05-19, new logo. Kit gate.com/en-us/media-kit. W3I `gate-io` shows the old logo. Aliases: gate.io.          |
| htx          | HTX        | `#008cd6` FAV     | htx.com                 | `LETTER`                         | Renamed from Huobi in 2023. No kit found. Aliases: huobi.                                                                                  |
| mexc         | MEXC       | `#0057ff` BK      | mexc.com                | `KIT`                            | Kit mexc.com/brand-guidelines: prior approval for public use; no changes. Logo refreshed Aug–Sep 2026.                                     |
| crypto-com   | Crypto.com | `#03316c` W3I     | crypto.com              | `W3I:exchanges/crypto-com`       | No kit found.                                                                                                                              |
| bitfinex     | Bitfinex   | `#03ca9b` BK      | bitfinex.com            | `KIT`                            | Kit bitfinex.com/press: media use only; other use needs written approval from iFinex.                                                      |
| bitstamp     | Bitstamp   | `#003a2f` FAV     | bitstamp.net            | `W3I:exchanges/bitstamp`         | Owned by Robinhood since June 2025. Check: W3I uses the older green `#149f49`.                                                             |
| gemini       | Gemini     | `#00dcfa` W3I     | gemini.com              | `W3I:exchanges/gemini`           | Press kit at gemini.com/news: ask before using the logo on websites or products. Live favicon is now orange `#ff4809`: check.        |
| bingx        | BingX      | `#0047ff` FAV     | bingx.com               | `LETTER`                         | No kit found.                                                                                                                              |
| bitmart      | BitMart    | `#18181d` FAV     | bitmart.com             | `LETTER`                         | No kit found.                                                                                                                              |
| upbit        | Upbit      | `#093687` W3I     | upbit.com               | `W3I:exchanges/upbit`            | Korea.                                                                                                                                     |
| bithumb      | Bithumb    | `#f47320` W3I     | bithumb.com             | `W3I:exchanges/bithumb`          | Korea. Check: new Korean-script logo since Oct 2024.                                                                                       |
| whitebit     | WhiteBIT   | `#181834` FAV     | whitebit.com            | `KIT`                            | Main exchange in Ukraine. Kit whitebit.com/brand-guideline: no changes, use on a dark background, no implied partnership, exact spelling. |
| bitvavo      | Bitvavo    | `#0051ff` FAV     | bitvavo.com             | `KIT`                            | Terms: no right to use the name or logo is granted. Kit bitvavo.com/en/press.                                                              |
| bitpanda     | Bitpanda   | `#0f3e36` FAV     | bitpanda.com            | `KIT`                            | Rebranded to dark green Aug–Sep 2025. Kit bitpanda.com/en/press-downloads.                                                                |
| revolut      | Revolut    | `#191c1f` SI      | revolut.com             | `SI:revolut`                     | Broker app. Use only Revolut's own artwork, unchanged.                                                                                     |
| robinhood    | Robinhood  | `#ccff00` SI      | robinhood.com           | `SI:robinhood`                   | Broker app. New identity Oct 2024. Light tile: black glyph.                                                                                |
| paypal       | PayPal     | `#002991` SI      | paypal.com              | `SI:paypal`                      | No copying or changing the logo without prior written consent.                                                                             |
| cash-app     | Cash App   | `#00c244` SI      | cash.app                | `SI:cashapp`                     | Trademark policy: only Cash App and its licensees may use the logo.                                                                        |
| nexo         | Nexo       | `#0a0d11` FAV     | nexo.com                | `KIT`                            | Rebranded about 2024. Brand kit in the nexo.com media center; read its usage guide before bundling.                                       |
| uphold       | Uphold     | `#49cc68` SI      | uphold.com              | `SI:uphold`                      | Kit uphold.design: no change or redraw; clear space.                                                                                       |
| swissborg    | SwissBorg  | `#01c38d` W3I     | swissborg.com           | `W3I:exchanges/swissborg`        | Kit swissborg.com/press.                                                                                                                   |
| coinone      | Coinone    | `#0458ff` FAV     | coinone.co.kr           | `LETTER`                         | Korea.                                                                                                                                     |
| bitflyer     | bitFlyer   | `#0050d7` FAV     | bitflyer.com            | `LETTER`                         | Japan.                                                                                                                                     |
| coincheck    | Coincheck  | `#00d9b1` FAV     | coincheck.com           | `LETTER`                         | Japan.                                                                                                                                     |
| poloniex     | Poloniex   | `#168f56` FAV     | poloniex.com            | `LETTER`                         | No kit found.                                                                                                                              |
| lbank        | LBank      | `#fedc00` FAV     | lbank.com               | `KIT`                            | Terms: no commercial use of platform logos. Media kit in the site footer.                                                                  |
| phemex       | Phemex     | `#72e1bb` FAV     | phemex.com              | `KIT`                            | Kit phemex.com/about/brand-style-guide (PDF not read yet).                                                                                 |
| coinex       | CoinEx     | `#0ead98` BK      | coinex.com              | `W3I:exchanges/coinex`           | Kit coinex.com/en/brand-material.                                                                                                          |
| xt           | XT.COM     | `#b8ff0d` FAV     | xt.com                  | `KIT`                            | "XT Media Toolkit" in the site footer. Logo refreshed 2025.                                                                                |
| pionex       | Pionex     | `#fe4f27` FAV     | pionex.com              | `LETTER`                         | No kit found.                                                                                                                              |
| deribit      | Deribit    | `#0052ff` FAV     | deribit.com             | `LETTER`                         | Options. Owned by Coinbase since Aug 2025; the brand may be folded into Coinbase.                                                          |
| blofin       | BloFin     | `#ff8900` FAV     | blofin.com              | `KIT`                            | Media assets at blofin.com/en/about-us. Logo refreshed about Aug 2025.                                                                     |

**Not included (closed or closing):** Kuna (Ukraine; wound down in 2025 after a court block), EXMO (closing since
July 2026 after UK sanctions), Zonda / zondacrypto (withdrawals frozen April 2026, bankruptcy reported August 2026), FTX
(bankrupt 2022), BTC Trade UA (no activity since about 2021). Closed storages are not listed; for old bags the user adds
them as custom storages (owner decision 2026-10-12, plan D9,
[parking lot 02-closed-storages](parking-lot/02-closed-storages.md)).
**Left out to keep the list short (alive):** WOO X, Bitrue, BtcTurk, Paribu, Digital X (Korbit renamed in Sept 2026),
Qmall (Ukraine, small). Add one when someone uses it.

## Decentralised exchanges (DEX) — kind `dex`

| id          | Name        | Colour         | Website               | Icon                         | Notes                                                                                                                                  |
| ----------- | ----------- | -------------- | --------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| uniswap     | Uniswap     | `#fc72ff` BK   | uniswap.org           | `W3I:exchanges/uniswap`      | Spot, Ethereum + L2s, #1 by volume. uniswap.org/trademark: no changes, no implied endorsement; uses beyond referring need consent.     |
| pancakeswap | PancakeSwap | `#1fc7d4` CSS  | pancakeswap.finance   | `W3I:exchanges/pancake-swap` | Spot, BNB Chain + more. Kit in the PancakeSwap docs: do not modify.                                                                   |
| pump-fun    | Pump.fun    | `#86efac` CSS  | pump.fun              | `LETTER`                     | Spot, Solana (PumpSwap). No kit. Aliases: pumpswap.                                                                                   |
| aerodrome   | Aerodrome   | `#0433ff` CSS  | aerodrome.finance     | `LETTER`                     | Spot, Base. A merge with Velodrome into "Aero" was announced for 2026, not live on 2026-10-12. No kit.                                |
| velodrome   | Velodrome   | `#ff1100` CSS  | velodrome.finance     | `LETTER`                     | Spot, OP Mainnet. See Aerodrome.                                                                                                      |
| jupiter     | Jupiter     | `#00b6e7` BK   | jup.ag                | `W3I:tokens/JUP`             | Spot aggregator + perps, Solana. Logo is a green-to-blue gradient. Kit developers.jup.ag/docs/resources/brand-kit.                     |
| raydium     | Raydium     | `#8c6eff` BK   | raydium.io            | `KIT`                        | Spot, Solana. Kit docs.raydium.io/resources/brand-kit: no recolour, stretch, effects or crop. W3I `RAY` is an older gradient.          |
| orca        | Orca        | `#ffc83d` CSS  | orca.so               | `KIT`                        | Spot, Solana. docs.orca.so/reference/brand: contact Orca before external use.                                                          |
| meteora     | Meteora     | `#f54b00` CSS  | meteora.ag            | `KIT`                        | Spot, Solana. github.com/MeteoraAg/brand-kit, use the "meteora-v2" set (2025). Repo has no licence.                                    |
| 1inch       | 1inch       | `#0000fe` CSS  | 1inch.com             | `KIT`                        | Aggregator, EVM. New logo and domain since 2025-09-30; W3I shows the old unicorn — do not use. Kit 1inch.com/press-room.              |
| kyberswap   | KyberSwap   | `#31cb9e` CSS  | kyberswap.com         | `W3I:tokens/KNC`             | Aggregator, EVM.                                                                                                                      |
| matcha      | Matcha      | `#00b96d` FAV  | matcha.xyz            | `LETTER`                     | Aggregator by 0x. W3I `ZRX` is the 0x mark, not Matcha.                                                                               |
| cow-swap    | CoW Swap    | `#004293` W3I  | swap.cow.fi           | `W3I:exchanges/cowswap`      | Aggregator, EVM. Kit: CoW DAO brand kit (Notion).                                                                                     |
| fluid       | Fluid       | `#366fff` BK   | fluid.io              | `KIT`                        | Spot, EVM. Renamed from Instadapp in Dec 2024. github.com/Instadapp/fluid-brand ("proprietary").                                       |
| curve       | Curve       | `#0000ff` BK   | curve.finance         | `W3I:tokens/CRV`             | Spot, EVM. Multicolour logo. Check against github.com/curvefi/curve-assets/tree/main/branding.                                        |
| balancer    | Balancer    | `#000000` BK   | balancer.fi           | `W3I:exchanges/balancer`     | Spot, EVM. Balancer Labs began winding down in March 2026; the protocol runs on.                                                      |
| sushiswap   | SushiSwap   | `#fa52a0` W3I  | sushi.com             | `W3I:exchanges/sushiswap`    | Spot, EVM. Aliases: sushi.                                                                                                            |
| thorchain   | THORChain   | `#33ff99` CSS  | thorchain.org         | `W3I:tokens/RUNE`            | Cross-chain spot (native BTC). Kit thorchain.org/brand-assets: no implied endorsement.                                                |
| velora      | Velora      | `#ff6b3b` FAV  | velora.xyz            | `KIT`                        | Aggregator, EVM. Renamed from ParaSwap in April 2025; W3I `para-swap` is the old brand — do not use. Kit velora.xyz/brand. Aliases: paraswap. |
| lfj         | LFJ         | `#5b5b60` ?    | lfj.gg                | `LETTER`                     | Spot, Avalanche. Renamed from Trader Joe in Sept 2024. Colour not verified (site blocked scripts). Aliases: trader joe, traderjoe.   |
| osmosis     | Osmosis     | `#5e12a0` BK   | osmosis.zone          | `W3I:networks/osmosis`       | Spot, Cosmos. Kit osmosis.zone/brand.                                                                                                 |
| ston-fi     | STON.fi     | `#0180ff` CSS  | ston.fi               | `KIT`                        | Spot, TON (largest TON DEX). Kit ston.fi/press-room#brand-kit.                                                                         |
| hyperliquid | Hyperliquid | `#97fce4` CSS  | hyperliquid.xyz       | `KIT`                        | Perps + spot, own L1. #1 perp DEX. Kit hyperliquid.gitbook.io/hyperliquid-docs/brand-kit. Light tile: black glyph.                   |
| aster       | Aster       | `#e7c08c` BK   | asterdex.com          | `KIT`                        | Perps + spot, BNB Chain. Media kit docs.asterdex.com/resources/media-kit: approval needed. Colour sampled from the kit image.         |
| lighter     | Lighter     | `#06060c` BK   | lighter.xyz           | `KIT`                        | Perps + spot, Ethereum ZK rollup. Kit lighter.xyz/brand-kit (black and white marks).                                                  |
| variational | Variational | `#4c9af8` CSS  | variational.io        | `KIT`                        | Perps, Arbitrum. Media kit docs.variational.io/more/media-kit.                                                                        |
| edgex       | edgeX       | `#00ce5f` CSS  | edgex.exchange        | `KIT`                        | Perps + spot. Kit: edgeX Brand Kit (Notion, not read yet; use `LETTER` if it has no SVG).                                            |
| grvt        | Grvt        | `#31d690` FAV  | grvt.io               | `LETTER`                     | Perps, own L2. Media kit not verified.                                                                                                |
| gmx         | GMX         | `#03d1cf` BK   | gmx.io                | `W3I:tokens/GMX`             | Perps, Arbitrum + more. Kit github.com/gmx-io/gmx-assets. Note: Simple Icons `gmx` is the GMX e-mail service, not this.              |
| paradex     | Paradex     | `#cc38ff` CSS  | paradex.trade         | `W3I:exchanges/paradex`      | Perps. Media kit paradex.trade/media-kit: "don't use in your own products and services".                                   |
| apex        | ApeX        | `#fed702` CSS  | apex.exchange         | `W3I:tokens/APEX`            | Perps (ApeX Omni). Aliases: apex omni, apex pro.                                                                                      |
| dydx        | dYdX        | `#6966ff` CSS  | dydx.xyz              | `W3I:tokens/DYDX`            | Perps, dYdX Chain (v4).                                                                                                               |
| veranta     | Veranta     | `#3a3cfb` BK   | veranta.xyz           | `KIT`                        | Perps, Base. Renamed from Avantis in Sept 2026. Kit docs.veranta.xyz/brand/veranta-brand-kit: the icon may be used alone at small sizes. Aliases: avantis. |

**Not included (closed):** Odos (app closed 2026-07-30), Vertex (wound down July 2025), Drift (exploit April 2026;
relaunched as Velocity, still tiny). **Left out (alive, small or niche):** Camelot, DeDust, Ekubo, Extended, Pacifica,
Aevo, gTrade, Velocity, Derive. Positions on trade.xyz live in the user's Hyperliquid account: tag them Hyperliquid.

## Hot wallets — kind `hot`

| id              | Name            | Colour        | Website             | Icon                          | Notes                                                                                                                         |
| --------------- | --------------- | ------------- | ------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| metamask        | MetaMask        | `#ff5c16` W3I | metamask.io         | `W3I:wallets/metamask`        | EVM, Solana, BTC. No kit found. The extension licence forbids confusing use of the marks.                                     |
| trust           | Trust Wallet    | `#0500ff` W3I | trustwallet.com     | `W3I:wallets/trust`           | Multichain. Kit trustwallet.com/press: no recolour or rotation.                                                               |
| phantom         | Phantom         | `#ab9ff2` W3I | phantom.com         | `W3I:wallets/phantom`         | Solana, EVM, BTC, Sui.                                                                                                        |
| rabby           | Rabby Wallet    | `#8697ff` W3I | rabby.io            | `W3I:wallets/rabby`           | EVM. Repo licence: "Brand name and logo of Rabby is copyright reserved".                                                      |
| exodus          | Exodus          | `#0b46f9` W3I | exodus.com          | `W3I:wallets/exodus`          | Multichain. Kit exodus.com/brand.                                                                                             |
| coinbase-wallet | Coinbase Wallet | `#0e5bff` W3I | base.app            | `W3I:wallets/coinbase`        | Was "Base App" from July 2025 until 2026-09-10. Check the current icon. Aliases: base app, base wallet.                       |
| okx-wallet      | OKX Wallet      | `#000000` W3I | web3.okx.com        | `W3I:wallets/okx`             | Multichain. No kit found.                                                                                                     |
| binance-wallet  | Binance Wallet  | `#f0b90b` SI  | binance.com         | `SI:binance`                  | Self-custody wallet in the Binance app; same mark as the exchange. Aliases: binance web3 wallet.                              |
| bitget-wallet   | Bitget Wallet   | `#00f0ff` BK  | web3.bitget.com     | `KIT`                         | Kit web3.bitget.com/brand-kit: unchanged only, no dark logo on dark. New logo May 2025. Aliases: bitkeep.                    |
| electrum        | Electrum        | `#0581c4` FAV | electrum.org        | `REPO`                        | BTC. Icon in github.com/spesmilo/electrum (MIT).                                                                              |
| sparrow         | Sparrow Wallet  | `#5c6770` FAV | sparrowwallet.com   | `REPO`                        | BTC. Icon in github.com/sparrowwallet/sparrow (Apache-2.0).                                                                   |
| bluewallet      | BlueWallet      | `#3f78dc` W3I | bluewallet.io       | `W3I:wallets/blue`            | BTC.                                                                                                                          |
| wasabi-wallet   | Wasabi Wallet   | `#77c600` FAV | wasabiwallet.io     | `REPO`                        | BTC. Repo github.com/WalletWasabi (MIT); check that the logo file is in it, else `LETTER`. Simple Icons `wasabi` is a cloud company, not this. |
| atomic          | Atomic Wallet   | `#1f8efa` W3I | atomicwallet.io     | `W3I:wallets/atomic`          | Multichain. Kit atomicwallet.io/press-kit.                                                                                    |
| zengo           | Zengo           | `#ea9c2f` W3I | zengo.com           | `W3I:wallets/zengo`           | Multichain (MPC).                                                                                                             |
| rainbow         | Rainbow         | `#8754c9` W3I | rainbow.me          | `W3I:wallets/rainbow`         | EVM. Multicolour logo.                                                                                                        |
| uniswap-wallet  | Uniswap Wallet  | `#f50db4` FAV | wallet.uniswap.org  | `W3I:exchanges/uniswap`       | EVM. Same mark as Uniswap; same trademark rules (uniswap.org/trademark).                                                      |
| solflare        | Solflare        | `#ffef46` W3I | solflare.com        | `W3I:wallets/solflare`        | Solana. Light tile: black glyph.                                                                                              |
| backpack        | Backpack        | `#e33e3f` W3I | backpack.app        | `W3I:wallets/backpack`        | Solana, EVM, BTC. Media kit backpack.app/media-kit.                                                                           |
| keplr           | Keplr           | `#14afeb` BK  | keplr.app           | `W3I:wallets/keplr`           | Cosmos. Kit keplr.app/brand.                                                                                                  |
| xverse          | Xverse          | `#e87830` FAV | xverse.app          | `LETTER`                      | BTC, Ordinals, Stacks. Kit (Notion) not read; its licence forbids confusing use of the marks.                                 |
| leather         | Leather         | `#12100f` FAV | leather.io          | `LETTER`                      | BTC, Stacks. Renamed from Hiro in 2023. Kit (Notion) not read.                                                                |
| keeper          | Keeper          | `#1d73f5` FAV | keeperwallet.com    | `LETTER`                      | TON and more. Renamed from Tonkeeper in Sept 2026; new logo. Aliases: tonkeeper.                                              |
| walt            | Walt            | `#000000` FAV | walt.io             | `LETTER`                      | TON and more, custodial by default. Renamed from "Wallet in Telegram" on 2026-09-28. Aliases: wallet in telegram, telegram wallet. |
| safe            | Safe{Wallet}    | `#12ff80` FAV | safe.global         | `W3I:wallets/safe`            | EVM multisig. Check: W3I uses the older green `#049f67`. Aliases: gnosis safe.                                                |
| zerion          | Zerion          | `#2461ed` W3I | zerion.io           | `W3I:wallets/zerion`          | EVM, Solana.                                                                                                                  |
| imtoken         | imToken         | `#007fff` W3I | token.im            | `W3I:wallets/imtoken`         | ETH/EVM, BTC.                                                                                                                 |
| tokenpocket     | TokenPocket     | `#2980fe` BK  | tokenpocket.pro     | `W3I:wallets/token-pocket`    | Multichain. Kit tokenpocket.pro/en/brandkit.                                                                                  |
| edge            | Edge            | `#08f0a1` BK  | edge.app            | `KIT`                         | Multichain. github.com/EdgeApp/edge-brand-guide (no licence file).                                                           |
| bitpay          | BitPay Wallet   | `#0a1e5e` FAV | bitpay.com/wallet   | `KIT`                         | BTC and more. Kit bitpay.com/brand: no change, recolour, rotation or effects.                                                 |
| brave-wallet    | Brave Wallet    | `#fb542b` SI  | brave.com/wallet    | `SI:brave`                    | Built into the Brave browser; uses the Brave mark (no separate wallet logo in the kit brave.com/brave-branding-assets).      |
| phoenix         | Phoenix         | `#50b338` FAV | phoenix.acinq.co    | `REPO`                        | BTC Lightning. Logo in github.com/ACINQ/phoenix (Apache-2.0).                                                                |
| blockstream-app | Blockstream App | `#00c3ff` FAV | blockstream.com/app | `KIT`                         | BTC, Liquid, Lightning. Renamed from Blockstream Green. Kit design.blockstream.com. Aliases: blockstream green, green.        |
| cake-wallet     | Cake Wallet     | `#ff630f` FAV | cakewallet.com      | `REPO`                        | Monero, BTC, LTC and more. Logo in github.com/cake-tech/cake_wallet (MIT).                                                    |
| yoroi           | Yoroi           | `#4a90e2` FAV | yoroi-wallet.com    | `LETTER`                      | Cardano.                                                                                                                      |
| slush           | Slush           | `#4da2ff` BK  | slush.app           | `KIT`                         | Sui. Renamed from Sui Wallet in April 2025. Kit slush.app/brand-assets. Aliases: sui wallet.                                 |
| kraken-wallet   | Kraken Wallet   | `#7133f5` W3I | kraken.com/wallet   | `W3I:wallets/kraken`          | Multichain self-custody wallet by Kraken.                                                                                     |

**Not included (closed):** Magic Eden Wallet (shut down May 2026), Ctrl Wallet / XDEFI (shut down 2026-08-19), Bybit
Web3 cloud and keyless wallets (closed May 2025). **Companion apps** of cold wallets are not separate storages: Ledger
Wallet (ex Ledger Live) and Trezor Suite are aliases of Ledger and Trezor. **Left out (alive, smaller):** Coinomi,
Guarda, Muun, Feather, Eternl, Petra, Coin98, Core (Ava Labs; logo needs written consent), Bitcoin.com Wallet, Ronin,
SubWallet, Talisman, My Wallet (ex MyTonWallet), Nunchuk, Ready X (ex Argent), UniSat, Wallet of Satoshi, Gram Wallet
(new in Telegram, details not verified).

## Cold wallets — kind `cold`

| id                  | Name                  | Colour        | Website             | Icon                               | Notes                                                                                                                               |
| ------------------- | --------------------- | ------------- | ------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| ledger              | Ledger                | `#000000` W3I | ledger.com          | `W3I:wallets/ledger`               | Terms of use §I.B: logos "may not be used for products or services that are not … offered by Ledger". Aliases: ledger live, ledger wallet, nano. |
| trezor              | Trezor                | `#141609` SI  | trezor.io           | `SI:trezor`                         | Website terms §7.2: no use of the marks "without prior, written, consent". Aliases: trezor suite.                                  |
| tangem              | Tangem                | `#010101` FAV | tangem.com          | `LETTER`                           | Card. No kit found.                                                                                                                 |
| keystone            | Keystone              | `#5b5b60` ?   | keyst.one           | `LETTER`                           | Air-gapped. Simple Icons `keystone` is KeystoneJS, not this.                                                                         |
| bitbox              | BitBox                | `#000000` W3I | bitbox.swiss        | `W3I:wallets/bitbox`               | BitBox02, by Shift Crypto (Switzerland).                                                                                            |
| coldcard            | COLDCARD              | `#5b5b60` ?   | coldcard.com        | `KIT`                              | Air-gapped, BTC. Kit coinkite.com/media-kit (SVG). A seed-generation bug was found on 2026-07-30; fixed firmware is out.           |
| safepal             | SafePal               | `#4a21ef` CSS | safepal.com         | `KIT`                              | Hardware S1 / X1 (the SafePal app is the same brand). Kit safepal.com/en/brandassets: no changes; mark only below 32 px; accept terms to download. |
| ellipal             | ELLIPAL               | `#0e69f9` CSS | ellipal.com         | `LETTER`                           | Air-gapped. No kit found.                                                                                                           |
| ngrave              | NGRAVE                | `#5b5b60` ?   | ngrave.io           | `KIT`                              | Air-gapped. Kit ngrave.io/en/press: "do not change the colors or modify its arrangement".                                           |
| onekey              | OneKey                | `#5b5b60` ?   | onekey.so           | `KIT`                              | Kit via help.onekey.so/articles/11461296 (Google Drive; guidelines inside, not read yet).                                           |
| blockstream-jade    | Blockstream Jade      | `#00b093` BK  | blockstream.com/jade | `KIT`                             | Air-gapped, BTC. Kit design.blockstream.com/styleguide/branding/blockstream-jade. Aliases: jade.                                    |
| foundation-passport | Foundation Passport   | `#000000` FAV | foundation.xyz      | `LETTER`                           | Air-gapped. Sold as Passport Prime; Passport Core discontinued July 2026. Aliases: passport prime.                                 |
| cypherock           | Cypherock             | `#fbc926` W3I | cypherock.com       | `W3I:wallets/cypherock`            | Light tile: black glyph.                                                                                                            |
| arculus             | Arculus               | `#5b5b60` ?   | getarculus.com      | `LETTER`                           | Card, by CompoSecure.                                                                                                               |
| dcent               | D'CENT                | `#6fc9c4` BK  | dcentwallet.com     | `LETTER`                           | Colour from an archived copy of their brand page (now 404).                                                                         |
| secux               | SecuX                 | `#292929` FAV | secuxtech.com       | `LETTER`                           | No kit found.                                                                                                                       |
| keepkey             | KeepKey               | `#5b5b60` ?   | keepkey.com         | `LETTER`                           | Still sold and maintained in 2026 (firmware 7.14.1).                                                                                |
| gridplus            | GridPlus Lattice1     | `#00b6e7` BK  | gridplus.io         | `KIT`                              | github.com/GridPlus/brand-assets (no licence file; brand manual v1.1 not read yet). Aliases: lattice.                              |
| coolwallet          | CoolWallet            | `#feba11` FAV | coolwallet.io       | `LETTER`                           | Card. No kit found.                                                                                                                 |
| bitkey              | Bitkey                | `#5b5b60` ?   | bitkey.world        | `LETTER`                           | By Block. New touchscreen model April 2026.                                                                                         |
| seedsigner          | SeedSigner            | `#ff7300` BK  | seedsigner.com      | `REPO`                             | DIY air-gapped. Logo `docs/img/logo.svg` in github.com/SeedSigner/seedsigner (MIT).                                                 |
| krux                | Krux                  | `#5b5b60` ?   | selfcustody.github.io/krux | `LETTER`                    | DIY air-gapped. Repo (MIT) has only a PNG favicon.                                                                                   |
| satochip            | Satochip              | `#5b5b60` ?   | satochip.io         | `KIT`                              | Card. Media kit satochip.io/media-kit: "only for authorized purposes"; ask before use in promotional material.                     |
| paper-backup        | Paper / steel backup  | `#5b5b60` —   | —                   | `OWN`                              | Generic: a seed phrase or keys on paper or a metal plate. Aliases: paper wallet, steel, metal, seed.                               |
| other-hardware      | Other hardware wallet | `#5b5b60` —   | —                   | `OWN`                              | Generic, for a device that is not in the list.                                                                                      |

**Not included:** Prokey (no recent activity found; doubts about it since 2020). **Left out (alive, niche):** Specter DIY,
TAPSIGNER and SATSCARD (Coinkite), Keycard, Ballet, BC Vault, Material Bitcoin (steel plates: use "Paper / steel
backup").

## Icon licensing summary

| Icon source                    | Exchanges | DEX | Hot | Cold | Total | What it means                                                                          |
| ------------------------------ | --------- | --- | --- | ---- | ----- | -------------------------------------------------------------------------------------- |
| `SI` Simple Icons (CC0)        | 9         | 0   | 2   | 1    | 12    | Free drawing; trademark of the brand.                                                  |
| `W3I` Web3 Icons (MIT)         | 10        | 14  | 20  | 3    | 47    | Free drawing with the MIT notice in `NOTICE.md`; trademark of the brand.               |
| `KIT` official brand kit       | 11        | 13  | 5   | 7    | 36    | No open licence; nominative use, unchanged, following the kit rules.                   |
| `REPO` open-source project     | 0         | 0   | 5   | 1    | 6     | Code licence (MIT / Apache-2.0); name and logo stay trademarks.                        |
| `LETTER` no logo               | 9         | 6   | 5   | 11   | 31    | Letter badge in the brand colour.                                                      |
| `OWN` generic                  | 0         | 0   | 0   | 2    | 2     | Drawn for this app.                                                                    |
| **Total**                      | **39**    | **33** | **37** | **25** | **134** |                                                                                  |

So **101 storages ship a real logo** (SI + W3I + KIT + REPO), among them the 13 brands whose terms ask for permission
first (plan D8). 31 show a letter badge because no logo source exists, and 2 use a generic icon. Task 02 may move a
`KIT` row to `LETTER` when the kit cannot be reached or has no usable SVG (not because its terms ask for permission:
plan D8); it then updates this table.

## How to add a storage later

1. Add a row to the right table here: a new id (never an old one), name, colour with its source, website, icon source,
   notes (status evidence with a year, kit URL, restrictions).
2. Add the same entry to `src/storage-tags/catalogue.ts`.
3. If it has a logo: add it to the source table in `scripts/storage-icons.mjs` (and the SVG to
   `scripts/storage-icons/official/` for `KIT` / `REPO`), run `npm run icons`, and commit the new tile and `NOTICE.md`.
4. `npm test` checks that the catalogue, the icon files and the budget agree.
