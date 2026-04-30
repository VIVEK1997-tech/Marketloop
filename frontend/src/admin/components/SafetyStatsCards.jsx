export default function SafetyStatsCards({ cards }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
          <p className="mt-3 text-3xl font-black text-slate-900 dark:text-slate-100">{card.value}</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{card.helper}</p>
        </div>
      ))}
    </div>
  );
}
