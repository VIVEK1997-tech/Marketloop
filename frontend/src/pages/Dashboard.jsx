import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { getAvatarOptions, getProfileImage } from '../utils/avatar.js';

export default function Dashboard() {
  const { user, setUser } = useAuth();
  const [sellerProducts, setSellerProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '', profileImage: user?.profileImage || '' });
  const [message, setMessage] = useState('');
  const [roleLoading, setRoleLoading] = useState(false);

  const userRoles = user?.roles || (user?.role ? [user.role] : []);
  const isSeller = userRoles.includes('seller') || userRoles.includes('admin');
  const avatarOptions = getAvatarOptions(profile.name || user?.name || 'MarketLoop User');

  useEffect(() => {
    api.get('/users/wishlist').then(({ data }) => setWishlist(data.wishlist));
    api.get('/chats/conversations').then(({ data }) => setConversations(data.conversations));
    if (isSeller) {
      api.get('/products/seller/me').then(({ data }) => setSellerProducts(data.products));
    } else {
      setSellerProducts([]);
    }
  }, [isSeller]);

  const saveProfile = async (event) => {
    event.preventDefault();
    const { data } = await api.put('/users/profile', profile);
    setUser(data.user);
    setMessage('Profile updated successfully');
  };

  const markSold = async (id) => {
    const { data } = await api.patch(`/products/${id}/sold`);
    setSellerProducts((current) => current.map((product) => (product._id === id ? data.product : product)));
  };

  const deleteListing = async (id) => {
    await api.delete(`/products/${id}`);
    setSellerProducts((current) => current.filter((product) => product._id !== id));
  };

  const enableSellerAccess = async () => {
    setRoleLoading(true);
    try {
      const { data } = await api.post('/users/roles/become-seller');
      setUser(data.user);
      setMessage(data.message);
    } finally {
      setRoleLoading(false);
    }
  };

  const switchRole = async (role) => {
    setRoleLoading(true);
    try {
      const { data } = await api.post('/users/roles/switch', { role });
      setUser(data.user);
      setMessage(data.message);
    } finally {
      setRoleLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="card flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">{user?.activeRole || user?.role} dashboard</p>
          <h1 className="text-3xl font-black">Hi, {user?.name}</h1>
          <p className="mt-2 text-sm text-slate-500">Roles on this account: {userRoles.join(', ')}</p>
        </div>
        {isSeller ? (
          <Link className="btn" to="/products/new">Post a product</Link>
        ) : (
          <button className="btn" onClick={enableSellerAccess} disabled={roleLoading}>
            {roleLoading ? 'Enabling...' : 'Become a seller'}
          </button>
        )}
      </section>

      <section className="card flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black">Role access</h2>
          <p className="text-sm text-slate-500">One MarketLoop account can shop like a buyer and list like a seller.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {userRoles.includes('buyer') && (
            <button
              className={`btn-secondary ${user?.activeRole === 'buyer' ? 'border-brand-300 bg-brand-50 text-brand-700' : ''}`}
              onClick={() => switchRole('buyer')}
              disabled={roleLoading || user?.activeRole === 'buyer'}
            >
              Buyer mode
            </button>
          )}
          {userRoles.includes('seller') && (
            <button
              className={`btn-secondary ${user?.activeRole === 'seller' ? 'border-brand-300 bg-brand-50 text-brand-700' : ''}`}
              onClick={() => switchRole('seller')}
              disabled={roleLoading || user?.activeRole === 'seller'}
            >
              Seller mode
            </button>
          )}
        </div>
      </section>

      {message && <p className="rounded-xl bg-emerald-50 p-4 font-semibold text-emerald-700">{message}</p>}

      <form onSubmit={saveProfile} className="card space-y-5">
        <div className="flex flex-col gap-5 md:flex-row md:items-start">
          <div className="flex flex-col items-center gap-3">
            <img
              src={getProfileImage(profile.profileImage, profile.name || user?.name)}
              alt={profile.name || user?.name || 'Profile'}
              className="h-28 w-28 rounded-full border border-slate-200 object-cover shadow-sm"
            />
            <button
              type="button"
              className="btn-secondary w-full text-sm text-red-600"
              onClick={() => setProfile((current) => ({ ...current, profileImage: '' }))}
            >
              Remove photo
            </button>
          </div>
          <div className="grid flex-1 gap-4 md:grid-cols-2">
            <input className="input" placeholder="Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            <input className="input" placeholder="Phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            <input
              className="input md:col-span-2"
              placeholder="Profile image URL"
              value={profile.profileImage}
              onChange={(e) => setProfile({ ...profile, profileImage: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h2 className="text-xl font-black">Choose an avatar</h2>
            <p className="text-sm text-slate-500">Pick a creative avatar if you do not want to upload or paste your own photo.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {avatarOptions.map((avatar) => {
              const selected = profile.profileImage === avatar.url;
              return (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => setProfile((current) => ({ ...current, profileImage: avatar.url }))}
                  className={`rounded-2xl border p-3 transition ${selected ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200' : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50'}`}
                >
                  <img src={avatar.url} alt={avatar.label} className="mx-auto h-16 w-16 rounded-full object-cover" />
                  <p className="mt-2 text-sm font-semibold text-slate-700">{avatar.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        <button className="btn w-fit">Save profile</button>
      </form>

      {isSeller && (
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
