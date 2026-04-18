import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Clock3, Leaf, MapPin, ShieldCheck, Sparkles, Store } from 'lucide-react';
import Filters from '../components/Filters.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { useProducts } from '../hooks/useProducts.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { groceryBudgetOptions, groceryCategories } from '../utils/groceryData.js';

const platformStats = [
  { label: 'Fresh listings every day', value: '3K+' },
  { label: 'Cities served', value: '60+' },
  { label: 'Average reply time', value: '< 4 min' },
  { label: 'Trusted local sellers', value: '1.2K+' }
];

const promises = [
  { title: 'Freshness promise', text: 'Every listing highlights live availability, location, and seller responsiveness before you message.' },
  { title: 'Quick grocery discovery', text: 'Find fruits, vegetables, and herbs by category first, then narrow by price and city.' },
  { title: 'Real marketplace trust', text: 'Wishlist, reviews, chat, and verified sellers stay built into the grocery browsing flow.' }
];

export default function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [filters, setFilters] = useState({ keyword: '', category: '', location: '', maxPrice: '', sort: 'latest' });
  const [wishlistMessage, setWishlistMessage] = useState('');
  const [wishlistIds, setWishlistIds] = useState([]);
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [recommendationMeta, setRecommendationMeta] = useState(null);
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
    if (!user) {
      setWishlistIds([]);
      setRecommendedProducts([]);
      setRecommendationMeta(null);
      return;
    }

    api.get('/users/wishlist')
      .then(({ data }) => setWishlistIds(data.wishlist.map((product) => product._id)))
      .catch(() => setWishlistIds([]));

    api.get('/products/recommendations/for-you')
      .then(({ data }) => {
        setRecommendedProducts(data.recommendations || []);
        setRecommendationMeta(data.meta || null);
      })
      .catch(() => {
        setRecommendedProducts([]);
        setRecommendationMeta(null);
      });
  }, [user]);

  useEffect(() => {
    api.get('/products', { params: { sort: 'latest' } })
      .then(({ data }) => setCatalogProducts(data.products || []))
      .catch(() => setCatalogProducts([]));
  }, []);

  const categorySections = useMemo(
    () =>
      groceryCategories.map((category) => ({
        ...category,
        items: catalogProducts.filter((product) => product.category === category.value).slice(0, 4)
      })),
    [catalogProducts]
  );

  const spotlightCategory = useMemo(() => {
    if (filters.category) return groceryCategories.find((category) => category.value === filters.category) || groceryCategories[0];
    const firstWithProducts = categorySections.find((category) => category.items.length);
    return firstWithProducts || groceryCategories[0];
  }, [filters.category, categorySections]);

  const spotlightProducts = useMemo(
    () => products.filter((product) => product.category === spotlightCategory?.value).slice(0, 4),
    [products, spotlightCategory]
  );

  const featuredProducts = useMemo(() => products.slice(0, 8), [products]);
  const bestDeals = useMemo(() => [...products].sort((a, b) => Number(a.price) - Number(b.price)).slice(0, 4), [products]);
  const freshProducts = useMemo(
    () => [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 12),
    [products]
  );

  const resultTitle = queryKeyword || filters.category || 'Fresh produce';

  const chooseCategory = (category) => {
    setFilters((current) => ({ ...current, keyword: '', category, sort: 'latest' }));
    navigate('/', { replace: true });
  };

  const openCategoryProduct = (category) => {
    const categoryProduct = catalogProducts.find((product) => product.category === category.value);
    if (categoryProduct?._id) {
      navigate(`/products/${categoryProduct._id}`);
      return;
    }
    chooseCategory(category.value);
  };

  const applyBudget = (value) => {
    setFilters((current) => ({ ...current, maxPrice: value }));
  };

  const toggleWishlist = async (id, currentlyWishlisted = wishlistIds.includes(id)) => {
    if (!user) return;
    try {
      if (currentlyWishlisted) {
        await api.delete(`/users/wishlist/${id}`);
        setWishlistIds((current) => current.filter((productId) => productId !== id));
        setWishlistMessage('Product removed from wishlist');
      } else {
        await api.post(`/users/wishlist/${id}`);
        setWishlistIds((current) => (current.includes(id) ? current : [...current, id]));
        setWishlistMessage('Product saved to wishlist');
      }
      window.setTimeout(() => setWishlistMessage(''), 2200);
    } catch {
      setWishlistMessage('Could not update wishlist. Please try again.');
    }
  };

  return (
    <div className="space-y-8 text-slate-900 dark:text-slate-100">
      <section className="overflow-hidden rounded-[2rem] border border-amber-200 bg-gradient-to-r from-[#fff9d8] via-white to-[#effbef] shadow-sm dark:border-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 dark:shadow-none">
        <div className="grid gap-6 px-5 py-5 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
              <BadgeCheck size={16} /> Blinkit-style fresh marketplace experience
            </div>
            <div className="space-y-3">
              <h1 className="max-w-3xl text-3xl font-black tracking-tight text-slate-900 md:text-5xl">
                Fresh fruits and vegetables from trusted local sellers, all in one fast-moving marketplace.
              </h1>
              <p className="max-w-2xl text-base text-slate-600 md:text-lg">
                Browse produce-first categories, compare prices instantly, wishlist the best deals, and message sellers in real time before you buy.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link className="btn gap-2 bg-emerald-600 hover:bg-emerald-700" to={user ? '/products/new' : '/register'}>
                <Store size={18} /> Start selling fresh stock
              </Link>
              <button
                type="button"
                className="btn-secondary gap-2 border-amber-200 bg-white hover:bg-amber-50"
                onClick={() => chooseCategory('Fresh Fruits')}
              >
                Shop fruits <ArrowRight size={18} />
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {platformStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white bg-white/85 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{stat.value}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[1.75rem] border border-emerald-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Quick basket</p>
                  <h2 className="mt-2 text-2xl font-black text-slate-900">{spotlightCategory.label}</h2>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                  Live now
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-600">{spotlightCategory.description}</p>
              <img
                src={spotlightCategory.image}
                alt={spotlightCategory.label}
                className="mt-4 h-52 w-full rounded-[1.5rem] object-cover"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {promises.map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
                  <p className="font-bold text-slate-900 dark:text-slate-100">{item.title}</p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-x-auto rounded-[1.75rem] border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <div className="flex min-w-max items-center gap-3">
          <button
            type="button"
            onClick={() => chooseCategory('')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${!filters.category ? 'bg-emerald-600 text-white' : 'border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
          >
            All produce
          </button>
          {groceryCategories.map((category) => (
            <button
              key={category.value}
              type="button"
              onClick={() => chooseCategory(category.value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filters.category === category.value ? 'bg-emerald-600 text-white' : 'border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="section-subtitle !text-emerald-700">Shop by category</p>
            <h2 className="section-title mt-2">Colorful produce aisles with live images and real products</h2>
          </div>
          <p className="hidden text-sm text-slate-500 md:block">Each category updates products in place, without dragging you away from the home experience.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {groceryCategories.map((category) => {
            const active = filters.category === category.value;
            const count = catalogProducts.filter((product) => product.category === category.value).length;
            return (
              <button
                key={category.value}
                type="button"
                onClick={() => openCategoryProduct(category)}
                className={`overflow-hidden rounded-[1.75rem] border text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:shadow-none ${active ? 'border-emerald-300 ring-2 ring-emerald-200 dark:border-emerald-700 dark:ring-emerald-900' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}
              >
                <div className={`bg-gradient-to-br ${category.accent} p-4`}>
                  <img src={category.image} alt={category.label} className="h-40 w-full rounded-[1.4rem] object-cover" />
                </div>
                <div className="space-y-2 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-lg font-black text-slate-900">{category.label}</p>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">{count} items</span>
                  </div>
                  <p className="text-sm text-slate-500">{category.description}</p>
                  <p className="text-sm font-bold text-emerald-700">
                    {count ? 'Open first product' : 'No product yet - view category'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {!!spotlightProducts.length && (
        <section className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="section-subtitle !text-emerald-700">Trending aisle</p>
              <h2 className="section-title mt-2">{spotlightCategory.label} buyers are exploring right now</h2>
            </div>
            <button type="button" className="text-sm font-semibold text-emerald-700" onClick={() => chooseCategory(spotlightCategory.value)}>
              View all in {spotlightCategory.label}
            </button>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {spotlightProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onWishlist={user ? toggleWishlist : null}
                isWishlisted={wishlistIds.includes(product._id)}
              />
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
          <div className="mb-4">
            <p className="section-subtitle !text-emerald-700">Refine your basket</p>
            <h2 className="section-title mt-2">Search by produce type, city, and budget</h2>
          </div>
          <Filters filters={filters} setFilters={setFilters} showKeyword={false} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 lg:grid-cols-2">
          {groceryBudgetOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => applyBudget(String(option.value))}
              className={`rounded-[1.5rem] border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:shadow-none ${filters.maxPrice === String(option.value) ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}
            >
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">Budget pick</p>
              <p className="mt-2 text-xl font-black text-slate-900">{option.label}</p>
            </button>
          ))}
        </div>
      </section>

      {error && <p className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
      {wishlistMessage && <p className="rounded-xl bg-emerald-50 p-4 font-semibold text-emerald-700">{wishlistMessage}</p>}

      {!!recommendedProducts.length && (
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="section-subtitle flex items-center gap-2 !text-emerald-700">
                <Sparkles size={15} className="text-emerald-600" />
                AI recommendations
              </p>
              <h2 className="section-title mt-2">Picked for you based on produce you explored and saved</h2>
            </div>
            {recommendationMeta?.model && (
              <p className="hidden rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold uppercase tracking-[0.15em] text-emerald-700 md:block">
                {recommendationMeta.model}
              </p>
            )}
          </div>
          {recommendationMeta?.explanation && <p className="text-sm text-slate-500">{recommendationMeta.explanation}</p>}
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {recommendedProducts.map((product) => (
              <div key={product._id} className="space-y-3">
                <ProductCard
                  product={product}
                  onWishlist={user ? toggleWishlist : null}
                  isWishlisted={wishlistIds.includes(product._id)}
                />
                {!!product.recommendationReasons?.length && (
                  <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <p className="font-bold text-slate-900 dark:text-slate-100">Why this was recommended</p>
                    <p className="mt-1">{product.recommendationReasons.join(' | ')}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {!!featuredProducts.length && (
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="section-subtitle !text-emerald-700">Fresh arrivals</p>
              <h2 className="section-title mt-2">Just listed produce from sellers near you</h2>
            </div>
            <p className="hidden text-sm text-slate-500 md:block">Dense card layout inspired by quick-commerce product walls.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onWishlist={user ? toggleWishlist : null}
                isWishlisted={wishlistIds.includes(product._id)}
              />
            ))}
          </div>
        </section>
      )}

      {!!bestDeals.length && (
        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[2rem] bg-gradient-to-br from-emerald-700 via-emerald-600 to-lime-500 p-8 text-white shadow-sm dark:shadow-none">
            <p className="section-subtitle !text-emerald-100">Grow your seller profile</p>
            <h2 className="mt-2 text-3xl font-black md:text-4xl">List daily stock and turn your produce into repeat orders.</h2>
            <p className="mt-4 max-w-xl text-emerald-50">
              Post fruits, vegetables, herbs, and seasonal baskets with multiple photos, pricing, and city-based availability in minutes.
            </p>
            <Link className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold text-emerald-700 transition hover:bg-emerald-50" to={user ? '/products/new' : '/register'}>
              Create listing <ArrowRight size={18} />
            </Link>
          </div>
          <div className="space-y-4">
            <div>
              <p className="section-subtitle !text-emerald-700">Best budget deals</p>
              <h2 className="section-title mt-2">Easy-on-wallet listings shoppers can grab fast</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {bestDeals.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onWishlist={user ? toggleWishlist : null}
                  isWishlisted={wishlistIds.includes(product._id)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {loading ? (
        <p className="card">Loading produce listings...</p>
      ) : (
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
          <div className="border-b border-slate-200 bg-[#fafcf7] px-6 py-5 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Current discovery feed</p>
                <h2 className="mt-2 text-3xl font-black text-slate-900">{resultTitle}</h2>
              </div>
              <div className="rounded-2xl bg-white px-4 py-3 text-right shadow-sm dark:bg-slate-900 dark:shadow-none">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Matching listings</p>
                <p className="mt-1 text-2xl font-black text-slate-900">{products.length}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-0 xl:grid-cols-[280px_1fr]">
            <aside className="border-r border-slate-200 bg-white px-6 py-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-800">Categories</p>
                  <div className="mt-4 space-y-2">
                    <button type="button" onClick={() => chooseCategory('')} className="block text-left text-sm font-medium text-slate-600 transition hover:text-emerald-700">
                      All produce
                    </button>
                    {groceryCategories.map((category) => (
                      <button
                        key={category.value}
                        type="button"
                        onClick={() => chooseCategory(category.value)}
                        className="block text-left text-sm font-medium text-slate-600 transition hover:text-emerald-700"
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-800">Popular cities</p>
                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    {['Bengaluru', 'Delhi', 'Mumbai', 'Pune', 'Hyderabad'].map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => setFilters((current) => ({ ...current, location: city }))}
                        className="block text-left transition hover:text-emerald-700"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-800">Marketplace trust</p>
                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <div className="flex gap-3">
                      <ShieldCheck size={17} className="mt-0.5 text-emerald-600" />
                      <p>Only authenticated users can list produce and reply in chat.</p>
                    </div>
                    <div className="flex gap-3">
                      <Clock3 size={17} className="mt-0.5 text-emerald-600" />
                      <p>Fresh-arrival sorting keeps the newest local produce at the top.</p>
                    </div>
                    <div className="flex gap-3">
                      <Leaf size={17} className="mt-0.5 text-emerald-600" />
                      <p>Produce-first UI helps buyers compare fruits and vegetables faster.</p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <div className="bg-white px-6 py-6 dark:bg-slate-900">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="section-subtitle !text-emerald-700">Showing results for "{resultTitle}"</p>
                  <h2 className="mt-2 text-2xl font-black text-slate-900">Handpicked produce listings with Blinkit-inspired browsing</h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <MapPin size={15} /> Local grocery marketplace view
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {freshProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onWishlist={user ? toggleWishlist : null}
                    isWishlisted={wishlistIds.includes(product._id)}
                  />
                ))}
                {!products.length && <p className="card col-span-full">No produce listings match your filters yet.</p>}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
