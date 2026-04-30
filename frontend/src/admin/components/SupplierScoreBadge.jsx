export default function SupplierScoreBadge({ score, band }) {
  const tone =
    score >= 85 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' :
    score >= 70 ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300' :
    score >= 55 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' :
    'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300';

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ${tone}`}>
      {band} · {score}
    </span>
  );
}

