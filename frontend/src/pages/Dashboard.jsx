import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

export default function Dashboard() {
  const { user } = useAuth();
  const [sellerProducts, setSellerProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '', profileImage: user?.profileImage || '' });

  useEffect(() => {
    api.get('/users/wishlist').then(({ data }) => setWishlist(data.wishlist));
    api.get('/chats/conversations').then(({ data }) => setConversations(data.conversations));
    if (user?.role === 'seller' || user?.role === 'admin') {
      api.get('/products/seller/me').then(({ data }) => setSellerProducts(data.products));
    }
  }, [user?.role]);

  const saveProfile = async (event) => {
    event.preventDefault();
    await api.put('/users/profile', profile);
  };

  const markSold = async (id) => {
    const { data } = await api.patch(`/products/${id}/sold`);
    setSellerProducts((current) => current.map((product) => (product._id === id ? data.product : product)));
  };

  const deleteListing = async (id) => {
    await api.delete(`/products/${id}`);
    setSellerProducts((current) => current.filter((product) => product._id !== id));
  };

  return (
    <div className="space-y-6">
      <section className="card flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">{user?.role} dashboard</p>
          <h1 className="text-3xl font-black">Hi, {user?.name}</h1>
        </div>
        <Link className="btn" to="/products/new">Post a product</Link>
      </section>
      <form onSubmit={saveProfile} className="card grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto]">
        <input className="input" placeholder="Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
        <input className="input" placeholder="Phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
        <input className="input" placeholder="Profile image URL" value={profile.profileImage} onChange={(e) => setProfile({ ...profile, profileImage: e.target.value })} />
        <button className="btn">Save profile</button>
      </form>
      {(user?.role === 'seller' || user?.role === 'admin') && (
        <section className="space-y-3">
          <h2 className="text-2xl font-black">Your listings</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {sellerProducts.map((product) => (
              <div key={product._id} className="space-y-2">
                <ProductCard product={product} />
                <div className="grid grid-cols-3 gap-2">
                  <Link className="btn-secondary py-2" to={`/products/${product._id}/edit`}>Edit</Link>
                  <button className="btn-secondary py-2" onClick={() => markSold(product._id)}>Sold</button>
                  <button className="btn-secondary py-2 text-red-600" onClick={() => deleteListing(product._id)}>Delete</button>
                </div>
                <p className="text-sm text-slate-500">Views: {product.views} | Interest: {product.interestCount} | Status: {product.status}</p>
              </div>
            ))}
            {!sellerProducts.length && <p className="card">You have not posted anything yet.</p>}
          </div>
        </section>
      )}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-2xl font-black">Wishlist</h2>
          {wishlist.map((product) => <ProductCard key={product._id} product={product} />)}
          {!wishlist.length && <p className="card">Saved products will appear here.</p>}
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl font-black">Chat history</h2>
          {conversations.map((conversation) => (
            <Link key={conversation._id} className="card block hover:border-brand-500" to="/chat" state={{ conversationId: conversation._id }}>
              <p className="font-bold">{conversation.product?.title || 'Marketplace chat'}</p>
              <p className="text-sm text-slate-500">{conversation.lastMessage?.message || 'No messages yet'}</p>
            </Link>
          ))}
          {!conversations.length && <p className="card">Your conversations will appear here.</p>}
        </div>
      </section>
    </div>
  );
}
