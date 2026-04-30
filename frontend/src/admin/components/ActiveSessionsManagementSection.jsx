import { useEffect, useMemo, useState } from 'react';
import { Download, FileArchive, RefreshCcw, ShieldAlert } from 'lucide-react';
import { downloadCsv, downloadZip } from '../exportUtils.js';
import BuyerSummaryCards from './BuyerSummaryCards.jsx';
import ToastStack from './ToastStack.jsx';
import ActiveSessionFilters from './ActiveSessionFilters.jsx';
import ActiveSessionBulkActions from './ActiveSessionBulkActions.jsx';
import ActiveSessionTable from './ActiveSessionTable.jsx';
import AuditLogTable from './AuditLogTable.jsx';
import ActiveUserDrawer from './ActiveUserDrawer.jsx';
import { generateMockActiveUsers, generateMockAuditLogs } from '../active/mockActiveUsers.js';
import { filterActiveUsers, filterAuditLogs, formatAdminDate, getPaginationMeta, paginateRows, rowsPerPageOptions, sortActiveUsers } from '../active/activeUtils.js';

const initialFilters = {
  search: '',
  role: 'all',
  state: 'all',
  sessionType: 'all',
  device: 'all',
  kyc: 'all',
  watchlist: 'all',
  suspicious: 'all',
  online: 'all',
  risk: 'all',
  auditSearch: '',
  entityType: 'all',
  fieldName: 'all',
  updaterType: 'all',
  dateFrom: '',
  dateTo: ''
};

const topActions = [
  { key: 'generate', label: 'Generate Active Sessions', icon: RefreshCcw, tone: 'primary' },
  { key: 'csv', label: 'Download CSV', icon: Download },
  { key: 'zip', label: 'Download ZIP', icon: FileArchive },
  { key: 'suspicious', label: 'Export Suspicious Report', icon: ShieldAlert }
];

export default function ActiveSessionsManagementSection() {
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [sortBy, setSortBy] = useState('lastSeen');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [activeUser, setActiveUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const seededUsers = generateMockActiveUsers(1000);
      setUsers(seededUsers);
      setAuditLogs(generateMockAuditLogs(seededUsers));
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const pushToast = (title, message, tone = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, title, message, tone }]);
    setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3500);
  };

  const filteredUsers = useMemo(() => filterActiveUsers(users, filters), [users, filters]);
  const sortedUsers = useMemo(() => sortActiveUsers(filteredUsers, sortBy, sortDirection), [filteredUsers, sortBy, sortDirection]);
  const pagedUsers = useMemo(() => paginateRows(sortedUsers, currentPage, rowsPerPage), [sortedUsers, currentPage, rowsPerPage]);
  const { start, end, totalPages } = useMemo(() => getPaginationMeta(sortedUsers.length, currentPage, rowsPerPage), [sortedUsers.length, currentPage, rowsPerPage]);
  const filteredLogs = useMemo(() => filterAuditLogs(auditLogs, filters), [auditLogs, filters]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.search, filters.role, filters.state, filters.sessionType, filters.device, filters.kyc, filters.watchlist, filters.suspicious, filters.online, filters.risk, sortBy, sortDirection, rowsPerPage]);

  const deviceOptions = useMemo(() => [...new Set(users.map((user) => user.device))].sort(), [users]);
  const fieldOptions = useMemo(() => [...new Set(auditLogs.map((log) => log.field))].sort(), [auditLogs]);

  const metrics = useMemo(() => {
    const online = users.filter((user) => user.state === 'Online').length;
    const suspicious = users.filter((user) => user.suspicious).length;
    const watchlisted = users.filter((user) => user.watchlisted).length;
    const locked = users.filter((user) => user.state === 'Locked' || user.state === 'Suspended').length;
    const highRisk = users.filter((user) => user.riskBand === 'high_risk').length;
    const activeSessions = users.reduce((sum, user) => sum + user.sessionCount, 0);
    return [
      { label: 'Total Users', value: users.length.toLocaleString('en-IN'), helper: 'Users visible to session monitoring' },
      { label: 'Active Sessions', value: activeSessions.toLocaleString('en-IN'), helper: 'Concurrent sessions across web and mobile' },
      { label: 'Online Now', value: online.toLocaleString('en-IN'), helper: 'Currently active user accounts' },
      { label: 'Suspicious Accounts', value: suspicious.toLocaleString('en-IN'), helper: 'Flagged for security review' },
      { label: 'Watchlist Users', value: watchlisted.toLocaleString('en-IN'), helper: 'Manual review watchlist entries' },
      { label: 'Needs Review Queue', value: `${highRisk} / ${locked}`, helper: 'High-risk and locked/suspended accounts' }
    ];
  }, [users]);

  const updateUsers = (predicate, updater) => {
    setUsers((current) => current.map((user) => (predicate(user) ? updater(user) : user)));
  };

  const handleUserAction = (action, user) => {
    const patch =
      action === 'logout_current' ? { sessionCount: Math.max(0, user.sessionCount - 1) } :
      action === 'logout_all' ? { sessionCount: 0, state: 'Offline' } :
      action === 'suspend' ? { state: 'Suspended' } :
      action === 'reactivate' ? { state: 'Online' } :
      action === 'lock_review' ? { state: 'Locked', suspicious: true, watchlisted: true } :
      action === 'warn' ? {} :
      action === 'watchlist' ? { watchlisted: !user.watchlisted } :
      action === 'suspicious' ? { suspicious: true, riskBand: 'high_risk', riskScore: Math.max(user.riskScore, 82) } :
      action === 'reset_password' ? { unusualReset: true, riskScore: Math.min(97, user.riskScore + 8) } :
      null;

    if (patch) {
      updateUsers((item) => item.id === user.id, (item) => ({ ...item, ...patch }));
    }

    pushToast('Admin action completed', `${user.name}: ${action.replace(/_/g, ' ')} applied.`);
  };

  const handleBulkAction = (action) => {
    const ids = [...selectedIds];
    if (!ids.length) return;
    if (action === 'export') {
      downloadCsv('selected-active-users', users.filter((user) => selectedIds.has(user.id)));
      pushToast('Export ready', `${ids.length} selected users exported.`);
      return;
    }

    updateUsers(
      (user) => selectedIds.has(user.id),
      (user) => ({
        ...user,
        state: action === 'revoke_sessions' ? 'Offline' : action === 'suspend' ? 'Suspended' : user.state,
        sessionCount: action === 'revoke_sessions' ? 0 : user.sessionCount,
        watchlisted: action === 'watchlist' ? true : user.watchlisted,
        suspicious: action === 'warn' ? true : user.suspicious
      })
    );
    pushToast('Bulk action completed', `${ids.length} users updated with ${action.replace(/_/g, ' ')}.`);
  };

  const handleTopAction = (key) => {
    if (key === 'generate') {
      setLoading(true);
      setTimeout(() => {
        const seededUsers = generateMockActiveUsers(1000);
        setUsers(seededUsers);
        setAuditLogs(generateMockAuditLogs(seededUsers));
        setLoading(false);
        pushToast('Active sessions regenerated', 'Fresh seeded users and audit logs are ready.');
      }, 300);
      return;
    }
    if (key === 'csv') {
      downloadCsv('active-session-records', sortedUsers);
      pushToast('CSV downloaded', 'Filtered active session records exported.');
      return;
    }
    if (key === 'zip') {
      downloadZip(
        'active-sessions',
        sortedUsers.slice(0, 50).map((user) => ({
          name: user.id,
          extension: 'txt',
          content: JSON.stringify(user, null, 2)
        }))
      );
      pushToast('ZIP downloaded', 'Session report bundle generated.');
      return;
    }
    downloadCsv('suspicious-user-report', sortedUsers.filter((user) => user.suspicious || user.riskBand === 'high_risk'));
    pushToast('Suspicious report exported', 'High-risk and suspicious users exported.');
  };

  const toggleSelect = (userId) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
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

  const pageNumbers = useMemo(() => {
    const pages = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    for (let page = startPage; page <= endPage; page += 1) pages.push(page);
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="space-y-6">
      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))} />
      <BuyerSummaryCards metrics={metrics} />

      <div className="flex flex-wrap items-center gap-3">
        {topActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.key}
              type="button"
              onClick={() => handleTopAction(action.key)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                action.tone === 'primary'
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Icon size={16} />
              {action.label}
            </button>
          );
        })}
      </div>

      <ActiveSessionFilters filters={filters} deviceOptions={deviceOptions} onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))} onReset={() => setFilters(initialFilters)} />
      <ActiveSessionBulkActions selectedCount={selectedIds.size} onAction={handleBulkAction} />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-4">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Active sessions</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{loading ? 'Loading session records...' : `Showing ${start}-${end} of ${sortedUsers.length.toLocaleString('en-IN')} active session records`}</p>
              </div>
              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                Search, monitor, revoke, suspend, and review risky sessions
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
          ) : (
            <>
              <ActiveSessionTable
                rows={pagedUsers}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                onToggleSelectPage={toggleSelectPage}
                onOpenUser={setActiveUser}
                onCellAction={(type, user) => {
                  setActiveUser(user);
                  pushToast('Session detail opened', `${user.name} · ${type}`);
                }}
                onQuickAction={handleUserAction}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSort={(column) => {
                  if (sortBy === column) {
                    setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
                    return;
                  }
                  setSortBy(column);
                  setSortDirection(column === 'name' || column === 'role' || column === 'status' ? 'asc' : 'desc');
                }}
              />

              <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm text-slate-500 dark:text-slate-400">Showing {start}-{end} of {sortedUsers.length.toLocaleString('en-IN')} active session records</p>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                    Rows per page
                    <select className="rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" value={rowsPerPage} onChange={(event) => setRowsPerPage(Number(event.target.value))}>
                      {rowsPerPageOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </label>
                  <div className="flex items-center gap-2">
                    <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold disabled:opacity-40 dark:border-slate-700">Previous</button>
                    {pageNumbers.map((page) => (
                      <button key={page} type="button" onClick={() => setCurrentPage(page)} className={`rounded-xl px-3 py-2 text-sm font-semibold ${page === currentPage ? 'bg-emerald-600 text-white' : 'border border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200'}`}>
                        {page}
                      </button>
                    ))}
                    <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold disabled:opacity-40 dark:border-slate-700">Next</button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Profile audit logs</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Track entity changes and drill into updater history.</p>
              </div>
              <button type="button" className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                Search, filter, and trace profile edits
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <input value={filters.auditSearch} onChange={(event) => setFilters((current) => ({ ...current, auditSearch: event.target.value }))} placeholder="Search audit logs" className="w-full rounded-2xl border border-slate-200 px-3 py-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-900" />
              <div className="grid gap-3 md:grid-cols-2">
                <select className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={filters.entityType} onChange={(event) => setFilters((current) => ({ ...current, entityType: event.target.value }))}>
                  <option value="all">All entity types</option>
                  {['Buyer', 'Seller', 'Admin', 'Support'].map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
                <select className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={filters.fieldName} onChange={(event) => setFilters((current) => ({ ...current, fieldName: event.target.value }))}>
                  <option value="all">All fields</option>
                  {fieldOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
                <select className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={filters.updaterType} onChange={(event) => setFilters((current) => ({ ...current, updaterType: event.target.value }))}>
                  <option value="all">All updater types</option>
                  <option value="admin">admin</option>
                  <option value="support">support</option>
                  <option value="system">system</option>
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" value={filters.dateFrom} onChange={(event) => setFilters((current) => ({ ...current, dateFrom: event.target.value }))} className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
                  <input type="date" value={filters.dateTo} onChange={(event) => setFilters((current) => ({ ...current, dateTo: event.target.value }))} className="rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
                </div>
              </div>
            </div>
          </div>

          <AuditLogTable
            rows={filteredLogs.slice(0, 120)}
            onEntityClick={(log) => {
              const linked = users.find((user) => user.id === log.linkedUserId);
              if (linked) setActiveUser(linked);
              pushToast('Audit entity opened', `${log.entity} audit history opened.`);
            }}
            onFieldClick={(field) => {
              setFilters((current) => ({ ...current, fieldName: field }));
              pushToast('Audit logs filtered', `Showing logs for field "${field}".`);
            }}
            onActorClick={(actor) => {
              setFilters((current) => ({ ...current, auditSearch: actor }));
              pushToast('Updater history opened', `Audit logs filtered for "${actor}".`);
            }}
          />
        </div>
      </div>

      <ActiveUserDrawer user={activeUser} open={Boolean(activeUser)} onClose={() => setActiveUser(null)} onAction={handleUserAction} />
    </div>
  );
}
