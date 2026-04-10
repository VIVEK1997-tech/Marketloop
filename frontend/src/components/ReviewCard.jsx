import { BadgeCheck, Star } from 'lucide-react';
import { getProfileImage } from '../utils/avatar.js';

const formatDate = (value) => new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export default function ReviewCard({ review }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <img
          src={getProfileImage(review.reviewer?.profileImage, review.reviewer?.name)}
          alt={review.reviewer?.name || 'Reviewer'}
          className="h-12 w-12 rounded-full object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-black text-slate-900">{review.reviewer?.name || 'MarketLoop user'}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1 font-semibold text-amber-500">
                  <Star size={13} fill="currentColor" /> {review.rating}
                </span>
                <span>{formatDate(review.createdAt)}</span>
                {review.verifiedBuyer && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">
                    <BadgeCheck size={12} /> Verified buyer
                  </span>
                )}
              </div>
            </div>
            {review.product?.title && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">{review.product.title}</span>}
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">{review.reviewText}</p>
        </div>
      </div>
    </article>
  );
}
