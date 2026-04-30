import { create } from 'zustand';
import { userRepository } from '@/services/api/user.repository';
import { useAuthStore } from '@/store/auth-store';
import { CartEntry, MarketplaceProduct } from '@/types/models';

export interface CartItem {
  product: MarketplaceProduct;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  hydrated: boolean;
  hydrating: boolean;
  hydrateFromServer: () => Promise<void>;
  resetForGuest: () => void;
  addItem: (product: MarketplaceProduct, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  incrementItem: (productId: string) => Promise<void>;
  decrementItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getQuantity: (productId: string) => number;
}

const toCartItems = (entries: CartEntry[] = []): CartItem[] => entries
  .filter((entry) => entry?.product?._id)
  .map((entry) => ({
    product: entry.product,
    quantity: Math.max(1, Number(entry.quantity || 1))
  }));

const syncEnabled = () => Boolean(useAuthStore.getState().user?.id && useAuthStore.getState().token);

const updateLocalQuantity = (items: CartItem[], productId: string, quantity: number) => {
  if (quantity <= 0) {
    return items.filter((item) => item.product._id !== productId);
  }

  const existing = items.find((item) => item.product._id === productId);
  if (!existing) {
    return items;
  }

  return items.map((item) => (
    item.product._id === productId
      ? { ...item, quantity }
      : item
  ));
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  hydrated: false,
  hydrating: false,
  hydrateFromServer: async () => {
    if (!syncEnabled()) {
      set({ items: [], hydrated: true, hydrating: false });
      return;
    }

    set({ hydrating: true });
    try {
      const cart = await userRepository.getCart();
      set({ items: toCartItems(cart), hydrated: true, hydrating: false });
    } catch {
      set({ items: [], hydrated: true, hydrating: false });
    }
  },
  resetForGuest: () => set({ items: [], hydrated: true, hydrating: false }),
  addItem: async (product, quantity = 1) => {
    const safeQuantity = Math.max(1, Number(quantity || 1));
    const previousItems = get().items;
    const existing = previousItems.find((item) => item.product._id === product._id);
    const nextItems = existing
      ? previousItems.map((item) => (
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + safeQuantity }
            : item
        ))
      : [...previousItems, { product, quantity: safeQuantity }];

    set({ items: nextItems });

    if (!syncEnabled()) return;

    try {
      const serverCart = await userRepository.updateCartItem(product._id, existing ? existing.quantity + safeQuantity : safeQuantity);
      set({ items: toCartItems(serverCart) });
    } catch {
      set({ items: previousItems });
      throw new Error('Unable to sync cart right now.');
    }
  },
  removeItem: async (productId) => {
    const previousItems = get().items;
    set({ items: previousItems.filter((item) => item.product._id !== productId) });

    if (!syncEnabled()) return;

    try {
      const serverCart = await userRepository.removeCartItem(productId);
      set({ items: toCartItems(serverCart) });
    } catch {
      set({ items: previousItems });
      throw new Error('Unable to remove this item from the cart right now.');
    }
  },
  incrementItem: async (productId) => {
    const previousItems = get().items;
    const target = previousItems.find((item) => item.product._id === productId);
    if (!target) return;

    const nextQuantity = target.quantity + 1;
    set({ items: updateLocalQuantity(previousItems, productId, nextQuantity) });

    if (!syncEnabled()) return;

    try {
      const serverCart = await userRepository.updateCartItem(productId, nextQuantity);
      set({ items: toCartItems(serverCart) });
    } catch {
      set({ items: previousItems });
      throw new Error('Unable to update cart quantity right now.');
    }
  },
  decrementItem: async (productId) => {
    const previousItems = get().items;
    const target = previousItems.find((item) => item.product._id === productId);
    if (!target) return;

    const nextQuantity = target.quantity - 1;
    set({ items: updateLocalQuantity(previousItems, productId, nextQuantity) });

    if (!syncEnabled()) return;

    try {
      const serverCart = nextQuantity > 0
        ? await userRepository.updateCartItem(productId, nextQuantity)
        : await userRepository.removeCartItem(productId);
      set({ items: toCartItems(serverCart) });
    } catch {
      set({ items: previousItems });
      throw new Error('Unable to update cart quantity right now.');
    }
  },
  clearCart: async () => {
    const previousItems = get().items;
    set({ items: [] });

    if (!syncEnabled()) return;

    try {
      await userRepository.clearCart();
    } catch {
      set({ items: previousItems });
      throw new Error('Unable to clear cart right now.');
    }
  },
  getQuantity: (productId) => get().items.find((item) => item.product._id === productId)?.quantity || 0
}));
