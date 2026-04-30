import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Package, Sparkles, Store } from 'lucide-react';
import BottomNav from '../components/BottomNav.jsx';
import CategoryChips from '../components/CategoryChips.jsx';
import HomeHero from '../components/HomeHero.jsx';
import ProductCard from '../components/ProductCard.jsx';
import ProductSection from '../components/ProductSection.jsx';
import PromoBanner from '../components/PromoBanner.jsx';
import { homeCategoryChips, promoBanners } from '../data/products.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useProducts } from '../hooks/useProducts.js';
import { api, extractApiData } from '../services/api.js';
import { cartApi } from '../services/cartApi.js';
import { productApi } from '../services/productApi.js';
import { groceryCategories } from '../utils/groceryData.js';

const defaultFilters = { keyword: '', category: '', location: '', maxPrice: '', sort: 'latest' };

export default function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [filters, setFilters] = useState(defaultFilters);
  const [activeChip, setActiveChip] = useState('Fruits');
  const [wishlistIds, setWishlistIds] = useState([]);
  const [wishlistMessage, setWishlistMessage] = useState('');
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [liveCategories, setLiveCategories] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [cartCount, setCartCount] = useState(() => cartApi.getItems().reduce((sum, item) => sum + item.quantity, 0));
  const queryKeyword = searchParams.get('q') || '';
  const { products, loading, error } = useProducts(filters);

  useEffect(() => {
    setFilters((current) => ({
      ...current,
      keyword: queryKeyword,
      category: queryKeyword ? '' : current.category
    }));
  }, [queryKeyword]);

  useEffect(() => {
    const targetSection = searchParams.get('section');
    if (!targetSection) return;

    const timeout = window.setTimeout(() => {
      document.getElementById(`home-${targetSection}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);

    return () => window.clearTimeout(timeout);
  }, [searchParams]);

  useEffect(() => {
    api.get('/products', { params: { sort: 'latest' } })
      .then((response) => setCatalogProducts(extractApiData(response).products || []))
      .catch(() => setCatalogProducts([]));
  }, []);

  useEffect(() => {
    productApi.getCategories()
      .then((categories) => setLiveCategories(categories))
      .catch(() => setLiveCategories([]));
  }, []);

  useEffect(() => {
    const syncCartCount = (items = cartApi.getItems()) => {
      setCartCount(items.reduce((sum, item) => sum + item.quantity, 0));
    };

    const handleCartUpdated = (event) => syncCartCount(event.detail);
    window.addEventListener('marketloop:cart-updated', handleCartUpdated);
    return () => window.removeEventListener('marketloop:cart-updated', handleCartUpdated);
  }, []);

  useEffect(() => {
    if (!user) {
      setWishlistIds([]);
      setRecommendedProducts([]);
      return;
    }

    api.get('/wishlist')
      .then((response) => {
        const data = extractApiData(response);
        setWishlistIds((data.wishlist || []).map((product) => product._id));
      })
      .catch(() => setWishlistIds([]));

    api.get('/products/recommendations/for-you')
      .then((response) => {
        const data = extractApiData(response);
        setRecommendedProducts(data.recommendations || []);
      })
      .catch(() => setRecommendedProducts([]));
  }, [user]);

  const featuredProducts = useMemo(() => products.slice(0, 12), [products]);
  const bestDeals = useMemo(
    () => [...products].sort((a, b) => Number(a.price) - Number(b.price)).slice(0, 8),
    [products]
  );
  const quickReorder = useMemo(() => {
    const savedProducts = catalogProducts.filter((product) => wishlistIds.includes(product._id));
    if (savedProducts.length) return savedProducts.slice(0, 8);
    return catalogProducts.slice(0, 8);
  }, [catalogProducts, wishlistIds]);

  const categoryShowcase = useMemo(
    () => {
      const liveValues = new Set(liveCategories.map((category) => category.value));
      const preferred = groceryCategories.filter((category) => ['Fresh Fruits', 'Fresh Vegetables', 'Exotic Fruits', 'Leafy Greens'].includes(category.value));
      const liveMatches = groceryCategories.filter((category) => liveValues.has(category.value));
      return (liveMatches.length ? liveMatches : preferred).slice(0, 4);
    },
    [liveCategories]
  );

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const keyword = filters.keyword.trim();
    navigate(keyword ? `/?q=${encodeURIComponent(keyword)}` : '/');
  };

  const handleChipSelect = (chip) => {
    setActiveChip(chip.label);
    if (chip.type === 'category') {
      setFilters((current) => ({ ...current, keyword: '', category: chip.value, sort: 'latest' }));
      navigate('/');
      return;
    }

    setFilters((current) => ({ ...current, keyword: chip.value, category: '', sort: 'latest' }));
    navigate(`/?q=${encodeURIComponent(chip.value)}`);
  };

  const handleWishlist = async (id, currentlyWishlisted = wishlistIds.includes(id)) => {
    if (!user) {
      navigate('/login?role=buyer', { state: { redirectTo: '/' } });
      return;
    }

    try {
      if (currentlyWishlisted) {
        await api.delete(`/wishlist/${id}`);
        setWishlistIds((current) => current.filter((productId) => productId !== id));
        setWishlistMessage('Removed from wishlist');
      } else {
        await api.post('/wishlist', { productId: id });
        setWishlistIds((current) => (current.includes(id) ? current : [...current, id]));
        setWishlistMessage('Saved to wishlist');
      }
      window.setTimeout(() => setWishlistMessage(''), 2200);
    } catch {
      setWishlistMessage('Could not update wishlist. Please try again.');
    }
  };

  const handleAddToCart = (product) => {
    setWishlistMessage(`${product.title} added to cart`);
    window.setTimeout(() => setWishlistMessage(''), 2200);
  };

  const isWishlisted = (product) => wishlistIds.includes(product._id);

  return (
    <div className="space-y-6 pb-24 text-slate-900">
      <HomeHero
        user={user}
        searchValue={filters.keyword}
        onSearchChange={(event) => setFilters((current) => ({ ...current, keyword: event.target.value }))}
        onSearchSubmit={handleSearchSubmit}
        cartCount={cartCount}
      />

      <CategoryChips chips={homeCategoryChips} activeLabel={activeChip} onSelect={handleChipSelect} />

      <section className="overflow-x-auto pb-1">
        <div className="flex min-w-max gap-4">
          {promoBanners.map((banner, index) => (
            <PromoBanner
              key={banner.id}
              banner={banner}
              onClick={() => {
                if (index === 0) {
                  handleChipSelect(homeCategoryChips[0]);
                } else {
                  navigate('/wishlist');
                }
              }}
            />
          ))}
        </div>
      </section>

      {wishlistMessage && <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 shadow-sm">{wishlistMessage}</p>}
      {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 shadow-sm">{error}</p>}

      <section id="home-categories" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-emerald-700">MarketLoop picks</p>
            <h2 className="mt-1 text-2xl font-black text-slate-900">Browse by grocery aisle</h2>
          </div>
          <Link to="/" className="text-sm font-bold text-emerald-700">View all</Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {categoryShowcase.map((category) => (
            <button
              key={category.value}
              type="button"
              onClick={() => handleChipSelect({ label: category.label, type: 'category', value: category.value })}
              className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <img src={category.image} alt={category.label} className="h-28 w-full object-cover" />
              <div className="space-y-1 p-3">
                <p className="font-black text-slate-900">{category.label}</p>
                <p className="text-xs text-slate-500">{category.description}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <ProductSection
        title="Best deals today"
        subtitle="Offers worth grabbing fast"
        products={bestDeals}
        onWishlist={user ? handleWishlist : null}
        isWishlisted={isWishlisted}
        onAddToCart={handleAddToCart}
        emptyMessage="No deals are available right now."
      />

      <ProductSection
        title="Recommended for you"
        subtitle="Picked from your browsing and wishlist activity"
        products={recommendedProducts}
        onWishlist={user ? handleWishlist : null}
        isWishlisted={isWishlisted}
        onAddToCart={handleAddToCart}
        emptyMessage="Sign in and interact with products to get recommendations here."
      />

      <div id="home-reorder">
        <ProductSection
        title="Quick reorder"
        subtitle="Your saved and easy-repeat grocery items"
        products={quickReorder}
        onWishlist={user ? handleWishlist : null}
        isWishlisted={isWishlisted}
        onAddToCart={handleAddToCart}
        emptyMessage="Save a few products to see a quick reorder lane."
        />
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-emerald-700">Fresh arrivals</p>
            <h2 className="mt-1 text-2xl font-black text-slate-900">New on MarketLoop</h2>
          </div>
          <div className="rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-500 shadow-sm">
            {loading ? 'Loading...' : `${featuredProducts.length} items`}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-[320px] animate-pulse rounded-[1.75rem] bg-white shadow-sm" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onWishlist={user ? handleWishlist : null}
                isWishlisted={isWishlisted(product)}
                onAddToCart={handleAddToCart}
              />
            ))}
            {!featuredProducts.length && (
              <div className="col-span-full rounded-[1.5rem] border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
                No products match your current grocery search.
              </div>
            )}
          </div>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
            <Store size={14} /> Seller side
          </div>
          <h3 className="mt-4 text-2xl font-black text-slate-900">List your fresh stock where grocery buyers already browse</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Upload fruits, vegetables, dairy, and essentials with live pricing and real-time buyer chat.
          </p>
          <Link className="btn mt-5 bg-emerald-600 hover:bg-emerald-700" to={user ? '/products/new' : '/register'}>
            Start selling
          </Link>
        </div>

        <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-amber-700">
            <Package size={14} /> Orders & trust
          </div>
          <h3 className="mt-4 text-2xl font-black text-slate-900">Fast grocery checkout without mixing payment logic into browsing</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Product details, buying options, checkout, Razorpay, and order success stay cleanly separated while the home page stays focused on shopping.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-emerald-700">
            <Sparkles size={16} /> Production-style buyer flow preserved
          </div>
        </div>
      </section>

      <BottomNav />
    </div>
  );
}
