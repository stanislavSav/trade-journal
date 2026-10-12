// The name check of the remove-account confirmation. Spec: docs/account-removal/plan.md §3 (defaults).

/** True when the typed text is the account name: both trimmed and NFC-normalised, compared case-sensitively. */
export function nameMatches(typed: string, name: string): boolean {
  const text = typed.trim().normalize('NFC')
  return text !== '' && text === name.trim().normalize('NFC')
}
