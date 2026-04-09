import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Car, ChevronDown, CircleDollarSign, LayoutGrid, MapPin, ShieldCheck, Smartphone, Sofa, Store, Tv, Zap } from 'lucide-react';
import Filters from '../components/Filters.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { useProducts } from '../hooks/useProducts.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const categoryHighlights = [
  { label: 'Cars', value: 'Cars', icon: Car, tone: 'from-sky-500 to-blue-700' },
  { label: 'Mobiles', value: 'Mobiles', icon: Smartphone, tone: 'from-emerald-500 to-green-700' },
  { label: 'Furniture', value: 'Furniture', icon: Sofa, tone: 'from-amber-400 to-orange-600' },
  { label: 'Electronics', value: 'Electronics', icon: Zap, tone: 'from-violet-500 to-fuchsia-700' }
];

const categoryStrip = [
  { label: 'All Categories', value: '' },
  { label: 'Cars', value: 'Cars' },
  { label: 'Motorcycles', value: 'Motorcycles' },
  { label: 'Mobile Phones', value: 'Mobiles' },
  { label: 'For Sale: Houses & Apartments', value: 'Houses' },
  { label: 'Furniture', value: 'Furniture' },
  { label: 'TVs, Video - Audio', value: 'Electronics' }
];

const sidebarSections = [
  { title: 'Categories', values: ['All Categories', 'Furniture', 'Electronics', 'Cars', 'Mobiles'] },
  { title: 'Locations', values: ['India', 'Delhi', 'Mumbai', 'Bengaluru', 'Pune'] },
  { title: 'Budget', values: ['Under ₹5,000', '₹5,000 - ₹20,000', '₹20,000 - ₹50,000', 'Above ₹50,000'] }
];

const platformStats = [
  { label: 'Active listings', value: '20K+' },
  { label: 'Buyer-seller chats', value: '8K+' },
  { label: 'Cities covered', value: '120+' },
  { label: 'Avg. response time', value: '< 5 min' }
];

export default function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const resultsRef = useRef(null);
  const [filters, setFilters] = useState({ keyword: '', category: '', location: '', maxPrice: '', sort: 'latest' });
  const [wishlistMessage, setWishlistMessage] = useState('');
  const [wishlistIds, setWishlistIds] = useState([]);
  const { products, loading, error } = useProducts(filters);
  const featuredProducts = useMemo(() => products.slice(0, 4), [products]);
  const topPreviewProducts = useMemo(() => products.slice(0, 3), [products]);
  const freshProducts = useMemo(() => [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8), [products]);
  const trustedProducts = useMemo(() => [...products].sort((a, b) => (b.views + b.interestCount) - (a.views + a.interestCount)).slice(0, 4), [products]);
  const queryKeyword = searchParams.get('q') || '';
  const resultTitle = queryKeyword || filters.category || 'Latest products';

  useEffect(() => {
    setFilters((current) => ({
      ...current,
      keyword: queryKeyword,
      category: queryKeyword ? '' : current.category
    }));

  }, [queryKeyword]);

  useEffect(() => {
    if (!user) {
      setWishlistIds([]);
      return;
    }

    api.get('/users/wishlist')
      .then(({ data }) => setWishlistIds(data.wishlist.map((product) => product._id)))
      .catch(() => setWishlistIds([]));
  }, [user]);

  const chooseCategory = (category) => {
    setFilters((current) => ({ ...current, keyword: '', category, sort: 'latest' }));
    navigate('/', { replace: true });
  };

  const addWishlist = async (id) => {
    if (!user) return;
    try {
      await api.post(`/users/wishlist/${id}`);
      setWishlistIds((current) => (current.includes(id) ? current : [...current, id]));
      setWishlistMessage('Product saved to wishlist');
    } catch {
      setWishlistMessage('Could not save product. Please try again.');
    }
  };

  return (
    <div className="space-y-8">
      <section className="overflow-x-auto rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex min-w-max items-center gap-3">
          {categoryStrip.map((item, index) => (
            <button
              key={item.label}
              onClick={() => chooseCategory(item.value)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                (item.value === '' && !filters.category) || filters.category === item.value
                  ? 'bg-brand-600 text-white'
                  : index === 0
                    ? 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {index === 0 && <span className="mr-2 inline-block align-middle"><LayoutGrid size={15} /></span>}
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {!loading && (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="section-subtitle">Browse By Category</p>
              <h2 className="section-title mt-2">
                {filters.category ? `${filters.category} picks from live listings` : 'Quick picks from live listings'}
              </h2>
            </div>
            <p className="text-sm text-slate-500">Click any category to update the products right here without leaving the section.</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
            <div className="grid gap-3">
              {categoryHighlights.map((category) => {
                const Icon = category.icon;
                const active = filters.category === category.value;
                return (
                  <button
                    key={category.value}
                    onClick={() => chooseCategory(category.value)}
                    className={`rounded-2xl border p-4 text-left transition ${active ? 'border-brand-500 bg-brand-50' : 'border-slate-200 bg-slate-50 hover:border-brand-300 hover:bg-white'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`rounded-2xl bg-gradient-to-r ${category.tone} p-3 text-white shadow-sm`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="font-black text-slate-900">{category.label}</p>
                        <p className="text-sm text-slate-500">See active listings</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {topPreviewProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onWishlist={user ? addWishlist : null}
                  isWishlisted={wishlistIds.includes(product._id)}
                />
              ))}
              {!topPreviewProducts.length && (
                <div className="card md:col-span-3">
                  No live products found for this category yet.
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="overflow-hidden rounded-[2rem] border border-cyan-100 bg-gradient-to-r from-cyan-50 via-white to-sky-50 text-slate-900 shadow-sm">
        <div className="grid gap-6 px-6 py-6 md:grid-cols-[1.15fr_0.85fr] md:px-8 md:py-8">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-brand-700">
              <BadgeCheck size={16} /> Trusted local buying and selling
            </div>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-3xl font-black leading-tight md:text-5xl">Buy anything near you. Sell everything you no longer use.</h1>
              <p className="max-w-2xl text-base text-slate-600 md:text-lg">
                Discover verified local deals, message sellers instantly, compare listings by price and location, and move fast on the best products in your city.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link className="btn gap-2" to={user ? '/products/new' : '/register'}><Store size={18} /> Start selling</Link>
              <button className="btn-secondary gap-2" onClick={() => window.scrollTo({ top: 620, behavior: 'smooth' })}>
                Explore deals <ArrowRight size={18} />
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {platformStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                  <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                  <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4">
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-5">
              <p className="section-subtitle">Why buyers stay</p>
              <div className="mt-4 space-y-4">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-1 text-brand-600" />
                  <div>
                    <p className="font-bold">Safe local discovery</p>
                    <p className="text-sm text-slate-600">Browse by category, location, and price ceiling before you ever message a seller.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CircleDollarSign className="mt-1 text-brand-600" />
                  <div>
                    <p className="font-bold">Transparent pricing</p>
                    <p className="text-sm text-slate-600">Compare similar items quickly and save the best ones to your wishlist.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <MapPin className="mt-1 text-brand-600" />
                  <div>
                    <p className="font-bold">Nearby-first experience</p>
                    <p className="text-sm text-slate-600">Find deals in your locality first, then expand your search only when needed.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-cyan-100 bg-gradient-to-r from-white to-cyan-50 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">Hot categories</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {categoryHighlights.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.value}
                      className={`rounded-2xl border border-white bg-white p-4 text-left transition hover:scale-[1.02] hover:shadow-sm ${filters.category === category.value ? 'ring-2 ring-brand-400' : ''}`}
                      onClick={() => chooseCategory(category.value)}
                    >
                      <div className={`inline-flex rounded-2xl bg-gradient-to-r ${category.tone} p-3 text-white`}>
                        <Icon />
                      </div>
                      <p className="mt-4 text-lg font-black text-slate-900">{category.label}</p>
                      <p className="text-sm text-slate-500">Browse fresh local listings</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card space-y-4">
          <div>
            <p className="section-subtitle">Refine results</p>
            <h2 className="section-title mt-2">Narrow listings by category, city, price, and sort order</h2>
          </div>
          <Filters filters={filters} setFilters={setFilters} showKeyword={false} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <div className="card bg-sky-50">
            <p className="font-black text-sky-900">Smart local discovery</p>
            <p className="mt-2 text-sm text-sky-800">Use category, price, and city filters the way buyers actually shop in real marketplaces.</p>
          </div>
          <div className="card bg-emerald-50">
            <p className="font-black text-emerald-900">Chat before you travel</p>
            <p className="mt-2 text-sm text-emerald-800">Message sellers instantly and confirm availability before meeting.</p>
          </div>
          <div className="card bg-amber-50">
            <p className="font-black text-amber-900">Post in minutes</p>
            <p className="mt-2 text-sm text-amber-800">Sellers can upload images, edit listings, mark sold, and track interest from the dashboard.</p>
          </div>
        </div>
      </section>

      {error && <p className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
      {wishlistMessage && <p className="rounded-xl bg-brand-50 p-4 font-semibold text-brand-700">{wishlistMessage}</p>}
      {!loading && !!featuredProducts.length && (
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="section-subtitle">Featured today</p>
              <h2 className="section-title mt-2">Popular picks buyers are exploring right now</h2>
            </div>
            <p className="hidden text-sm text-slate-500 md:block">Freshly merchandised like a real marketplace landing page.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onWishlist={user ? addWishlist : null}
                isWishlisted={wishlistIds.includes(product._id)}
              />
            ))}
          </div>
        </section>
      )}

      {!loading && !!trustedProducts.length && (
        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-brand-700 p-8 text-white">
            <p className="section-subtitle !text-cyan-100">Sell faster</p>
            <h2 className="mt-2 text-3xl font-black md:text-4xl">Turn unused products into money with one listing.</h2>
            <p className="mt-4 max-w-xl text-slate-200">Post eye-catching photos, respond in real time, and manage all your listings from one seller dashboard.</p>
            <Link className="btn mt-6 gap-2" to={user ? '/products/new' : '/register'}>
              Create listing <ArrowRight size={18} />
            </Link>
          </div>
          <div className="space-y-4">
            <div>
              <p className="section-subtitle">Trending with buyers</p>
              <h2 className="section-title mt-2">Listings getting the most attention</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {trustedProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onWishlist={user ? addWishlist : null}
                  isWishlisted={wishlistIds.includes(product._id)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {loading ? (
        <p className="card">Loading products...</p>
      ) : (
        <>
          <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <p className="text-sm text-slate-500">Home</p>
                  <span className="text-slate-300">/</span>
                  <p className="font-semibold text-slate-700">{resultTitle}</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span>{products.length} Ads</span>
                  <span className="inline-flex items-center gap-1 font-semibold">Sort by: Date Published <ChevronDown size={16} /></span>
                </div>
              </div>
            </div>
            <div className="border-b border-slate-100 px-6 py-6">
              <div className="rounded-3xl bg-gradient-to-r from-sky-100 via-cyan-50 to-white p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">Featured marketplace collection</p>
                    <h2 className="mt-2 text-3xl font-black text-slate-900">Browse {resultTitle} deals across India</h2>
                    <p className="mt-2 max-w-2xl text-sm text-slate-600">Compare prices, shortlist favorites, and message sellers instantly just like a real-world classifieds marketplace.</p>
                  </div>
                  <div className="rounded-2xl bg-white px-5 py-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Showing results for</p>
                    <p className="mt-1 text-xl font-black text-brand-700">{resultTitle}</p>
                  </div>
                </div>
              </div>
            </div>
            <div ref={resultsRef} className="grid gap-0 lg:grid-cols-[280px_1fr]">
              <aside className="border-r border-slate-200 bg-white px-6 py-6">
                <h2 className="text-3xl font-black text-slate-900">{resultTitle} in India</h2>
                <div className="mt-6 space-y-8">
                  {sidebarSections.map((section) => (
                    <div key={section.title} className="border-b border-slate-100 pb-6">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-sm font-black uppercase tracking-[0.12em] text-slate-800">{section.title}</h3>
                        <ChevronDown size={16} className="text-slate-400" />
                      </div>
                      <div className="space-y-3">
                        {section.values.map((value) => (
                          <button
                            key={value}
                            onClick={() => section.title === 'Categories' && chooseCategory(value === 'All Categories' ? '' : value)}
                            className="block text-left text-sm font-medium text-slate-600 transition hover:text-brand-700"
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </aside>
              <div className="bg-white px-6 py-6">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="section-subtitle">Showing results for "{resultTitle}"</p>
                    <h2 className="mt-2 text-2xl font-black text-slate-900">Explore matching listings</h2>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Tv size={16} />
                    <span>Local marketplace style catalog view</span>
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {freshProducts.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      onWishlist={user ? addWishlist : null}
                      isWishlisted={wishlistIds.includes(product._id)}
                    />
                  ))}
                  {!products.length && <p className="card col-span-full">No products match your search yet.</p>}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="section-subtitle">Why MarketLoop feels real</p>
                <h2 className="section-title mt-2">Everything buyers and sellers expect from a serious marketplace</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="font-black text-slate-900">Real-time chat</p>
                  <p className="mt-2 text-sm text-slate-600">Talk instantly with sellers and get quick responses before you travel.</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="font-black text-slate-900">Saved favorites</p>
                  <p className="mt-2 text-sm text-slate-600">Shortlist products and revisit them later when you are ready to buy.</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="font-black text-slate-900">Seller dashboard</p>
                  <p className="mt-2 text-sm text-slate-600">Track views, interest, and sold status without leaving your account.</p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
