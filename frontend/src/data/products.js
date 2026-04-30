import { groceryCategoryMap } from '../utils/groceryData.js';

const defaultImage =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80';

const keywordImageMap = [
  {
    match: ['blueberry', 'berries'],
    image: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=900&q=80'
  },
  {
    match: ['strawberry'],
    image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=900&q=80'
  },
  {
    match: ['dragon fruit', 'dragonfruit'],
    image: 'https://images.unsplash.com/photo-1526318472351-c75fcf070305?auto=format&fit=crop&w=900&q=80'
  },
  {
    match: ['banana'],
    image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&w=900&q=80'
  },
  {
    match: ['tomato'],
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=900&q=80'
  },
  {
    match: ['milk'],
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=900&q=80'
  },
  {
    match: ['bread', 'loaf'],
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80'
  },
  {
    match: ['egg', 'eggs'],
    image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=900&q=80'
  },
  {
    match: ['apple'],
    image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=900&q=80'
  },
  {
    match: ['orange'],
    image: 'https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?auto=format&fit=crop&w=900&q=80'
  },
  {
    match: ['onion'],
    image: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=900&q=80'
  },
  {
    match: ['spinach', 'palak'],
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=900&q=80'
  }
];

export const homeCategoryChips = [
  { label: 'Fruits', type: 'category', value: 'Fresh Fruits' },
  { label: 'Vegetables', type: 'category', value: 'Fresh Vegetables' },
  { label: 'Dairy', type: 'keyword', value: 'milk' },
  { label: 'Snacks', type: 'keyword', value: 'snacks' },
  { label: 'Staples', type: 'keyword', value: 'rice' },
  { label: 'Beverages', type: 'keyword', value: 'juice' }
];

export const promoBanners = [
  {
    id: 'flash',
    eyebrow: 'Flash deals',
    title: 'Up to 25% off on premium fruits today',
    body: 'Blueberries, dragon fruit, and seasonal imports from trusted local sellers.',
    cta: 'Shop fruit deals',
    tone: 'from-emerald-600 via-green-500 to-lime-400'
  },
  {
    id: 'daily',
    eyebrow: 'Daily essentials',
    title: 'Milk, bread, eggs and veggies delivered fast',
    body: 'Build a practical basket with staples shoppers reorder every week.',
    cta: 'Browse essentials',
    tone: 'from-slate-900 via-slate-800 to-emerald-700'
  }
];

export const resolveProductImage = (product = {}) => {
  if (product.images?.[0]) return product.images[0];

  const title = `${product.title || ''} ${product.description || ''}`.toLowerCase();
  const matched = keywordImageMap.find((entry) => entry.match.some((keyword) => title.includes(keyword)));
  if (matched) return matched.image;

  return groceryCategoryMap[product.category]?.image || defaultImage;
};

export const getProductOriginalPrice = (product = {}) => {
  const price = Number(product.price || 0);
  return Math.max(price, Math.round(price * 1.18));
};

export const getProductDiscountPercent = (product = {}) => {
  const currentPrice = Number(product.price || 0);
  const originalPrice = getProductOriginalPrice(product);
  if (!currentPrice || currentPrice >= originalPrice) return 0;
  return Math.max(1, Math.round(((originalPrice - currentPrice) / originalPrice) * 100));
};

export const getSellerPill = (product = {}) =>
  product.seller?.name || product.category || 'MarketLoop seller';

