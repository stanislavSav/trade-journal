import { useEffect, useMemo, useState } from 'react'
import {
  accountIdFor,
  addAccount,
  addTrade,
  deleteTrade,
  countAccountData,
  formatQty,
  removeAccount,
  renameBag,
  summarizeAccount,
  updateTrade,
  type NewTradeInput,
  type TradePatch,
} from '../domain'
import { errorText, useLang, useT } from '../i18n'
import { usePrices } from '../prices/usePrices'
import { deviceKey, isDemo } from '../state/demo'
import { useJournal } from '../state/useJournal'
import { useStoredString } from '../state/useStoredString'
import { activeFilter, filterChips, filterKey, matchesFilter } from '../storage-tags/filter'
import { bagStorages, storageLookup } from '../storage-tags/resolve'
import { AddAccountSheet } from './AddAccountSheet'
import { AddTradeSheet, type AddPreset } from './AddTradeSheet'
import { BackupSheet } from './BackupSheet'
import { BagDetail } from './BagDetail'
import { BagList, type ListTab } from './BagList'
import { sortBags } from './bagSort'
import { DemoBanner } from './DemoBanner'
import { DetailLayer } from './DetailLayer'
import { EditTradeSheet } from './EditTradeSheet'
import { Header } from './Header'
import { PlusIcon } from './icons'
import {
  coinMap,
  findBagSummary,
  geckoIdsFor,
  liveAccounts,
  openPositions,
  openTotals,
  priceFor,
  realizedOf,
} from './portfolioView'
import { RemoveAccountSheet } from './RemoveAccountSheet'
import { useBagRoute } from './route'
import { SettingsSheet } from './SettingsSheet'
import { SortSheet } from './SortSheet'
import { SummaryCard } from './SummaryCard'
import { StorageFilterBar } from './StorageFilterBar'
import { StoragePickerSheet } from './StoragePickerSheet'
import { applyBagStorages, customStorageHandlers } from './storageHandlers'
import { filterCaption } from './storageText'
import { accountTabId } from './tabKeys'
import { Toast, type ToastMessage } from './Toast'
import { useBagSort } from './useBagSort'

type SheetState =
  | { kind: 'add'; preset: AddPreset }
  | { kind: 'storages'; bagId: string } // storage picker over the bag screen
  | { kind: 'edit'; tradeId: string }
  | { kind: 'backup' }
  | { kind: 'account' }
  | { kind: 'settings' }
  | { kind: 'removeAccount'; accountId: string }
  | { kind: 'sort'; tab: ListTab }
  | null

export function JournalApp() {
  const t = useT()
  const { lang } = useLang()
  const api = useJournal()
  const { journal, apply } = api

  const accounts = useMemo(() => liveAccounts(journal), [journal])
  const [storedAccount, rememberAccount] = useStoredString(deviceKey('account'))
  const account = accounts.find((a) => a.id === storedAccount) ?? accounts[0] ?? null
  const accountId = account?.id ?? null

  const summary = useMemo(() => (accountId ? summarizeAccount(journal, accountId) : null), [journal, accountId])
  const coins = useMemo(() => coinMap(journal), [journal])
  const idsKey = summary ? geckoIdsFor(summary.open, coins).join(',') : ''
  const geckoIds = useMemo(() => (idsKey === '' ? [] : idsKey.split(',')), [idsKey])
  const prices = usePrices(geckoIds)

  // Storage filter (docs/storage-tags/plan.md §6.1): filter first, then sort, then totals. One device preference for
  // every account; a chip the account does not have shows All and keeps the stored value (D3).
  const lookup = useMemo(() => storageLookup(journal), [journal])
  const [storedFilter, rememberFilter] = useStoredString(deviceKey('storage-filter'))
  const chips = useMemo(
    () => (summary ? filterChips([...summary.open, ...summary.closed], lookup, lang) : []),
    [summary, lookup, lang],
  )
  const filter = useMemo(() => activeFilter(storedFilter, chips), [storedFilter, chips])
  const filtered = useMemo(() => {
    if (!summary) return null
    if (filter.kind === 'all') return summary
    const keep = (s: (typeof summary.open)[number]) => matchesFilter(s.bag, filter, lookup)
    const open = summary.open.filter(keep)
    const closed = summary.closed.filter(keep)
    return { ...summary, open, closed, realized: realizedOf([...open, ...closed]) }
  }, [summary, filter, lookup])

  const positions = useMemo(
    () => (filtered ? openPositions(filtered.open, coins, prices.snapshot.prices) : []),
    [filtered, coins, prices.snapshot.prices],
  )
  const totals = useMemo(() => openTotals(positions), [positions])
  // List order comes only from sortBags, with the sort saved on this device (docs/list-sorting/plan.md).
  const { sorts, pick } = useBagSort()
  const openRows = useMemo(() => sortBags(positions, sorts.open), [positions, sorts.open])
  const closedRows = useMemo(() => {
    const rows = filtered ? filtered.closed.map((s) => ({ summary: s })) : []
    return sortBags(rows, sorts.closed).map((r) => r.summary)
  }, [filtered, sorts.closed])
  // A trade started from a single-storage chip is tagged with it, so the new bag stays in the list.
  const presetStorageIds = filter.kind === 'storage' ? [filter.id] : undefined

  const [listTab, setListTab] = useState<ListTab>('open')
  const [sheet, setSheet] = useState<SheetState>(null)
  // Going back or forward in history also dismisses whatever sheet is open.
  const { bagId, openBag, closeBag } = useBagRoute(() => setSheet(null))
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const notify = (text: string) => setToast({ id: Date.now(), text })

  const detail = useMemo(() => (bagId ? findBagSummary(journal, bagId) : null), [journal, bagId])
  const storageEdits = customStorageHandlers(apply)
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

  // docs/account-removal/plan.md §6.2: one apply, then the first remaining account (D6), close, toast.
  const dropAccount = (id: string) => {
    const name = accounts.find((a) => a.id === id)?.name ?? id
    const next = apply((j, now) => removeAccount(j, id, now))
    const first = liveAccounts(next)[0]
    if (first) rememberAccount(first.id)
    setSheet(null)
    notify(t.accounts.removed({ name }))
  }
  const removing = sheet?.kind === 'removeAccount' ? accounts.find((a) => a.id === sheet.accountId) : undefined
  // Another tab removed it meanwhile: nothing left to confirm.
  useEffect(() => {
    if (sheet?.kind === 'removeAccount' && !removing) setSheet(null)
  }, [sheet, removing])

  const editing = sheet?.kind === 'edit' ? journal.trades.find((t) => t.id === sheet.tradeId && !t.deleted) : undefined
  const editingBag = editing ? journal.bags.find((b) => b.id === editing.bagId) : undefined

  return (
    <>
      <div className="app" inert={showingDetail}>
        {isDemo && <DemoBanner />}
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
            {chips.length > 0 && (
              <StorageFilterBar
                key={accountId}
                chips={chips}
                active={filter}
                lookup={lookup}
                onPick={(f) => rememberFilter(filterKey(f))}
              />
            )}
            <SummaryCard
              totals={totals}
              realized={filtered?.realized ?? summary.realized}
              prices={prices}
              caption={filterCaption(t, filter, lookup)}
            />
            <BagList
              tab={listTab}
              onTab={setListTab}
              open={openRows}
              closed={closedRows}
              onOpen={openBag}
              sort={sorts[listTab]}
              onSortClick={() => setSheet({ kind: 'sort', tab: listTab })}
              filter={filter}
              lookup={lookup}
            />
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
            storages={bagStorages(detail.bag, lookup)}
            onEditStorages={() => setSheet({ kind: 'storages', bagId: detail.bag.id })}
          />
        </DetailLayer>
      )}

      {sheet?.kind === 'add' && (
        <AddTradeSheet
          journal={journal}
          accounts={accounts}
          preset={sheet.preset}
          presetStorageIds={presetStorageIds}
          storageEdits={storageEdits}
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
          demo={isDemo}
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
      {sheet?.kind === 'settings' && (
        <SettingsSheet
          accounts={accounts}
          journal={journal}
          onRemoveAccount={(id) => setSheet({ kind: 'removeAccount', accountId: id })}
          onNotify={notify}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet?.kind === 'sort' && (
        <SortSheet
          tab={sheet.tab}
          sort={sorts[sheet.tab]}
          onPick={(key) => pick(sheet.tab, key)}
          onClose={() => setSheet(null)}
        />
      )}
      {removing && (
        <RemoveAccountSheet
          key={removing.id}
          account={removing}
          counts={countAccountData(journal, removing.id)}
          onExport={isDemo ? undefined : api.exportNow}
          onConfirm={() => dropAccount(removing.id)}
          onClose={() => setSheet({ kind: 'settings' })}
        />
      )}

      {sheet?.kind === 'storages' && detail?.bag.id === sheet.bagId && (
        <StoragePickerSheet
          journal={journal}
          title={t.storage.storedAt}
          initial={detail.bag.storageIds ?? []}
          onSave={(ids) => {
            setSheet(null)
            if (applyBagStorages(apply, sheet.bagId, ids)) notify(t.storage.updated)
          }}
          onClose={() => setSheet(null)}
          {...storageEdits}
        />
      )}

      <Toast message={toast} onDone={() => setToast(null)} />
    </>
  )
}
