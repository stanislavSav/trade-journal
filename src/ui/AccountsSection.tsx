import { useId } from 'react'
import { countAccountData, type Account, type Journal } from '../domain'
import { useT } from '../i18n'

interface Props {
  /** Live accounts in header order. */
  accounts: Account[]
  journal: Journal
  onRemove: (accountId: string) => void
}

/** Settings → Accounts: every live account with its counts and a Remove button (docs/account-removal/plan.md §5.1). */
export function AccountsSection({ accounts, journal, onRemove }: Props) {
  const t = useT()
  const titleId = useId()

  return (
    <section aria-labelledby={titleId}>
      <h3 id={titleId} className="section-title">
        {t.accounts.title}
      </h3>
      {accounts.length === 0 ? (
        <p className="help settings-hint">{t.accounts.empty}</p>
      ) : (
        <ul className="card list account-list">
          {accounts.map((account) => (
            <li key={account.id} className="account-row">
              <div className="row-main">
                <span className="account-name">{account.name}</span>
                <span className="row-meta num">{t.accounts.counts(countAccountData(journal, account.id))}</span>
              </div>
              <button
                type="button"
                className="text-btn account-remove"
                aria-label={t.accounts.removeLabel({ name: account.name })}
                aria-haspopup="dialog"
                onClick={() => onRemove(account.id)}
              >
                {t.accounts.remove}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
