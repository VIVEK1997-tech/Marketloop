import { useState } from 'react';
import StarRating from './StarRating.jsx';
import { api, getErrorMessage } from '../services/api.js';

const typeCopy = {
  product: {
    title: 'Rate this product',
    placeholder: 'How was the product quality and description accuracy?'
  },
  seller: {
    title: 'Rate this seller',
    placeholder: 'How was communication, trustworthiness, and response time?'
  }
};

export default function ReviewForm({ productId, reviewType, onSubmitted }) {
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const copy = typeCopy[reviewType];

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const { data } = await api.post('/reviews', { productId, reviewType, rating, reviewText });
      setReviewText('');
      setRating(5);
      onSubmitted?.(data.review, data.message);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-black text-slate-900">{copy.title}</h3>
          <p className="text-sm text-slate-500">Share honest feedback to help future buyers.</p>
        </div>
        <StarRating value={rating} onChange={setRating} size={22} />
      </div>
      <textarea
        className="input mt-4 min-h-28"
        placeholder={copy.placeholder}
        value={reviewText}
        onChange={(event) => setReviewText(event.target.value)}
      />
      {error && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button className="btn mt-4" disabled={saving || reviewText.trim().length < 3}>
        {saving ? 'Submitting...' : 'Submit review'}
      </button>
    </form>
  );
}
