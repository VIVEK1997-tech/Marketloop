import { Bell, KeyRound, LogOut, ShieldAlert, ShieldCheck, UserCheck, X } from 'lucide-react';
import { formatAdminDate } from '../active/activeUtils.js';

const actions = [
  ['profile', 'View full user profile', UserCheck],
  ['sessions', 'View active sessions', LogOut],
  ['logout_current', 'Force logout current session', LogOut],
  ['logout_all', 'Force logout from all devices', LogOut],
  ['suspend', 'Temporarily suspend account', ShieldAlert],
  ['reactivate', 'Reactivate account', ShieldCheck],
  ['lock_review', 'Lock account for review', ShieldAlert],
  ['reset_password', 'Reset password trigger', KeyRound],
  ['warn', 'Send warning / notification', Bell],
  ['suspicious', 'Mark suspicious activity', ShieldAlert],
  ['orders', 'View recent orders', UserCheck],
  ['kyc', 'View KYC status', UserCheck],
  ['complaints', 'View complaints / disputes', UserCheck],
  ['note', 'Add internal admin note', UserCheck],
  ['watchlist', 'Toggle watchlist', ShieldCheck]
];

export default function ActiveUserDrawer({ user, open, onClose, onAction }) {
  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-slate-950/40">
      <div className="h-full w-full max-w-4xl overflow-y-auto bg-white shadow-2xl dark:bg-slate-950">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5 dark:border-slate-800 dark:bg-slate-950">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">User session profile</p>
            <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-100">{user.name}</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{user.id} · {user.role} · {user.email}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              ['State', user.state],
              ['KYC', user.kycStatus],
              ['Active sessions', user.sessionCount],
              ['Risk score', `${user.riskScore} (${user.riskBand.replace('_', ' ')})`],
              ['Last login', formatAdminDate(user.loginTime, true)],
              ['Last activity', formatAdminDate(user.lastSeen, true)],
              ['Failed logins', user.failedLoginAttempts],
              ['Watchlist', user.watchlisted ? 'Yes' : 'No']
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
                <p className="mt-2 text-base font-black text-slate-900 dark:text-slate-100">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <div className="rounded-[1.5rem] border border-slate-200 p-5 dark:border-slate-800">
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">User details</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {[
                    ['Phone', user.phone],
                    ['Linked profile', user.linkedProfileRef],
                    ['Primary device', user.device],
                    ['Primary IP', user.ip],
                    ['Location', user.location],
                    ['Platform', `${user.platform} · ${user.browser}`],
                    ['OS', user.os],
                    ['Notes count', user.notesCount]
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Security flags</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {user.securityFlags.length ? user.securityFlags.map((flag) => (
                      <span key={flag} className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">{flag}</span>
                    )) : <span className="text-sm text-slate-500">No active flags.</span>}
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 p-5 dark:border-slate-800">
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Device and session list</h3>
                <div className="mt-4 space-y-3">
                  {user.sessions.map((session) => (
                    <div key={session.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-black text-slate-900 dark:text-slate-100">{session.device}</p>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{session.platform} · {session.browser} · {session.os}</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          session.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : session.status === 'Suspicious'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-slate-100 text-slate-700'
                        }`}>
                          {session.status}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <p className="text-sm text-slate-600 dark:text-slate-300">IP: {session.ip}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">Location: {session.location}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">Login: {formatAdminDate(session.loginTime, true)}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">Last active: {formatAdminDate(session.lastActive, true)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[1.5rem] border border-slate-200 p-5 dark:border-slate-800">
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Admin actions</h3>
                <div className="mt-4 grid gap-2">
                  {actions.map(([key, label, Icon]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => onAction(key, user)}
                      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                        key === 'suspend' || key === 'lock_review' || key === 'suspicious'
                          ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900'
                      }`}
                    >
                      <Icon size={16} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 p-5 dark:border-slate-800">
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Login history</h3>
                <div className="mt-4 space-y-4">
                  {user.loginHistory.map((entry) => (
                    <div key={entry.id} className="border-l-2 border-cyan-200 pl-4">
                      <p className="text-sm text-slate-700 dark:text-slate-200">{entry.outcome} · {entry.location}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-400">{entry.ip} · {formatAdminDate(entry.timestamp, true)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 p-5 dark:border-slate-800">
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Recent actions & notes</h3>
                <div className="mt-4 space-y-4">
                  {[...user.recentActions, ...user.internalNotes].slice(0, 6).map((entry) => (
                    <div key={entry.id} className="border-l-2 border-slate-200 pl-4 dark:border-slate-700">
                      <p className="text-sm text-slate-700 dark:text-slate-200">{entry.label}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-400">{entry.actor} · {formatAdminDate(entry.createdAt, true)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
