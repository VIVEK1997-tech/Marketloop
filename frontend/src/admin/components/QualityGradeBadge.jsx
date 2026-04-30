export default function QualityGradeBadge({ value }) {
  const tone =
    value === 'Green'
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
      : value === 'Orange'
        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
        : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300';

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ${tone}`}>{value}</span>;
}

