const toneMap = {
  active: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  online: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  approved: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  verified: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  paid: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  successful: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  'partially refunded': 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  settlement_pending: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300',
  'settlement pending': 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300',
  gateway_timeout: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300',
  'gateway timeout': 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300',
  pending: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  deactivated: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  inactive: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  kyc_pending: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  orange: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300',
  suspended: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300',
  confirmed: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300',
  packed: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
  shipped: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  'out for delivery': 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300',
  delivered: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  cancelled: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  failed: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
  returned: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300',
  refunded: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  'on hold': 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  disputed: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
  assigned: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300',
  'in transit': 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  'failed attempt': 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300',
  'cod pending': 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  chargeback: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
  completed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  requested: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  locked: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
  idle: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  'pending verification': 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300',
  blacklisted: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
  blocked: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
  rejected: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
  danger: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
  unpaid: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
  open: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300',
  recent: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300',
  offline: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
};

export default function StatusBadge({ value }) {
  const normalized = String(value || '').toLowerCase();
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ${toneMap[normalized] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
      {value}
    </span>
  );
}
