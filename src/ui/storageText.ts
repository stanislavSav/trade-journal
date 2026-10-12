// Translated labels for storage kinds and picker groups (docs/storage-tags/plan.md D7).
import type { StorageKind } from '../domain'
import type { Messages } from '../i18n'
import type { PickerGroupKey } from '../storage-tags/picker'

export function kindLabel(t: Messages, kind: StorageKind): string {
  const labels: Record<StorageKind, string> = {
    cex: t.storage.kindCex,
    dex: t.storage.kindDex,
    hot: t.storage.kindHot,
    cold: t.storage.kindCold,
    other: t.storage.kindOther,
  }
  return labels[kind]
}

export function groupLabel(t: Messages, key: PickerGroupKey): string {
  const labels: Record<PickerGroupKey, string> = {
    used: t.storage.groupUsed,
    cex: t.storage.groupCex,
    dex: t.storage.groupDex,
    hot: t.storage.groupHot,
    cold: t.storage.groupCold,
    custom: t.storage.groupCustom,
  }
  return labels[key]
}
