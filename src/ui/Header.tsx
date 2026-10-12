import type { Account } from '../domain'
import { useT } from '../i18n'
import { GearIcon, PlusIcon } from './icons'
import { accountTabId, onTabKeys } from './tabKeys'

interface Props {
  accounts: Account[]
  activeId: string | null
  onSelect: (id: string) => void
  onAddAccount: () => void
  unsaved: boolean
  onBackup: () => void
  onSettings: () => void
}

export function Header({ accounts, activeId, onSelect, onAddAccount, unsaved, onBackup, onSettings }: Props) {
  const t = useT()
  return (
    <header className="app-header">
      <div className="account-bar">
        <div className="account-tabs" role="tablist" aria-label={t.header.accounts} onKeyDown={onTabKeys}>
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
        <button type="button" className="icon-btn" aria-label={t.header.addAccount} onClick={onAddAccount}>
          <PlusIcon size={18} />
        </button>
      </div>
      <button type="button" className="icon-btn" aria-label={t.header.settings} onClick={onSettings}>
        <GearIcon />
      </button>
      <button
        type="button"
        className="backup-btn"
        onClick={onBackup}
        aria-label={unsaved ? t.header.backupUnsaved : t.header.backup}
      >
        {t.header.backup}
        {unsaved && <span className="dot" aria-hidden="true" />}
      </button>
    </header>
  )
}
