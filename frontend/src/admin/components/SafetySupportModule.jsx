import { useEffect, useMemo, useState } from 'react';
import SafetyToolbar from './SafetyToolbar.jsx';
import SafetyStatsCards from './SafetyStatsCards.jsx';
import SafetyFilters from './SafetyFilters.jsx';
import NotificationTable from './NotificationTable.jsx';
import ComplaintTable from './ComplaintTable.jsx';
import SafetyPagination from './SafetyPagination.jsx';
import AlertDetailsDrawer from './AlertDetailsDrawer.jsx';
import ComplaintDetailsDrawer from './ComplaintDetailsDrawer.jsx';
import SafetyActivityPanel from './SafetyActivityPanel.jsx';
import SafetyBulkActionsBar from './SafetyBulkActionsBar.jsx';
import BlockUserModal from './BlockUserModal.jsx';
import ResolveComplaintModal from './ResolveComplaintModal.jsx';
import ToastStack from './ToastStack.jsx';
import { downloadCsv, downloadZip } from '../exportUtils.js';
import { generateSafetyData } from '../safety/generateSafetyData.js';
import { filterAlerts, filterComplaints, getSafetyPaginationMeta, paginateSafetyRows, sortSafetyRows } from '../safety/safetyUtils.js';

const initialFilters = {
  search: '',
  alertLevel: 'all',
  alertStatus: 'all',
  alertType: 'all',
  complaintType: 'all',
  complaintStatus: 'all',
  severity: 'all',
  assignedAdmin: 'all',
  blockedOnly: false,
  suspendedOnly: false,
  unresolvedOnly: false,
  createdFrom: '',
  createdTo: ''
};

const buildActivity = (actor, action, recordId, note) => ({
  id: `${recordId}-${Date.now()}-${Math.random()}`,
  actor,
  action,
  recordId,
  note,
  timestamp: new Date().toISOString()
});

export default function SafetySupportModule() {
  const [alerts, setAlerts] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [alertPage, setAlertPage] = useState(1);
  const [complaintPage, setComplaintPage] = useState(1);
  const [alertRowsPerPage, setAlertRowsPerPage] = useState(10);
  const [complaintRowsPerPage, setComplaintRowsPerPage] = useState(10);
  const [selectedAlertIds, setSelectedAlertIds] = useState(() => new Set());
  const [selectedComplaintIds, setSelectedComplaintIds] = useState(() => new Set());
  const [activeAlert, setActiveAlert] = useState(null);
  const [activeComplaint, setActiveComplaint] = useState(null);
  const [activity, setActivity] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  const [blockState, setBlockState] = useState({ open: false, complaint: null, mode: 'block' });
  const [resolveState, setResolveState] = useState({ open: false, complaint: null });

  useEffect(() => {
    const timer = setTimeout(() => {
      const seeded = generateSafetyData(1000);
      setAlerts(seeded.alerts);
      setComplaints(seeded.complaints);
      setActivity([
        ...seeded.alerts.slice(0, 6).map((row, index) =>
          buildActivity(row.assignedAdmin, index % 2 === 0 ? 'Alert acknowledged' : 'Alert escalated', row.alertId, `${row.alertTitle} in ${row.sourceModule}`)
        ),
        ...seeded.complaints.slice(0, 6).map((row, index) =>
          buildActivity(row.assignedAdmin, index % 2 === 0 ? 'Complaint reviewed' : 'User watchlisted', row.complaintId, `${row.complaintType} against ${row.againstName}`)
        )
      ].sort((left, right) => new Date(right.timestamp) - new Date(left.timestamp)));
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setAlertPage(1);
    setComplaintPage(1);
  }, [filters, sortBy, sortDirection, alertRowsPerPage, complaintRowsPerPage]);

  const pushToast = (title, message, tone = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, title, message, tone }]);
    setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3500);
  };

  const appendActivity = (entry) => {
    setActivity((current) => [entry, ...current].slice(0, 36));
  };

  const alertOptions = useMemo(() => ({
    levels: [...new Set(alerts.map((row) => row.level))].sort(),
    statuses: [...new Set(alerts.map((row) => row.status))].sort(),
    types: [...new Set(alerts.map((row) => row.alertType))].sort(),
    admins: [...new Set(alerts.map((row) => row.assignedAdmin))].sort()
  }), [alerts]);

  const complaintOptions = useMemo(() => ({
    types: [...new Set(complaints.map((row) => row.complaintType))].sort(),
    statuses: [...new Set(complaints.map((row) => row.status))].sort(),
    severities: [...new Set(complaints.map((row) => row.severity))].sort(),
    admins: [...new Set(complaints.map((row) => row.assignedAdmin))].sort()
  }), [complaints]);

  const filteredAlerts = useMemo(() => filterAlerts(alerts, filters), [alerts, filters]);
  const filteredComplaints = useMemo(() => filterComplaints(complaints, filters), [complaints, filters]);
  const sortedAlerts = useMemo(() => sortSafetyRows(filteredAlerts, sortBy, sortDirection), [filteredAlerts, sortBy, sortDirection]);
  const sortedComplaints = useMemo(() => sortSafetyRows(filteredComplaints, sortBy, sortDirection), [filteredComplaints, sortBy, sortDirection]);
  const pagedAlerts = useMemo(() => paginateSafetyRows(sortedAlerts, alertPage, alertRowsPerPage), [sortedAlerts, alertPage, alertRowsPerPage]);
  const pagedComplaints = useMemo(() => paginateSafetyRows(sortedComplaints, complaintPage, complaintRowsPerPage), [sortedComplaints, complaintPage, complaintRowsPerPage]);
  const alertsMeta = useMemo(() => getSafetyPaginationMeta(sortedAlerts.length, alertPage, alertRowsPerPage), [sortedAlerts.length, alertPage, alertRowsPerPage]);
  const complaintsMeta = useMemo(() => getSafetyPaginationMeta(sortedComplaints.length, complaintPage, complaintRowsPerPage), [sortedComplaints.length, complaintPage, complaintRowsPerPage]);

  const blockedCount = useMemo(() => complaints.filter((row) => row.isBlocked || row.isSuspended).length, [complaints]);

  const statsCards = useMemo(() => {
    const criticalAlerts = alerts.filter((row) => ['Danger', 'Critical'].includes(row.level)).length;
    const unresolvedAlerts = alerts.filter((row) => !['Resolved', 'Dismissed'].includes(row.status)).length;
    const openComplaints = complaints.filter((row) => ['Open', 'In Review'].includes(row.status)).length;
    const escalatedComplaints = complaints.filter((row) => row.status === 'Escalated').length;
    const averageRisk = alerts.length ? (alerts.reduce((sum, row) => sum + (row.level === 'Critical' ? 4 : row.level === 'Danger' ? 3 : row.level === 'Warning' ? 2 : 1), 0) / alerts.length).toFixed(1) : '0.0';
    return [
      { label: 'Total Alerts', value: alerts.length.toLocaleString('en-IN'), helper: 'Notifications across payments, inventory, auth, and support.' },
      { label: 'Danger / Critical', value: criticalAlerts.toLocaleString('en-IN'), helper: 'Highest priority alerts needing rapid admin action.' },
      { label: 'Unresolved Alerts', value: unresolvedAlerts.toLocaleString('en-IN'), helper: 'Alerts still waiting for acknowledge, review, or resolution.' },
      { label: 'Open Complaints', value: openComplaints.toLocaleString('en-IN'), helper: 'Active user complaints and support cases under review.' },
      { label: 'Escalated Cases', value: escalatedComplaints.toLocaleString('en-IN'), helper: 'Complaints currently pushed into escalation workflow.' },
      { label: 'Blocked / Suspended', value: blockedCount.toLocaleString('en-IN'), helper: `Safety watchlist pressure score ${averageRisk}/4.` }
    ];
  }, [alerts, complaints, blockedCount]);

  const updateAlerts = (predicate, updater, activityBuilder) => {
    const entries = [];
    setAlerts((current) => current.map((row) => {
      if (!predicate(row)) return row;
      const next = { ...updater(row), updatedAt: new Date().toISOString() };
      if (activityBuilder) entries.push(activityBuilder(next));
      return next;
    }));
    if (entries.length) setActivity((current) => [...entries.reverse(), ...current].slice(0, 36));
  };

  const updateComplaints = (predicate, updater, activityBuilder) => {
    const entries = [];
    setComplaints((current) => current.map((row) => {
      if (!predicate(row)) return row;
      const next = { ...updater(row), updatedAt: new Date().toISOString() };
      if (activityBuilder) entries.push(activityBuilder(next));
      return next;
    }));
    if (entries.length) setActivity((current) => [...entries.reverse(), ...current].slice(0, 36));
  };

  const handleAlertAction = (action, alert) => {
    const targetIds = alert ? new Set([alert.id]) : selectedAlertIds;
    if (!targetIds.size) return;

    if (action === 'export') {
      downloadCsv('selected-alerts', alerts.filter((row) => targetIds.has(row.id)));
      pushToast('Alerts exported', `${targetIds.size} alerts exported to CSV.`);
      return;
    }

    const nextStatus =
      action === 'acknowledge' ? 'Acknowledged' :
      action === 'investigate' ? 'Investigating' :
      action === 'resolve' ? 'Resolved' :
      action === 'dismiss' ? 'Dismissed' :
      action === 'escalate' ? 'Investigating' : null;

    if (!nextStatus) return;

    updateAlerts(
      (row) => targetIds.has(row.id),
      (row) => ({
        ...row,
        status: nextStatus,
        assignedAdmin: action === 'escalate' ? 'Fraud Desk' : row.assignedAdmin,
        timeline: [
          {
            id: `${row.alertId}-${Date.now()}`,
            actor: action === 'escalate' ? 'Fraud Desk' : 'Safety Desk',
            action: action === 'acknowledge' ? 'Alert acknowledged' : action === 'investigate' ? 'Alert investigation opened' : action === 'resolve' ? 'Alert resolved' : action === 'dismiss' ? 'Alert dismissed' : 'Alert escalated',
            detail: row.recommendedAction,
            timestamp: new Date().toISOString()
          },
          ...row.timeline
        ]
      }),
      (row) => buildActivity(action === 'escalate' ? 'Fraud Desk' : 'Safety Desk', `Alert ${action}`, row.alertId, `${row.alertTitle} moved to ${nextStatus}.`)
    );
    setSelectedAlertIds(new Set());
    pushToast('Alert workflow updated', `${targetIds.size} alert${targetIds.size > 1 ? 's were' : ' was'} updated.`);
  };

  const handleComplaintAction = (action, complaint) => {
    const targetIds = complaint ? new Set([complaint.id]) : selectedComplaintIds;
    if (!targetIds.size) return;

    if (action === 'export') {
      downloadCsv('selected-complaints', complaints.filter((row) => targetIds.has(row.id)));
      pushToast('Complaints exported', `${targetIds.size} complaints exported to CSV.`);
      return;
    }

    if (action === 'assign') {
      updateComplaints(
        (row) => targetIds.has(row.id),
        (row) => ({
          ...row,
          assignedAdmin: 'Support Lead',
          timeline: [{ id: `${row.complaintId}-${Date.now()}`, actor: 'Support Lead', action: 'Complaint assigned', detail: 'Case assigned to Support Lead.', timestamp: new Date().toISOString() }, ...row.timeline]
        }),
        (row) => buildActivity('Support Lead', 'Complaint assigned', row.complaintId, `Assigned to Support Lead.`)
      );
      pushToast('Assignment updated', `${targetIds.size} complaint${targetIds.size > 1 ? 's' : ''} reassigned.`);
      return;
    }

    if (action === 'resolve' && complaint) {
      setResolveState({ open: true, complaint });
      return;
    }

    if (action === 'block' || action === 'unblock') {
      setBlockState({ open: true, complaint, mode: action === 'block' ? 'block' : 'restore' });
      return;
    }

    const nextStatus =
      action === 'escalate' ? 'Escalated' :
      action === 'reject' ? 'Rejected' :
      action === 'suspend' ? 'Suspended' :
      action === 'restore' ? 'In Review' : null;

    if (!nextStatus) return;

    updateComplaints(
      (row) => targetIds.has(row.id),
      (row) => ({
        ...row,
        status: nextStatus,
        isSuspended: action === 'suspend' ? true : action === 'restore' ? false : row.isSuspended,
        timeline: [{ id: `${row.complaintId}-${Date.now()}`, actor: 'Safety Desk', action: `Complaint ${action}`, detail: `${row.complaintType} moved to ${nextStatus}.`, timestamp: new Date().toISOString() }, ...row.timeline]
      }),
      (row) => buildActivity('Safety Desk', `Complaint ${action}`, row.complaintId, `${row.complaintType} moved to ${nextStatus}.`)
    );
    setSelectedComplaintIds(new Set());
    pushToast('Complaint workflow updated', `${targetIds.size} complaint${targetIds.size > 1 ? 's were' : ' was'} updated.`);
  };

  const handleGenerateScan = () => {
    setLoading(true);
    setTimeout(() => {
      const seeded = generateSafetyData(12);
      const newAlerts = seeded.alerts.map((row, index) => ({
        ...row,
        id: `alert-extra-${Date.now()}-${index + 1}`,
        alertId: `ALT-${String(990000 + index).padStart(6, '0')}`,
        status: 'New',
        level: index % 3 === 0 ? 'Critical' : row.level
      }));
      setAlerts((current) => [...newAlerts, ...current]);
      appendActivity(buildActivity('Risk Engine', 'Safety scan generated', 'SCAN-001', `${newAlerts.length} new alerts created from simulated risk scan.`));
      setLoading(false);
      pushToast('Safety scan complete', `${newAlerts.length} new alerts were added to the queue.`);
    }, 700);
  };

  const handleCsvExport = () => {
    downloadCsv('safety-alerts', filteredAlerts);
    downloadCsv('safety-complaints', filteredComplaints);
    pushToast('Safety exports ready', 'Filtered alerts and complaints were exported.');
  };

  const handleZipExport = () => {
    downloadZip('safety-support-bundle', [
      { name: 'alerts-summary', extension: 'txt', content: JSON.stringify(filteredAlerts.slice(0, 50), null, 2) },
      { name: 'complaints-summary', extension: 'txt', content: JSON.stringify(filteredComplaints.slice(0, 50), null, 2) }
    ]);
    appendActivity(buildActivity('Admin Console', 'ZIP export generated', 'SAFETY-BUNDLE', 'Safety support placeholder bundle downloaded.'));
    pushToast('ZIP export generated', 'Safety support placeholder bundle is ready.');
  };

  const handleSelectAll = (setState) => (ids, checked) => {
    setState((current) => {
      const next = new Set(current);
      ids.forEach((id) => {
        if (checked) next.add(id);
        else next.delete(id);
      });
      return next;
    });
  };

  const handleToggleSelect = (setState) => (id) => {
    setState((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const confirmResolveComplaint = (resolution) => {
    const complaint = resolveState.complaint;
    if (!complaint) return;
    updateComplaints(
      (row) => row.id === complaint.id,
      (row) => ({
        ...row,
        status: 'Resolved',
        resolutionNotes: resolution,
        timeline: [{ id: `${row.complaintId}-${Date.now()}`, actor: 'Support Lead', action: 'Complaint resolved', detail: resolution, timestamp: new Date().toISOString() }, ...row.timeline]
      }),
      (row) => buildActivity('Support Lead', 'Complaint resolved', row.complaintId, resolution)
    );
    setResolveState({ open: false, complaint: null });
    pushToast('Complaint resolved', `${complaint.complaintId} resolution notes were saved.`);
  };

  const confirmBlockAction = (reason) => {
    const complaint = blockState.complaint;
    if (!complaint) return;
    const isRestriction = blockState.mode === 'block';
    updateComplaints(
      (row) => row.id === complaint.id,
      (row) => ({
        ...row,
        status: isRestriction ? 'Blocked' : 'In Review',
        isBlocked: isRestriction,
        isSuspended: isRestriction ? true : false,
        resolutionNotes: reason,
        timeline: [{ id: `${row.complaintId}-${Date.now()}`, actor: 'Safety Desk', action: isRestriction ? 'Account restricted' : 'Account restored', detail: reason, timestamp: new Date().toISOString() }, ...row.timeline]
      }),
      (row) => buildActivity('Safety Desk', isRestriction ? 'Account restricted' : 'Account restored', row.complaintId, reason)
    );
    setBlockState({ open: false, complaint: null, mode: 'block' });
    pushToast(isRestriction ? 'Account blocked' : 'Account restored', `${complaint.againstName} safety state was updated.`);
  };

  const handleQuickStatusAlert = (row) => {
    handleAlertAction(row.status === 'New' ? 'acknowledge' : row.status === 'Acknowledged' ? 'investigate' : row.status === 'Investigating' ? 'resolve' : 'dismiss', row);
  };

  const handleQuickStatusComplaint = (row) => {
    if (row.status === 'Open' || row.status === 'In Review') {
      setResolveState({ open: true, complaint: row });
      return;
    }
    handleComplaintAction('escalate', row);
  };

  const handleViewLinked = (row) => {
    appendActivity(buildActivity('Admin Console', 'Linked record viewed', row.alertId, `${row.linkedRecordType} ${row.linkedRecordId} opened from alert detail.`));
    pushToast('Linked record opened', `${row.linkedRecordType} ${row.linkedRecordId} drill-in logged.`);
  };

  const handleComplaintBlock = (row, action) => {
    setBlockState({ open: true, complaint: row, mode: action === 'unblock' ? 'restore' : 'block' });
  };

  const resetFilters = () => setFilters(initialFilters);

  const sectionShell = 'rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900';

  return (
    <div className="space-y-6">
      <SafetyToolbar
        search={filters.search}
        onSearchChange={(value) => setFilters((current) => ({ ...current, search: value }))}
        onGenerateScan={handleGenerateScan}
        onCsvExport={handleCsvExport}
        onZipExport={handleZipExport}
        blockedCount={blockedCount}
      />

      <SafetyStatsCards cards={statsCards} />

      <SafetyFilters
        filters={filters}
        onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
        alertOptions={alertOptions}
        complaintOptions={complaintOptions}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortByChange={setSortBy}
        onSortDirectionChange={setSortDirection}
        onReset={resetFilters}
      />

      <SafetyBulkActionsBar
        selectedAlertCount={selectedAlertIds.size}
        selectedComplaintCount={selectedComplaintIds.size}
        onAlertAction={handleAlertAction}
        onComplaintAction={handleComplaintAction}
      />

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <div className={sectionShell}>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">Notification Center</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Payment failures, low stock, procurement delays, suspicious activity, and risk alerts.</p>
              </div>
            </div>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="h-14 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
                ))}
              </div>
            ) : filteredAlerts.length ? (
              <>
                <NotificationTable
                  rows={pagedAlerts}
                  selectedIds={selectedAlertIds}
                  onToggleSelect={handleToggleSelect(setSelectedAlertIds)}
                  onSelectAllPage={handleSelectAll(setSelectedAlertIds)}
                  onOpen={setActiveAlert}
                  onQuickStatus={handleQuickStatusAlert}
                  onViewLinked={handleViewLinked}
                  onEscalate={(row) => handleAlertAction('escalate', row)}
                />
                <div className="mt-4">
                  <SafetyPagination
                    label="alerts"
                    currentPage={alertsMeta.safePage}
                    totalPages={alertsMeta.totalPages}
                    totalRows={sortedAlerts.length}
                    start={alertsMeta.start}
                    end={alertsMeta.end}
                    rowsPerPage={alertRowsPerPage}
                    onPageChange={setAlertPage}
                    onRowsPerPageChange={setAlertRowsPerPage}
                  />
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                No alerts match the current filters.
              </div>
            )}
          </div>

          <div className={sectionShell}>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">Complaints and Blocked Users</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Support issues, reported users, blocked accounts, and dispute handling workflows.</p>
              </div>
            </div>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="h-14 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
                ))}
              </div>
            ) : filteredComplaints.length ? (
              <>
                <ComplaintTable
                  rows={pagedComplaints}
                  selectedIds={selectedComplaintIds}
                  onToggleSelect={handleToggleSelect(setSelectedComplaintIds)}
                  onSelectAllPage={handleSelectAll(setSelectedComplaintIds)}
                  onOpen={setActiveComplaint}
                  onStatusAction={handleQuickStatusComplaint}
                  onBlockAction={handleComplaintBlock}
                />
                <div className="mt-4">
                  <SafetyPagination
                    label="complaints"
                    currentPage={complaintsMeta.safePage}
                    totalPages={complaintsMeta.totalPages}
                    totalRows={sortedComplaints.length}
                    start={complaintsMeta.start}
                    end={complaintsMeta.end}
                    rowsPerPage={complaintRowsPerPage}
                    onPageChange={setComplaintPage}
                    onRowsPerPageChange={setComplaintRowsPerPage}
                  />
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                No complaints match the current filters.
              </div>
            )}
          </div>
        </div>

        <SafetyActivityPanel rows={activity.slice(0, 12)} />
      </div>

      <AlertDetailsDrawer alert={activeAlert} onClose={() => setActiveAlert(null)} onAction={handleAlertAction} />
      <ComplaintDetailsDrawer complaint={activeComplaint} onClose={() => setActiveComplaint(null)} onAction={handleComplaintAction} />
      <BlockUserModal
        open={blockState.open}
        complaint={blockState.complaint}
        mode={blockState.mode}
        onClose={() => setBlockState({ open: false, complaint: null, mode: 'block' })}
        onConfirm={confirmBlockAction}
      />
      <ResolveComplaintModal
        open={resolveState.open}
        complaint={resolveState.complaint}
        onClose={() => setResolveState({ open: false, complaint: null })}
        onConfirm={confirmResolveComplaint}
      />

      {confirmState && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">{confirmState.title}</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{confirmState.message}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setConfirmState(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-700">Cancel</button>
              <button type="button" onClick={confirmState.onConfirm} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">Confirm</button>
            </div>
          </div>
        </div>
      )}

      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))} />
    </div>
  );
}
