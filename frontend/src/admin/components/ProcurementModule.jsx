import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Download, FileArchive, PackageCheck, UserRoundPlus, XCircle } from 'lucide-react';
import ToastStack from './ToastStack.jsx';
import ProcurementToolbar from './ProcurementToolbar.jsx';
import ProcurementStatsCards from './ProcurementStatsCards.jsx';
import ProcurementFilters from './ProcurementFilters.jsx';
import ProcurementTable from './ProcurementTable.jsx';
import ProcurementPagination from './ProcurementPagination.jsx';
import ProcurementActivityPanel from './ProcurementActivityPanel.jsx';
import ProcurementRequestDrawer from './ProcurementRequestDrawer.jsx';
import BulkActionToolbar from './BulkActionToolbar.jsx';
import { downloadCsv, downloadZip } from '../exportUtils.js';
import { generateDummyProcurements } from '../procurement/generateDummyProcurements.js';
import { filterProcurements, formatProcurementDate, getProcurementPaginationMeta, paginateProcurements, sortProcurements } from '../procurement/procurementUtils.js';

const initialFilters = {
  search: '',
  status: 'all',
  category: 'all',
  priority: 'all',
  supplier: 'all',
  region: 'all',
  qualityMin: '',
  qualityMax: '',
  rejectionThreshold: '',
  deliveryFrom: '',
  deliveryTo: ''
};

const buildActivity = (request, action, actor = 'Admin Console') => ({
  id: `${request.id}-${Date.now()}-${Math.random()}`,
  procurementId: request.procurementId,
  actor,
  action,
  detail: `${request.requestTitle} · ${request.supplier}`,
  timestamp: new Date().toISOString()
});

export default function ProcurementModule() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [activeRequest, setActiveRequest] = useState(null);
  const [activity, setActivity] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const seeded = generateDummyProcurements(1000);
      setRequests(seeded);
      setActivity(
        seeded.slice(0, 8).map((request, index) => ({
          id: `activity-${index + 1}`,
          procurementId: request.procurementId,
          actor: request.assignedAdmin,
          action: index % 2 === 0 ? 'Procurement reviewed' : 'Quantity plan updated',
          detail: `${request.requestTitle} · ${request.supplier}`,
          timestamp: request.updatedAt
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
    suppliers: [...new Set(requests.map((row) => row.supplier))].sort(),
    categories: [...new Set(requests.map((row) => row.category))].sort(),
    regions: [...new Set(requests.map((row) => row.region))].sort()
  }), [requests]);

  const filteredRows = useMemo(() => filterProcurements(requests, filters), [requests, filters]);
  const sortedRows = useMemo(() => sortProcurements(filteredRows, sortBy, sortDirection), [filteredRows, sortBy, sortDirection]);
  const pagedRows = useMemo(() => paginateProcurements(sortedRows, currentPage, rowsPerPage), [sortedRows, currentPage, rowsPerPage]);
  const { start, end, totalPages } = useMemo(() => getProcurementPaginationMeta(sortedRows.length, currentPage, rowsPerPage), [sortedRows.length, currentPage, rowsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy, sortDirection, rowsPerPage]);

  const statsCards = useMemo(() => {
    const pending = requests.filter((row) => row.status === 'Requested').length;
    const partial = requests.filter((row) => row.status === 'Partially Received').length;
    const highRisk = requests.filter((row) => row.isRisk).length;
    const averageQuality = requests.length ? (requests.reduce((sum, row) => sum + row.qualityScore, 0) / requests.length).toFixed(1) : '0.0';

    return [
      { label: 'Total Requests', value: requests.length.toLocaleString('en-IN'), helper: 'Active procurement planning records', tone: 'cyan' },
      { label: 'Pending Approvals', value: pending.toLocaleString('en-IN'), helper: 'Waiting on admin decision', tone: 'amber' },
      { label: 'Partially Received', value: partial.toLocaleString('en-IN'), helper: 'Need receipt reconciliation', tone: 'violet' },
      { label: 'High Rejection Risk', value: highRisk.toLocaleString('en-IN'), helper: 'Rows flagged for quality or rejection risk', tone: 'rose' },
      { label: 'Average Quality Score', value: averageQuality, helper: 'Across all procurement requests', tone: 'emerald' }
    ];
  }, [requests]);

  const updateRequests = (predicate, updater, activityBuilder) => {
    const logEntries = [];
    setRequests((current) =>
      current.map((request) => {
        if (!predicate(request)) return request;
        const next = {
          ...updater(request),
          updatedAt: new Date().toISOString()
        };
        if (activityBuilder) logEntries.push(activityBuilder(next));
        return next;
      })
    );
    if (logEntries.length) {
      setActivity((current) => [...logEntries.reverse(), ...current].slice(0, 24));
    }
  };

  const handleRowAction = (action, request) => {
    if (action === 'view') {
      setActiveRequest(request);
      return;
    }

    if (action === 'archive' || action === 'reject') {
      setConfirmState({
        title: `${action === 'archive' ? 'Archive' : 'Reject'} ${request.procurementId}?`,
        message: 'This action is intentionally confirmed because it changes the procurement workflow for suppliers and planners.',
        onConfirm: () => {
          updateRequests(
            (row) => row.id === request.id,
            (row) => ({
              ...row,
              status: action === 'archive' ? 'Archived' : 'Rejected'
            }),
            (row) => buildActivity(row, action === 'archive' ? 'Procurement archived' : 'Procurement rejected')
          );
          setConfirmState(null);
          pushToast(action === 'archive' ? 'Procurement archived' : 'Procurement rejected', `${request.procurementId} was updated successfully.`);
        }
      });
      return;
    }

    if (action === 'duplicate') {
      const duplicate = {
        ...request,
        id: `${request.id}-copy-${Date.now()}`,
        procurementId: `${request.procurementId}-COPY`,
        status: 'Draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setRequests((current) => [duplicate, ...current]);
      setActivity((current) => [buildActivity(duplicate, 'Procurement duplicated'), ...current].slice(0, 24));
      pushToast('Procurement duplicated', `${request.procurementId} was copied into a new draft.`);
      return;
    }

    updateRequests(
      (row) => row.id === request.id,
      (row) => ({
        ...row,
        status:
          action === 'approve' ? 'Approved' :
          action === 'partial' ? 'Partially Received' :
          action === 'edit' ? row.status :
          row.status,
        notes: action === 'edit' ? `${row.notes} Admin opened edit workflow.` : row.notes
      }),
      (row) => buildActivity(row, action === 'approve' ? 'Procurement approved' : action === 'partial' ? 'Marked partially received' : 'Procurement edited')
    );
    pushToast('Procurement action completed', `${request.procurementId}: ${action.replace(/_/g, ' ')} applied.`);
  };

  const handleBulkAction = (action) => {
    const ids = [...selectedIds];
    if (!ids.length) return;

    if (action === 'export') {
      downloadCsv('selected-procurements', requests.filter((row) => selectedIds.has(row.id)));
      pushToast('Bulk export ready', `${ids.length} procurement requests exported.`);
      return;
    }

    updateRequests(
      (row) => selectedIds.has(row.id),
      (row) => ({
        ...row,
        status:
          action === 'approve' ? 'Approved' :
          action === 'partial' ? 'Partially Received' :
          action === 'reject' ? 'Rejected' :
          row.status,
        assignedAdmin: action === 'assign_admin' ? 'Neha Admin' : row.assignedAdmin
      }),
      (row) =>
        buildActivity(
          row,
          action === 'approve'
            ? 'Bulk approved procurement'
            : action === 'partial'
              ? 'Bulk marked partially received'
              : action === 'reject'
                ? 'Bulk rejected procurement'
                : 'Bulk admin assignment updated'
        )
    );
    pushToast('Bulk procurement update completed', `${ids.length} procurement requests updated.`);
  };

  const handleToolbarAction = (action) => {
    if (action === 'generate') {
      setLoading(true);
      setTimeout(() => {
        const additions = generateDummyProcurements(5).map((row, index) => ({
          ...row,
          id: `generated-${Date.now()}-${index}`,
          procurementId: `PROC-GEN-${String(index + 1).padStart(2, '0')}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'Requested'
        }));
        setRequests((current) => [...additions, ...current]);
        setActivity((current) => [
          ...additions.map((row) => buildActivity(row, 'Generated procurement planning', 'Planning Bot')),
          ...current
        ].slice(0, 24));
        setLoading(false);
        pushToast('Procurement planning generated', `${additions.length} new procurement requests were appended.`);
      }, 450);
      return;
    }

    if (action === 'csv') {
      downloadCsv('procurement-requests', sortedRows);
      pushToast('CSV downloaded', 'Filtered procurement dataset exported.');
      return;
    }

    downloadZip(
      'procurement-requests',
      sortedRows.slice(0, 50).map((row) => ({
        name: row.procurementId,
        extension: 'txt',
        content: JSON.stringify(row, null, 2)
      }))
    );
    pushToast('ZIP downloaded', 'Procurement bundle generated.');
  };

  const toggleSelect = (id) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectPage = (rows) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      const allSelected = rows.every((row) => next.has(row.id));
      rows.forEach((row) => {
        if (allSelected) next.delete(row.id);
        else next.add(row.id);
      });
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))} />
      <ProcurementStatsCards cards={statsCards} />
      <ProcurementToolbar onAction={handleToolbarAction} />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap gap-2">
              {['all', 'Requested', 'Approved', 'Partially Received', 'Rejected'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFilters((current) => ({ ...current, status }))}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] transition ${
                    filters.status === status
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {status === 'all' ? 'All statuses' : status}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Sort by</span>
              <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="createdAt">Created date</option>
                <option value="expectedDeliveryDate">Expected delivery</option>
                <option value="qualityScore">Quality score</option>
                <option value="rejectionRate">Rejection rate</option>
                <option value="quantityPlan">Quantity plan</option>
                <option value="status">Status</option>
              </select>
              <button type="button" onClick={() => setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-200">
                {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
              </button>
            </div>
          </div>

          <ProcurementFilters filters={filters} options={options} onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))} onReset={() => setFilters(initialFilters)} />
          <BulkActionToolbar
            selectedCount={selectedIds.size}
            title="Bulk procurement actions"
            entityLabel="procurement requests"
            actions={[
              { key: 'approve', label: 'Approve selected', icon: CheckCircle2 },
              { key: 'partial', label: 'Mark partial', icon: PackageCheck },
              { key: 'reject', label: 'Reject selected', icon: XCircle },
              { key: 'assign_admin', label: 'Assign admin', icon: UserRoundPlus },
              { key: 'export', label: 'Export selected', icon: Download }
            ]}
            onAction={handleBulkAction}
          />

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Procurement requests</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {loading ? 'Loading procurement requests...' : `Showing ${start}-${end} of ${sortedRows.length.toLocaleString('en-IN')} requests`}
                </p>
              </div>
              <div className="rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
                {requests.filter((row) => row.isRisk).length} requests in the review queue
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
              <p className="text-lg font-black text-slate-900 dark:text-slate-100">No procurement requests match the current filters.</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Try widening supplier, quality, rejection, or delivery date filters.</p>
            </div>
          ) : (
            <>
              <ProcurementTable
                rows={pagedRows}
                selectedIds={selectedIds}
                activeId={activeRequest?.id}
                onToggleSelect={toggleSelect}
                onToggleSelectPage={toggleSelectPage}
                onOpen={setActiveRequest}
                onAction={handleRowAction}
              />
              <ProcurementPagination
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

        <ProcurementActivityPanel items={activity} />
      </div>

      <ProcurementRequestDrawer request={activeRequest} open={Boolean(activeRequest)} onClose={() => setActiveRequest(null)} onAction={handleRowAction} />

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

