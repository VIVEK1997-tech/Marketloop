import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { getProductDiscountPercent, getProductOriginalPrice, getSellerPill, resolveProductImage } from '../data/products.js';
import { cartApi } from '../services/cartApi.js';
import { formatLocation } from '../utils/location.js';
import { formatCurrency, formatNormalizedPrice } from '../utils/uom.js';

export default function ProductCard({
  product,
  onWishlist,
  isWishlisted = false,
  onAddToCart,
  compact = false
}) {
  const image = resolveProductImage(product);
  const fallbackImage = resolveProductImage({ category: product.category });
  const productId = product?._id || product?.id;
  const productUrl = productId ? `/product/${productId}` : '';
  const originalPrice = getProductOriginalPrice(product);
  const discountPercent = getProductDiscountPercent(product);
  const sellerPill = getSellerPill(product);
  const unitLabel = product.unit || '1 pack';
  const locationLabel = formatLocation(product.location, 'Nearby seller');

  const handleWishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (productId) onWishlist?.(productId, isWishlisted);
  };

  const handleAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();
    cartApi.addItem(product, 1);
    onAddToCart?.(product);
  };

  return (
    <article
      className={`group relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:shadow-none ${
        compact ? 'min-h-[320px]' : ''
      }`}
    >
      <Link
        to={productUrl || '#'}
        className="block cursor-pointer"
        aria-label={`Open details for ${product.title}`}
        onClick={(event) => {
          if (!productUrl) event.preventDefault();
        }}
      >
        <div className="relative overflow-hidden bg-gradient-to-b from-[#f6f8f3] via-white to-white px-4 pt-4 dark:from-slate-900 dark:to-slate-900">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-700 shadow-sm">
              {discountPercent}% OFF
            </span>
            {onWishlist && (
              <button
                type="button"
                className={`z-10 rounded-full border bg-white p-2 shadow-sm transition dark:bg-slate-800 ${isWishlisted ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900 dark:bg-rose-950' : 'border-slate-200 text-slate-400 hover:border-rose-200 hover:text-rose-500 dark:border-slate-700 dark:text-slate-400'}`}
                onClick={handleWishlist}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>
          <img
            src={image}
            alt={product.title}
            onError={(event) => {
              event.currentTarget.src = fallbackImage;
            }}
            className="h-40 w-full rounded-[1.4rem] bg-[#f7f8fa] object-cover p-2 transition duration-300 group-hover:scale-[1.03]"
          />
        </div>

        <div className="space-y-3 px-4 pb-4 pt-3">
          <div className="min-w-0">
            <p className="line-clamp-2 text-base font-extrabold text-slate-900 transition group-hover:text-emerald-700 dark:text-slate-100 dark:group-hover:text-emerald-300">
              {product.title}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">{unitLabel}</p>
          </div>

          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{formatCurrency(product.price)}</p>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-400 line-through">{formatCurrency(originalPrice)}</p>
                <p className="text-xs font-bold text-emerald-700">{formatNormalizedPrice(product)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
            >
              ADD
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
            <span className="truncate rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold dark:bg-slate-800 dark:text-slate-300">
              {sellerPill}
            </span>
            <span className="text-xs font-medium text-slate-400">{locationLabel}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
