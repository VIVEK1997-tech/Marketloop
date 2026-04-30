import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard.jsx';
import { api, extractApiData, getErrorMessage } from '../services/api.js';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/wishlist')
      .then((response) => setWishlist(extractApiData(response).wishlist || []))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const removeWishlist = async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      setWishlist((current) => current.filter((product) => product._id !== productId));
      setMessage('Product removed from wishlist');
      setError('');
      window.setTimeout(() => setMessage(''), 2200);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) return <p className="card">Loading your wishlist...</p>;

  return (
    <div className="space-y-6">
      <section className="card">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">Buyer tools</p>
        <h1 className="mt-2 text-3xl font-black">Your wishlist</h1>
        <p className="mt-2 text-slate-500">Open your saved items directly from the header whenever you log back in.</p>
        {message && <p className="mt-4 rounded-xl bg-emerald-50 p-3 font-semibold text-emerald-700">{message}</p>}
        {error && <p className="mt-4 rounded-xl bg-red-50 p-3 font-semibold text-red-700">{error}</p>}
      </section>

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {wishlist.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            onWishlist={removeWishlist}
            isWishlisted
          />
        ))}
        {!wishlist.length && <p className="card col-span-full">No saved items yet. Start saving products from listings and details pages.</p>}
      </section>
    </div>
  );
}
