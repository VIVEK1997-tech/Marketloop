export const MARKETLOOP_COLORS = {
  primary: '#22C55E',
  primaryDark: '#16A34A',
  primarySoft: '#DCFCE7',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F5F9',
  text: '#0F172A',
  textMuted: '#64748B',
  border: '#E2E8F0',
  accent: '#F59E0B',
  accentSoft: '#FEF3C7',
  dangerSoft: '#FFE4E6'
} as const;

export const CATEGORY_META: Record<string, { icon: string; tint: string }> = {
  Fruits: { icon: 'apple-alt', tint: '#FEF3C7' },
  Vegetables: { icon: 'leaf', tint: '#DCFCE7' },
  Dairy: { icon: 'tint', tint: '#DBEAFE' },
  Snacks: { icon: 'gift', tint: '#FCE7F3' },
  Beverages: { icon: 'coffee', tint: '#FDE68A' },
  Staples: { icon: 'shopping-basket', tint: '#EDE9FE' },
  Bakery: { icon: 'birthday-cake', tint: '#FEE2E2' }
};

export const formatCurrency = (amount?: number) => `Rs. ${Number(amount || 0).toFixed(0)}`;

export const getProductDiscount = (productId: string, price: number) => {
  const seed = productId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const discount = 8 + (seed % 18);
  const originalPrice = Math.round(price / (1 - discount / 100));
  return { discount, originalPrice };
};

export const getProductSubtitle = (quantity?: number, unit?: string) => {
  if (!quantity && !unit) return 'Fresh stock available';
  return `${quantity || 1} ${unit || 'unit'}`;
};
