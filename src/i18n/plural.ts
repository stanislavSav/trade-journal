// Plural forms for whole counts (plan D4). Each form is a function of the count, so a message decides where the
// number goes. Coin quantities are decimals and never go through a plural.

type Form = (n: number) => string

const enRules = new Intl.PluralRules('en')
const ukRules = new Intl.PluralRules('uk')

/** English: 1 → one, everything else → other. */
export function pluralEn(forms: { one: Form; other: Form }): (n: number) => string {
  return (n) => (enRules.select(n) === 'one' ? forms.one(n) : forms.other(n))
}

/** Ukrainian: 1, 21 → one; 2–4, 22–24 → few; 0, 5–20, 25 → many; fractions → other. */
export function pluralUk(forms: { one: Form; few: Form; many: Form; other: Form }): (n: number) => string {
  return (n) => {
    const rule = ukRules.select(n)
    if (rule === 'one' || rule === 'few' || rule === 'many') return forms[rule](n)
    return forms.other(n)
  }
}
