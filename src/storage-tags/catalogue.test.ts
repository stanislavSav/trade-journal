import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { CUSTOM_ID_PREFIX } from '../domain/storages'
import { CATALOGUE } from './catalogue'

const ROOT = join(import.meta.dirname, '../..')
const ICONS = join(ROOT, 'src/storage-tags/icons')

interface Row {
  id: string
  name: string
  kind: string
  colour: string
  icon: string
  aliases: string[]
}

/** The four storage tables of docs/storage-tags/catalogue.md, in file order. */
function catalogueRows(): Row[] {
  const rows: Row[] = []
  let kind: string | null = null
  for (const line of readFileSync(join(ROOT, 'docs/storage-tags/catalogue.md'), 'utf8').split('\n')) {
    if (line.startsWith('## ')) kind = /— kind `(\w+)`/.exec(line)?.[1] ?? null
    if (!kind || !line.startsWith('| ') || line.startsWith('| id') || line.startsWith('| --')) continue
    const [id, name, colour, , icon, notes] = line.split('|').slice(1, -1).map((c) => c.trim()) as string[]
    const aliases = /Aliases: (.+?)\.(?: |$)/.exec(notes ?? '')?.[1]?.split(',').map((a) => a.trim()) ?? []
    rows.push({ id: id!, name: name!, kind, colour: /#[0-9a-f]{6}/.exec(colour!)?.[0] ?? colour!, icon: icon!, aliases })
  }
  return rows
}

// The source table of the icon script (a plain .mjs file, loaded at run time).
const script = (await import(/* @vite-ignore */ join(ROOT, 'scripts/storage-icons.mjs'))) as {
  SOURCES: Record<string, { from: string }>
  MAX_FILE_BYTES: number
  MAX_TOTAL_BYTES: number
}

const iconFiles = readdirSync(ICONS).filter((f) => f.endsWith('.svg'))

describe('CATALOGUE', () => {
  it('has exactly the rows of catalogue.md, in the same order', () => {
    const rows = catalogueRows()
    expect(rows).toHaveLength(134)
    expect(CATALOGUE.map(({ id, name, kind, colour, aliases }) => ({ id, name, kind, colour, aliases: aliases ?? [] })))
      .toEqual(rows.map(({ id, name, kind, colour, aliases }) => ({ id, name, kind, colour, aliases })))
  })

  it('uses well-formed, unique ids, colours and kinds', () => {
    expect(new Set(CATALOGUE.map((s) => s.id)).size).toBe(CATALOGUE.length)
    for (const s of CATALOGUE) {
      expect(s.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
      expect(s.id.startsWith(CUSTOM_ID_PREFIX)).toBe(false)
      expect(s.colour).toMatch(/^#[0-9a-f]{6}$/)
      expect(['cex', 'dex', 'hot', 'cold']).toContain(s.kind)
      for (const alias of s.aliases ?? []) expect(alias).toBe(alias.toLowerCase())
    }
  })
})

describe('logo tiles', () => {
  it('has a tile for every catalogue row with a logo source, and no other tile', () => {
    const withLogo = catalogueRows()
      .filter((r) => /^`(SI|W3I):|^`(KIT|REPO)`/.test(r.icon))
      .map((r) => r.id)
    expect(Object.keys(script.SOURCES).sort()).toEqual([...withLogo].sort())
    expect(iconFiles.map((f) => f.replace(/\.svg$/, '')).sort()).toEqual([...withLogo].sort())
  })

  it('keeps every file and the total inside the budget', () => {
    const sizes = iconFiles.map((f) => statSync(join(ICONS, f)).size)
    for (const [i, size] of sizes.entries()) expect(size, iconFiles[i]).toBeLessThanOrEqual(script.MAX_FILE_BYTES)
    expect(sizes.reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(script.MAX_TOTAL_BYTES)
    expect(script.MAX_FILE_BYTES).toBe(6 * 1024)
    expect(script.MAX_TOTAL_BYTES).toBe(200 * 1024)
  })

  it('contains nothing that can run code or load another file', () => {
    for (const file of iconFiles) {
      const svg = readFileSync(join(ICONS, file), 'utf8')
      expect(svg, file).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"[^>]* viewBox="0 0 24 24"/)
      expect(svg, file).not.toMatch(/<script|\son[a-z]+=|href="http|<image|<foreignObject/i)
    }
  })

  it('lists every tile with its source and licence in NOTICE.md, with the Web3 Icons licence', () => {
    const notice = readFileSync(join(ICONS, 'NOTICE.md'), 'utf8')
    for (const file of iconFiles) expect(notice, file).toMatch(new RegExp(`\\| \`${file}\` \\| .+ \\| .+ \\| .+ \\|`))
    expect(notice).toContain('Copyright (c) 2024 0xa3k5')
    expect(notice).toContain('Logos are trademarks of their owners.')
  })
})
