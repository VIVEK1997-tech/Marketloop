const defaultHighlights = [
  { label: 'Farm fresh', tone: 'bg-emerald-50 text-emerald-700' },
  { label: 'Quality checked', tone: 'bg-sky-50 text-sky-700' },
  { label: 'Fast delivery', tone: 'bg-amber-50 text-amber-700' }
];

export default function ProductHighlights({ highlights = defaultHighlights }) {
  return (
    <section className="flex flex-wrap gap-3">
      {highlights.map((highlight) => (
        <span
          key={highlight.label}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${highlight.tone}`}
        >
          {highlight.label}
        </span>
      ))}
    </section>
  );
}
