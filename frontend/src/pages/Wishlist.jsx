import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard.jsx';
import { api } from '../services/api.js';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    api.get('/users/wishlist').then(({ data }) => setWishlist(data.wishlist));
  }, []);

  const removeWishlist = async (productId) => {
    await api.delete(`/users/wishlist/${productId}`);
    setWishlist((current) => current.filter((product) => product._id !== productId));
  };

  return (
    <div className="space-y-6">
      <section className="card">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">Buyer tools</p>
        <h1 className="mt-2 text-3xl font-black">Your wishlist</h1>
        <p className="mt-2 text-slate-500">Open your saved items directly from the header whenever you log back in.</p>
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
