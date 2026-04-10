import { useEffect, useState } from 'react';
import { BadgeCheck, Flag, ThumbsDown, ThumbsUp } from 'lucide-react';
import StarRating from './StarRating.jsx';
import { api } from '../services/api.js';
import { getProfileImage } from '../utils/avatar.js';

const formatDate = (value) => new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export default function ReviewList({ title, reviews = [], averageRating = 0, totalReviews = 0, breakdown = {}, sort, onSortChange }) {
  const [localReviews, setLocalReviews] = useState(reviews);

  useEffect(() => {
    setLocalReviews(reviews);
  }, [reviews]);

  const markHelpful = async (reviewId, helpful) => {
    const { data } = await api.patch(`/reviews/${reviewId}/helpful`, { helpful });
    setLocalReviews((current) => current.map((review) => (review._id === reviewId ? { ...review, ...data.review } : review)));
  };

  const report = async (reviewId) => {
    await api.post(`/reviews/${reviewId}/report`, { reason: 'Inappropriate review' });
  };

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="section-subtitle">Trust & feedback</p>
          <h2 className="section-title mt-2">{title}</h2>
          <div className="mt-3 flex items-center gap-3">
            <StarRating value={averageRating} readOnly size={20} />
            <span className="font-black text-slate-900">{Number(averageRating || 0).toFixed(1)}</span>
            <span className="text-sm text-slate-500">({totalReviews} reviews)</span>
          </div>
        </div>
        <select className="input w-fit" value={sort} onChange={(event) => onSortChange?.(event.target.value)}>
          <option value="latest">Latest</option>
          <option value="highest">Highest rating</option>
          <option value="lowest">Lowest rating</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      {!!totalReviews && (
        <div className="mb-5 grid gap-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = breakdown?.[rating] || 0;
            const width = totalReviews ? `${(count / totalReviews) * 100}%` : '0%';
            return (
              <div key={rating} className="grid grid-cols-[3rem_1fr_2rem] items-center gap-3 text-sm">
                <span>{rating}★</span>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-amber-400" style={{ width }} />
                </div>
                <span className="text-slate-500">{count}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="space-y-4">
        {localReviews.map((review) => (
          <article key={review._id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={getProfileImage(review.reviewer?.profileImage, review.reviewer?.name)}
                  alt={review.reviewer?.name || 'Reviewer'}
                  className="h-11 w-11 rounded-full object-cover"
                />
                <div>
                  <p className="font-black text-slate-900">{review.reviewer?.name || 'MarketLoop user'}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <StarRating value={review.rating} readOnly size={14} />
                    <span>{formatDate(review.createdAt)}</span>
                    {review.verifiedBuyer && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">
                        <BadgeCheck size={12} /> Verified buyer
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {review.product?.title && <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500">{review.product.title}</span>}
            </div>
            <p className="mt-3 leading-6 text-slate-700">{review.reviewText}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="btn-secondary px-3 py-2 text-xs" onClick={() => markHelpful(review._id, true)}>
                <ThumbsUp size={14} /> Helpful {review.helpfulBy?.length || 0}
              </button>
              <button className="btn-secondary px-3 py-2 text-xs" onClick={() => markHelpful(review._id, false)}>
                <ThumbsDown size={14} /> Not helpful {review.notHelpfulBy?.length || 0}
              </button>
              <button className="btn-secondary px-3 py-2 text-xs text-red-600" onClick={() => report(review._id)}>
                <Flag size={14} /> Report
              </button>
            </div>
          </article>
        ))}
        {!localReviews.length && <p className="rounded-2xl bg-slate-50 p-4 text-slate-500">No reviews yet.</p>}
      </div>
    </section>
  );
}
