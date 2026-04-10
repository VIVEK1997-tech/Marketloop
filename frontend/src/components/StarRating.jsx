import { Star } from 'lucide-react';

export default function StarRating({ value = 0, onChange, size = 18, readOnly = false }) {
  const roundedValue = Math.round(Number(value || 0));

  return (
    <div className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= roundedValue;
        const classes = active ? 'text-amber-400' : 'text-slate-300';

        if (readOnly) {
          return <Star key={star} size={size} className={classes} fill={active ? 'currentColor' : 'none'} />;
        }

        return (
          <button key={star} type="button" onClick={() => onChange?.(star)} className="transition hover:scale-110" aria-label={`${star} star rating`}>
            <Star size={size} className={classes} fill={active ? 'currentColor' : 'none'} />
          </button>
        );
      })}
    </div>
  );
}
