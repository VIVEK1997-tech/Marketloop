import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, LogOut, Shield, Store } from 'lucide-react';
import AvatarSelector from '../components/AvatarSelector.jsx';
import ProductCard from '../components/ProductCard.jsx';
import ProfileCard from '../components/ProfileCard.jsx';
import ProfileTabs from '../components/ProfileTabs.jsx';
import ReviewCard from '../components/ReviewCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api, getErrorMessage } from '../services/api.js';

const tabs = [
  { id: 'profile', label: 'Profile Info' },
  { id: 'listings', label: 'Listings' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'settings', label: 'Settings' }
];

const createProfileState = (user) => ({
  name: user?.name || '',
  phone: user?.phone || '',
  profileImage: user?.profileImage || '',
  location: {
    city: user?.location?.city || '',
    state: user?.location?.state || '',
    country: user?.location?.country || '',
    address: user?.location?.address || ''
  }
});

const validateProfile = (profile) => {
  const errors = {};
  if (!profile.name.trim() || profile.name.trim().length < 2) errors.name = 'Please enter your full name.';
  if (profile.phone && !/^[0-9+\-\s]{8,15}$/.test(profile.phone.trim())) errors.phone = 'Use a valid phone number.';
  return errors;
};

const draftKey = (userId) => `marketloop_profile_draft_${userId}`;

function SkeletonPanel() {
  return (
    <div className="space-y-4">
      <div className="card animate-pulse space-y-4">
        <div className="h-6 w-40 rounded bg-slate-200" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-12 rounded bg-slate-200" />
          <div className="h-12 rounded bg-slate-200" />
          <div className="h-12 rounded bg-slate-200 md:col-span-2" />
          <div className="h-28 rounded bg-slate-200 md:col-span-2" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, setUser, logout } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [profile, setProfile] = useState(createProfileState(user));
  const [activeTab, setActiveTab] = useState('profile');
  const [sellerProducts, setSellerProducts] = useState([]);
  const [sellerReviews, setSellerReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState('');

  const userRoles = user?.roles || (user?.role ? [user.role] : []);
  const isSeller = userRoles.includes('seller') || userRoles.includes('admin');

  useEffect(() => {
    setLoading(true);
    api.get('/users/profile')
      .then(({ data }) => {
        setProfileData(data.user);
        setStats(data.stats);
        const savedDraft = localStorage.getItem(draftKey(data.user.id));
        const nextProfile = savedDraft ? JSON.parse(savedDraft) : createProfileState(data.user);
        setProfile(nextProfile);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!profileData?.id) return;
    localStorage.setItem(draftKey(profileData.id), JSON.stringify(profile));
  }, [profile, profileData?.id]);

  const dirty = useMemo(() => JSON.stringify(profile) !== JSON.stringify(createProfileState(profileData || user)), [profile, profileData, user]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    const timer = toast ? setTimeout(() => setToast(''), 2500) : null;
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!profileData?.id) return;
    if (activeTab === 'listings' && isSeller && !sellerProducts.length) {
      setTabLoading(true);
      api.get('/products/seller/me')
        .then(({ data }) => setSellerProducts(data.products))
        .finally(() => setTabLoading(false));
    }

    if (activeTab === 'reviews' && !sellerReviews.length) {
      setTabLoading(true);
      api.get(`/users/${profileData.id}/ratings`)
        .then(({ data }) => setSellerReviews(data.reviews || []))
        .finally(() => setTabLoading(false));
    }
  }, [activeTab, isSeller, sellerProducts.length, sellerReviews.length, profileData?.id]);

  const guardedSetActiveTab = (tabId) => {
    if (dirty && tabId !== activeTab) {
      const proceed = window.confirm('You have unsaved profile changes. Leave this tab anyway?');
      if (!proceed) return;
    }
    setActiveTab(tabId);
  };

  const updateField = (key, value) => setProfile((current) => ({ ...current, [key]: value }));
  const updateLocation = (key, value) => setProfile((current) => ({ ...current, location: { ...current.location, [key]: value } }));

  const saveProfile = async (event) => {
    event.preventDefault();
    const nextErrors = validateProfile(profile);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      const { data } = await api.put('/users/profile', profile);
      setUser(data.user);
      setProfileData(data.user);
      localStorage.removeItem(draftKey(data.user.id));
      setToast('Profile saved successfully');
    } catch (error) {
      setToast(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
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
      setProfileData(data.user);
      setToast(data.message);
    } finally {
      setRoleLoading(false);
    }
  };

  const switchRole = async (role) => {
    setRoleLoading(true);
    try {
      const { data } = await api.post('/users/roles/switch', { role });
      setUser(data.user);
      setProfileData(data.user);
      setToast(data.message);
    } finally {
      setRoleLoading(false);
    }
  };

  if (loading || !profileData || !stats) {
    return (
      <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="card animate-pulse space-y-4">
          <div className="mx-auto h-28 w-28 rounded-full bg-slate-200" />
          <div className="h-6 rounded bg-slate-200" />
          <div className="h-4 rounded bg-slate-200" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-20 rounded bg-slate-200" />
            <div className="h-20 rounded bg-slate-200" />
          </div>
        </div>
        <SkeletonPanel />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed right-4 top-24 z-40 rounded-2xl px-4 py-3 text-sm font-semibold shadow-lg ${toast.toLowerCase().includes('saved') ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>
          {toast}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <ProfileCard user={profileData} stats={stats} isSeller={isSeller} onEditProfile={() => setActiveTab('profile')} />

        <section className="space-y-5">
          <ProfileTabs tabs={tabs} activeTab={activeTab} onChange={guardedSetActiveTab} />

          {activeTab === 'profile' && (
            <form onSubmit={saveProfile} className="space-y-5">
              <div className="card">
                <div className="mb-5">
                  <p className="section-subtitle">Profile workspace</p>
                  <h2 className="section-title mt-2">Manage your identity, trust signals, and public presence</h2>
                </div>
                <AvatarSelector name={profile.name} value={profile.profileImage} onChange={(value) => updateField('profileImage', value)} />
              </div>

              <div className="card space-y-5">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Personal info</h3>
                  <p className="mt-1 text-sm text-slate-500">This is how buyers and sellers recognize you across MarketLoop.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Full name
                    <input className="input mt-2" value={profile.name} onChange={(event) => updateField('name', event.target.value)} />
                    <span className="mt-2 block text-xs font-normal text-slate-500">Use your real name for better trust and response rates.</span>
                    {errors.name && <span className="mt-1 block text-xs font-semibold text-red-600">{errors.name}</span>}
                  </label>
                  <label className="block text-sm font-semibold text-slate-700">
                    Email
                    <input className="input mt-2 bg-slate-50" value={profileData.email || ''} disabled />
                    <span className="mt-2 block text-xs font-normal text-slate-500">Email visibility is limited and used mainly for account safety.</span>
                  </label>
                </div>
              </div>

              <div className="card space-y-5">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Contact info</h3>
                  <p className="mt-1 text-sm text-slate-500">Help people know where you are based and how to reach you after interest is confirmed.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Phone number
                    <input className="input mt-2" value={profile.phone} onChange={(event) => updateField('phone', event.target.value)} />
                    <span className="mt-2 block text-xs font-normal text-slate-500">Add a valid number for faster buyer and seller coordination.</span>
                    {errors.phone && <span className="mt-1 block text-xs font-semibold text-red-600">{errors.phone}</span>}
                  </label>
                  <label className="block text-sm font-semibold text-slate-700">
                    City
                    <input className="input mt-2" value={profile.location.city} onChange={(event) => updateLocation('city', event.target.value)} />
                    <span className="mt-2 block text-xs font-normal text-slate-500">Used to personalize local listings and improve search discovery.</span>
                  </label>
                  <label className="block text-sm font-semibold text-slate-700">
                    State
                    <input className="input mt-2" value={profile.location.state} onChange={(event) => updateLocation('state', event.target.value)} />
                  </label>
                  <label className="block text-sm font-semibold text-slate-700">
                    Country
                    <input className="input mt-2" value={profile.location.country} onChange={(event) => updateLocation('country', event.target.value)} />
                  </label>
                  <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
                    Address
                    <textarea className="input mt-2 min-h-28" value={profile.location.address} onChange={(event) => updateLocation('address', event.target.value)} />
                    <span className="mt-2 block text-xs font-normal text-slate-500">Share only the level of detail you are comfortable with. Exact meetup address can still stay private until chat.</span>
                  </label>
                </div>
              </div>

              <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-2xl backdrop-blur md:hidden">
                <button className="btn w-full" disabled={!dirty || saving} onClick={saveProfile}>
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>

              <div className="hidden justify-end md:flex">
                <button className="btn" disabled={!dirty || saving}>
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'listings' && (
            <div className="space-y-5">
              <div className="card flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="section-subtitle">My Listings</p>
                  <h2 className="section-title mt-2">Manage the products you have posted</h2>
                </div>
                {isSeller ? <Link className="btn" to="/products/new"><Store size={18} /> Post a product</Link> : <p className="text-sm text-slate-500">Enable seller access in Settings to start posting.</p>}
              </div>
              {tabLoading ? <SkeletonPanel /> : (
                <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                  {sellerProducts.map((product) => (
                    <div key={product._id} className="space-y-2">
                      <ProductCard product={product} />
                      <div className="grid grid-cols-3 gap-2">
                        <Link className="btn-secondary py-2" to={`/products/${product._id}/edit`}>Edit</Link>
                        <button className="btn-secondary py-2" onClick={() => markSold(product._id)}>Sold</button>
                        <button className="btn-secondary py-2 text-red-600" onClick={() => deleteListing(product._id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                  {!sellerProducts.length && <p className="card md:col-span-2 2xl:col-span-3">No listings yet. Start with your first product post to build credibility.</p>}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-5">
              <div className="card">
                <p className="section-subtitle">Reviews</p>
                <h2 className="section-title mt-2">What other buyers are saying about you</h2>
                <p className="mt-2 text-sm text-slate-500">Higher ratings improve trust and help future buyers engage with confidence.</p>
              </div>
              {tabLoading ? <SkeletonPanel /> : (
                <div className="grid gap-4">
                  {sellerReviews.map((review) => <ReviewCard key={review._id} review={review} />)}
                  {!sellerReviews.length && <p className="card">No seller reviews yet. Completing chats and successful transactions will help you build your reputation.</p>}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-5">
              <div className="card">
                <p className="section-subtitle">Settings</p>
                <h2 className="section-title mt-2">Account controls, privacy, and workspace actions</h2>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="card">
                  <h3 className="text-xl font-black text-slate-900">Role access</h3>
                  <p className="mt-2 text-sm text-slate-500">Switch between buyer and seller workflows from the same account without creating a second profile.</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {userRoles.includes('buyer') && (
                      <button
                        className={`btn-secondary ${profileData.activeRole === 'buyer' ? 'border-brand-300 bg-brand-50 text-brand-700' : ''}`}
                        onClick={() => switchRole('buyer')}
                        disabled={roleLoading || profileData.activeRole === 'buyer'}
                      >
                        Buyer mode
                      </button>
                    )}
                    {userRoles.includes('seller') ? (
                      <button
                        className={`btn-secondary ${profileData.activeRole === 'seller' ? 'border-brand-300 bg-brand-50 text-brand-700' : ''}`}
                        onClick={() => switchRole('seller')}
                        disabled={roleLoading || profileData.activeRole === 'seller'}
                      >
                        Seller mode
                      </button>
                    ) : (
                      <button className="btn-secondary" onClick={enableSellerAccess} disabled={roleLoading}>
                        {roleLoading ? 'Enabling...' : 'Enable seller access'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="card">
                  <h3 className="text-xl font-black text-slate-900">Payments & orders</h3>
                  <p className="mt-2 text-sm text-slate-500">Review Razorpay transactions, receipts, and payment status in one place.</p>
                  <Link className="btn-secondary mt-4 gap-2" to="/payments">
                    <CreditCard size={16} /> Open payment history
                  </Link>
                </div>

                <div className="card">
                  <h3 className="text-xl font-black text-slate-900">Privacy guidance</h3>
                  <p className="mt-2 text-sm text-slate-500">Keep your exact address private until a chat feels trustworthy. Use profile fields to share only what improves discovery and confidence.</p>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                    <Shield size={16} /> Recommended for marketplace safety
                  </div>
                </div>

                <div className="card">
                  <h3 className="text-xl font-black text-slate-900">Logout</h3>
                  <p className="mt-2 text-sm text-slate-500">Securely sign out of your account on this device.</p>
                  <button className="btn-secondary mt-4 gap-2 text-red-600" onClick={logout}>
                    <LogOut size={16} /> Logout now
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
