import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { BellRing, Clock3, Heart, LogIn, MapPin, MessageCircle, Search, Store, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { getProfileImage } from '../utils/avatar.js';
import Chatbot from './Chatbot.jsx';
const RECENT_SEARCHES_KEY = 'marketloop_recent_searches';

const getRecentSearches = () => {
  try {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveRecentSearch = (query) => {
  if (!query) return;
  const next = [query, ...getRecentSearches().filter((item) => item.toLowerCase() !== query.toLowerCase())].slice(0, 6);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
  return next;
};

const highlightMatch = (text, query) => {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'ig'));
  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={`${part}-${index}`} className="rounded bg-cyan-100 px-0.5 text-brand-700">
        {part}
      </mark>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    )
  );
};

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const searchWrapRef = useRef(null);
  const inputRef = useRef(null);
  const [headerSearch, setHeaderSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [wishlistCount, setWishlistCount] = useState(0);
  const userRoles = user?.roles || (user?.role ? [user.role] : []);
  const isSeller = userRoles.includes('seller') || userRoles.includes('admin');

  const trimmedSearch = headerSearch.trim();
  const showingRecent = !trimmedSearch;
  const dropdownItems = showingRecent ? recentSearches.map((label) => ({ type: 'recent', label })) : suggestions.map((product) => ({ type: 'product', product }));

  useEffect(() => {
    setRecentSearches(getRecentSearches());
    const params = new URLSearchParams(location.search);
    setHeaderSearch(params.get('q') || '');
  }, [location.search]);

  useEffect(() => {
    if (!user) {
      setWishlistCount(0);
      return;
    }

    api.get('/users/wishlist')
      .then(({ data }) => setWishlistCount(data.wishlist.length))
      .catch(() => setWishlistCount(0));
  }, [user, location.pathname]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [headerSearch, showSuggestions]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!searchWrapRef.current?.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    const query = headerSearch.trim();
    if (query.length < 2) {
      setSuggestions([]);
      if (!query) {
        setShowSuggestions(Boolean(recentSearches.length));
      }
      return;
    }

    const fetchTimer = setTimeout(async () => {
      try {
        const { data } = await api.get('/products', {
          params: { keyword: query, sort: 'latest' }
        });
        setSuggestions(data.products.slice(0, 6));
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    }, 180);

    return () => clearTimeout(fetchTimer);
  }, [headerSearch, recentSearches.length]);

  const runSearch = (query) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    params.set('searchAt', Date.now().toString());
    setRecentSearches(saveRecentSearch(query) || getRecentSearches());
    navigate(`/${params.toString() ? `?${params.toString()}` : ''}`);
    setShowSuggestions(false);
    setActiveIndex(-1);
  };

  const submitSearch = (event) => {
    event.preventDefault();
    const query = headerSearch.trim();
    runSearch(query);
  };

  const applySuggestion = (product) => {
    saveRecentSearch(product.title);
    setRecentSearches(getRecentSearches());
    setHeaderSearch(product.title);
    setShowSuggestions(false);
    setActiveIndex(-1);
    navigate(`/products/${product._id}`);
  };

  const applyRecentSearch = (query) => {
    setHeaderSearch(query);
    runSearch(query);
  };

  const handleKeyDown = (event) => {
    if (!showSuggestions || !dropdownItems.length) {
      if (event.key === 'ArrowDown' && (suggestions.length || recentSearches.length)) {
        setShowSuggestions(true);
        setActiveIndex(0);
        event.preventDefault();
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % dropdownItems.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => (current <= 0 ? dropdownItems.length - 1 : current - 1));
      return;
    }

    if (event.key === 'Escape') {
      setShowSuggestions(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
      return;
    }

    if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      const selected = dropdownItems[activeIndex];
      if (selected.type === 'recent') {
        applyRecentSearch(selected.label);
      } else {
        applySuggestion(selected.product);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs md:text-sm">
          <p className="font-medium text-slate-100">India's local marketplace for cars, mobiles, furniture, electronics, and more.</p>
          <div className="hidden items-center gap-5 text-slate-300 md:flex">
            <span className="inline-flex items-center gap-2"><BellRing size={14} /> Daily fresh listings</span>
            <span className="inline-flex items-center gap-2"><MessageCircle size={14} /> Real-time buyer seller chat</span>
          </div>
        </div>
      </div>
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <Link to="/" className="shrink-0 flex items-center gap-2 text-xl font-black text-brand-700">
            <Store /> MarketLoop
          </Link>
          <div className="hidden min-w-0 flex-1 items-center justify-center md:flex">
            <div ref={searchWrapRef} className="relative w-full max-w-[680px]">
              <form onSubmit={submitSearch} className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-400 transition focus-within:border-brand-400 focus-within:bg-white">
                <Search size={18} />
                <input
                  ref={inputRef}
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  placeholder="Search for cars, bikes, phones, furniture, jobs..."
                  value={headerSearch}
                  onFocus={() => setShowSuggestions(Boolean(trimmedSearch ? suggestions.length : recentSearches.length))}
                  onKeyDown={handleKeyDown}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setHeaderSearch(nextValue);
                    setShowSuggestions(Boolean(nextValue.trim() ? true : recentSearches.length));
                  }}
                />
                <button className="shrink-0 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700" type="submit">
                  Search
                </button>
              </form>
              {showSuggestions && (
                <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                  {showingRecent && !!recentSearches.length && (
                    <div className="border-b border-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Recent searches
                    </div>
                  )}
                  {!showingRecent && !!suggestions.length && (
                    <div className="border-b border-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Suggestions
                    </div>
                  )}
                  {dropdownItems.length ? (
                    dropdownItems.map((item, index) => (
                      item.type === 'recent' ? (
                        <button
                          key={`${item.type}-${item.label}`}
                          type="button"
                          onClick={() => applyRecentSearch(item.label)}
                          className={`flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 ${activeIndex === index ? 'bg-brand-50' : 'hover:bg-slate-50'}`}
                        >
                          <Clock3 size={16} className="text-slate-400" />
                          <span className="text-sm font-medium text-slate-700">{highlightMatch(item.label, trimmedSearch)}</span>
                        </button>
                      ) : (
                        <button
                          key={item.product._id}
                          type="button"
                          onClick={() => applySuggestion(item.product)}
                          className={`flex w-full items-start justify-between gap-4 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 ${activeIndex === index ? 'bg-brand-50' : 'hover:bg-slate-50'}`}
                        >
                          <div>
                            <p className="font-semibold text-slate-900">{highlightMatch(item.product.title, trimmedSearch)}</p>
                            <p className="mt-1 text-xs text-slate-500">{highlightMatch(item.product.category, trimmedSearch)}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="font-bold text-brand-700">₹{Number(item.product.price).toLocaleString('en-IN')}</p>
                            <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500"><MapPin size={12} /> {highlightMatch(item.product.location, trimmedSearch)}</p>
                          </div>
                        </button>
                      )
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-slate-500">No matching products found.</div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5">
            <Link
              className="relative inline-flex items-center gap-1 rounded-xl px-2 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 sm:gap-1.5 sm:px-2.5 sm:text-sm"
              to={user ? '/wishlist' : '/login'}
              aria-label="Open wishlist"
            >
              <Heart size={16} className="text-slate-700" />
              <span className="hidden sm:inline">Wishlist</span>
              {user && wishlistCount > 0 && (
                <span className="absolute left-4 top-0.5 inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>
            {!user && (
              <>
                <Link className="inline-flex items-center gap-1 rounded-xl px-2 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 sm:gap-1.5 sm:px-2.5 sm:text-sm" to="/login">
                  <LogIn size={16} />
                  <span className="hidden sm:inline">Login</span>
                </Link>
                <Link className="inline-flex items-center gap-1 rounded-xl border border-brand-200 bg-brand-50 px-2 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-100 sm:gap-1.5 sm:px-2.5 sm:text-sm" to="/register">
                  <UserPlus size={16} />
                  <span className="hidden sm:inline">Register</span>
                </Link>
              </>
            )}
            {user && (
              <>
                {isSeller && (
                  <Link className="inline-flex items-center gap-1 rounded-xl border border-brand-200 bg-brand-50 px-2 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-100 sm:gap-1.5 sm:px-2.5 sm:text-sm" to="/products/new">
                    <Store size={16} />
                    <span className="hidden sm:inline">Sell</span>
                  </Link>
                )}
                <Link className="inline-flex items-center gap-1 rounded-xl px-2 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 sm:gap-1.5 sm:px-2.5 sm:text-sm" to="/dashboard">
                  <img
                    src={getProfileImage(user?.profileImage, user?.name)}
                    alt={user?.name || 'Profile'}
                    className="h-5 w-5 rounded-full object-cover"
                  />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <button
                  className="inline-flex items-center gap-1 rounded-xl px-2 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 sm:gap-1.5 sm:px-2.5 sm:text-sm"
                  onClick={logout}
                >
                  <LogIn size={16} className="rotate-180" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
            {!user && (
              <Link className="inline-flex items-center gap-1 rounded-xl px-2 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 sm:gap-1.5 sm:px-2.5 sm:text-sm" to="/register">
                <Store size={16} />
                <span className="hidden sm:inline">Sell</span>
              </Link>
            )}
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
      <Chatbot />
    </div>
  );
}
