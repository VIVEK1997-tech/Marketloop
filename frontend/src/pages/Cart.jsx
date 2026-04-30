import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { cartApi } from '../services/cartApi.js';
import { getErrorMessage } from '../services/api.js';

const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;

export default function Cart() {
  const navigate = useNavigate();
  const [items, setItems] = useState(() => cartApi.getItems());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let ignore = false;

    cartApi.bootstrapFromServer()
      .then((nextItems) => {
        if (!ignore) setItems(nextItems);
      })
      .catch((err) => {
        if (!ignore) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    const handleCartUpdated = (event) => {
      setItems(Array.isArray(event.detail) ? event.detail : []);
    };

    window.addEventListener('marketloop:cart-updated', handleCartUpdated);
    return () => {
      ignore = true;
      window.removeEventListener('marketloop:cart-updated', handleCartUpdated);
    };
  }, []);

  useEffect(() => {
    if (!message) return undefined;
    const timer = window.setTimeout(() => setMessage(''), 2200);
    return () => window.clearTimeout(timer);
  }, [message]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.product?.price || 0) * Number(item.quantity || 0), 0),
    [items]
  );
  const deliveryFee = subtotal > 699 ? 0 : items.length ? 35 : 0;
  const total = subtotal + deliveryFee;

  const updateQuantity = (productId, quantity) => {
    try {
      const nextItems = cartApi.updateQuantity(productId, quantity);
      setItems(nextItems);
      setMessage('Cart updated');
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const removeItem = (productId) => {
    updateQuantity(productId, 0);
  };

  const clearCart = () => {
    try {
      const nextItems = cartApi.clear();
      setItems(nextItems);
      setMessage('Cart cleared');
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) return <p className="card">Loading your cart...</p>;

  return (
    <div className="space-y-6">
      <section className="card">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">Cart</p>
        <h1 className="mt-2 text-3xl font-black">Your saved items</h1>
        <p className="mt-2 text-slate-500">Cart data now syncs with your MarketLoop account, so it stays available after refresh and login.</p>
        {message && <p className="mt-4 rounded-xl bg-emerald-50 p-3 font-semibold text-emerald-700">{message}</p>}
        {error && <p className="mt-4 rounded-xl bg-red-50 p-3 font-semibold text-red-700">{error}</p>}
      </section>

      {!items.length ? (
        <div className="card space-y-4">
          <p className="text-slate-500">Your cart is empty. Add some fresh groceries to get started.</p>
          <Link className="btn inline-flex" to="/">Browse products</Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="space-y-4">
            {items.map((item) => (
              <article key={item.productId} className="card flex flex-wrap items-center gap-4">
                <img
                  src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'}
                  alt={item.product?.title || 'Product'}
                  className="h-24 w-24 rounded-2xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <Link to={`/product/${item.productId}`} className="text-lg font-black text-slate-900 hover:text-brand-700">
                    {item.product?.title || 'Product'}
                  </Link>
                  <p className="mt-1 text-sm text-slate-500">{item.product?.unit || '1 pack'} • {item.product?.location || 'MarketLoop'}</p>
                  <p className="mt-2 text-xl font-black text-slate-900">{formatCurrency(item.product?.price)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" className="rounded-xl border border-slate-200 p-2" onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}>
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-bold">{item.quantity}</span>
                  <button type="button" className="rounded-xl border border-slate-200 p-2" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
                    <Plus size={16} />
                  </button>
                </div>
                <button type="button" className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50" onClick={() => removeItem(item.productId)}>
                  <Trash2 size={16} /> Remove
                </button>
              </article>
            ))}
          </section>

          <aside className="card space-y-4 lg:sticky lg:top-24 lg:self-start">
            <h2 className="text-2xl font-black text-slate-900">Order summary</h2>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Items subtotal</span>
                <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Delivery fee</span>
                <span className="font-semibold text-slate-900">{deliveryFee ? formatCurrency(deliveryFee) : 'Free'}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-black text-slate-900">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
            <button className="btn w-full justify-center" onClick={() => navigate(`/checkout?productId=${items[0].productId}&qty=${items[0].quantity}`)}>
              Checkout first item
            </button>
            <button className="btn-secondary w-full justify-center" onClick={clearCart}>
              Clear cart
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
