// Demo mode: the app opened with ?demo, also on the live site (docs/demo-data/plan.md D2–D6).
// The data itself is in demoData.ts. Leaving the demo is always a page load, so isDemo is a module constant.

/** True when the query string has `demo` (`?demo`, `?demo=1`, `?x=1&demo`). */
export function readDemoFlag(search: string): boolean {
  return new URLSearchParams(search).has('demo')
}

export const isDemo = typeof location !== 'undefined' && readDemoFlag(location.search)

const DEVICE_PREFIX = 'trade-journal:ui:'
const DEMO_DEVICE_PREFIX = 'trade-journal:demo:ui:'

/** The key builder for one mode; exported so tests can check both. */
export function makeDeviceKey(demo: boolean): (name: string) => string {
  const prefix = demo ? DEMO_DEVICE_PREFIX : DEVICE_PREFIX
  return (name) => prefix + name
}

/**
 * The localStorage key of a device preference (G5), e.g. `deviceKey('account')`. In demo it has its own prefix, so
 * the demo never changes the real preferences (plan D6). Build every preference key with it; the only exception is
 * the language key (`LANG_KEY` in src/i18n/I18nProvider.tsx), which the demo shares on purpose.
 */
export const deviceKey = makeDeviceKey(isDemo)

/** Leave the demo: load the real app, and do not keep the demo page in history (plan D5). */
export function exitDemo(): void {
  location.replace(import.meta.env.BASE_URL)
}
