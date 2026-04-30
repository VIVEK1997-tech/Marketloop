import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import ProductInfoCard from '../components/ProductInfoCard.jsx';
import PriceSummary from '../components/PriceSummary.jsx';
import QuantitySelector from '../components/QuantitySelector.jsx';
import BuyingActions from '../components/buying/BuyingActions.jsx';
import { cartApi } from '../services/cartApi.js';
import { productApi } from '../services/productApi.js';
import { getErrorMessage } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function BuyingOptionsPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const initialQuantity = Math.max(1, Number(location.state?.quantity || 1));
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(initialQuantity);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    productApi.getProduct(id)
      .then((nextProduct) => {
        if (cancelled) return;
        setProduct(nextProduct);
        setQuantity(Math.max(initialQuantity, cartApi.getQuantity(nextProduct._id) || initialQuantity));
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, initialQuantity]);

  const originalPrice = useMemo(() => (product ? Math.round(product.price * 1.21) : 0), [product]);
  const discountPercent = useMemo(() => {
    if (!product || !originalPrice) return 0;
    return Math.max(1, Math.round(((originalPrice - product.price) / originalPrice) * 100));
  }, [product, originalPrice]);
  const subtotal = (product?.price || 0) * quantity;
  const deliveryFee = subtotal > 699 ? 0 : 35;
  const total = subtotal + deliveryFee;

  const increase = () => setQuantity((current) => current + 1);
  const decrease = () => setQuantity((current) => Math.max(1, current - 1));

  const addToCart = () => {
    if (!product) return;
    cartApi.addItem(product, quantity);
    setMessage('Added to cart successfully');
    window.setTimeout(() => setMessage(''), 2200);
  };

  const proceedToCheckout = () => {
    if (!user) {
      navigate('/login?role=buyer', {
        state: { redirectTo: `/checkout?productId=${id}&qty=${quantity}` }
      });
      return;
    }

    navigate(`/checkout?productId=${id}&qty=${quantity}`);
  };

  if (loading) return <p className="card">Loading buying options...</p>;
  if (error) return <p className="card text-red-700">{error}</p>;
  if (!product) return <p className="card">Product not found.</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link to={`/product/${product._id}`} className="hover:text-emerald-700">Product details</Link>
        <span>/</span>
        <span className="font-semibold text-slate-700">Buying options</span>
      </div>

      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-400">Review quantity and total</p>
        <div className="mt-3">
          <ProductInfoCard product={product} originalPrice={originalPrice} discountPercent={discountPercent} />
        </div>
      </div>

      <article className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Quantity</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Update the number of units before checkout.</p>
          </div>
          <QuantitySelector quantity={quantity} onDecrease={decrease} onIncrease={increase} />
        </div>

        <PriceSummary subtotal={subtotal} deliveryFee={deliveryFee} total={total} className="mt-6" />

        <div className="mt-6">
          <BuyingActions onAddToCart={addToCart} onBuyNow={proceedToCheckout} />
        </div>

        {message && <p className="mt-4 text-sm font-semibold text-emerald-700">{message}</p>}
      </article>
    </div>
  );
}
