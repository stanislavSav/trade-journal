import { useEffect, useMemo, useState } from 'react'
import {
  accountIdFor,
  addAccount,
  addTrade,
  deleteTrade,
  formatQty,
  renameBag,
  summarizeAccount,
  updateTrade,
  type NewTradeInput,
  type TradePatch,
} from '../domain'
import { usePrices } from '../prices/usePrices'
import { useJournal } from '../state/useJournal'
import { useStoredString } from '../state/useStoredString'
import { AddAccountSheet } from './AddAccountSheet'
import { AddTradeSheet, type AddPreset } from './AddTradeSheet'
import { BackupSheet } from './BackupSheet'
import { BagDetail } from './BagDetail'
import { BagList, type ListTab } from './BagList'
import { DetailLayer } from './DetailLayer'
import { EditTradeSheet } from './EditTradeSheet'
import { Header } from './Header'
import { PlusIcon } from './icons'
import { coinMap, findBagSummary, geckoIdsFor, liveAccounts, openPositions, openTotals, priceFor } from './portfolioView'
import { useBagRoute } from './route'
import { SettingsSheet } from './SettingsSheet'
import { SummaryCard } from './SummaryCard'
import { accountTabId } from './tabKeys'
import { Toast, type ToastMessage } from './Toast'

type SheetState =
  | { kind: 'add'; preset: AddPreset }
  | { kind: 'edit'; tradeId: string }
  | { kind: 'backup' }
  | { kind: 'account' }
  | { kind: 'settings' }
  | null

export function JournalApp() {
  const api = useJournal()
  const { journal, apply } = api

  const accounts = useMemo(() => liveAccounts(journal), [journal])
  const [storedAccount, rememberAccount] = useStoredString('trade-journal:ui:account')
  const account = accounts.find((a) => a.id === storedAccount) ?? accounts[0] ?? null
  const accountId = account?.id ?? null

  const summary = useMemo(() => (accountId ? summarizeAccount(journal, accountId) : null), [journal, accountId])
  const coins = useMemo(() => coinMap(journal), [journal])
  const idsKey = summary ? geckoIdsFor(summary.open, coins).join(',') : ''
  const geckoIds = useMemo(() => (idsKey === '' ? [] : idsKey.split(',')), [idsKey])
  const prices = usePrices(geckoIds)
  const positions = useMemo(
    () => (summary ? openPositions(summary.open, coins, prices.snapshot.prices) : []),
    [summary, coins, prices.snapshot.prices],
  )
  const totals = useMemo(() => openTotals(positions), [positions])

  const [listTab, setListTab] = useState<ListTab>('open')
  const [sheet, setSheet] = useState<SheetState>(null)
  // Going back or forward in history also dismisses whatever sheet is open.
  const { bagId, openBag, closeBag } = useBagRoute(() => setSheet(null))
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const notify = (text: string) => setToast({ id: Date.now(), text })

  const detail = useMemo(() => (bagId ? findBagSummary(journal, bagId) : null), [journal, bagId])
  const showingDetail = detail !== null

  // The list stays in place under the bag screen; only the bag screen scrolls meanwhile.
  useEffect(() => {
    if (!showingDetail) return
    const html = document.documentElement.style
    html.overflow = 'hidden'
    return () => {
      html.overflow = ''
    }
  }, [showingDetail])

  const saveTrade = (input: NewTradeInput) => {
    apply((j, now) => addTrade(j, input, now).journal)
    setSheet(null)
    rememberAccount(input.accountId)
    notify(`${input.side === 'buy' ? 'Bought' : 'Sold'} ${formatQty(input.qty)} ${input.symbol.toUpperCase()}`)
  }

  const saveEdit = (tradeId: string, patch: TradePatch) => {
    apply((j, now) => updateTrade(j, tradeId, patch, now))
    setSheet(null)
    notify('Trade updated')
  }

  const removeTrade = (tradeId: string) => {
    const next = apply((j, now) => deleteTrade(j, tradeId, now))
    setSheet(null)
    if (bagId && !findBagSummary(next, bagId)) closeBag()
    notify('Trade deleted')
  }

  const createAccount = (name: string) => {
    apply((j, now) => addAccount(j, name, now))
    rememberAccount(accountIdFor(name))
    setSheet(null)
  }

  const editing = sheet?.kind === 'edit' ? journal.trades.find((t) => t.id === sheet.tradeId && !t.deleted) : undefined
  const editingBag = editing ? journal.bags.find((b) => b.id === editing.bagId) : undefined

  return (
    <>
      <div className="app" inert={showingDetail}>
        <Header
          accounts={accounts}
          activeId={accountId}
          onSelect={rememberAccount}
          onAddAccount={() => setSheet({ kind: 'account' })}
          unsaved={api.unsaved}
          onBackup={() => setSheet({ kind: 'backup' })}
          onSettings={() => setSheet({ kind: 'settings' })}
        />
        {api.saveError && (
          <p className="banner" role="alert">
            {api.saveError}. Save a backup now.
          </p>
        )}
        {summary && accountId ? (
          <main id="account-panel" role="tabpanel" aria-labelledby={accountTabId(accountId)}>
            <SummaryCard totals={totals} realized={summary.realized} prices={prices} />
            <BagList tab={listTab} onTab={setListTab} open={positions} closed={summary.closed} onOpen={openBag} />
          </main>
        ) : (
          <main className="empty-state">
            <p>No accounts yet.</p>
            <button type="button" className="btn primary" onClick={() => setSheet({ kind: 'account' })}>
              Add account
            </button>
          </main>
        )}
        {accountId && (
          <button
            type="button"
            className="fab"
            aria-label="Add trade"
            onClick={() => setSheet({ kind: 'add', preset: { accountId } })}
          >
            <PlusIcon size={28} />
          </button>
        )}
      </div>

      {detail && (
        <DetailLayer key={detail.bag.id} onBack={closeBag}>
          <BagDetail
            summary={detail}
            coin={coins.get(detail.bag.symbol)}
            price={priceFor(coins.get(detail.bag.symbol), prices.snapshot.prices)}
            backLabel={accounts.find((a) => a.id === detail.bag.accountId)?.name ?? 'Back'}
            onBack={closeBag}
            onEditTrade={(tradeId) => setSheet({ kind: 'edit', tradeId })}
            onTrade={(side) =>
              setSheet({
                kind: 'add',
                preset: { accountId: detail.bag.accountId, symbol: detail.bag.symbol, bagId: detail.bag.id, side },
              })
            }
            onRename={(name) => apply((j, now) => renameBag(j, detail.bag.id, name, now))}
          />
        </DetailLayer>
      )}

      {sheet?.kind === 'add' && (
        <AddTradeSheet
          journal={journal}
          accounts={accounts}
          preset={sheet.preset}
          onSave={saveTrade}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet?.kind === 'edit' && editing && (
        <EditTradeSheet
          key={editing.id}
          trade={editing}
          symbol={editingBag?.symbol ?? ''}
          onSave={(patch) => saveEdit(editing.id, patch)}
          onDelete={() => removeTrade(editing.id)}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet?.kind === 'backup' && (
        <BackupSheet
          backup={api.backup}
          unsaved={api.unsaved}
          onExport={api.exportNow}
          onMerge={api.mergeBackup}
          onMerged={({ added, updated }) => {
            setSheet(null)
            notify(`Merged: ${added} new, ${updated} updated`)
          }}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet?.kind === 'account' && (
        <AddAccountSheet accounts={accounts} onAdd={createAccount} onClose={() => setSheet(null)} />
      )}
      {sheet?.kind === 'settings' && <SettingsSheet onClose={() => setSheet(null)} />}

      <Toast message={toast} onDone={() => setToast(null)} />
    </>
  )
}
