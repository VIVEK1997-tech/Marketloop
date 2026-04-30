const toneMap = {
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200',
  amber: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200',
  rose: 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200',
  cyan: 'border-cyan-200 bg-cyan-50 text-cyan-800 dark:border-cyan-900/60 dark:bg-cyan-950/30 dark:text-cyan-200',
  violet: 'border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900/60 dark:bg-violet-950/30 dark:text-violet-200'
};

export default function QualityStatsCards({ cards }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
      {cards.map((card) => (
        <div key={card.label} className={`rounded-[1.5rem] border p-4 shadow-sm ${toneMap[card.tone] || toneMap.cyan}`}>
          <p className="text-xs font-black uppercase tracking-[0.16em] opacity-80">{card.label}</p>
          <p className="mt-3 text-2xl font-black">{card.value}</p>
          <p className="mt-2 text-sm opacity-80">{card.helper}</p>
        </div>
      ))}
    </div>
  );
}

