import { ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react';
import StatusBadge from './StatusBadge.jsx';
import { formatAdminDate } from '../active/activeUtils.js';

function SortButton({ active, direction, label, onClick }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1 font-black uppercase tracking-[0.14em] text-slate-400">
      {label}
      {active ? (direction === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />) : null}
    </button>
  );
}

function QuickMenu({ user, onAction }) {
  const actions = [
    ['profile', 'View full profile'],
    ['logout_current', 'Force logout current session'],
    ['logout_all', 'Force logout all devices'],
    ['suspend', 'Temporarily suspend'],
    ['reactivate', 'Reactivate account'],
    ['lock_review', 'Lock for review'],
    ['warn', 'Send warning'],
    ['watchlist', user.watchlisted ? 'Remove from watchlist' : 'Add to watchlist']
  ];

  return (
    <details className="relative" onClick={(event) => event.stopPropagation()}>
      <summary className="flex cursor-pointer list-none items-center justify-center rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
        <MoreHorizontal size={18} />
      </summary>
      <div className="absolute right-0 z-10 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-950">
        {actions.map(([key, label]) => (
          <button key={key} type="button" onClick={() => onAction(key, user)} className="flex w-full rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900">
            {label}
          </button>
        ))}
      </div>
    </details>
  );
}

export default function ActiveSessionTable({
  rows,
  selectedIds,
  onToggleSelect,
  onToggleSelectPage,
  onOpenUser,
  onCellAction,
  onQuickAction,
  sortBy,
  sortDirection,
  onSort
}) {
  const allOnPageSelected = rows.length > 0 && rows.every((row) => selectedIds.has(row.id));

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="max-h-[720px] overflow-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
          <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-950">
            <tr>
              <th className="px-4 py-3">
                <input type="checkbox" checked={allOnPageSelected} onChange={() => onToggleSelectPage(rows)} />
              </th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">User</th>
              <th className="px-4 py-3 text-left"><SortButton label="Role" active={sortBy === 'role'} direction={sortDirection} onClick={() => onSort('role')} /></th>
              <th className="px-4 py-3 text-left"><SortButton label="State" active={sortBy === 'status'} direction={sortDirection} onClick={() => onSort('status')} /></th>
              <th className="px-4 py-3 text-left"><SortButton label="Last Seen" active={sortBy === 'lastSeen'} direction={sortDirection} onClick={() => onSort('lastSeen')} /></th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Device</th>
              <th className="px-4 py-3 text-left"><SortButton label="Session Count" active={sortBy === 'sessionCount'} direction={sortDirection} onClick={() => onSort('sessionCount')} /></th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">Risk</th>
              <th className="px-4 py-3 text-right font-black uppercase tracking-[0.14em] text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((user) => (
              <tr key={user.id} className={`cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-950/50 ${user.riskBand === 'high_risk' ? 'bg-rose-50/40 dark:bg-rose-950/10' : ''}`} onClick={() => onOpenUser(user)}>
                <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}>
                  <input type="checkbox" checked={selectedIds.has(user.id)} onChange={() => onToggleSelect(user.id)} />
                </td>
                <td className="px-4 py-4">
                  <button type="button" onClick={(event) => { event.stopPropagation(); onOpenUser(user); }} className="font-black text-brand-700 hover:underline">
                    {user.name}
                  </button>
                  <p className="mt-1 text-xs text-slate-500">{user.id} · {user.email}</p>
                </td>
                <td className="px-4 py-4">
                  <button type="button" onClick={(event) => { event.stopPropagation(); onCellAction('role', user); }} className="font-semibold text-brand-700 hover:underline">
                    {user.role}
                  </button>
                </td>
                <td className="px-4 py-4">
                  <button type="button" onClick={(event) => { event.stopPropagation(); onCellAction('state', user); }}>
                    <StatusBadge value={user.state} />
                  </button>
                </td>
                <td className="px-4 py-4">
                  <button type="button" onClick={(event) => { event.stopPropagation(); onCellAction('history', user); }} className="text-left text-slate-600 hover:text-brand-700 dark:text-slate-300">
                    {formatAdminDate(user.lastSeen, true)}
                  </button>
                </td>
                <td className="px-4 py-4">
                  <button type="button" onClick={(event) => { event.stopPropagation(); onCellAction('device', user); }} className="text-left text-slate-600 hover:text-brand-700 dark:text-slate-300">
                    <p>{user.device}</p>
                    <p className="mt-1 text-xs text-slate-500">{user.platform} · {user.browser}</p>
                  </button>
                </td>
                <td className="px-4 py-4 font-semibold">{user.sessionCount}</td>
                <td className="px-4 py-4">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                    user.riskBand === 'high_risk'
                      ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                      : user.riskBand === 'medium_risk'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                  }`}>
                    {user.riskBand.replace('_', ' ')} · {user.riskScore}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <QuickMenu user={user} onAction={onQuickAction} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
