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
  Sparkles,
  Wallet
} from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import ReviewForm from '../components/ReviewForm.jsx';
import ReviewList from '../components/ReviewList.jsx';
import StarRating from '../components/StarRating.jsx';
import { api, getErrorMessage } from '../services/api.js';
import { loadRazorpayCheckout } from '../services/razorpay.js';
import { useAuth } from '../context/AuthContext.jsx';
import { getProfileImage } from '../utils/avatar.js';

const fallbackImage = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80';

const paymentMethods = [
  { id: 'upi', label: 'UPI', description: 'Pay instantly using any UPI app', icon: Wallet },
  { id: 'card', label: 'Credit / Debit Card', description: 'Secure card payment', icon: CreditCard },
  { id: 'netbanking', label: 'Net banking', description: 'Pay securely from your bank', icon: PackageCheck }
];

const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;

const formatDate = (value) => {
  if (!value) return 'Recently listed';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently listed';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState('');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [sellerListings, setSellerListings] = useState([]);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [recommendationMeta, setRecommendationMeta] = useState(null);
  const [wishlistStatus, setWishlistStatus] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  const [isPaymentFailed, setIsPaymentFailed] = useState(false);
  const [paymentReceipt, setPaymentReceipt] = useState(null);
  const [productReviews, setProductReviews] = useState({ reviews: [], averageRating: 0, totalReviews: 0, breakdown: {} });
  const [sellerReviews, setSellerReviews] = useState({ reviews: [], averageRating: 0, totalReviews: 0, breakdown: {}, topRated: false });
  const [reviewEligibility, setReviewEligibility] = useState(null);
  const [reviewMessage, setReviewMessage] = useState('');
  const [productReviewSort, setProductReviewSort] = useState('latest');
  const [sellerReviewSort, setSellerReviewSort] = useState('latest');

  useEffect(() => {
    let cancelled = false;

    const loadProduct = async () => {
      setError('');
      setProduct(null);
      setRelatedProducts([]);
      setSellerListings([]);
      setAiRecommendations([]);
      setRecommendationMeta(null);
      setReviewEligibility(null);
      setReviewMessage('');
      setWishlistStatus('');
      setPaymentOpen(false);
      setPaymentMessage('');
      setIsLoadingPayment(false);
      setIsProcessingPayment(false);
      setIsPaymentSuccess(false);
      setIsPaymentFailed(false);
      setPaymentReceipt(null);

      try {
        const { data } = await api.get(`/products/${id}`);
        if (cancelled) return;
        const nextProduct = data.product;
        setProduct(nextProduct);
        setActiveImage(nextProduct.images?.[0] || fallbackImage);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      }
    };

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!product?._id) return;

    let cancelled = false;
    const sellerId = product.seller?._id;

    const requests = [
      api
        .get('/products', { params: { category: product.category, sort: 'latest' } })
        .then(({ data }) => ({
          type: 'related',
          value: data.products.filter((item) => item._id !== product._id).slice(0, 4)
        }))
        .catch(() => ({ type: 'related', value: [] })),
      api
        .get(`/products/${product._id}/recommendations`)
        .then(({ data }) => ({
          type: 'recommendations',
          value: data.recommendations || [],
          meta: data.meta || null
        }))
        .catch(() => ({ type: 'recommendations', value: [], meta: null }))
    ];

    if (sellerId) {
      requests.push(
        api
          .get(`/products/seller/${sellerId}`)
          .then(({ data }) => ({
            type: 'sellerListings',
            value: data.products.filter((item) => item._id !== product._id).slice(0, 4)
          }))
          .catch(() => ({ type: 'sellerListings', value: [] }))
      );
    }

    Promise.all(requests).then((results) => {
      if (cancelled) return;
      results.forEach((result) => {
        if (result.type === 'related') setRelatedProducts(result.value);
        if (result.type === 'sellerListings') setSellerListings(result.value);
        if (result.type === 'recommendations') {
          setAiRecommendations(result.value);
          setRecommendationMeta(result.meta);
        }
      });
    });

    return () => {
      cancelled = true;
    };
  }, [product]);

  useEffect(() => {
    if (!product?._id) return;

    api.get(`/reviews/product/${product._id}`, { params: { sort: productReviewSort } })
      .then(({ data }) => setProductReviews(data))
      .catch(() => setProductReviews({ reviews: [], averageRating: 0, totalReviews: 0, breakdown: {} }));
  }, [product?._id, productReviewSort]);

  useEffect(() => {
    if (!product?.seller?._id) {
      setSellerReviews({ reviews: [], averageRating: 0, totalReviews: 0, breakdown: {}, topRated: false });
      return;
    }

    api.get(`/reviews/seller/${product.seller._id}`, { params: { sort: sellerReviewSort } })
      .then(({ data }) => setSellerReviews(data))
      .catch(() => setSellerReviews({ reviews: [], averageRating: 0, totalReviews: 0, breakdown: {}, topRated: false }));
  }, [product?.seller?._id, sellerReviewSort]);

  useEffect(() => {
    if (!user || !product?._id) {
      setReviewEligibility(null);
      return;
    }

    api.get(`/reviews/eligibility/${product._id}`)
      .then(({ data }) => setReviewEligibility(data))
      .catch(() => setReviewEligibility(null));
  }, [user, product?._id]);

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
    if (!product) return [fallbackImage];
    const uniqueImages = Array.from(new Set(product.images || []));
    return uniqueImages.length ? uniqueImages : [fallbackImage];
  }, [product]);

  const overviewItems = useMemo(() => {
    if (!product) return [];
    return [
      { label: 'Category', value: product.category || 'General' },
      { label: 'Location', value: product.location || 'Location not shared yet' },
      { label: 'Posted on', value: formatDate(product.createdAt) },
      { label: 'Status', value: product.status === 'sold' ? 'Sold' : 'Available' },
      { label: 'Views', value: `${product.views || 0} views` },
      { label: 'Interest', value: `${product.interestCount || 0} saves` }
    ];
  }, [product]);

  const sellerId = product?.seller?._id || '';
  const sellerName = product?.seller?.name || 'Marketplace Seller';
  const isOwner = Boolean(user && sellerId && user.id === sellerId);
  const canContactSeller = Boolean(user && sellerId && !isOwner);
  const canReviewProduct = Boolean(reviewEligibility?.eligible && !reviewEligibility?.alreadyReviewed?.product);
  const canReviewSeller = Boolean(reviewEligibility?.eligible && !reviewEligibility?.alreadyReviewed?.seller);

  const startChat = async () => {
    if (!sellerId || !product?._id) {
      setWishlistStatus('Seller information is still loading for this listing.');
      return;
    }
    try {
      const { data } = await api.post('/chats/conversations', { sellerId, productId: product._id });
      navigate('/chat', { state: { conversationId: data.conversation._id } });
    } catch (err) {
      setWishlistStatus(getErrorMessage(err));
    }
  };

  const toggleWishlist = async () => {
    if (!product?._id) return;
    try {
      if (isWishlisted) {
        await api.delete(`/users/wishlist/${product._id}`);
        setWishlistStatus('Removed from wishlist');
        setIsWishlisted(false);
      } else {
        await api.post(`/users/wishlist/${product._id}`);
        setWishlistStatus('Saved to wishlist');
        setIsWishlisted(true);
      }
    } catch (err) {
      setWishlistStatus(getErrorMessage(err));
    }
  };

  const toggleCardWishlist = async (productId, currentlyWishlisted = false) => {
    if (currentlyWishlisted) {
      await api.delete(`/users/wishlist/${productId}`);
    } else {
      await api.post(`/users/wishlist/${productId}`);
    }
  };

  const refreshReviewData = async (message) => {
    if (!product?._id) return;
    setReviewMessage(message || 'Review submitted successfully');

    const requests = [
      api.get(`/reviews/product/${product._id}`, { params: { sort: productReviewSort } })
    ];

    if (product.seller?._id) {
      requests.push(api.get(`/reviews/seller/${product.seller._id}`, { params: { sort: sellerReviewSort } }));
    }

    if (user) {
      requests.push(api.get(`/reviews/eligibility/${product._id}`));
    }

    const responses = await Promise.all(requests);
    setProductReviews(responses[0].data);

    let index = 1;
    if (product.seller?._id) {
      setSellerReviews(responses[index].data);
      index += 1;
    }

    if (user && responses[index]?.data) {
      setReviewEligibility(responses[index].data);
    }
  };

  const proceedPayment = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!product?._id) return;

    setIsLoadingPayment(true);
    setIsProcessingPayment(false);
    setIsPaymentSuccess(false);
    setIsPaymentFailed(false);
    setPaymentMessage('');
    setPaymentReceipt(null);

    try {
      await loadRazorpayCheckout();
      const { data } = await api.post('/payment/create-order', { productId: product._id });

      if (!window.Razorpay) {
        throw new Error('Razorpay checkout could not be loaded. Please refresh and try again.');
      }

      if (!data?.checkout?.key || !data?.checkout?.order_id) {
        throw new Error('Payment order was created incorrectly. Please try again.');
      }

      setIsLoadingPayment(false);
      setIsProcessingPayment(true);
      setPaymentOpen(false);
      setPaymentMessage('Processing payment...');

      const options = {
        ...data.checkout,
        image: '/favicon.svg',
        theme: { color: '#0891b2' },
        handler: async (response) => {
          try {
            const verification = await api.post('/payment/verify-payment', response);
            setIsProcessingPayment(false);
            setIsPaymentSuccess(true);
            setIsPaymentFailed(false);
            setPaymentMessage('Payment successful. Order confirmed.');
            setPaymentReceipt(verification.data.receipt);
            setProduct((current) => (current ? { ...current, status: 'sold' } : current));
          } catch (err) {
            setIsProcessingPayment(false);
            setIsPaymentSuccess(false);
            setIsPaymentFailed(true);
            setPaymentMessage(getErrorMessage(err) || 'Payment failed or cancelled');
          } finally {
            setIsLoadingPayment(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsLoadingPayment(false);
            setIsProcessingPayment(false);
            setIsPaymentSuccess(false);
            setIsPaymentFailed(true);
            setPaymentMessage('Payment failed or cancelled');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', async (response) => {
        await api.post('/payment/failed', {
          razorpayOrderId: data.order?.razorpayOrderId,
          error: response.error
        }).catch(() => {});

        setIsLoadingPayment(false);
        setIsProcessingPayment(false);
        setIsPaymentSuccess(false);
        setIsPaymentFailed(true);
        setPaymentMessage(response.error?.description || 'Payment failed or cancelled');
      });
      razorpay.open();
    } catch (err) {
      setIsLoadingPayment(false);
      setIsProcessingPayment(false);
      setIsPaymentSuccess(false);
      setIsPaymentFailed(true);
      setPaymentMessage(getErrorMessage(err));
    }
  };

  if (error) return <p className="card text-red-700 dark:text-red-300">{error}</p>;
  if (!product) return <p className="card">Loading product...</p>;

  return (
    <div className="space-y-6">
      <section className="space-y-6">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <Link to="/" className="transition hover:text-brand-700">Home</Link>
                <span>/</span>
                <Link to={`/?q=${encodeURIComponent(product.category || '')}`} className="transition hover:text-brand-700">
                  {product.category || 'Products'}
                </Link>
                <span>/</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{product.title}</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                Featured Listing
              </div>
            </div>
          </div>

          <div className="grid gap-6 px-6 py-6 md:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950">
                <img className="h-[22rem] w-full object-cover md:h-[28rem]" src={activeImage || galleryImages[0]} alt={product.title} />
              </div>

              {galleryImages.length > 1 && (
                <div className="grid gap-3 sm:grid-cols-4">
                  {galleryImages.map((image) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() => setActiveImage(image)}
                      className={`overflow-hidden rounded-2xl border ${activeImage === image ? 'border-brand-500 ring-2 ring-brand-200' : 'border-slate-200 dark:border-slate-800'}`}
                    >
                      <img src={image} alt={product.title} className="h-24 w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <aside className="space-y-4 md:sticky md:top-24 md:self-start">
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
                <p className="text-4xl font-black text-slate-900 dark:text-slate-100">{formatCurrency(product.price)}</p>
                <div className="mt-3 flex items-center gap-2">
                  <StarRating value={productReviews.averageRating || product.averageRating} readOnly size={18} />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {(productReviews.averageRating || product.averageRating || 0).toFixed(1)}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    ({productReviews.totalReviews || product.totalReviews || 0} product reviews)
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <MapPin size={18} />
                  <span>{product.location || 'Location not shared yet'}</span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <CalendarDays size={16} />
                  <span>Posted on {formatDate(product.createdAt)}</span>
                </div>

                {canContactSeller ? (
                  <div className="mt-6 grid gap-3">
                    <button className="btn w-full" onClick={() => setPaymentOpen(true)} disabled={product.status === 'sold'}>
                      <IndianRupee size={18} /> Buy now / Pay
                    </button>
                    <button className="btn-secondary w-full border-brand-600 text-brand-700 hover:bg-brand-50 dark:hover:bg-slate-800" onClick={() => setPaymentOpen(true)}>
                      Make offer
                    </button>
                    <button className="btn-secondary w-full" onClick={startChat}>
                      <MessageCircle size={18} /> Chat with seller
                    </button>
                    <button
                      className={`btn-secondary w-full ${isWishlisted ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900 dark:bg-rose-950/50' : ''}`}
                      onClick={toggleWishlist}
                    >
                      <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} /> {isWishlisted ? 'Remove from wishlist' : 'Save item'}
                    </button>
                    {wishlistStatus && <p className="text-sm font-semibold text-brand-700">{wishlistStatus}</p>}
                  </div>
                ) : isOwner ? (
                  <Link className="btn-secondary mt-6 flex w-full justify-center" to={`/products/${product._id}/edit`}>
                    Edit listing
                  </Link>
                ) : (
                  <Link className="btn-secondary mt-6 flex w-full justify-center" to="/login">
                    Login to buy or chat
                  </Link>
                )}
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
                <div className="flex items-start gap-4">
                  <img
                    src={getProfileImage(product.seller?.profileImage, sellerName)}
                    alt={sellerName}
                    className="h-16 w-16 rounded-full border border-slate-200 object-cover dark:border-slate-800"
                  />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">Posted by</p>
                    <p className="text-xl font-black text-slate-900 dark:text-slate-100">{sellerName}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Member since {formatDate(product.seller?.createdAt || product.createdAt)}
                    </p>
                    <p className={`mt-3 text-sm font-semibold ${product.seller?.online ? 'text-emerald-600' : 'text-slate-500 dark:text-slate-400'}`}>
                      {product.seller?.online ? 'Online now' : 'Offline'}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <StarRating value={sellerReviews.averageRating || product.seller?.averageRating} readOnly size={16} />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        {(sellerReviews.averageRating || product.seller?.averageRating || 0).toFixed(1)}
                      </span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        ({sellerReviews.totalReviews || product.seller?.totalReviews || 0})
                      </span>
                      {sellerReviews.topRated && (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                          Top Rated Seller
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 p-4 text-center dark:bg-slate-800">
                    <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{sellerListings.length + 1}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Items listed</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 text-center dark:bg-slate-800">
                    <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{product.interestCount || 0}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Interested buyers</p>
                  </div>
                </div>
                {sellerId ? (
                  <button className="btn-secondary mt-5 w-full" onClick={startChat} disabled={!canContactSeller}>
                    {canContactSeller ? 'Chat with seller' : isOwner ? 'Your listing' : 'Login to chat'}
                  </button>
                ) : (
                  <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    Seller details are still loading for this listing.
                  </div>
                )}
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Location</h3>
                <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-gradient-to-br from-slate-100 to-slate-50 p-6 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-rose-100 p-3 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="font-black text-slate-900 dark:text-slate-100">{product.location || 'Location not shared yet'}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Exact address is shared by the seller after chat confirmation.</p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_340px]">
          <section className="space-y-4">
            <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 md:text-4xl dark:text-slate-100">{product.title}</h1>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{product.category || 'General'}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Eye size={16} />
                  <span>{product.views || 0} views</span>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">Overview</h2>
                </div>
                <div className="grid gap-0 sm:grid-cols-3">
                  {overviewItems.map((item) => (
                    <div key={item.label} className="border-b border-r border-slate-100 p-4 dark:border-slate-800">
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">{item.label}</p>
                      <p className="mt-2 text-base font-black text-slate-900 dark:text-slate-100">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            <article className="rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-200 px-5 py-3 dark:border-slate-800">
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">Description</h2>
              </div>
              <div className="px-5 py-4">
                <p className="whitespace-pre-line leading-7 text-slate-600 dark:text-slate-300">{product.description}</p>
              </div>
            </article>

            {reviewMessage && <p className="rounded-xl bg-emerald-50 p-4 font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">{reviewMessage}</p>}

            {user && reviewEligibility && !reviewEligibility.eligible && !reviewEligibility.isOwner && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
                {reviewEligibility.reason}
              </div>
            )}

            {(canReviewProduct || canReviewSeller) && (
              <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4">
                  <p className="section-subtitle">Write a review</p>
                  <h2 className="section-title mt-2">Help other buyers trust this listing</h2>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  {canReviewProduct && (
                    <ReviewForm productId={product._id} reviewType="product" onSubmitted={(_review, message) => refreshReviewData(message)} />
                  )}
                  {canReviewSeller && (
                    <ReviewForm productId={product._id} reviewType="seller" onSubmitted={(_review, message) => refreshReviewData(message)} />
                  )}
                </div>
              </article>
            )}

            {reviewEligibility?.alreadyReviewed?.product && reviewEligibility?.alreadyReviewed?.seller && (
              <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                You already reviewed this product and seller.
              </div>
            )}

            <ReviewList
              title="Product reviews"
              reviews={productReviews.reviews}
              averageRating={productReviews.averageRating}
              totalReviews={productReviews.totalReviews}
              breakdown={productReviews.breakdown}
              sort={productReviewSort}
              onSortChange={setProductReviewSort}
            />

            <ReviewList
              title="Seller feedback"
              reviews={sellerReviews.reviews}
              averageRating={sellerReviews.averageRating}
              totalReviews={sellerReviews.totalReviews}
              breakdown={sellerReviews.breakdown}
              sort={sellerReviewSort}
              onSortChange={setSellerReviewSort}
            />

            {!!relatedProducts.length && (
              <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4">
                  <p className="section-subtitle">Related ads</p>
                  <h2 className="section-title mt-2">More {product.category} listings</h2>
                </div>
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {relatedProducts.slice(0, 3).map((item) => (
                    <ProductCard key={item._id} product={item} onWishlist={user ? toggleCardWishlist : null} />
                  ))}
                </div>
              </article>
            )}

            {!!aiRecommendations.length && (
              <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="section-subtitle flex items-center gap-2">
                      <Sparkles size={15} className="text-brand-600" />
                      AI recommendations
                    </p>
                    <h2 className="section-title mt-2">Smart picks you may also like</h2>
                  </div>
                  {recommendationMeta?.model && (
                    <div className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-brand-700 dark:bg-slate-800 dark:text-cyan-300">
                      {recommendationMeta.model}
                    </div>
                  )}
                </div>
                {recommendationMeta?.explanation && (
                  <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">{recommendationMeta.explanation}</p>
                )}
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {aiRecommendations.map((item) => (
                    <div key={item._id} className="space-y-3">
                      <ProductCard product={item} onWishlist={user ? toggleCardWishlist : null} />
                      {!!item.recommendationReasons?.length && (
                        <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          <p className="font-bold text-slate-900 dark:text-slate-100">Why this was recommended</p>
                          <p className="mt-1">{item.recommendationReasons.join(' | ')}</p>
                        </div>
                      )}
                    </div>
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
          <div className="w-full max-w-2xl rounded-[2rem] bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="section-subtitle">Secure checkout</p>
                <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-100">Pay for {product.title}</h2>
                <p className="mt-2 text-slate-500 dark:text-slate-400">Choose a payment method to continue your purchase request.</p>
              </div>
              <button className="btn-secondary px-3 py-2" onClick={() => setPaymentOpen(false)}>Close</button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    type="button"
                    className="rounded-2xl border border-slate-200 p-4 text-left transition hover:border-brand-300 hover:bg-brand-50 dark:border-slate-800 dark:hover:bg-slate-800"
                  >
                    <Icon className="text-brand-700" />
                    <p className="mt-3 font-black text-slate-900 dark:text-slate-100">{method.label}</p>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{method.description}</p>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-5 dark:bg-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-400">Amount payable</p>
                  <p className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-100">{formatCurrency(product.price)}</p>
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  <p>Buyer protection and chat confirmation are recommended before pickup.</p>
                </div>
              </div>
            </div>

            {(paymentMessage || isLoadingPayment || isProcessingPayment) && (
              <div className={`mt-4 rounded-2xl p-4 ${
                isPaymentSuccess
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : isPaymentFailed
                    ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                    : 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
              }`}>
                {isLoadingPayment || isProcessingPayment ? 'Processing payment...' : paymentMessage}
              </div>
            )}

            {paymentReceipt && (
              <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                <p className="text-lg font-black">Payment receipt</p>
                <p className="mt-2">Receipt ID: {paymentReceipt.receiptId}</p>
                <p>Product: {paymentReceipt.product}</p>
                <p>Seller: {paymentReceipt.seller}</p>
                <p>Amount: {formatCurrency(paymentReceipt.amount)}</p>
                <p>Method: {paymentReceipt.method}</p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <button className="btn" onClick={proceedPayment} disabled={isLoadingPayment || isProcessingPayment}>
                {isLoadingPayment || isProcessingPayment ? 'Processing payment...' : 'Open Razorpay checkout'}
              </button>
              <button className="btn-secondary" onClick={startChat}>Ask seller first</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
