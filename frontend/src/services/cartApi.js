import { api, extractApiData } from './api.js';
import { readStoredJson, readStoredValue, writeStoredJson } from '../utils/storage.js';

const CART_KEY = 'marketloop_web_cart';

const normalizeCartItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items.filter((item) =>
    item
    && typeof item === 'object'
    && typeof item.productId === 'string'
    && Number.isFinite(Number(item.quantity))
  );
};

const readCart = () => {
  return readStoredJson(CART_KEY, [], {
    validate: (value) => normalizeCartItems(value).length === value?.length
  });
};

const writeCart = (items) => {
  const normalizedItems = normalizeCartItems(items);
  writeStoredJson(CART_KEY, normalizedItems);
  window.dispatchEvent(new CustomEvent('marketloop:cart-updated', { detail: normalizedItems }));
  return normalizedItems;
};

const hasSessionToken = () => Boolean(readStoredValue('token', null));

const persistServerCart = async (productId, quantity) => {
  if (!hasSessionToken()) return null;
  const response = await api.put(`/cart/${productId}`, { quantity });
  return writeCart(extractApiData(response).cart || []);
};

const clearServerCart = async () => {
  if (!hasSessionToken()) return null;
  const response = await api.delete('/cart');
  return writeCart(extractApiData(response).cart || []);
};

const removeServerItem = async (productId) => {
  if (!hasSessionToken()) return null;
  const response = await api.delete(`/cart/${productId}`);
  return writeCart(extractApiData(response).cart || []);
};

const syncFromServer = async () => {
  if (!hasSessionToken()) return readCart();
  const response = await api.get('/cart');
  return writeCart(extractApiData(response).cart || []);
};

const syncLocalMutation = (items) => {
  const nextItems = writeCart(items);
  if (hasSessionToken()) {
    nextItems.forEach((item) => {
      persistServerCart(item.productId, item.quantity).catch(() => null);
    });
  }
  return nextItems;
};

const removeOrSync = (productId, items) => {
  const nextItems = writeCart(items);
  if (hasSessionToken()) {
    removeServerItem(productId).catch(() => null);
  }
  return nextItems;
};

const clearOrSync = () => {
  const cleared = writeCart([]);
  if (hasSessionToken()) {
    clearServerCart().catch(() => null);
  }
  return cleared;
};

export const cartApi = {
  async syncFromServer() {
    return syncFromServer();
  },

  bootstrapFromServer() {
    if (!hasSessionToken()) return Promise.resolve(readCart());
    return syncFromServer().catch(() => readCart());
  },

  clearLocalOnly() {
    return writeCart([]);
  },

  getItems() {
    return readCart();
  },

  getQuantity(productId) {
    return readCart().find((item) => item.productId === productId)?.quantity || 0;
  },

  addItem(product, quantity = 1) {
    const items = readCart();
    const existing = items.find((item) => item.productId === product._id);

    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({
        productId: product._id,
        quantity,
        product: {
          _id: product._id,
          title: product.title,
          price: product.price,
          unit: product.unit,
          images: product.images,
          location: product.location,
          category: product.category,
          seller: product.seller
        }
      });
    }

    const nextItems = writeCart(items);
    if (hasSessionToken()) {
      persistServerCart(product._id, nextItems.find((item) => item.productId === product._id)?.quantity || quantity).catch(() => null);
    }
    return nextItems;
  },

  updateQuantity(productId, quantity) {
    if (quantity <= 0) {
      const items = readCart().filter((item) => item.productId !== productId);
      return removeOrSync(productId, items);
    }

    const items = readCart().map((item) => (item.productId === productId ? { ...item, quantity } : item));
    const nextItems = writeCart(items);
    if (hasSessionToken()) {
      persistServerCart(productId, quantity).catch(() => null);
    }
    return nextItems;
  },

  clear() {
    return clearOrSync();
  }
};
