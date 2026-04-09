import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  CalendarDays,
  CreditCard,
  Eye,
  Heart,
  IndianRupee,
  MapPin,
  MessageCircle,
  PackageCheck,
  Store,
  Wallet
} from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import { api, getErrorMessage } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const paymentMethods = [
  { id: 'upi', label: 'UPI', description: 'Pay instantly using any UPI app', icon: Wallet },
  { id: 'card', label: 'Credit / Debit Card', description: 'Secure card payment for this item', icon: CreditCard },
  { id: 'cod', label: 'Pay on meetup', description: 'Confirm with seller and pay at pickup', icon: PackageCheck }
];

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;
const formatDate = (value) => new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [sellerListings, setSellerListings] = useState([]);
  const [activeImage, setActiveImage] = useState('');
  const [error, setError] = useState('');
  const [wishlistStatus, setWishlistStatus] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(({ data }) => {
        setProduct(data.product);
        setActiveImage(data.product.images?.[0] || '');
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, [id]);

  useEffect(() => {
    if (!product) return;

    api.get('/products', { params: { category: product.category, sort: 'latest' } })
      .then(({ data }) => setRelatedProducts(data.products.filter((item) => item._id !== product._id).slice(0, 4)))
      .catch(() => setRelatedProducts([]));

    api.get(`/products/seller/${product.seller._id}`)
      .then(({ data }) => setSellerListings(data.products.filter((item) => item._id !== product._id).slice(0, 4)))
      .catch(() => setSellerListings([]));
  }, [product]);

  useEffect(() => {
    if (!user) {
      setIsWishlisted(false);
      return;
    }

    api.get('/users/wishlist')
      .then(({ data }) => setIsWishlisted(data.wishlist.some((item) => item._id === id)))
      .catch(() => setIsWishlisted(false));
  }, [id, user]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    const uniqueImages = Array.from(new Set(product.images || []));
    return uniqueImages.length
      ? uniqueImages
      : ['https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80'];
  }, [product]);

  const overviewItems = useMemo(() => {
    if (!product) return [];
    return [
      { label: 'Category', value: product.category },
      { label: 'Location', value: product.location },
      { label: 'Posted on', value: formatDate(product.createdAt) },
      { label: 'Status', value: product.status === 'sold' ? 'Sold' : 'Available' },
      { label: 'Views', value: `${product.views || 0} views` },
      { label: 'Interest', value: `${product.interestCount || 0} saves` }
    ];
  }, [product]);

  const startChat = async () => {
    const { data } = await api.post('/chats/conversations', { sellerId: product.seller._id, productId: product._id });
    navigate('/chat', { state: { conversationId: data.conversation._id } });
  };

  const addWishlist = async () => {
    try {
      await api.post(`/users/wishlist/${product._id}`);
      setWishlistStatus('Saved to wishlist');
      setIsWishlisted(true);
    } catch (err) {
      setWishlistStatus(getErrorMessage(err));
    }
  };

  const proceedPayment = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setPaymentLoading(true);
    setPaymentStatus('');
    setTimeout(() => {
      const methodLabel = paymentMethods.find((item) => item.id === selectedMethod)?.label || 'Selected method';
      setPaymentLoading(false);
      setPaymentStatus(`Payment initiated with ${methodLabel}. Seller has been notified and your order request is being processed.`);
    }, 1100);
  };

  if (error) return <p className="card text-red-700">{error}</p>;
  if (!product) return <p className="card">Loading product...</p>;

  return (
    <div className="space-y-6">
      <section className="space-y-6">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <Link to="/" className="transition hover:text-brand-700">Home</Link>
                <span>/</span>
                <Link to={`/?q=${encodeURIComponent(product.category)}`} className="transition hover:text-brand-700">
                  {product.category}
                </Link>
                <span>/</span>
                <span className="font-semibold text-slate-700">{product.title}</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
                Featured Listing
              </div>
            </div>
          </div>

          <div className="grid gap-6 px-6 py-6 md:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-100">
                <img className="h-[22rem] w-full object-cover md:h-[28rem]" src={activeImage || galleryImages[0]} alt={product.title} />
              </div>

              {galleryImages.length > 1 && (
                <div className="grid gap-3 sm:grid-cols-4">
                  {galleryImages.map((image) => (
                    <button
                      key={image}
                      onClick={() => setActiveImage(image)}
                      className={`overflow-hidden rounded-2xl border ${activeImage === image ? 'border-brand-500 ring-2 ring-brand-200' : 'border-slate-200'}`}
                    >
                      <img src={image} alt={product.title} className="h-24 w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <aside className="space-y-4 md:sticky md:top-24 md:self-start">
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-4xl font-black text-slate-900">{formatCurrency(product.price)}</p>
                <div className="mt-4 flex items-center gap-2 text-slate-600">
                  <MapPin size={18} />
                  <span>{product.location}</span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-slate-500">
                  <CalendarDays size={16} />
                  <span>Posted on {formatDate(product.createdAt)}</span>
                </div>

                {user && user.id !== product.seller._id ? (
                  <div className="mt-6 grid gap-3">
                    <button className="btn w-full" onClick={() => setPaymentOpen(true)}>
                      <IndianRupee size={18} /> Buy now / Pay
                    </button>
                    <button className="btn-secondary w-full border-brand-600 text-brand-700 hover:bg-brand-50" onClick={() => setPaymentOpen(true)}>
                      Make offer
                    </button>
                    <button className="btn-secondary w-full" onClick={startChat}>
                      <MessageCircle size={18} /> Chat with seller
                    </button>
                    <button
                      className={`btn-secondary w-full ${isWishlisted ? 'border-rose-200 bg-rose-50 text-rose-600' : ''}`}
                      onClick={addWishlist}
                    >
                      <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} /> {isWishlisted ? 'Saved' : 'Save item'}
                    </button>
                    {wishlistStatus && <p className="text-sm font-semibold text-brand-700">{wishlistStatus}</p>}
                  </div>
                ) : (
                  <Link className="btn-secondary mt-6 flex w-full justify-center" to={`/products/${product._id}/edit`}>
                    Edit listing
                  </Link>
                )}
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                    <Store />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">Posted by</p>
                    <p className="text-xl font-black text-slate-900">{product.seller?.name}</p>
                    <p className="mt-1 text-sm text-slate-500">Member since {formatDate(product.seller?.createdAt || product.createdAt)}</p>
                    <p className={`mt-3 text-sm font-semibold ${product.seller?.online ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {product.seller?.online ? 'Online now' : 'Offline'}
                    </p>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 p-4 text-center">
                    <p className="text-2xl font-black text-slate-900">{sellerListings.length + 1}</p>
                    <p className="text-sm text-slate-500">Items listed</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 text-center">
                    <p className="text-2xl font-black text-slate-900">{product.interestCount || 0}</p>
                    <p className="text-sm text-slate-500">Interested buyers</p>
                  </div>
                </div>
                <button className="btn-secondary mt-5 w-full" onClick={startChat}>
                  Chat with seller
                </button>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-black text-slate-900">Location</h3>
                <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-gradient-to-br from-slate-100 to-slate-50 p-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-rose-100 p-3 text-rose-600">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="font-black text-slate-900">{product.location}</p>
                      <p className="text-sm text-slate-500">Exact address shared by seller after chat confirmation.</p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_340px]">
          <section className="space-y-4">
            <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 md:text-4xl">{product.title}</h1>
                  <p className="mt-2 text-sm text-slate-500">{product.category}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Eye size={16} />
                  <span>{product.views || 0} views</span>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200">
                <div className="border-b border-slate-200 px-4 py-3">
                  <h2 className="text-2xl font-black text-slate-900">Overview</h2>
                </div>
                <div className="grid gap-0 sm:grid-cols-3">
                  {overviewItems.map((item) => (
                    <div key={item.label} className="border-b border-r border-slate-100 p-4 sm:last:border-r-0 [&:nth-last-child(-n+3)]:border-b-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">{item.label}</p>
                      <p className="mt-2 text-base font-black text-slate-900">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            <article className="rounded-[1.5rem] border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-5 py-3">
                <h2 className="text-2xl font-black text-slate-900">Description</h2>
              </div>
              <div className="px-5 py-4">
                <p className="whitespace-pre-line leading-7 text-slate-600">{product.description}</p>
              </div>
            </article>

            {!!relatedProducts.length && (
              <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="section-subtitle">Related ads</p>
                    <h2 className="section-title mt-2">More {product.category} listings</h2>
                  </div>
                </div>
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {relatedProducts.slice(0, 3).map((item) => (
                    <ProductCard
                      key={item._id}
                      product={item}
                      onWishlist={user ? async (productId) => api.post(`/users/wishlist/${productId}`) : null}
                      isWishlisted={false}
                    />
                  ))}
                </div>
              </article>
            )}
          </section>
          <div className="hidden md:block" />
        </div>
      </section>

      {paymentOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/55 px-4">
          <div className="w-full max-w-2xl rounded-[2rem] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="section-subtitle">Secure checkout</p>
                <h2 className="mt-2 text-3xl font-black text-slate-900">Pay for {product.title}</h2>
                <p className="mt-2 text-slate-500">Choose a payment method to continue your purchase request.</p>
              </div>
              <button className="btn-secondary px-3 py-2" onClick={() => setPaymentOpen(false)}>Close</button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`rounded-2xl border p-4 text-left transition ${selectedMethod === method.id ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200' : 'border-slate-200 hover:border-brand-300'}`}
                  >
                    <Icon className="text-brand-700" />
                    <p className="mt-3 font-black text-slate-900">{method.label}</p>
                    <p className="mt-2 text-sm text-slate-500">{method.description}</p>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-400">Amount payable</p>
                  <p className="mt-2 text-3xl font-black text-slate-900">{formatCurrency(product.price)}</p>
                </div>
                <div className="text-sm text-slate-500">
                  <p>Buyer protection and chat confirmation recommended before pickup.</p>
                </div>
              </div>
            </div>

            {paymentStatus && (
              <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-emerald-700">
                {paymentStatus}
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <button className="btn" onClick={proceedPayment} disabled={paymentLoading}>
                {paymentLoading ? 'Processing...' : 'Proceed to payment'}
              </button>
              <button className="btn-secondary" onClick={startChat}>Ask seller first</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
