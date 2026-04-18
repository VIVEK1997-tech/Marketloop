import { Link, useNavigate } from 'react-router-dom';
import { Heart, MapPin } from 'lucide-react';
import { groceryCategoryMap } from '../utils/groceryData.js';

export default function ProductCard({ product, onWishlist, isWishlisted = false }) {
  const navigate = useNavigate();
  const categoryData = groceryCategoryMap[product.category];
  const image =
    product.images?.[0] ||
    categoryData?.image ||
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80';
  const productUrl = `/products/${product._id}`;

  const openDetails = () => {
    if (product?._id) navigate(productUrl);
  };

  const handleWishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onWishlist?.(product._id, isWishlisted);
  };

  return (
    <article
      className="cursor-pointer overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:shadow-none"
      onClick={openDetails}
      role="link"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openDetails();
        }
      }}
      aria-label={`Open details for ${product.title}`}
    >
      <div className="relative overflow-hidden bg-gradient-to-b from-[#fffde7] to-white px-4 pt-4 dark:from-slate-900 dark:to-slate-900">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700 shadow-sm dark:bg-slate-800 dark:text-emerald-300">
            {product.category}
          </span>
          {onWishlist && (
            <button
              type="button"
              className={`rounded-full border bg-white p-2 shadow-sm transition dark:bg-slate-800 ${isWishlisted ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900 dark:bg-rose-950' : 'border-slate-200 text-slate-400 hover:border-rose-200 hover:text-rose-500 dark:border-slate-700 dark:text-slate-400'}`}
              onClick={handleWishlist}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>
        <Link to={productUrl} className="block" onClick={(event) => event.stopPropagation()}>
          <img
            src={image}
            alt={product.title}
            className="h-44 w-full rounded-[1.4rem] object-cover transition duration-300 hover:scale-[1.03]"
          />
        </Link>
      </div>

      <div className="space-y-3 px-4 pb-4 pt-3">
        <div className="min-w-0">
          <Link to={productUrl} onClick={(event) => event.stopPropagation()} className="line-clamp-2 text-base font-extrabold text-slate-900 transition hover:text-emerald-700 dark:text-slate-100 dark:hover:text-emerald-300">
            {product.title}
          </Link>
          <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{product.description}</p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Starting at</p>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100">Rs. {Number(product.price).toLocaleString('en-IN')}</p>
          </div>
          <Link
            to={productUrl}
            onClick={(event) => event.stopPropagation()}
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900/70"
          >
            View
          </Link>
        </div>

        <div className="flex items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
          <span className="truncate rounded-full bg-slate-100 px-3 py-1 font-medium dark:bg-slate-800 dark:text-slate-300">
            {product.status === 'sold' ? 'Sold out' : 'Fresh today'}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1">
            <MapPin size={14} /> {product.location}
          </span>
        </div>
      </div>
    </article>
  );
}
