import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { deviceKey, isDemo, makeDeviceKey, readDemoFlag } from './demo'

describe('readDemoFlag', () => {
  it('is true only when the query has demo', () => {
    expect(readDemoFlag('?demo')).toBe(true)
    expect(readDemoFlag('?demo=1')).toBe(true)
    expect(readDemoFlag('?lang=uk&demo')).toBe(true)
    expect(readDemoFlag('')).toBe(false)
    expect(readDemoFlag('?demonstration')).toBe(false)
  })
})

describe('deviceKey', () => {
  it('uses the normal prefix outside the demo', () => {
    expect(makeDeviceKey(false)('account')).toBe('trade-journal:ui:account')
    expect(makeDeviceKey(false)('sort:open')).toBe('trade-journal:ui:sort:open')
  })

  it('uses its own prefix in the demo', () => {
    expect(makeDeviceKey(true)('account')).toBe('trade-journal:demo:ui:account')
    expect(makeDeviceKey(true)('storage-filter')).toBe('trade-journal:demo:ui:storage-filter')
  })

  it('follows the page (tests run outside the demo)', () => {
    expect(isDemo).toBe(false)
    expect(deviceKey('account')).toBe('trade-journal:ui:account')
  })
})

// Plan §9 risk "demo writes a real key": every preference key must go through deviceKey().
describe('device preference keys in src/', () => {
  it('have no trade-journal:ui: literal except deviceKey itself and the shared language key', () => {
    const root = fileURLToPath(new URL('..', import.meta.url))
    const allowed = new Set(['state/demo.ts', 'state/demo.test.ts', 'i18n/I18nProvider.tsx'])
    const offenders = (readdirSync(root, { recursive: true }) as string[])
      .map((f) => f.split('\\').join('/'))
      .filter((f) => /\.(ts|tsx)$/.test(f) && !allowed.has(f))
      .filter((f) => readFileSync(root + f, 'utf8').includes('trade-journal:ui:'))
    expect(offenders).toEqual([])
  })
})
