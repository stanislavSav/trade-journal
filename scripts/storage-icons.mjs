// Builds the storage logo tiles in src/storage-tags/icons/ (dev-only; run with `npm run icons`, commit the output).
// Spec: docs/storage-tags/plan.md §6.4 and docs/storage-tags/catalogue.md ("Icon" column).
//
// Each tile is a square 24×24 SVG with its own background, shown by StorageIcon with rounded corners.
// To remove one brand's logo: delete its row from SOURCES, run `npm run icons`, set its catalogue row to LETTER.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'src/storage-tags/icons')
const OFFICIAL = join(ROOT, 'scripts/storage-icons/official')
const W3I = join(ROOT, 'node_modules/@web3icons/core/dist/svgs')

export const MAX_FILE_BYTES = 6 * 1024
export const MAX_TOTAL_BYTES = 200 * 1024
/** Size of the logo inside its tile (Simple Icons glyphs and official marks). */
const GLYPH_SCALE = 0.7

const si = (slug) => ({ from: 'simple-icons', slug })
/** `places`: decimals kept in the drawing (default 3); fewer only to fit a big file into the budget. */
const w3i = (set, name, extra = {}) => ({ from: 'web3icons', set, name, ...extra })
/**
 * A logo file saved by hand as scripts/storage-icons/official/<id>.svg, from the brand's kit (`kit`) or from the
 * project's open-source repository (`repo`). `url` is where it was downloaded. `bg` is the tile colour (one the kit
 * allows); `bg: null` means the file already is a full square tile. `scale` overrides GLYPH_SCALE. `viewBox` shows
 * only part of the file (the symbol of a symbol + wordmark lockup), without changing the drawing.
 */
const DOWNLOADED = '2026-10-12'
const kit = (url, bg, extra = {}) => ({
  from: 'official',
  source: 'kit',
  url,
  licence: 'Trademark, no open licence (used unchanged to name the service)',
  date: DOWNLOADED,
  bg,
  ...extra,
})
const repo = (url, licence, bg, extra = {}) => ({
  from: 'official',
  source: 'repo',
  url,
  licence,
  date: DOWNLOADED,
  bg,
  ...extra,
})

/** id → logo source. Copied from the "Icon" column of docs/storage-tags/catalogue.md, in catalogue order. */
export const SOURCES = {
  // Exchanges
  binance: si('binance'),
  coinbase: w3i('exchanges', 'coinbase'),
  // Same glyph as today; only the tile purple changed (#5741d9 → #7132f5).
  kraken: w3i('exchanges', 'kraken', { background: ['#5741D9', '#7132f5'] }),
  okx: si('okx'),
  bybit: w3i('exchanges', 'bybit'),
  bitget: w3i('exchanges', 'bitget'),
  kucoin: si('kucoin'),
  gate: kit('https://www.gate.com/cdn/fe/_next/static/media/gate-mark-color.01dd386a.svg', '#ffffff', {
    viewBox: '149 51 150.2 150.2',
  }),
  mexc: kit('https://static.mocortech.com/image-host/index/logo-mark-blue.be49f0ab479a.svg', '#ffffff', {
    viewBox: '0 6 51 52',
  }),
  'crypto-com': w3i('exchanges', 'crypto-com'),
  bitfinex: kit('https://www.bitfinex.com/images/press-v2/downloads/brands/leaf.svg', '#0d1d29'),
  // Same glyph; the brand colour moved from cyan to orange (live app icon, 2026).
  gemini: w3i('exchanges', 'gemini', { background: ['#00DCFA', '#ff4809'] }),
  upbit: w3i('exchanges', 'upbit'),
  bithumb: w3i('exchanges', 'bithumb'),
  whitebit: kit('https://static.whitebit.com/img/brandGuideline/whitebit-logos.zip (bg-white/for small sizes)', '#ffffff'),
  bitvavo: kit('https://bitvavo.com/en/press (bitvavo-mark-square-blue.svg)', null),
  bitpanda: kit(
    'https://group.bitpanda.com/news-and-media (Logo.zip, Bitpanda_Lettermark_darkgreen_RGB.svg)',
    '#ffffff',
  ),
  revolut: si('revolut'),
  robinhood: si('robinhood'),
  paypal: si('paypal'),
  'cash-app': si('cashapp'),
  nexo: kit('https://nexo.com/icon.svg (site icon; no brand kit online)', '#ffffff'),
  uphold: si('uphold'),
  swissborg: w3i('exchanges', 'swissborg'),
  lbank: kit('https://affiliate-static.lbank.zone/media/image/LBank_logo_20250904.zip (SVG/icon/icon -color.svg)', '#000000', {
    scale: 0.85,
  }),
  phemex: kit('https://static.phemex.com/s/home/logo/logo-light-v3.svg (symbol only)', '#141414', {
    viewBox: '0 0 28 70',
  }),
  coinex: w3i('exchanges', 'coinex'),
  xt: kit('https://www.xt.com/en (footer logo, symbol only)', '#000000', { viewBox: '0 0 30 30' }),
  blofin: kit(
    'https://s2.blofin.com/static/blofin/public/media-assets.zip (BloFin Initialmark_black@2x.svg)',
    '#ffffff',
  ),
  // DEX
  uniswap: w3i('exchanges', 'uniswap'),
  pancakeswap: w3i('exchanges', 'pancake-swap'),
  jupiter: w3i('tokens', 'JUP'),
  raydium: kit('https://raw.githubusercontent.com/raydium-io/media-assets/HEAD/logo.svg', '#ffffff'),
  orca: kit('https://drive.google.com/uc?export=download&id=1T6YpxX-k-8HvIoMriU7awyeFxFemHs_1 (logomark.svg)', '#13174d', {
    scale: 0.8,
  }),
  meteora: kit('https://raw.githubusercontent.com/MeteoraAg/brand-kit/HEAD/meteora-v2/symbol/symbol.svg', '#12121c'),
  '1inch': kit('https://1inch.com/assets/images/landing/press-room/assets/1inch_block_black.svg', null),
  kyberswap: w3i('tokens', 'KNC'),
  'cow-swap': w3i('exchanges', 'cowswap'),
  fluid: kit(
    'https://raw.githubusercontent.com/Instadapp/fluid-brand/HEAD/Logo%20Variations/Logo%201%20(brighter)%2032px_32px.svg',
    '#ffffff',
    { scale: 0.9 },
  ),
  curve: w3i('tokens', 'CRV', { places: 1 }),
  balancer: w3i('exchanges', 'balancer'),
  sushiswap: w3i('exchanges', 'sushiswap'),
  thorchain: w3i('tokens', 'RUNE'),
  velora: kit('https://velora.xyz/brand (Notion: Velora_Colored_Icon_(Use_on_light_background).svg)', '#04050e'),
  osmosis: w3i('networks', 'osmosis'),
  'ston-fi': kit('https://ston.fi/images/tild3432-3236-4431-b139-376231383134__favicon.svg', '#ffffff'),
  hyperliquid: kit('https://hyperliquid.gitbook.io/hyperliquid-docs/brand-kit (Hyperliquid_Blob_Dark.svg)', '#97fce4'),
  aster: kit('https://docs.asterdex.com/resources/media-kit (Aster logos.zip, SVG/black-color.svg)', '#ffffff', {
    viewBox: '0 0 284 284',
    scale: 0.8,
  }),
  lighter: kit('https://framerusercontent.com/assets/GAVoK5oFCdm1rRX2eWsVYGBk.zip (light_iconmark.svg)', '#06060c'),
  gmx: w3i('tokens', 'GMX'),
  paradex: w3i('exchanges', 'paradex'),
  apex: w3i('tokens', 'APEX'),
  // The kit file is symbol + wordmark (13 KB); only the symbol path is kept, unchanged.
  variational: kit('https://docs.variational.io/more/media-kit (Brand Assets.zip, Variational White.svg)', '#010612', {
    viewBox: '0 0 369 260',
  }),
  edgex: kit('https://edgex-brand-kit.notion.site (edgeX Brand Kit, Mark/Black on Green/Square.svg)', null),
  dydx: w3i('tokens', 'DYDX'),
  veranta: kit('https://www.veranta.xyz/images/home/brand/veranta-mark.svg', '#3a3cfb'),
  // Hot wallets
  metamask: w3i('wallets', 'metamask'),
  trust: w3i('wallets', 'trust'),
  phantom: w3i('wallets', 'phantom'),
  rabby: w3i('wallets', 'rabby'),
  exodus: w3i('wallets', 'exodus'),
  'coinbase-wallet': kit('https://base.app (header logo "Coinbase Wallet Logo"; no press kit online)', '#0f1927'),
  'okx-wallet': w3i('wallets', 'okx'),
  'binance-wallet': si('binance'),
  'bitget-wallet': kit(
    'https://web3.bitget.com/bgwactivity-static/_next/static/media/Bitget-Wallet-Logomark.07wqb3-5_b2ml.svg',
    '#001f29',
    { scale: 1 },
  ),
  bluewallet: w3i('wallets', 'blue'),
  atomic: w3i('wallets', 'atomic'),
  zengo: w3i('wallets', 'zengo'),
  rainbow: w3i('wallets', 'rainbow'),
  'uniswap-wallet': w3i('exchanges', 'uniswap'),
  solflare: w3i('wallets', 'solflare'),
  backpack: w3i('wallets', 'backpack'),
  keplr: w3i('wallets', 'keplr'),
  safe: kit('https://safe-global.notion.site/Safe-Media-Kit-35ce7ffc829c4bedbbf828464a1b7c00 (Logo Mark, black)', '#12ff80'),
  zerion: w3i('wallets', 'zerion'),
  imtoken: w3i('wallets', 'imtoken'),
  tokenpocket: w3i('wallets', 'token-pocket'),
  electrum: repo(
    'https://raw.githubusercontent.com/spesmilo/electrum/c9d2f82855fe1d1cd324bbfb9cfb232edc134d8c/electrum/gui/icons/electrum_lightblue.svg',
    'MIT',
    '#ffffff',
  ),
  'wasabi-wallet': repo(
    'https://raw.githubusercontent.com/WalletWasabi/WasabiWalletWebSite/6b434262a122951bfedb8f4bb851ed349ba47387/wwwroot/images/logo.svg',
    'MIT',
    '#ffffff',
  ),
  phoenix: repo(
    'https://raw.githubusercontent.com/ACINQ/phoenix/ea5795882cae9bdd4ce2b1a7544f0c4d3220eae4/phoenix-ios/phoenix-ios/Assets.xcassets/logo_green.imageset/logo.svg',
    'Apache-2.0',
    '#ffffff',
  ),
  edge: kit('https://raw.githubusercontent.com/EdgeApp/edge-brand-guide/master/Logo/Primary/edge_logo_dark.svg', '#ffffff', {
    viewBox: '0 0 87.01 82.81',
  }),
  bitpay: kit('https://framerusercontent.com/images/8PuGDo4SSu8C2Ut7nJ1mkkeKE6E.svg (bitpay.com/brand, Square Mark)', null),
  'brave-wallet': si('brave'),
  'blockstream-app': kit(
    'https://design.blockstream.com/assets/pages/blockstream/BlockstreamAssets.zip (blks_emblem_on_transparent_rgb.svg)',
    '#111316',
  ),
  slush: kit('https://slush.app/brand-assets (Drive kit, Symbol/SVG/symbol-white.svg)', '#4da2ff'),
  'kraken-wallet': w3i('wallets', 'kraken'),
  'cake-wallet': repo(
    'https://raw.githubusercontent.com/cake-tech/cake_wallet/8df61b4a666631c819fe271927badf83c5c561bf/assets/images/ios_icons/cakewallet-app.icon/Assets/base.svg',
    'MIT',
    '#ffffff',
  ),
  // Cold wallets
  ledger: w3i('wallets', 'ledger'),
  trezor: si('trezor'),
  bitbox: w3i('wallets', 'bitbox'),
  safepal: kit('https://www.safepal.com/assets/img/logo-dark-m.svg', '#ffffff'),
  ngrave: kit('https://www.ngrave.io/en/press (header logo, gem only)', '#000000', { viewBox: '0 -2.2 25.4 25.4' }),
  onekey: kit('https://help.onekey.so/articles/11461296 (OneKey - Media Kit.zip, logomark-ui/square)', null),
  cypherock: w3i('wallets', 'cypherock'),
  satochip: kit('https://satochip.io/media-kit/ (logo-satochip-circle-no-text.svg)', '#ffffff', {
    viewBox: '348.16 179.63 482.62 482.62',
  }),
  gridplus: kit(
    'https://raw.githubusercontent.com/GridPlus/brand-assets/main/Avatars/SVG/grid-plus-avator-black.svg',
    null,
  ),
  'blockstream-jade': kit('https://design.blockstream.com/assets/pages/jade/JadeAssets.zip', '#111316'),
}

/** Every catalogue id that gets a tile. */
export const ICON_IDS = Object.keys(SOURCES)

// --- reading the sources -------------------------------------------------------------------------------------

let simpleIcons
async function simpleIcon(slug) {
  simpleIcons ??= Object.values(await import('simple-icons'))
  const icon = simpleIcons.find((i) => i.slug === slug)
  if (!icon) throw new Error(`simple-icons has no "${slug}"`)
  return icon
}

function web3Icon(set, name) {
  const file = join(W3I, set, 'background', `${name}.svg.js`)
  const match = /^var \w+ =\s*('(?:[^'\\]|\\.)*')/m.exec(readFileSync(file, 'utf8'))
  if (!match) throw new Error(`Cannot read ${file}`)
  // The module holds one single-quoted JS string literal.
  return JSON.parse(`"${match[1].slice(1, -1).replace(/\\'/g, "'").replace(/"/g, '\\"')}"`)
}

const FULL_TILE = 'd="M24 0H0v24h24z"'

/**
 * Tidy a Web3 Icons tile. The clip path that covers the whole tile is dropped (the 24×24 viewport clips anyway).
 * `background: [from, to]` swaps the tile colour for the brand's current one, only where the glyph is unchanged.
 */
function web3Tile(svg, source) {
  let out = svg
  const clip = /<clipPath id="([^"]+)">\s*<path fill="#fff" d="M0 0h24v24H0z"\/>\s*<\/clipPath>/.exec(out)
  if (clip) out = out.replace(clip[0], '').replace(` clip-path="url(#${clip[1]})"`, '')
  if (source.background) {
    const [from, to] = source.background
    if (!out.includes(`fill="${from}" ${FULL_TILE}`)) throw new Error(`no ${from} background`)
    out = out.replace(`fill="${from}" ${FULL_TILE}`, `fill="${to}" ${FULL_TILE}`)
  }
  return out
}

function packageVersion(name) {
  return JSON.parse(readFileSync(join(ROOT, 'node_modules', name, 'package.json'), 'utf8')).version
}

// --- building the tiles --------------------------------------------------------------------------------------

/** WCAG contrast (same formula as contrastRatio in src/domain/storages.ts). */
function contrast(a, b) {
  const lum = (hex) => {
    const [r, g, bl] = [1, 3, 5].map((i) => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl
  }
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

const glyphColour = (bg) => (contrast(bg, '#ffffff') >= contrast(bg, '#000000') ? '#fff' : '#000')

function tileFromSimpleIcon(icon) {
  const bg = `#${icon.hex.toLowerCase()}`
  const offset = round((24 * (1 - GLYPH_SCALE)) / 2)
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" fill="${bg}"/>` +
    `<path fill="${glyphColour(bg)}" transform="translate(${offset} ${offset}) scale(${GLYPH_SCALE})" ` +
    `d="${icon.path}"/></svg>`
  )
}

/** Put an official logo on a tile: the whole drawing, scaled to fit and centred (aspect ratio kept). */
function tileFromOfficial(svg, source) {
  const { viewBox: own, inner } = splitSvg(svg)
  const viewBox = source.viewBox ?? own
  const open = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">'
  if (source.bg === null) return `${open}<svg width="24" height="24" viewBox="${viewBox}">${inner}</svg></svg>`
  // The inner viewport has the shape of the viewBox, so nothing outside the viewBox shows.
  const [, , w, h] = viewBox.split(/[\s,]+/).map(Number)
  const box = 24 * (source.scale ?? GLYPH_SCALE)
  const [width, height] = w >= h ? [box, (box * h) / w] : [(box * w) / h, box]
  const [x, y] = [round((24 - width) / 2), round((24 - height) / 2)]
  const place = `x="${x}" y="${y}" width="${round(width)}" height="${round(height)}"`
  const tile = `<rect width="24" height="24" fill="${source.bg}"/>`
  return `${open}${tile}<svg ${place} viewBox="${viewBox}">${inner}</svg></svg>`
}

function splitSvg(svg) {
  const open = /<svg\b[^>]*>/i.exec(svg)
  if (!open) throw new Error('No <svg> element')
  const attr = (name) => new RegExp(`\\s${name}="([^"]*)"`, 'i').exec(open[0])?.[1]
  const viewBox = attr('viewBox') ?? `0 0 ${parseFloat(attr('width'))} ${parseFloat(attr('height'))}`
  if (/NaN/.test(viewBox)) throw new Error('The <svg> has no viewBox and no width/height')
  return { viewBox, inner: svg.slice(open.index + open[0].length, svg.lastIndexOf('</svg>')) }
}

// --- clean-up and minify -------------------------------------------------------------------------------------

/**
 * Turn simple `<style>` rules (`.class` or a tag name like `path`) into attributes, so `class` and `<style>` can be
 * dropped. `@media` blocks are dropped too: a tile has its own background, so it must not change with dark mode.
 */
function inlineStyles(svg) {
  const byClass = new Map()
  const byTag = new Map()
  for (const [, css] of svg.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) {
    const text = css
      .replace(/<!\[CDATA\[|\]\]>/g, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/@media[^{]*\{(?:[^{}]*\{[^}]*\})*\s*\}/g, '')
    for (const [, selectors, body] of text.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
      const decls = body
        .split(';')
        .map((d) => d.split(':').map((part) => part.trim()))
        .filter(([k, v]) => k && v)
      for (const selector of selectors.split(',').map((part) => part.trim())) {
        const [map, key] = selector.startsWith('.') ? [byClass, selector.slice(1)] : [byTag, selector]
        if (!/^[\w-]+$/.test(key)) throw new Error(`Unsupported CSS selector "${selector}"`)
        map.set(key, [...(map.get(key) ?? []), ...decls])
      }
    }
  }
  const withoutStyle = svg.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  return withoutStyle.replace(/<([\w:-]+)(\s[^>]*?)?(\/?)>/g, (tag, name, attrs = '', selfClose) => {
    const classes = /\sclass="([^"]*)"/.exec(attrs)?.[1].split(/\s+/) ?? []
    const decls = [...(byTag.get(name) ?? []), ...classes.flatMap((c) => byClass.get(c) ?? [])]
    if (decls.length === 0) return tag
    const added = decls
      .filter(([k]) => !new RegExp(`\\s${k}="`).test(attrs))
      .map(([k, v]) => ` ${k}="${v.replace(/"/g, "'")}"`)
      .join('')
    return `<${name}${attrs}${added}${selfClose}>`
  })
}

const round = (n, places = 3) => Number(n.toFixed(places)).toString()

/** Fewer decimals in drawing data (3 places are far below one pixel at 28 px). `.5` stays `.5`. */
function shortenNumbers(svg, places) {
  const short = (n) => round(Number(n), places).replace(/^(-?)0\./, '$1.')
  const names = 'd|points|transform|gradientTransform|x|y|x1|y1|x2|y2|cx|cy|fx|fy|r|rx|ry|width|height|offset'
  const attrs = new RegExp(`(\\s(?:${names})=")([^"]*)"`, 'g')
  return svg.replace(attrs, (_, start, value) => `${start}${value.replace(/-?\d*\.\d+/g, short)}"`)
}

/** Remove everything a logo does not need, and anything that could run code. */
export function cleanSvg(svg, idPrefix, places = 3) {
  let out = inlineStyles(svg)
    .replace(/<\?xml[\s\S]*?\?>/g, '')
    .replace(/<!DOCTYPE[\s\S]*?>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(metadata|title|desc|script|foreignObject)\b[\s\S]*?<\/\1>/gi, '')
    .replace(/<(metadata|title|desc|script)\b[^>]*\/>/gi, '')
    .replace(/\son[a-z]+="[^"]*"/gi, '')
    .replace(/<(sodipodi|inkscape|rdf|dc|cc):[\w-]+\b[\s\S]*?(?:\/>|<\/\1:[\w-]+>)/gi, '')
    .replace(/\s(?:class|data-[\w-]+|xml:space|version|role|aria-[\w-]+|enable-background)="[^"]*"/gi, '')
    .replace(/\s(?:sodipodi|inkscape|rdf|dc|cc):[\w-]+="[^"]*"/gi, '')
    .replace(/\sstyle="enable-background[^"]*"/gi, '')
    .replace(/\s(?:xmlns:[\w-]+)="[^"]*"/gi, '')
    .replace(/\sxlink:href=/g, ' href=')
  // width/height only on the outer <svg> (keep viewBox).
  out = out.replace(/<svg\b[^>]*>/, (tag) => tag.replace(/\s(?:width|height|x|y)="[^"]*"/g, ''))
  // Unique, short ids per file: the n-th id becomes "<prefix>-<n>", and every reference follows. Ids nothing refers
  // to are dropped.
  const ids = [...out.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])
  for (const [n, id] of ids.entries()) {
    const esc = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    if (!new RegExp(`(?:url\\(|href=")#${esc}[")]`).test(out)) {
      out = out.replace(new RegExp(`\\sid="${esc}"`, 'g'), '')
      continue
    }
    out = out
      .replace(new RegExp(`\\sid="${esc}"`, 'g'), ` id="${idPrefix}-${n.toString(36)}"`)
      .replace(new RegExp(`url\\(#${esc}\\)`, 'g'), `url(#${idPrefix}-${n.toString(36)})`)
      .replace(new RegExp(`href="#${esc}"`, 'g'), `href="#${idPrefix}-${n.toString(36)}"`)
  }
  if (/<image\b/i.test(out)) throw new Error('contains a raster <image>')
  if (/href="(?!#)/i.test(out)) throw new Error('links to an outside file')
  return shortenNumbers(out, places)
    .replace(/>\s+</g, '><')
    .replace(/<defs\/>|<defs><\/defs>/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+\/>/g, '/>')
    .trim()
}

// --- main ----------------------------------------------------------------------------------------------------

async function build(id, source) {
  if (source.from === 'simple-icons') return cleanSvg(tileFromSimpleIcon(await simpleIcon(source.slug)), id)
  if (source.from === 'web3icons') {
    return cleanSvg(web3Tile(web3Icon(source.set, source.name), source), id, source.places)
  }
  const file = join(OFFICIAL, `${id}.svg`)
  if (!existsSync(file)) throw new Error(`missing ${file}`)
  return cleanSvg(tileFromOfficial(readFileSync(file, 'utf8'), source), id, source.places)
}

function noticeRow(id, source, versions) {
  if (source.from === 'simple-icons') {
    return `| \`${id}.svg\` | Simple Icons ${versions.si} | \`${source.slug}\` | CC0-1.0 |`
  }
  if (source.from === 'web3icons') {
    return `| \`${id}.svg\` | Web3 Icons ${versions.w3i} | \`${source.set}/background/${source.name}\` | MIT |`
  }
  const kind = source.source === 'kit' ? 'Brand kit' : 'Project repository'
  return `| \`${id}.svg\` | ${kind}, downloaded ${source.date} | ${source.url} | ${source.licence} |`
}

function notice(versions) {
  const rows = Object.entries(SOURCES).map(([id, source]) => noticeRow(id, source, versions))
  return `# Storage logos: sources and licences

Generated by \`scripts/storage-icons.mjs\` (\`npm run icons\`). Do not edit by hand.
Spec: docs/storage-tags/plan.md §6.4 and docs/storage-tags/catalogue.md.

**Logos are trademarks of their owners. They are used only to name the service where the user keeps coins. No
endorsement is implied.**

The drawing licence (CC0, MIT, Apache-2.0) covers the drawing only, not the trade mark. Brand-kit files have no open
licence; they are used unchanged, at small size, next to the brand name. A brand that wants its logo removed gets a
letter badge instead (plan §9).

| File | Source | Source name | Licence |
| ---- | ------ | ----------- | ------- |
${rows.join('\n')}

## Web3 Icons licence

The files marked "Web3 Icons" come from \`@web3icons/core\` (https://github.com/0xa3k5/web3icons):

\`\`\`
${WEB3ICONS_LICENCE}
\`\`\`
`
}

const WEB3ICONS_LICENCE = `MIT License

Copyright (c) 2024 0xa3k5

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`

async function main() {
  mkdirSync(OUT, { recursive: true })
  const versions = { si: packageVersion('simple-icons'), w3i: packageVersion('@web3icons/core') }
  const problems = []
  let total = 0
  const written = new Set()
  for (const [id, source] of Object.entries(SOURCES)) {
    try {
      const svg = `${await build(id, source)}\n`
      const bytes = Buffer.byteLength(svg)
      if (bytes > MAX_FILE_BYTES) problems.push(`${id}.svg is ${bytes} bytes (max ${MAX_FILE_BYTES})`)
      total += bytes
      writeFileSync(join(OUT, `${id}.svg`), svg)
      written.add(`${id}.svg`)
    } catch (err) {
      problems.push(`${id}: ${err.message}`)
    }
  }
  for (const file of readdirSync(OUT)) {
    if (file.endsWith('.svg') && !written.has(file)) rmSync(join(OUT, file))
  }
  writeFileSync(join(OUT, 'NOTICE.md'), notice(versions))
  if (total > MAX_TOTAL_BYTES) problems.push(`all icons are ${total} bytes (max ${MAX_TOTAL_BYTES})`)
  console.log(`${written.size} icons, ${total} bytes`)
  if (problems.length > 0) {
    console.error(problems.join('\n'))
    process.exit(1)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main()
