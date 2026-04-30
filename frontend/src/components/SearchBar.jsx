import { Search, ShoppingBag } from 'lucide-react';

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search for groceries...',
  cartCount = 0
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="flex items-center gap-3 rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3 shadow-sm"
    >
      <Search size={18} className="text-slate-400" />
      <input
        value={value}
        onChange={onChange}
        className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
        placeholder={placeholder}
      />
      <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
        <ShoppingBag size={14} />
        {cartCount} in cart
      </div>
    </form>
  );
}
