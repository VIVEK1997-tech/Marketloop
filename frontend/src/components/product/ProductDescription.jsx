import { useMemo, useState } from 'react';

export default function ProductDescription({ description }) {
  const [expanded, setExpanded] = useState(false);

  const preview = useMemo(() => {
    if (!description) return 'Fresh grocery listing from a MarketLoop seller.';
    if (description.length <= 180) return description;
    return `${description.slice(0, 180).trim()}...`;
  }, [description]);

  const showToggle = (description || '').length > 180;

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black text-slate-900">About this product</h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        {expanded ? description : preview}
      </p>
      {showToggle && (
        <button
          type="button"
          className="mt-3 text-sm font-bold text-emerald-700"
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? 'Read less' : 'Read more'}
        </button>
      )}
    </section>
  );
}
