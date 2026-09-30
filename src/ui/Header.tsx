import type { Account } from '../domain'
import { PlusIcon } from './icons'
import { accountTabId, onTabKeys } from './tabKeys'

interface Props {
  accounts: Account[]
  activeId: string | null
  onSelect: (id: string) => void
  onAddAccount: () => void
  unsaved: boolean
  onBackup: () => void
}

export function Header({ accounts, activeId, onSelect, onAddAccount, unsaved, onBackup }: Props) {
  return (
    <header className="app-header">
      <div className="account-bar">
        <div className="account-tabs" role="tablist" aria-label="Accounts" onKeyDown={onTabKeys}>
          {accounts.map((a) => {
            const selected = a.id === activeId
            return (
              <button
                key={a.id}
                id={accountTabId(a.id)}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls="account-panel"
                tabIndex={selected ? 0 : -1}
                className="account-tab"
                onClick={() => onSelect(a.id)}
              >
                {a.name}
              </button>
            )
          })}
        </div>
        <button type="button" className="icon-btn" aria-label="Add account" onClick={onAddAccount}>
          <PlusIcon size={18} />
        </button>
      </div>
      <button
        type="button"
        className="backup-btn"
        onClick={onBackup}
        aria-label={unsaved ? 'Backup, has changes not backed up' : 'Backup'}
      >
        Backup
        {unsaved && <span className="dot" aria-hidden="true" />}
      </button>
    </header>
  )
}
