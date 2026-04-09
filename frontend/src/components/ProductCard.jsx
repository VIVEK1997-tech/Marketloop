import { Link } from 'react-router-dom';
import { Heart, MapPin } from 'lucide-react';

export default function ProductCard({ product, onWishlist, isWishlisted = false }) {
  const image = product.images?.[0] || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80';

  return (
    <article className="card overflow-hidden p-0">
      <Link to={`/products/${product._id}`}>
        <img src={image} alt={product.title} className="h-48 w-full object-cover" />
      </Link>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-2xl font-black">₹{Number(product.price).toLocaleString('en-IN')}</p>
            <Link to={`/products/${product._id}`} className="font-semibold hover:text-brand-700">{product.title}</Link>
          </div>
          {onWishlist && (
            <button
              className={`rounded-full border p-2 transition ${isWishlisted ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-slate-200 text-slate-400 hover:border-rose-200 hover:text-rose-500'}`}
              onClick={() => onWishlist(product._id)}
              aria-label="Add to wishlist"
            >
              <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>
        <p className="line-clamp-2 text-sm text-slate-500">{product.description}</p>
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span className="rounded-full bg-slate-100 px-3 py-1">{product.category}</span>
          <span className="flex items-center gap-1"><MapPin size={14} /> {product.location}</span>
        </div>
      </div>
    </article>
  );
}
