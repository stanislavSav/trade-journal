// Draws one storage as a square tile with rounded corners: its logo, a generic icon, or a letter badge.
// Decorative only (aria-hidden): the caller shows the storage name as text. Spec: docs/storage-tags/plan.md §6.4.
import type { CSSProperties, JSX } from 'react'
import { badgeLetter, textColour, type StorageInfo } from './resolve'
import './storage-icon.css'

export function StorageIcon({ info, size }: { info: StorageInfo; size: number }) {
  if (info.iconUrl) {
    return (
      <img className="storage-icon" src={info.iconUrl} alt="" width={size} height={size} decoding="async" aria-hidden />
    )
  }
  const style: CSSProperties = { width: size, height: size, background: info.colour, color: textColour(info.colour) }
  const Generic = GENERIC_ICONS[info.id]
  if (Generic) {
    return (
      <span className="storage-icon" style={style} aria-hidden>
        <Generic size={Math.round(size * 0.7)} />
      </span>
    )
  }
  return (
    <span className="storage-icon storage-icon-letter" style={{ ...style, fontSize: size * 0.56 }} aria-hidden>
      {badgeLetter(info.name)}
    </span>
  )
}

// Generic icons for the two catalogue entries that are not brands, in the style of src/ui/icons.tsx.
const stroke = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

/** A sheet of paper with a key on it: a seed phrase on paper or steel. */
function PaperKeyIcon({ size }: { size: number }) {
  return (
    <svg {...stroke} width={size} height={size}>
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M15 3v4h4" />
      <circle cx="10" cy="14" r="2" />
      <path d="M12 14h4v2" />
    </svg>
  )
}

/** A small device with a screen and a button: a hardware wallet. */
function DeviceIcon({ size }: { size: number }) {
  return (
    <svg {...stroke} width={size} height={size}>
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <rect x="9.5" y="5" width="5" height="6" rx="1" />
      <circle cx="12" cy="16.5" r="1.5" />
    </svg>
  )
}

const GENERIC_ICONS: Record<string, (props: { size: number }) => JSX.Element> = {
  'paper-backup': PaperKeyIcon,
  'other-hardware': DeviceIcon,
}
