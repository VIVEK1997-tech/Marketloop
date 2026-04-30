import { useEffect, useMemo, useState } from 'react';
import InventoryToolbar from './InventoryToolbar.jsx';
import InventoryStatsCards from './InventoryStatsCards.jsx';
import InventoryFilters from './InventoryFilters.jsx';
import InventoryBatchTable from './InventoryBatchTable.jsx';
import InventoryMovementTable from './InventoryMovementTable.jsx';
import InventoryPagination from './InventoryPagination.jsx';
import InventoryDetailsDrawer from './InventoryDetailsDrawer.jsx';
import InventoryActivityPanel from './InventoryActivityPanel.jsx';
import InventoryBulkActionsBar from './InventoryBulkActionsBar.jsx';
import StockAdjustmentModal from './StockAdjustmentModal.jsx';
import TransferStockModal from './TransferStockModal.jsx';
import ToastStack from './ToastStack.jsx';
import { downloadCsv, downloadZip } from '../exportUtils.js';
import { generateDummyInventory } from '../inventory/generateDummyInventory.js';
import { filterInventoryBatches, filterMovementRows, formatMoney, getPaginationMeta, paginateRows, sortInventoryBatches } from '../inventory/inventoryUtils.js';

const initialFilters = {
  search: '',
  freshness: 'all',
  warehouse: 'all',
  category: 'all',
  supplier: 'all',
  buyerStatus: 'all',
  sellerStatus: 'all',
  expiryFrom: '',
  expiryTo: '',
  lowStockOnly: false,
  damagedOnly: false,
  nearExpiryOnly: false,
  availableMin: '',
  availableMax: '',
  marginMin: '',
  marginMax: ''
};

const buildActivity = (batch, action, actor = 'Admin Console', detail) => ({
  id: `${batch.id}-${Date.now()}-${Math.random()}`,
  sku: batch.sku,
  actor,
  action,
  detail: detail || `${batch.product} · ${batch.warehouse}`,
  timestamp: new Date().toISOString()
});

export default function InventoryModule() {
  const [batches, setBatches] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);
  const [sortBy, setSortBy] = useState('lastUpdated');
  const [sortDirection, setSortDirection] = useState('desc');
  const [batchPage, setBatchPage] = useState(1);
  const [batchRowsPerPage, setBatchRowsPerPage] = useState(25);
  const [movementPage, setMovementPage] = useState(1);
  const [movementRowsPerPage, setMovementRowsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [activeBatch, setActiveBatch] = useState(null);
  const [activity, setActivity] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  const [adjustmentState, setAdjustmentState] = useState({ open: false, batch: null, quantity: 0 });
  const [transferState, setTransferState] = useState({ open: false, batch: null, destination: '' });

  useEffect(() => {
    const timer = setTimeout(() => {
      const seeded = generateDummyInventory(1000);
      setBatches(seeded.batches);
      setMovements(seeded.movements);
      setActivity(
        seeded.movements.slice(0, 10).map((movement) => ({
          id: `inventory-activity-${movement.id}`,
          sku: movement.sku,
          actor: movement.adminName,
          action: movement.type,
          detail: movement.notes,
          timestamp: movement.date
        }))
      );
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const pushToast = (title, message, tone = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, title, message, tone }]);
    setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3500);
  };

  const options = useMemo(() => ({
    warehouses: [...new Set(batches.map((row) => row.warehouse))].sort(),
    categories: [...new Set(batches.map((row) => row.category))].sort(),
    suppliers: [...new Set(batches.map((row) => row.supplier))].sort(),
    buyerStatuses: [...new Set(batches.map((row) => row.buyerStatus))].sort(),
    sellerStatuses: [...new Set(batches.map((row) => row.sellerStatus))].sort()
  }), [batches]);

  const filteredBatches = useMemo(() => filterInventoryBatches(batches, filters), [batches, filters]);
  const sortedBatches = useMemo(() => sortInventoryBatches(filteredBatches, sortBy, sortDirection), [filteredBatches, sortBy, sortDirection]);
  const pagedBatches = useMemo(() => paginateRows(sortedBatches, batchPage, batchRowsPerPage), [sortedBatches, batchPage, batchRowsPerPage]);
  const batchMeta = useMemo(() => getPaginationMeta(sortedBatches.length, batchPage, batchRowsPerPage), [sortedBatches.length, batchPage, batchRowsPerPage]);
  const filteredMovements = useMemo(() => filterMovementRows(movements, filters.search), [movements, filters.search]);
  const pagedMovements = useMemo(() => paginateRows(filteredMovements, movementPage, movementRowsPerPage), [filteredMovements, movementPage, movementRowsPerPage]);
  const movementMeta = useMemo(() => getPaginationMeta(filteredMovements.length, movementPage, movementRowsPerPage), [filteredMovements.length, movementPage, movementRowsPerPage]);

  useEffect(() => {
    setBatchPage(1);
  }, [filters, sortBy, sortDirection, batchRowsPerPage]);

  useEffect(() => {
    setMovementPage(1);
  }, [filters.search, movementRowsPerPage]);

  const statsCards = useMemo(() => {
    const totalAvailable = batches.reduce((sum, row) => sum + row.availableQty, 0);
    const totalIncoming = batches.reduce((sum, row) => sum + row.incomingQty, 0);
    const totalReserved = batches.reduce((sum, row) => sum + row.reservedQty, 0);
    const totalDamaged = batches.reduce((sum, row) => sum + row.damagedQty, 0);
    const lowStock = batches.filter((row) => row.availableQty <= row.reorderLevel).length;
    const nearExpiry = batches.filter((row) => row.riskFlags.includes('Near expiry') || row.riskFlags.includes('Expired')).length;
    const estimatedValue = batches.reduce((sum, row) => sum + row.estimatedValue, 0);
    return [
      { label: 'Total SKUs', value: batches.length.toLocaleString('en-IN'), helper: 'Tracked inventory batches', tone: 'cyan' },
      { label: 'Available Stock', value: totalAvailable.toLocaleString('en-IN'), helper: 'Sellable and buy-side visible quantity', tone: 'emerald' },
      { label: 'Incoming Stock', value: totalIncoming.toLocaleString('en-IN'), helper: 'Inbound purchase-side stock waiting to land', tone: 'violet' },
      { label: 'Reserved Stock', value: totalReserved.toLocaleString('en-IN'), helper: 'Allocated for active orders', tone: 'amber' },
      { label: 'Damaged Stock', value: totalDamaged.toLocaleString('en-IN'), helper: 'Blocked or wastage-linked stock', tone: 'rose' },
      { label: 'Low Stock Alerts', value: lowStock.toLocaleString('en-IN'), helper: 'Batches below reorder level', tone: 'amber' },
      { label: 'Near Expiry Alerts', value: nearExpiry.toLocaleString('en-IN'), helper: 'Expiring or expired lots', tone: 'rose' },
      { label: 'Inventory Value', value: formatMoney(estimatedValue), helper: 'Estimated sell-side inventory value', tone: 'emerald' }
    ];
  }, [batches]);

  const appendMovement = (batch, type, quantity, note, referenceType = 'Manual Adjustment') => {
    const nextMovement = {
      id: `movement-runtime-${Date.now()}-${Math.random()}`,
      movementId: `MOV-${String(Date.now()).slice(-6)}`,
      type,
      item: batch.product,
      sku: batch.sku,
      quantity,
      unit: batch.unit,
      location: batch.warehouse,
      referenceType,
      referenceId: `${referenceType.slice(0, 3).toUpperCase()}-${String(Date.now()).slice(-5)}`,
      adminName: 'Admin Console',
      date: new Date().toISOString(),
      notes: note
    };
    setMovements((current) => [nextMovement, ...current]);
    setActivity((current) => [buildActivity(batch, type, 'Admin Console', note), ...current].slice(0, 24));
  };

  const updateBatches = (predicate, updater) => {
    setBatches((current) =>
      current.map((row) => (predicate(row) ? { ...updater(row), lastUpdated: new Date().toISOString() } : row))
    );
  };

  const handleAction = (action, batch) => {
    if (action === 'adjust') {
      setAdjustmentState({ open: true, batch, quantity: 0 });
      return;
    }
    if (action === 'transfer') {
      setTransferState({ open: true, batch, destination: options.warehouses.find((option) => option !== batch.warehouse) || batch.warehouse });
      return;
    }

    if (action === 'damaged' || action === 'return') {
      setConfirmState({
        title: `${action === 'damaged' ? 'Mark damaged' : 'Return to supplier'} ${batch.sku}?`,
        message: 'This affects sellable quantity and should stay behind an explicit confirmation.',
        onConfirm: () => {
          updateBatches(
            (row) => row.id === batch.id,
            (row) => ({
              ...row,
              damagedQty: action === 'damaged' ? row.damagedQty + 6 : row.damagedQty,
              returnedQty: action === 'return' ? row.returnedQty + 5 : row.returnedQty,
              availableQty: Math.max(0, row.availableQty - 6),
              buyerStatus: action === 'return' ? 'Supplier Return' : row.buyerStatus,
              sellerStatus: 'Blocked',
              adminNotes: `${row.adminNotes} ${action === 'damaged' ? 'Damage recorded.' : 'Return to supplier initiated.'}`
            })
          );
          appendMovement(batch, action === 'damaged' ? 'Wastage' : 'Return', action === 'damaged' ? 6 : 5, `${action === 'damaged' ? 'Damage isolated from saleable stock.' : 'Supplier return recorded.'}`, action === 'damaged' ? 'Manual Adjustment' : 'Return');
          setConfirmState(null);
          pushToast(action === 'damaged' ? 'Damage recorded' : 'Supplier return created', `${batch.sku} was updated.`);
        }
      });
      return;
    }

    const apply = (updater, type, qty, note, referenceType) => {
      updateBatches((row) => row.id === batch.id, updater);
      appendMovement(batch, type, qty, note, referenceType);
      pushToast('Inventory action completed', `${batch.sku}: ${action.replace(/_/g, ' ')} applied.`);
    };

    if (action === 'receive') {
      apply(
        (row) => ({ ...row, availableQty: row.availableQty + row.incomingQty, incomingQty: 0, buyerStatus: 'Pending Quality Check', adminNotes: `${row.adminNotes} Incoming stock received.` }),
        'Inward',
        batch.incomingQty || 0,
        'Incoming stock received into warehouse.',
        'Purchase Order'
      );
      return;
    }
    if (action === 'reserve') {
      apply(
        (row) => ({ ...row, reservedQty: row.reservedQty + 8, availableQty: Math.max(0, row.availableQty - 8), sellerStatus: 'Reserved' }),
        'Reserved',
        8,
        'Stock reserved for outgoing customer order.',
        'Sales Order'
      );
      return;
    }
    if (action === 'release') {
      apply(
        (row) => ({ ...row, reservedQty: Math.max(0, row.reservedQty - 6), availableQty: row.availableQty + 6, sellerStatus: 'Sellable' }),
        'Released',
        6,
        'Reserved stock released back to sellable pool.',
        'Sales Order'
      );
      return;
    }
    if (action === 'sold') {
      apply(
        (row) => ({ ...row, soldQty: row.soldQty + 12, availableQty: Math.max(0, row.availableQty - 12), sellerStatus: 'Dispatched' }),
        'Outward',
        12,
        'Stock dispatched against completed seller order.',
        'Sales Order'
      );
      return;
    }
    if (action === 'discount') {
      apply(
        (row) => ({ ...row, sellerStatus: 'Discount Sale', adminNotes: `${row.adminNotes} Discount sale suggestion applied.` }),
        'Adjustment',
        0,
        'Near-expiry or orange stock moved to discount sale.',
        'Manual Adjustment'
      );
      return;
    }
    if (action === 'reorder') {
      apply(
        (row) => ({ ...row, buyerStatus: 'Pending Quality Check', incomingQty: row.incomingQty + Math.max(row.reorderLevel, 40) }),
        'Adjustment',
        Math.max(batch.reorderLevel, 40),
        'Smart reorder request generated for low-stock batch.',
        'Purchase Order'
      );
    }
  };

  const handleBulkAction = (action) => {
    const ids = [...selectedIds];
    if (!ids.length && action !== 'discount' && action !== 'reorder') return;

    const targetIds = ids.length
      ? ids
      : action === 'discount'
        ? filteredBatches.filter((row) => row.freshnessGrade === 'Orange' || row.riskFlags.includes('Near expiry')).map((row) => row.id)
        : action === 'reorder'
          ? filteredBatches.filter((row) => row.availableQty <= row.reorderLevel).map((row) => row.id)
          : [];

    if (action === 'export') {
      downloadCsv('selected-inventory-batches', batches.filter((row) => selectedIds.has(row.id)));
      pushToast('Bulk export ready', `${selectedIds.size} inventory batches exported.`);
      return;
    }

    updateBatches(
      (row) => targetIds.includes(row.id),
      (row) => ({
        ...row,
        availableQty: action === 'receive' ? row.availableQty + row.incomingQty : action === 'sold' ? Math.max(0, row.availableQty - 10) : action === 'release' ? row.availableQty + 5 : row.availableQty,
        incomingQty:
          action === 'reorder' ? row.incomingQty + Math.max(row.reorderLevel, 30) :
          action === 'receive' ? 0 :
          row.incomingQty,
        reservedQty: action === 'reserve' ? row.reservedQty + 6 : action === 'release' ? Math.max(0, row.reservedQty - 5) : row.reservedQty,
        soldQty: action === 'sold' ? row.soldQty + 10 : row.soldQty,
        damagedQty: action === 'damaged' ? row.damagedQty + 4 : row.damagedQty,
        returnedQty: action === 'return' ? row.returnedQty + 3 : row.returnedQty,
        sellerStatus: action === 'discount' ? 'Discount Sale' : action === 'reserve' ? 'Reserved' : action === 'sold' ? 'Dispatched' : action === 'release' ? 'Sellable' : row.sellerStatus,
        buyerStatus: action === 'reorder' ? 'Pending Quality Check' : row.buyerStatus
      })
    );
    pushToast('Bulk inventory action completed', `${targetIds.length} batches updated.`);
  };

  const handleToolbarAction = (action) => {
    if (action === 'generate') {
      setLoading(true);
      setTimeout(() => {
        const seeded = generateDummyInventory(8);
        const additions = seeded.batches.map((row, index) => ({
          ...row,
          id: `generated-batch-${Date.now()}-${index}`,
          sku: `GEN-${String(Date.now()).slice(-4)}-${index + 1}`,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        }));
        setBatches((current) => [...additions, ...current]);
        setMovements((current) => [...seeded.movements.slice(0, 12), ...current]);
        setActivity((current) => [...additions.map((row) => buildActivity(row, 'Generated inventory batch', 'Inventory Generator')), ...current].slice(0, 24));
        setLoading(false);
        pushToast('Inventory control generated', `${additions.length} new inventory batches were appended.`);
      }, 450);
      return;
    }
    if (action === 'csv') {
      downloadCsv('inventory-control', sortedBatches);
      pushToast('CSV downloaded', 'Filtered inventory dataset exported.');
      return;
    }
    downloadZip(
      'inventory-control',
      sortedBatches.slice(0, 50).map((row) => ({
        name: row.sku,
        extension: 'txt',
        content: JSON.stringify(row, null, 2)
      }))
    );
    setActivity((current) => [{ id: `zip-${Date.now()}`, sku: 'ZIP', actor: 'Admin Console', action: 'ZIP export generated', detail: 'Inventory placeholder ZIP export prepared.', timestamp: new Date().toISOString() }, ...current].slice(0, 24));
    pushToast('ZIP downloaded', 'Inventory ZIP placeholder generated.');
  };

  const confirmAdjustment = () => {
    const { batch, quantity } = adjustmentState;
    if (!batch) return;
    const amount = Number(quantity || 0);
    updateBatches((row) => row.id === batch.id, (row) => ({ ...row, availableQty: Math.max(0, row.availableQty + amount), adminNotes: `${row.adminNotes} Manual stock adjustment applied.` }));
    appendMovement(batch, 'Adjustment', amount, 'Manual stock adjustment applied by admin.', 'Manual Adjustment');
    setAdjustmentState({ open: false, batch: null, quantity: 0 });
    pushToast('Stock adjusted', `${batch.sku} inventory was adjusted by ${amount}.`);
  };

  const confirmTransfer = () => {
    const { batch, destination } = transferState;
    if (!batch) return;
    updateBatches((row) => row.id === batch.id, (row) => ({ ...row, warehouse: destination, adminNotes: `${row.adminNotes} Stock transfer initiated to ${destination}.` }));
    appendMovement(batch, 'Transfer', Math.min(12, batch.availableQty), `Stock transfer initiated to ${destination}.`, 'Transfer');
    setTransferState({ open: false, batch: null, destination: '' });
    pushToast('Stock transfer created', `${batch.sku} is now assigned to ${destination}.`);
  };

  const toggleSelect = (id) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectPage = (pageRows) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      const allSelected = pageRows.every((row) => next.has(row.id));
      pageRows.forEach((row) => {
        if (allSelected) next.delete(row.id);
        else next.add(row.id);
      });
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))} />
      <InventoryStatsCards cards={statsCards} />
      <InventoryToolbar onAction={handleToolbarAction} />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap gap-2">
              {['all', 'Green', 'Orange', 'Red'].map((grade) => (
                <button
                  key={grade}
                  type="button"
                  onClick={() => setFilters((current) => ({ ...current, freshness: grade }))}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] transition ${filters.freshness === grade ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'}`}
                >
                  {grade === 'all' ? 'All freshness' : grade}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Sort by</span>
              <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="expiryDate">Expiry date</option>
                <option value="availableQty">Available quantity</option>
                <option value="incomingQty">Incoming quantity</option>
                <option value="damagedQty">Damaged quantity</option>
                <option value="sellingPrice">Selling price</option>
                <option value="margin">Margin</option>
                <option value="lastUpdated">Last updated</option>
                <option value="freshnessGrade">Freshness grade</option>
              </select>
              <button type="button" onClick={() => setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-200">
                {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
              </button>
            </div>
          </div>

          <InventoryFilters filters={filters} options={options} onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))} onReset={() => setFilters(initialFilters)} />
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => handleBulkAction('reorder')} className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700">Generate reorder requests</button>
            <button type="button" onClick={() => handleBulkAction('discount')} className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600">Move to discount sale</button>
          </div>
          <InventoryBulkActionsBar selectedCount={selectedIds.size} onAction={handleBulkAction} />

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Inventory batches</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{loading ? 'Loading inventory batches...' : `Showing ${batchMeta.start}-${batchMeta.end} of ${sortedBatches.length.toLocaleString('en-IN')} batches`}</p>
              </div>
              <div className="rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
                {batches.filter((row) => row.riskFlags.length > 0).length} risk-flagged batches
              </div>
            </div>
          </div>

          {loading ? (
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="space-y-3">
                <div className="h-5 w-48 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="h-4 w-full animate-pulse rounded-full bg-slate-100 dark:bg-slate-900" />
                <div className="h-4 w-5/6 animate-pulse rounded-full bg-slate-100 dark:bg-slate-900" />
              </div>
            </div>
          ) : !sortedBatches.length ? (
            <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <p className="text-lg font-black text-slate-900 dark:text-slate-100">No inventory batches match the current filters.</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Try widening freshness, warehouse, supplier, or expiry filters.</p>
            </div>
          ) : (
            <>
              <InventoryBatchTable rows={pagedBatches} selectedIds={selectedIds} activeId={activeBatch?.id} onToggleSelect={toggleSelect} onToggleSelectPage={toggleSelectPage} onOpen={setActiveBatch} onAction={handleAction} />
              <InventoryPagination currentPage={batchPage} totalPages={batchMeta.totalPages} total={sortedBatches.length} start={batchMeta.start} end={batchMeta.end} rowsPerPage={batchRowsPerPage} onRowsPerPageChange={setBatchRowsPerPage} onPageChange={setBatchPage} label="inventory batches" />
            </>
          )}

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Stock movement logs</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Inward, outward, transfer, adjustment, return, and reservation events.</p>
          </div>
          <InventoryMovementTable rows={pagedMovements} />
          <InventoryPagination currentPage={movementPage} totalPages={movementMeta.totalPages} total={filteredMovements.length} start={movementMeta.start} end={movementMeta.end} rowsPerPage={movementRowsPerPage} onRowsPerPageChange={setMovementRowsPerPage} onPageChange={setMovementPage} label="movement logs" />
        </div>

        <InventoryActivityPanel items={activity} />
      </div>

      <InventoryDetailsDrawer batch={activeBatch} open={Boolean(activeBatch)} onClose={() => setActiveBatch(null)} onAction={handleAction} movementRows={movements.filter((row) => row.sku === activeBatch?.sku)} />
      <StockAdjustmentModal open={adjustmentState.open} batch={adjustmentState.batch} quantity={adjustmentState.quantity} onQuantityChange={(value) => setAdjustmentState((current) => ({ ...current, quantity: value }))} onClose={() => setAdjustmentState({ open: false, batch: null, quantity: 0 })} onConfirm={confirmAdjustment} />
      <TransferStockModal open={transferState.open} batch={transferState.batch} warehouseOptions={options.warehouses} destination={transferState.destination} onDestinationChange={(value) => setTransferState((current) => ({ ...current, destination: value }))} onClose={() => setTransferState({ open: false, batch: null, destination: '' })} onConfirm={confirmTransfer} />

      {confirmState ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 px-4">
          <div className="w-full max-w-md rounded-[1.75rem] bg-white p-6 shadow-2xl dark:bg-slate-950">
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">{confirmState.title}</h3>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{confirmState.message}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setConfirmState(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-700">Cancel</button>
              <button type="button" onClick={confirmState.onConfirm} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">Confirm</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
