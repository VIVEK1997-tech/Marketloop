export default function VendorTrustBadge({ value }) {
  const tone =
    value === 'Trusted'
      ? 'bg-emerald-50 text-emerald-700'
      : value === 'Watchlist'
        ? 'bg-rose-50 text-rose-700'
        : 'bg-slate-100 text-slate-700';

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${tone}`}>{value}</span>;
}
