import { Clock3, MapPin, Sparkles } from 'lucide-react';
import SearchBar from './SearchBar.jsx';

export default function HomeHero({
  user,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  cartCount
}) {
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <section className="rounded-[2rem] bg-gradient-to-br from-emerald-600 via-emerald-500 to-lime-400 px-5 py-5 text-white shadow-sm">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-emerald-50">Delivery in 10-20 mins</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">Good morning, {firstName}</h1>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-2 backdrop-blur">
                <MapPin size={13} /> Delivering to Delhi NCR
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-2 backdrop-blur">
                <Clock3 size={13} /> Fast fresh-stock updates
              </span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] backdrop-blur">
            <Sparkles size={13} /> MarketLoop
          </span>
        </div>

        <div className="rounded-[1.8rem] bg-white/12 p-1.5 backdrop-blur-sm">
          <SearchBar
            value={searchValue}
            onChange={onSearchChange}
            onSubmit={onSearchSubmit}
            cartCount={cartCount}
          />
        </div>
      </div>
    </section>
  );
}
