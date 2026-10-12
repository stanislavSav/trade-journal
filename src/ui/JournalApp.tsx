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
import { errorText, useT } from '../i18n'
import { usePrices } from '../prices/usePrices'
import { useJournal } from '../state/useJournal'
import { useStoredString } from '../state/useStoredString'
import { AddAccountSheet } from './AddAccountSheet'
import { AddTradeSheet, type AddPreset } from './AddTradeSheet'
import { BackupSheet } from './BackupSheet'
import { BagDetail } from './BagDetail'
import { BagList, type ListTab } from './BagList'
import { DEFAULT_SORT, sortBags } from './bagSort'
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
  const t = useT()
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
  // List order comes only from sortBags (docs/list-sorting/plan.md); the sort control arrives in task 02.
  const openRows = useMemo(() => sortBags(positions, DEFAULT_SORT.open), [positions])
  const closedRows = useMemo(() => {
    const rows = summary ? summary.closed.map((s) => ({ summary: s })) : []
    return sortBags(rows, DEFAULT_SORT.closed).map((r) => r.summary)
  }, [summary])

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
    const done = { qty: formatQty(input.qty), symbol: input.symbol.toUpperCase() }
    notify(input.side === 'buy' ? t.trade.bought(done) : t.trade.sold(done))
  }

  const saveEdit = (tradeId: string, patch: TradePatch) => {
    apply((j, now) => updateTrade(j, tradeId, patch, now))
    setSheet(null)
    notify(t.trade.updated)
  }

  const removeTrade = (tradeId: string) => {
    const next = apply((j, now) => deleteTrade(j, tradeId, now))
    setSheet(null)
    if (bagId && !findBagSummary(next, bagId)) closeBag()
    notify(t.trade.deleted)
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
            {t.backup.saveFailed({ error: errorText(t, api.saveError).text })}
          </p>
        )}
        {summary && accountId ? (
          <main id="account-panel" role="tabpanel" aria-labelledby={accountTabId(accountId)}>
            <SummaryCard totals={totals} realized={summary.realized} prices={prices} />
            <BagList tab={listTab} onTab={setListTab} open={openRows} closed={closedRows} onOpen={openBag} />
          </main>
        ) : (
          <main className="empty-state">
            <p>{t.account.none}</p>
            <button type="button" className="btn primary" onClick={() => setSheet({ kind: 'account' })}>
              {t.account.add}
            </button>
          </main>
        )}
        {accountId && (
          <button
            type="button"
            className="fab"
            aria-label={t.trade.addTitle}
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
            backLabel={accounts.find((a) => a.id === detail.bag.accountId)?.name ?? t.common.back}
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
            notify(t.backup.merged({ added, updated }))
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
