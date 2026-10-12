import { describe, expect, it } from 'vitest'
import { en } from './en'
import { uk } from './uk'

type Leaf = { path: string; value: unknown }

function leaves(value: unknown, path = ''): Leaf[] {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return Object.entries(value).flatMap(([key, v]) => leaves(v, path ? `${path}.${key}` : key))
  }
  return [{ path, value }]
}

function kind(value: unknown): string {
  return Array.isArray(value) ? 'array' : typeof value
}

/**
 * A stand-in for any parameter: every property reads as `n`, and the object itself turns into `n`, so it works for
 * named parameters (`p.qty`), for counts passed to plurals, and for a bare number.
 */
function sample(n: number): unknown {
  return new Proxy(
    {},
    {
      get: (_target, prop) => (prop === Symbol.toPrimitive ? () => n : n),
    },
  )
}

const catalogs = { en, uk }
const enLeaves = leaves(en)

describe('message catalogs', () => {
  it('have the same key paths', () => {
    expect(leaves(uk).map((l) => l.path)).toEqual(enLeaves.map((l) => l.path))
  })

  it('have the same kind of value at each path', () => {
    const ukByPath = new Map(leaves(uk).map((l) => [l.path, l.value]))
    for (const { path, value } of enLeaves) {
      const other = ukByPath.get(path)
      expect(kind(other), path).toBe(kind(value))
      if (typeof value === 'function' && typeof other === 'function') expect(other.length, path).toBe(value.length)
      if (Array.isArray(value) && Array.isArray(other)) expect(other.length, path).toBe(value.length)
    }
  })

  for (const [lang, catalog] of Object.entries(catalogs)) {
    it(`${lang}: has no empty text`, () => {
      for (const { path, value } of leaves(catalog)) {
        if (typeof value === 'string') expect(value.trim(), path).not.toBe('')
        if (Array.isArray(value)) {
          for (const item of value) expect(typeof item === 'string' && item.trim() !== '', path).toBe(true)
        }
        if (typeof value === 'function') {
          for (const n of [1, 2, 5]) {
            const text: unknown = value(sample(n))
            expect(typeof text, path).toBe('string')
            expect(String(text).trim(), path).not.toBe('')
          }
        }
      }
    })
  }
})
