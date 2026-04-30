export default function OverviewStatCard({ card, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(card.key)}
      aria-label={`Open ${card.label} details`}
      className="rounded-[1.5rem] border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-900"
    >
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
      <p className="mt-3 text-3xl font-black text-slate-900 dark:text-slate-100">{card.value}</p>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Click to inspect records and quick actions.</p>
    </button>
  );
}
