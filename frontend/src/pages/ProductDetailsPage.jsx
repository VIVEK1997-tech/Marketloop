import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import ProductDescription from '../components/product/ProductDescription.jsx';
import ProductHighlights from '../components/product/ProductHighlights.jsx';
import ProductImageGallery from '../components/product/ProductImageGallery.jsx';
import ProductPurchasePanel from '../components/product/ProductPurchasePanel.jsx';
import SellerCompactCard from '../components/product/SellerCompactCard.jsx';
import { getProductDiscountPercent, getProductOriginalPrice } from '../data/products.js';
import { useAuth } from '../context/AuthContext.jsx';
import { api, getErrorMessage } from '../services/api.js';
import { cartApi } from '../services/cartApi.js';
import { productApi } from '../services/productApi.js';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const nextProduct = await productApi.getProduct(id);
        const recommendationResult = await productApi.getRecommendations(id);
        if (cancelled) return;
        setProduct(nextProduct);
        setActiveImage(nextProduct.images?.[0] || '');
        setQuantity(Math.max(1, cartApi.getQuantity(nextProduct._id) || 1));
        setRecommendations(recommendationResult.recommendations || []);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!user || !id) {
      setIsWishlisted(false);
      return;
    }

    api.get('/wishlist')
      .then((response) => setIsWishlisted((response.data?.data?.wishlist || response.data?.wishlist || []).some((item) => item._id === id)))
      .catch(() => setIsWishlisted(false));
  }, [user, id]);

  const originalPrice = useMemo(() => getProductOriginalPrice(product || {}), [product]);
  const discountPercent = useMemo(() => getProductDiscountPercent(product || {}), [product]);

  const increaseQuantity = () => setQuantity((current) => current + 1);
  const decreaseQuantity = () => setQuantity((current) => Math.max(1, current - 1));

  const handleBuyNow = () => {
    if (!product) return;
    navigate(`/product/${product._id}/buy`, { state: { quantity } });
  };

  const handleAddToCart = () => {
    if (!product) return;
    cartApi.addItem(product, quantity);
    setMessage('Added to cart successfully');
    window.setTimeout(() => setMessage(''), 2200);
  };

  const startChat = async () => {
    if (!user) {
      navigate('/login?role=buyer', { state: { redirectTo: `/product/${id}` } });
      return;
    }

    try {
      const { data } = await api.post('/chats/conversations', {
        sellerId: product.seller?._id,
        productId: product._id
      });
      navigate('/chat', { state: { conversationId: data.conversation._id } });
    } catch (err) {
      setMessage(getErrorMessage(err));
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      navigate('/login?role=buyer', { state: { redirectTo: `/product/${id}` } });
      return;
    }

    try {
      if (isWishlisted) {
        await api.delete(`/wishlist/${product._id}`);
        setIsWishlisted(false);
        setMessage('Removed from wishlist');
      } else {
        await api.post('/wishlist', { productId: product._id });
        setIsWishlisted(true);
        setMessage('Saved to wishlist');
      }
    } catch (err) {
      setMessage(getErrorMessage(err));
    }
  };

  if (loading) return <p className="card">Loading product...</p>;
  if (error) return <p className="card text-red-700">{error}</p>;
  if (!product) return <p className="card">Product not found.</p>;

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
        <ProductImageGallery
          title={product.title}
          category={product.category}
          images={product.images}
          activeImage={activeImage}
          onSelectImage={setActiveImage}
        />

        <div className="space-y-4 lg:sticky lg:top-24">
          <ProductPurchasePanel
            product={product}
            originalPrice={originalPrice}
            discountPercent={discountPercent}
            quantity={quantity}
            onIncrease={increaseQuantity}
            onDecrease={decreaseQuantity}
            onBuyNow={handleBuyNow}
            onAddToCart={handleAddToCart}
          />
          {message && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p>}
        </div>
      </section>

      <ProductHighlights />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <SellerCompactCard
          seller={product.seller}
          isWishlisted={isWishlisted}
          onMessageSeller={startChat}
          onSaveItem={toggleWishlist}
          message=""
        />
        <ProductDescription description={product.description} />
      </div>

      {!!recommendations.length && (
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900">You may also like</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {recommendations.slice(0, 4).map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
