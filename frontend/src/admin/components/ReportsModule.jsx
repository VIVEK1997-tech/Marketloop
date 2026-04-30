import { useEffect, useMemo, useState } from 'react';
import ReportsToolbar from './ReportsToolbar.jsx';
import ReportsStatsCards from './ReportsStatsCards.jsx';
import ReportsFilters from './ReportsFilters.jsx';
import ReportsTable from './ReportsTable.jsx';
import ReportsPagination from './ReportsPagination.jsx';
import ReportPreviewModal from './ReportPreviewModal.jsx';
import ReportDetailsDrawer from './ReportDetailsDrawer.jsx';
import ReportsActivityPanel from './ReportsActivityPanel.jsx';
import ReportsBulkActionsBar from './ReportsBulkActionsBar.jsx';
import ReportScheduleModal from './ReportScheduleModal.jsx';
import ToastStack from './ToastStack.jsx';
import { downloadCsv, downloadZip } from '../exportUtils.js';
import { generateDummyReports } from '../reports/generateDummyReports.js';
import { filterReports, getReportsPaginationMeta, paginateReports, sortReports } from '../reports/reportsUtils.js';

const initialFilters = {
  search: '',
  category: 'all',
  status: 'all',
  format: 'all',
  ownerAdmin: 'all',
  scheduleFrequency: 'all',
  visibility: 'all',
  lastRunFrom: '',
  lastRunTo: '',
  scheduledOnly: false,
  failedOnly: false
};

const buildActivity = (report, action, actor = 'Admin Console', detail) => ({
  id: `${report.id}-${Date.now()}-${Math.random()}`,
  reportId: report.reportId,
  actor,
  action,
  detail: detail || `${report.reportName} - ${report.status}`,
  timestamp: new Date().toISOString()
});

export default function ReportsModule() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);
  const [sortBy, setSortBy] = useState('lastRunAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [activeReport, setActiveReport] = useState(null);
  const [previewReport, setPreviewReport] = useState(null);
  const [scheduleState, setScheduleState] = useState({ open: false, report: null, frequency: 'None', nextRun: '' });
  const [activity, setActivity] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const seeded = generateDummyReports(500);
      setRows(seeded);
      setActivity(
        seeded.slice(0, 12).map((row, index) => ({
          id: `report-activity-${index + 1}`,
          reportId: row.reportId,
          actor: row.ownerAdmin,
          action: index % 3 === 0 ? 'Report generated' : index % 3 === 1 ? 'Report scheduled' : 'Report downloaded',
          detail: `${row.reportName} - ${row.status}`,
          timestamp: row.updatedAt
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

  const options = useMemo(
    () => ({
      categories: [...new Set(rows.map((row) => row.reportCategory))].sort(),
      formats: [...new Set(rows.flatMap((row) => row.formats))].sort(),
      owners: [...new Set(rows.map((row) => row.ownerAdmin))].sort(),
      frequencies: [...new Set(rows.map((row) => row.scheduleFrequency))].sort(),
      visibilities: [...new Set(rows.map((row) => row.visibility))].sort()
    }),
    [rows]
  );

  const filteredRows = useMemo(() => filterReports(rows, filters), [rows, filters]);
  const sortedRows = useMemo(() => sortReports(filteredRows, sortBy, sortDirection), [filteredRows, sortBy, sortDirection]);
  const pagedRows = useMemo(() => paginateReports(sortedRows, currentPage, rowsPerPage), [sortedRows, currentPage, rowsPerPage]);
  const { start, end, totalPages } = useMemo(
    () => getReportsPaginationMeta(sortedRows.length, currentPage, rowsPerPage),
    [sortedRows.length, currentPage, rowsPerPage]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy, sortDirection, rowsPerPage]);

  const statsCards = useMemo(() => {
    const ready = rows.filter((row) => row.status === 'Ready').length;
    const queued = rows.filter((row) => row.status === 'Queued').length;
    const failed = rows.filter((row) => row.status === 'Failed').length;
    const scheduled = rows.filter((row) => row.scheduleFrequency !== 'None').length;
    const exportsThisMonth = rows.filter((row) => row.lastRunAt && new Date(row.lastRunAt).getMonth() === new Date('2026-04-24').getMonth()).length;
    return [
      { label: 'Total Reports', value: rows.length.toLocaleString('en-IN'), helper: 'Tracked exports and report templates', tone: 'cyan' },
      { label: 'Ready Reports', value: ready.toLocaleString('en-IN'), helper: 'Reports available for download', tone: 'emerald' },
      { label: 'Queued Reports', value: queued.toLocaleString('en-IN'), helper: 'Pending jobs waiting for generation', tone: 'amber' },
      { label: 'Failed Reports', value: failed.toLocaleString('en-IN'), helper: 'Exports needing retry or review', tone: 'rose' },
      { label: 'Scheduled Reports', value: scheduled.toLocaleString('en-IN'), helper: 'Recurring scheduled report jobs', tone: 'violet' },
      { label: 'Exports This Month', value: exportsThisMonth.toLocaleString('en-IN'), helper: 'Generated report exports this month', tone: 'emerald' }
    ];
  }, [rows]);

  const updateRows = (predicate, updater, activityBuilder) => {
    const activityEntries = [];
    setRows((current) =>
      current.map((row) => {
        if (!predicate(row)) return row;
        const next = { ...updater(row), updatedAt: new Date().toISOString() };
        if (activityBuilder) activityEntries.push(activityBuilder(next));
        return next;
      })
    );
    if (activityEntries.length) {
      setActivity((current) => [...activityEntries.reverse(), ...current].slice(0, 30));
    }
  };

  const generateReport = (report, actor = 'Report Engine') => {
    updateRows(
      (row) => row.id === report.id,
      (row) => ({
        ...row,
        status: 'Ready',
        lastRunAt: new Date().toISOString(),
        totalRows: row.totalRows + 12
      }),
      (row) => buildActivity(row, 'Report generated', actor)
    );
  };

  const handleRowAction = (action, report) => {
    if (action === 'view') {
      setActiveReport(report);
      return;
    }
    if (action === 'preview') {
      setPreviewReport(report);
      setActivity((current) => [buildActivity(report, 'Report preview opened'), ...current].slice(0, 30));
      return;
    }
    if (action === 'generate') {
      generateReport(report);
      pushToast('Report generated', `${report.reportName} was refreshed.`);
      return;
    }
    if (action === 'retry') {
      generateReport(report, 'Retry Worker');
      pushToast('Failed report retried', `${report.reportName} retry completed.`);
      return;
    }
    if (action === 'schedule') {
      setScheduleState({
        open: true,
        report,
        frequency: report.scheduleFrequency,
        nextRun: report.nextScheduledRun ? new Date(report.nextScheduledRun).toISOString().slice(0, 16) : ''
      });
      return;
    }
    if (action.startsWith('download_')) {
      const format = action.replace('download_', '').toUpperCase();
      downloadZip(`${report.reportId}-${format.toLowerCase()}`, [{ name: `${report.reportId}-${format.toLowerCase()}`, extension: 'txt', content: JSON.stringify(report, null, 2) }]);
      setActivity((current) => [buildActivity(report, `${format} download requested`), ...current].slice(0, 30));
      pushToast('Export placeholder downloaded', `${report.reportName} ${format} placeholder was generated.`);
      return;
    }
    if (action === 'duplicate') {
      const duplicate = {
        ...report,
        id: `${report.id}-copy-${Date.now()}`,
        reportId: `${report.reportId}-COPY`,
        status: 'Queued',
        lastRunAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setRows((current) => [duplicate, ...current]);
      setActivity((current) => [buildActivity(duplicate, 'Report duplicated'), ...current].slice(0, 30));
      pushToast('Report duplicated', `${report.reportName} was copied into a new queued report.`);
      return;
    }
    if (action === 'archive' || action === 'delete') {
      setConfirmState({
        title: `${action === 'archive' ? 'Archive' : 'Delete'} ${report.reportName}?`,
        message: 'This changes report availability and is intentionally confirmed before applying.',
        onConfirm: () => {
          if (action === 'delete') {
            setRows((current) => current.filter((row) => row.id !== report.id));
            setActivity((current) => [buildActivity(report, 'Report deleted'), ...current].slice(0, 30));
          } else {
            updateRows(
              (row) => row.id === report.id,
              (row) => ({ ...row, status: 'Archived' }),
              (row) => buildActivity(row, 'Report archived')
            );
          }
          setConfirmState(null);
          pushToast(action === 'archive' ? 'Report archived' : 'Report deleted', `${report.reportName} updated successfully.`);
        }
      });
    }
  };

  const handleBulkAction = (action) => {
    const ids = [...selectedIds];
    if (!ids.length) return;

    if (action === 'export') {
      downloadCsv('selected-reports', rows.filter((row) => selectedIds.has(row.id)));
      pushToast('Bulk export ready', `${selectedIds.size} reports exported.`);
      return;
    }
    if (action === 'download') {
      downloadZip(
        'selected-reports',
        rows.filter((row) => selectedIds.has(row.id)).map((row) => ({
          name: row.reportId,
          extension: 'txt',
          content: JSON.stringify(row, null, 2)
        }))
      );
      pushToast('ZIP downloaded', `${selectedIds.size} report placeholders downloaded.`);
      return;
    }
    if (action === 'schedule') {
      const target = rows.find((row) => selectedIds.has(row.id));
      if (target) {
        setScheduleState({
          open: true,
          report: target,
          frequency: target.scheduleFrequency,
          nextRun: target.nextScheduledRun ? new Date(target.nextScheduledRun).toISOString().slice(0, 16) : ''
        });
      }
      return;
    }
    if (action === 'delete') {
      setConfirmState({
        title: `Delete ${ids.length} reports?`,
        message: 'Bulk delete is intentionally confirmed to avoid removing reporting history by mistake.',
        onConfirm: () => {
          setRows((current) => current.filter((row) => !selectedIds.has(row.id)));
          setConfirmState(null);
          pushToast('Reports deleted', `${ids.length} reports were removed.`);
        }
      });
      return;
    }

    updateRows(
      (row) => selectedIds.has(row.id),
      (row) => ({
        ...row,
        status:
          action === 'generate' ? 'Ready' :
          action === 'archive' ? 'Archived' :
          row.status,
        lastRunAt: action === 'generate' ? new Date().toISOString() : row.lastRunAt
      }),
      (row) => buildActivity(row, action === 'generate' ? 'Report generated' : action === 'archive' ? 'Report archived' : 'Report scheduled')
    );
    pushToast('Bulk reports action completed', `${ids.length} reports updated.`);
  };

  const handleToolbarAction = (action) => {
    if (action === 'generate') {
      setLoading(true);
      setTimeout(() => {
        const additions = generateDummyReports(4).map((row, index) => ({
          ...row,
          id: `generated-report-${Date.now()}-${index}`,
          reportId: `RPT-GEN-${String(index + 1).padStart(2, '0')}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
        setRows((current) => [...additions, ...current]);
        setActivity((current) => [...additions.map((row) => buildActivity(row, 'Generated report planning', 'Report Generator')), ...current].slice(0, 30));
        setLoading(false);
        pushToast('Reports generated', `${additions.length} report records were appended.`);
      }, 450);
      return;
    }
    if (action === 'preview') {
      const target = rows.find((row) => selectedIds.has(row.id)) || rows.find((row) => row.status === 'Ready') || rows[0];
      if (target) setPreviewReport(target);
      return;
    }
    if (action === 'csv') {
      downloadCsv('report-center', sortedRows);
      pushToast('CSV downloaded', 'Filtered report list exported.');
      return;
    }
    downloadZip(
      'report-center',
      sortedRows.slice(0, 40).map((row) => ({
        name: row.reportId,
        extension: 'txt',
        content: JSON.stringify(row, null, 2)
      }))
    );
    setActivity((current) => [{
      id: `zip-${Date.now()}`,
      reportId: 'ZIP',
      actor: 'Admin Console',
      action: 'ZIP export generated',
      detail: 'Report bundle placeholder prepared.',
      timestamp: new Date().toISOString()
    }, ...current].slice(0, 30));
    pushToast('ZIP downloaded', 'Report ZIP placeholder generated.');
  };

  const saveSchedule = () => {
    const { report, frequency, nextRun } = scheduleState;
    if (!report) return;
    updateRows(
      (row) => row.id === report.id,
      (row) => ({
        ...row,
        scheduleFrequency: frequency,
        nextScheduledRun: frequency === 'None' ? null : new Date(nextRun).toISOString(),
        status: frequency === 'None' ? row.status : 'Scheduled'
      }),
      (row) => buildActivity(row, 'Report scheduled', 'Admin Scheduler', `${frequency} schedule saved.`)
    );
    setScheduleState({ open: false, report: null, frequency: 'None', nextRun: '' });
    pushToast('Schedule saved', `${report.reportName} schedule was updated.`);
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
      <ReportsStatsCards cards={statsCards} />
      <ReportsToolbar onAction={handleToolbarAction} />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap gap-2">
              {['all', 'Ready', 'Queued', 'Failed', 'Scheduled'].map((status) => (
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
                <option value="reportName">Report name</option>
                <option value="reportCategory">Category</option>
                <option value="lastRunAt">Last run date</option>
                <option value="nextScheduledRun">Next scheduled run</option>
                <option value="status">Status</option>
                <option value="totalRows">Total rows</option>
                <option value="fileSize">File size</option>
              </select>
              <button type="button" onClick={() => setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-200">
                {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
              </button>
            </div>
          </div>

          <ReportsFilters filters={filters} options={options} onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))} onReset={() => setFilters(initialFilters)} />
          <ReportsBulkActionsBar selectedCount={selectedIds.size} onAction={handleBulkAction} />

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Report Center</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{loading ? 'Loading reports...' : `Showing ${start}-${end} of ${sortedRows.length.toLocaleString('en-IN')} reports`}</p>
              </div>
              <div className="rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                {rows.filter((row) => row.status === 'Failed').length} failed reports in retry queue
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
              <p className="text-lg font-black text-slate-900 dark:text-slate-100">No reports match the current filters.</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Try widening category, status, owner, schedule, or visibility filters.</p>
            </div>
          ) : (
            <>
              <ReportsTable rows={pagedRows} selectedIds={selectedIds} activeId={activeReport?.id} onToggleSelect={toggleSelect} onToggleSelectPage={toggleSelectPage} onOpen={setActiveReport} onAction={handleRowAction} />
              <ReportsPagination currentPage={currentPage} totalPages={totalPages} total={sortedRows.length} start={start} end={end} rowsPerPage={rowsPerPage} onRowsPerPageChange={setRowsPerPage} onPageChange={setCurrentPage} />
            </>
          )}
        </div>

        <ReportsActivityPanel items={activity} />
      </div>

      <ReportDetailsDrawer report={activeReport} open={Boolean(activeReport)} onClose={() => setActiveReport(null)} onAction={handleRowAction} />
      <ReportPreviewModal open={Boolean(previewReport)} report={previewReport} onClose={() => setPreviewReport(null)} />
      <ReportScheduleModal
        open={scheduleState.open}
        report={scheduleState.report}
        frequency={scheduleState.frequency}
        nextRun={scheduleState.nextRun}
        onFrequencyChange={(value) => setScheduleState((current) => ({ ...current, frequency: value }))}
        onNextRunChange={(value) => setScheduleState((current) => ({ ...current, nextRun: value }))}
        onClose={() => setScheduleState({ open: false, report: null, frequency: 'None', nextRun: '' })}
        onConfirm={saveSchedule}
      />

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
