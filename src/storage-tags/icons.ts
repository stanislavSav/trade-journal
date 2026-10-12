// Storage id → URL of its bundled logo tile (made by `npm run icons`, see scripts/storage-icons.mjs).
// `?no-inline` keeps every logo a separate file: Vite would otherwise put small SVGs into the JS as base64.
// The service worker precaches them (vite.config.ts, `assets/*.svg`), so logos work offline.
const files = import.meta.glob<string>('./icons/*.svg', { eager: true, query: '?no-inline', import: 'default' })

const urls = new Map(Object.entries(files).map(([path, url]) => [path.slice('./icons/'.length, -'.svg'.length), url]))

/** URL of the logo tile for a predefined storage, or null when it has none (letter badge). */
export function iconUrl(id: string): string | null {
  return urls.get(id) ?? null
}
