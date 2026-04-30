import { Heart, Home, Search, ShoppingCart, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const items = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/?section=categories', label: 'Categories', icon: Search },
  { to: '/wishlist', label: 'Wishlist', icon: Heart },
  { to: '/cart', label: 'Cart', icon: ShoppingCart },
  { to: '/dashboard', label: 'Profile', icon: User }
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 px-3 py-2 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-between gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.to || (item.to.startsWith('/?section=') && location.pathname === '/');
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-bold ${
                active ? 'bg-emerald-50 text-emerald-700' : 'text-slate-400'
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
