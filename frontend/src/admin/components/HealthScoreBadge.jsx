export default function HealthScoreBadge({ score, band }) {
  const tone =
    band === 'Excellent'
      ? 'bg-emerald-50 text-emerald-700'
      : band === 'Good'
        ? 'bg-cyan-50 text-cyan-700'
        : band === 'Needs Review'
          ? 'bg-amber-50 text-amber-700'
          : 'bg-rose-50 text-rose-700';

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${tone}`}>{band} · {score}</span>;
}
