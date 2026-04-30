import { ArrowRight } from 'lucide-react';

export default function PromoBanner({ banner, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-[280px] flex-1 rounded-[1.75rem] bg-gradient-to-br ${banner.tone} p-5 text-left text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
    >
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/80">{banner.eyebrow}</p>
      <h3 className="mt-3 text-2xl font-black leading-tight">{banner.title}</h3>
      <p className="mt-3 text-sm leading-6 text-white/85">{banner.body}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold">
        {banner.cta} <ArrowRight size={16} />
      </span>
    </button>
  );
}
