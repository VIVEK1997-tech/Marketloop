import { MapPin } from 'lucide-react';
import { formatLocation } from '../utils/location.js';
import { formatNormalizedPrice, formatPriceUnit } from '../utils/uom.js';

const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;

export default function ProductInfoCard({ product, originalPrice, discountPercent }) {
  const locationLabel = formatLocation(product.location, 'Local listing');

  return (
    <article className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="space-y-3">
        <div className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-amber-700">
          {discountPercent}% off
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100">{product.title}</h1>
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <span>{product.category}</span>
          <span>&bull;</span>
          <span className="inline-flex items-center gap-1">
            <MapPin size={14} /> {locationLabel}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-4xl font-black text-slate-900 dark:text-slate-100">{formatPriceUnit(product)}</p>
          <p className="text-xl text-slate-400 line-through dark:text-slate-500">{formatCurrency(originalPrice)}</p>
        </div>
        <p className="text-base text-slate-500 dark:text-slate-400">{product.quantity || 1} {product.unit || 'Kg'}</p>
        {product.unit && (
          <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">{formatNormalizedPrice(product)}</p>
        )}
        <p className="text-lg leading-8 text-slate-600 dark:text-slate-300">{product.description}</p>
      </div>
    </article>
  );
}
