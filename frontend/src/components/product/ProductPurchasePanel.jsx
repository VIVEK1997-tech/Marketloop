import { MapPin } from 'lucide-react';
import { formatLocation } from '../../utils/location.js';
import { formatCurrency, formatNormalizedPrice } from '../../utils/uom.js';
import QuantitySelector from '../QuantitySelector.jsx';
import ProductActions from './ProductActions.jsx';

export default function ProductPurchasePanel({
  product,
  originalPrice,
  discountPercent,
  quantity,
  onIncrease,
  onDecrease,
  onBuyNow,
  onAddToCart
}) {
  const locationLabel = formatLocation(product.location, 'Fresh local listing');

  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="space-y-4">
        <div className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-amber-700">
          {discountPercent}% off
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900">{product.title}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span>{product.category}</span>
            <span>&bull;</span>
            <span className="inline-flex items-center gap-1">
              <MapPin size={14} /> {locationLabel}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <p className="text-4xl font-black text-slate-900">{formatCurrency(product.price)}</p>
          <p className="pb-1 text-lg text-slate-400 line-through">{formatCurrency(originalPrice)}</p>
        </div>

        <div className="space-y-1">
          <p className="text-base font-semibold text-slate-700">{product.quantity || 1} {product.unit || 'Kg'}</p>
          <p className="text-sm font-semibold text-emerald-700">{formatNormalizedPrice(product)}</p>
          <p className="text-sm text-slate-500">Fresh stock available today. Delivery slots open for this area.</p>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-[1.25rem] bg-slate-50 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">Quantity</p>
            <p className="text-xs text-slate-500">Adjust before buying or adding to cart.</p>
          </div>
          <QuantitySelector quantity={quantity} onIncrease={onIncrease} onDecrease={onDecrease} />
        </div>

        <ProductActions onBuyNow={onBuyNow} onAddToCart={onAddToCart} />
      </div>
    </section>
  );
}
