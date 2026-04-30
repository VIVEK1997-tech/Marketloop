import { Heart, MapPin, MessageCircle, ShieldCheck, Star } from 'lucide-react';
import { getProfileImage } from '../../utils/avatar.js';
import { formatLocation } from '../../utils/location.js';

export default function SellerCompactCard({
  seller,
  isWishlisted,
  onMessageSeller,
  onSaveItem,
  message
}) {
  const sellerName = seller?.name || 'MarketLoop seller';
  const sellerCity = formatLocation(seller?.city || seller?.location, 'Local seller');

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <img
            src={getProfileImage(seller?.profileImage, sellerName)}
            alt={sellerName}
            className="h-14 w-14 rounded-full border border-slate-200 object-cover"
          />
          <div>
            <p className="text-lg font-black text-slate-900">{sellerName}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-sm text-slate-500">
              <MapPin size={14} /> {sellerCity}
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
          {seller?.rating ? <Star size={13} /> : <ShieldCheck size={13} />}
          {seller?.rating ? `${Number(seller.rating).toFixed(1)} rated` : 'Trusted seller'}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" className="btn-secondary" onClick={onMessageSeller}>
          <MessageCircle size={18} /> Message seller
        </button>
        <button
          type="button"
          className={`btn-secondary ${isWishlisted ? 'border-rose-200 bg-rose-50 text-rose-600' : ''}`}
          onClick={onSaveItem}
        >
          <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} /> {isWishlisted ? 'Saved' : 'Save item'}
        </button>
      </div>

      {message && <p className="mt-3 text-sm font-semibold text-emerald-700">{message}</p>}
    </section>
  );
}
