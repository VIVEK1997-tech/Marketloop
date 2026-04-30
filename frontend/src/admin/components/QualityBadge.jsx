export default function QualityBadge({ value }) {
  const tone =
    value === 'Premium' || value === 'Fresh'
      ? 'bg-emerald-50 text-emerald-700'
      : value === 'Standard'
        ? 'bg-cyan-50 text-cyan-700'
        : value === 'Average'
          ? 'bg-amber-50 text-amber-700'
          : 'bg-rose-50 text-rose-700';

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${tone}`}>{value}</span>;
}
