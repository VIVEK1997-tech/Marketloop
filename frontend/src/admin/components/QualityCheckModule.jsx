import { useEffect, useMemo, useState } from 'react';
import ToastStack from './ToastStack.jsx';
import QualityToolbar from './QualityToolbar.jsx';
import QualityStatsCards from './QualityStatsCards.jsx';
import QualityFilters from './QualityFilters.jsx';
import QualityTable from './QualityTable.jsx';
import QualityPagination from './QualityPagination.jsx';
import QualityDetailsDrawer from './QualityDetailsDrawer.jsx';
import QualityActivityPanel from './QualityActivityPanel.jsx';
import QualityBulkActionsBar from './QualityBulkActionsBar.jsx';
import { downloadCsv, downloadZip } from '../exportUtils.js';
import { generateDummyQualityChecks } from '../quality/generateDummyQualityChecks.js';
import { filterQualityRows, getQualityPaginationMeta, paginateQualityRows, sortQualityRows } from '../quality/qualityUtils.js';

const initialFilters = {
  search: '',
  grade: 'all',
  inspectionStatus: 'all',
  category: 'all',
  supplier: 'all',
  warehouse: 'all',
  region: 'all',
  freshnessMin: '',
  freshnessMax: '',
  shelfLifeMin: '',
  shelfLifeMax: '',
  damageThreshold: '',
  dateFrom: '',
  dateTo: ''
};

const buildActivity = (inspection, action, actor = 'Admin Console') => ({
  id: `${inspection.id}-${Date.now()}-${Math.random()}`,
  inspectionId: inspection.inspectionId,
  actor,
  action,
  detail: `${inspection.product} · ${inspection.supplier}`,
  timestamp: new Date().toISOString()
});

const nextGrade = (current) => (current === 'Green' ? 'Orange' : current === 'Orange' ? 'Red' : 'Green');

export default function QualityCheckModule() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);
  const [sortBy, setSortBy] = useState('inspectedAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [activeInspection, setActiveInspection] = useState(null);
  const [activity, setActivity] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const seeded = generateDummyQualityChecks(1000);
      setRows(seeded);
      setActivity(
        seeded.slice(0, 8).map((row, index) => ({
          id: `quality-activity-${index + 1}`,
          inspectionId: row.inspectionId,
          actor: row.inspectorName,
          action: index % 2 === 0 ? 'Inspection recorded' : 'Admin quality review updated',
          detail: `${row.product} · ${row.supplier}`,
          timestamp: row.inspectedAt
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
    categories: [...new Set(rows.map((row) => row.category))].sort(),
    suppliers: [...new Set(rows.map((row) => row.supplier))].sort(),
    warehouses: [...new Set(rows.map((row) => row.warehouse))].sort(),
    regions: [...new Set(rows.map((row) => row.region))].sort()
  }), [rows]);

  const filteredRows = useMemo(() => filterQualityRows(rows, filters), [rows, filters]);
  const sortedRows = useMemo(() => sortQualityRows(filteredRows, sortBy, sortDirection), [filteredRows, sortBy, sortDirection]);
  const pagedRows = useMemo(() => paginateQualityRows(sortedRows, currentPage, rowsPerPage), [sortedRows, currentPage, rowsPerPage]);
  const { start, end, totalPages } = useMemo(() => getQualityPaginationMeta(sortedRows.length, currentPage, rowsPerPage), [sortedRows.length, currentPage, rowsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy, sortDirection, rowsPerPage]);

  const statsCards = useMemo(() => {
    const green = rows.filter((row) => row.grade === 'Green').length;
    const orange = rows.filter((row) => row.grade === 'Orange').length;
    const red = rows.filter((row) => row.grade === 'Red').length;
    const expiring = rows.filter((row) => row.shelfLifeDays <= 2).length;
    const avgFreshness = rows.length ? (rows.reduce((sum, row) => sum + row.freshnessScore, 0) / rows.length).toFixed(1) : '0.0';
    return [
      { label: 'Total Inspections', value: rows.length.toLocaleString('en-IN'), helper: 'Current seeded inspection records', tone: 'cyan' },
      { label: 'Green Approved', value: green.toLocaleString('en-IN'), helper: 'Fresh lots approved for sale', tone: 'emerald' },
      { label: 'Orange Caution Stock', value: orange.toLocaleString('en-IN'), helper: 'Candidates for discount sale', tone: 'amber' },
      { label: 'Red Rejected', value: red.toLocaleString('en-IN'), helper: 'High-risk or rejected lots', tone: 'rose' },
      { label: 'Expiring Soon', value: expiring.toLocaleString('en-IN'), helper: 'Shelf life of 2 days or less', tone: 'violet' },
      { label: 'Avg Freshness', value: avgFreshness, helper: 'Average freshness score across inspections', tone: 'emerald' }
    ];
  }, [rows]);

  const updateRows = (predicate, updater, activityBuilder) => {
    const activityEntries = [];
    setRows((current) =>
      current.map((row) => {
        if (!predicate(row)) return row;
        const next = {
          ...updater(row),
          inspectedAt: new Date().toISOString()
        };
        if (activityBuilder) activityEntries.push(activityBuilder(next));
        return {
          ...next,
          auditLog: [
            {
              id: `${next.id}-audit-${Date.now()}-${Math.random()}`,
              actor: 'Admin Console',
              action: next.recommendedAction,
              detail: `Grade ${next.grade} · Status ${next.inspectionStatus}`,
              timestamp: new Date().toISOString()
            },
            ...next.auditLog
          ]
        };
      })
    );

    if (activityEntries.length) {
      setActivity((current) => [...activityEntries.reverse(), ...current].slice(0, 24));
    }
  };

  const resolveActionPatch = (action, row) => {
    if (action === 'approve') return { grade: 'Green', inspectionStatus: 'Approved for Sale', recommendedAction: 'Approve for sale' };
    if (action === 'discount') return { grade: 'Orange', inspectionStatus: 'Discount Sale', recommendedAction: 'Send to discount sale' };
    if (action === 'reject') return { grade: 'Red', inspectionStatus: 'Rejected', recommendedAction: 'Reject and return' };
    if (action === 'quarantine') return { inspectionStatus: 'Quarantined', recommendedAction: 'Quarantine batch' };
    if (action === 'assign') return { inspectorName: 'Sara Quality', adminNotes: `${row.adminNotes} Inspector reassigned by admin.` };
    if (action === 'edit') return { adminNotes: `${row.adminNotes} Inspection opened for admin edit.` };
    if (action === 'update_grade') {
      const grade = nextGrade(row.grade);
      return {
        grade,
        inspectionStatus: grade === 'Green' ? 'Approved for Sale' : grade === 'Orange' ? 'Discount Sale' : 'Quarantined',
        recommendedAction: grade === 'Green' ? 'Approve for sale' : grade === 'Orange' ? 'Send to discount sale' : 'Quarantine batch'
      };
    }
    if (action === 'archive') return { inspectionStatus: 'Archived', recommendedAction: 'Archive inspection' };
    return null;
  };

  const handleRowAction = (action, row) => {
    if (action === 'view') {
      setActiveInspection(row);
      return;
    }

    if (action === 'reject' || action === 'archive') {
      setConfirmState({
        title: `${action === 'reject' ? 'Reject' : 'Archive'} ${row.inspectionId}?`,
        message: 'This changes the quality disposition and is intentionally confirmed before applying.',
        onConfirm: () => {
          const patch = resolveActionPatch(action, row);
          updateRows((item) => item.id === row.id, (item) => ({ ...item, ...patch }), (item) => buildActivity(item, patch.recommendedAction));
          setConfirmState(null);
          pushToast(action === 'reject' ? 'Inspection rejected' : 'Inspection archived', `${row.inspectionId} was updated.`);
        }
      });
      return;
    }

    const patch = resolveActionPatch(action, row);
    if (!patch) return;
    updateRows((item) => item.id === row.id, (item) => ({ ...item, ...patch }), (item) => buildActivity(item, patch.recommendedAction || 'Inspection updated'));
    pushToast('Inspection action completed', `${row.inspectionId}: ${action.replace(/_/g, ' ')} applied.`);
  };

  const handleBulkAction = (action) => {
    const ids = [...selectedIds];
    const targetIds = ids.length ? ids : action === 'discount' ? filteredRows.filter((row) => row.grade === 'Orange').map((row) => row.id) : [];
    if (!targetIds.length && action !== 'export') return;

    if (action === 'export') {
      downloadCsv('selected-quality-inspections', rows.filter((row) => selectedIds.has(row.id)));
      pushToast('Bulk export ready', `${selectedIds.size} inspection records exported.`);
      return;
    }

    updateRows(
      (row) => targetIds.includes(row.id),
      (row) => ({ ...row, ...(resolveActionPatch(action, row) || {}) }),
      (row) => buildActivity(row, resolveActionPatch(action, row)?.recommendedAction || 'Quality action updated')
    );
    pushToast('Bulk quality action completed', `${targetIds.length} inspections updated.`);
  };

  const handleToolbarAction = (action) => {
    if (action === 'generate') {
      setLoading(true);
      setTimeout(() => {
        const additions = generateDummyQualityChecks(5).map((row, index) => ({
          ...row,
          id: `generated-quality-${Date.now()}-${index}`,
          inspectionId: `QC-GEN-${String(index + 1).padStart(2, '0')}`,
          createdAt: new Date().toISOString(),
          inspectedAt: new Date().toISOString()
        }));
        setRows((current) => [...additions, ...current]);
        setActivity((current) => [...additions.map((row) => buildActivity(row, 'Generated quality check', 'QA Generator')), ...current].slice(0, 24));
        setLoading(false);
        pushToast('Quality checks generated', `${additions.length} new inspection records were appended.`);
      }, 450);
      return;
    }

    if (action === 'csv') {
      downloadCsv('quality-inspections', sortedRows);
      pushToast('CSV downloaded', 'Filtered quality dataset exported.');
      return;
    }

    downloadZip(
      'quality-inspections',
      sortedRows.slice(0, 50).map((row) => ({
        name: row.inspectionId,
        extension: 'txt',
        content: JSON.stringify(row, null, 2)
      }))
    );
    pushToast('ZIP downloaded', 'Quality inspection bundle generated.');
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
      <QualityStatsCards cards={statsCards} />
      <QualityToolbar onAction={handleToolbarAction} />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap gap-2">
              {['all', 'Green', 'Orange', 'Red'].map((grade) => (
                <button
                  key={grade}
                  type="button"
                  onClick={() => setFilters((current) => ({ ...current, grade }))}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] transition ${
                    filters.grade === grade
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {grade === 'all' ? 'All grades' : grade}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Sort by</span>
              <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="inspectedAt">Inspected date</option>
                <option value="freshnessScore">Freshness score</option>
                <option value="shelfLifeDays">Shelf life</option>
                <option value="damagePercentage">Damage %</option>
                <option value="product">Product</option>
                <option value="supplier">Supplier</option>
                <option value="grade">Grade</option>
              </select>
              <button type="button" onClick={() => setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-200">
                {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
              </button>
            </div>
          </div>

          <QualityFilters filters={filters} options={options} onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))} onReset={() => setFilters(initialFilters)} />
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handleBulkAction('discount')}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
            >
              Send caution stock to discount sale
            </button>
          </div>
          <QualityBulkActionsBar selectedCount={selectedIds.size} onAction={handleBulkAction} />

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Quality inspections</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {loading ? 'Loading quality inspections...' : `Showing ${start}-${end} of ${sortedRows.length.toLocaleString('en-IN')} inspections`}
                </p>
              </div>
              <div className="rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
                {rows.filter((row) => row.isRisk).length} inspections in the risk queue
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
          ) : !sortedRows.length ? (
            <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <p className="text-lg font-black text-slate-900 dark:text-slate-100">No inspections match the current filters.</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Try widening grade, shelf life, damage, or warehouse filters.</p>
            </div>
          ) : (
            <>
              <QualityTable
                rows={pagedRows}
                selectedIds={selectedIds}
                activeId={activeInspection?.id}
                onToggleSelect={toggleSelect}
                onToggleSelectPage={toggleSelectPage}
                onOpen={setActiveInspection}
                onAction={handleRowAction}
              />
              <QualityPagination
                currentPage={currentPage}
                totalPages={totalPages}
                total={sortedRows.length}
                start={start}
                end={end}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={setRowsPerPage}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>

        <QualityActivityPanel items={activity} />
      </div>

      <QualityDetailsDrawer inspection={activeInspection} open={Boolean(activeInspection)} onClose={() => setActiveInspection(null)} onAction={handleRowAction} />

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

