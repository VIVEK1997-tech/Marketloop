import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../src/models/User.js';
import Product from '../src/models/Product.js';
import Purchase from '../src/models/Purchase.js';
import Procurement from '../src/models/Procurement.js';
import QualityCheck from '../src/models/QualityCheck.js';
import InventoryItem from '../src/models/InventoryItem.js';
import InventoryMovement from '../src/models/InventoryMovement.js';
import Invoice from '../src/models/Invoice.js';
import Bill from '../src/models/Bill.js';
import AuditLog from '../src/models/AuditLog.js';
import AdminNotification from '../src/models/AdminNotification.js';
import Complaint from '../src/models/Complaint.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const sampleSellers = [
  {
    email: 'riya.sharma@marketloop.test',
    name: 'Riya Sharma',
    password: '123456',
    phone: '9898989898',
    role: 'buyer',
    roles: ['buyer'],
    activeRole: 'buyer',
    isVerified: true,
    accountStatus: 'active',
    location: {
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      address: 'HSR Layout',
      coordinates: { type: 'Point', coordinates: [77.6498, 12.9116] }
    }
  },
  {
    email: 'admin@marketloop.test',
    name: 'MarketLoop Admin',
    password: 'Admin@123',
    phone: '9000000000',
    role: 'admin',
    roles: ['admin'],
    activeRole: 'admin',
    isVerified: true,
    accountStatus: 'active',
    location: {
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      address: 'Head Office',
      coordinates: { type: 'Point', coordinates: [77.5946, 12.9716] }
    }
  },
  {
    email: 'freshfarm.bengaluru@marketloop.test',
    name: 'FreshFarm Bengaluru',
    password: '123456',
    phone: '9876501234',
    role: 'seller',
    roles: ['seller'],
    activeRole: 'seller',
    isVerified: true,
    accountStatus: 'active',
    location: {
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      address: 'Indiranagar',
      coordinates: { type: 'Point', coordinates: [77.6408, 12.9784] }
    }
  },
  {
    email: 'greenbasket.pune@marketloop.test',
    name: 'Green Basket Pune',
    password: '123456',
    phone: '9988001122',
    role: 'seller',
    roles: ['seller'],
    activeRole: 'seller',
    isVerified: false,
    accountStatus: 'kyc_pending',
    location: {
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      address: 'Koregaon Park',
      coordinates: { type: 'Point', coordinates: [73.8942, 18.5362] }
    }
  },
  {
    email: 'dailyorganics.delhi@marketloop.test',
    name: 'Daily Organics Delhi',
    password: '123456',
    phone: '9090901111',
    role: 'seller',
    roles: ['seller'],
    activeRole: 'seller',
    isVerified: true,
    accountStatus: 'inactive',
    location: {
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      address: 'Dwarka',
      coordinates: { type: 'Point', coordinates: [77.046, 28.5921] }
    }
  },
  {
    email: 'orchardhub.nashik@marketloop.test',
    name: 'Orchard Hub Nashik',
    password: '123456',
    phone: '8080804444',
    role: 'seller',
    roles: ['seller'],
    activeRole: 'seller',
    isVerified: true,
    accountStatus: 'deactivated',
    isBanned: true,
    location: {
      city: 'Nashik',
      state: 'Maharashtra',
      country: 'India',
      address: 'Wholesale Market Yard',
      coordinates: { type: 'Point', coordinates: [73.7898, 19.9975] }
    }
  }
];

const sampleProducts = [
  {
    sellerEmail: 'freshfarm.bengaluru@marketloop.test',
    title: 'Premium Alphonso Mango Box',
    description: 'Sweet Ratnagiri Alphonso mangoes packed in a fresh 3 kg box. Naturally ripened and ideal for gifting or smoothies.',
    price: 599,
    category: 'Fresh Fruits',
    location: 'Bengaluru',
    coordinates: { type: 'Point', coordinates: [77.6408, 12.9784] },
    images: ['https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=1200&q=80'],
    views: 196,
    interestCount: 28
  },
  {
    sellerEmail: 'freshfarm.bengaluru@marketloop.test',
    title: 'Farm Fresh Banana Combos',
    description: 'Fresh yellow bananas sourced the same morning, packed in easy family bundles for daily breakfast and snacks.',
    price: 79,
    category: 'Fresh Fruits',
    location: 'Bengaluru',
    coordinates: { type: 'Point', coordinates: [77.5946, 12.9716] },
    images: ['https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&w=1200&q=80'],
    views: 144,
    interestCount: 19
  },
  {
    sellerEmail: 'freshfarm.bengaluru@marketloop.test',
    title: 'Juicy Nagpur Orange Pack',
    description: 'Bright and sweet oranges with thin peel and rich juice content, handpicked for direct kitchen use.',
    price: 149,
    category: 'Fresh Fruits',
    location: 'Mysuru',
    coordinates: { type: 'Point', coordinates: [76.6394, 12.2958] },
    images: ['https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=1200&q=80'],
    views: 112,
    interestCount: 15
  },
  {
    sellerEmail: 'greenbasket.pune@marketloop.test',
    title: 'Daily Vegetable Essentials Basket',
    description: 'Tomato, onion, potato, capsicum, cucumber and cauliflower packed as a ready home-cooking combo for the week.',
    price: 249,
    category: 'Fresh Vegetables',
    location: 'Pune',
    coordinates: { type: 'Point', coordinates: [73.8942, 18.5362] },
    images: ['https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80'],
    views: 188,
    interestCount: 24
  },
  {
    sellerEmail: 'greenbasket.pune@marketloop.test',
    title: 'Hydroponic Lettuce and Spinach Pack',
    description: 'Tender spinach leaves with crisp lettuce, cleaned and packed to help buyers start quick salads and wraps.',
    price: 119,
    category: 'Leafy Greens',
    location: 'Pune',
    coordinates: { type: 'Point', coordinates: [73.8567, 18.5204] },
    images: ['https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=1200&q=80'],
    views: 126,
    interestCount: 18
  },
  {
    sellerEmail: 'greenbasket.pune@marketloop.test',
    title: 'Root Vegetable Value Pack',
    description: 'Carrot, beetroot, radish and potatoes bundled together for curry prep, roasting, and weekly meal plans.',
    price: 169,
    category: 'Root Vegetables',
    location: 'Mumbai',
    coordinates: { type: 'Point', coordinates: [72.8777, 19.076] },
    images: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=1200&q=80'],
    views: 137,
    interestCount: 17
  },
  {
    sellerEmail: 'dailyorganics.delhi@marketloop.test',
    title: 'Imported Kiwi and Avocado Duo',
    description: 'Premium imported kiwi and creamy avocados packed carefully for breakfast bowls and healthy snacking.',
    price: 329,
    category: 'Exotic Fruits',
    location: 'Delhi',
    coordinates: { type: 'Point', coordinates: [77.209, 28.6139] },
    images: ['https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=1200&q=80'],
    views: 158,
    interestCount: 22
  },
  {
    sellerEmail: 'dailyorganics.delhi@marketloop.test',
    title: 'Coriander Mint and Curry Leaves Kit',
    description: 'Fresh herb trio for chutneys, garnishing, and daily Indian cooking, bundled in breathable packaging.',
    price: 69,
    category: 'Herbs & Seasonings',
    location: 'Delhi',
    coordinates: { type: 'Point', coordinates: [77.1025, 28.7041] },
    images: ['https://images.unsplash.com/photo-1466637574441-749b8f19452f?auto=format&fit=crop&w=1200&q=80'],
    views: 119,
    interestCount: 16
  },
  {
    sellerEmail: 'dailyorganics.delhi@marketloop.test',
    title: 'Sprouts and Salad Bowl Combo',
    description: 'Ready-to-eat moong sprouts, cucumber, cherry tomato, and salad leaves for clean, protein-rich meals.',
    price: 189,
    category: 'Salads & Sprouts',
    location: 'Noida',
    coordinates: { type: 'Point', coordinates: [77.391, 28.5355] },
    images: ['https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80'],
    views: 141,
    interestCount: 21
  },
  {
    sellerEmail: 'dailyorganics.delhi@marketloop.test',
    title: 'Certified Organic Veggie Basket',
    description: 'Certified organic tomatoes, cucumbers, spinach, and carrots from trusted growers with residue-free handling.',
    price: 289,
    category: 'Organic Produce',
    location: 'Delhi',
    coordinates: { type: 'Point', coordinates: [77.046, 28.5921] },
    images: ['https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80'],
    views: 176,
    interestCount: 25
  },
  {
    sellerEmail: 'freshfarm.bengaluru@marketloop.test',
    title: 'Seasonal Watermelon Whole Fruit',
    description: 'Large ripe watermelon with deep red flesh and high sweetness, selected for summer hydration and family use.',
    price: 129,
    category: 'Fresh Fruits',
    location: 'Bengaluru',
    coordinates: { type: 'Point', coordinates: [77.6408, 12.9784] },
    images: ['https://images.unsplash.com/photo-1563114773-84221bd62daa?auto=format&fit=crop&w=1200&q=80'],
    views: 103,
    interestCount: 12
  },
  {
    sellerEmail: 'greenbasket.pune@marketloop.test',
    title: 'Cauliflower and Broccoli Fresh Cut Pack',
    description: 'Tight florets packed with insulation for home deliveries, useful for stir-fries, curries, and salads.',
    price: 139,
    category: 'Fresh Vegetables',
    location: 'Pune',
    coordinates: { type: 'Point', coordinates: [73.8942, 18.5362] },
    images: ['https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1200&q=80'],
    views: 97,
    interestCount: 11
  },
  {
    sellerEmail: 'greenbasket.pune@marketloop.test',
    title: 'Baby Spinach Premium Pack',
    description: 'Soft baby spinach leaves washed and packed for smoothies, saag, soups, and quick healthy meals.',
    price: 99,
    category: 'Leafy Greens',
    location: 'Mumbai',
    coordinates: { type: 'Point', coordinates: [72.8331, 19.1197] },
    images: ['https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=1200&q=80'],
    views: 88,
    interestCount: 10
  },
  {
    sellerEmail: 'dailyorganics.delhi@marketloop.test',
    title: 'Organic Apple and Pear Combo',
    description: 'Certified organic apples and pears with crisp bite and careful cold-chain handling for premium households.',
    price: 349,
    category: 'Organic Produce',
    location: 'Gurugram',
    coordinates: { type: 'Point', coordinates: [77.0266, 28.4595] },
    images: ['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=1200&q=80'],
    views: 124,
    interestCount: 18
  }
];

const mandiRateItems = [
  { name: 'Potato', price: 20, group: 'Basic Vegetables', category: 'Fresh Vegetables' },
  { name: 'Onion', price: 25, group: 'Basic Vegetables', category: 'Fresh Vegetables' },
  { name: 'Tomato', price: 22, group: 'Basic Vegetables', category: 'Fresh Vegetables' },
  { name: 'Brinjal', price: 30, group: 'Basic Vegetables', category: 'Fresh Vegetables' },
  { name: 'Ladyfinger (Bhindi)', price: 35, group: 'Basic Vegetables', category: 'Fresh Vegetables' },
  { name: 'Capsicum', price: 55, group: 'Basic Vegetables', category: 'Fresh Vegetables' },
  { name: 'Green Chilli', price: 60, group: 'Basic Vegetables', category: 'Herbs & Seasonings' },
  { name: 'Cabbage', price: 20, group: 'Basic Vegetables', category: 'Fresh Vegetables' },
  { name: 'Cauliflower', price: 30, group: 'Basic Vegetables', category: 'Fresh Vegetables' },
  { name: 'Peas', price: 40, group: 'Basic Vegetables', category: 'Fresh Vegetables' },
  { name: 'Carrot', price: 30, group: 'Root Vegetables', category: 'Root Vegetables' },
  { name: 'Radish', price: 20, group: 'Root Vegetables', category: 'Root Vegetables' },
  { name: 'Beetroot', price: 28, group: 'Root Vegetables', category: 'Root Vegetables' },
  { name: 'Turnip', price: 25, group: 'Root Vegetables', category: 'Root Vegetables' },
  { name: 'Sweet Potato', price: 35, group: 'Root Vegetables', category: 'Root Vegetables' },
  { name: 'Yam (Suran)', price: 50, group: 'Root Vegetables', category: 'Root Vegetables' },
  { name: 'Spinach (Palak)', price: 15, group: 'Leafy Vegetables', category: 'Leafy Greens' },
  { name: 'Fenugreek (Methi)', price: 20, group: 'Leafy Vegetables', category: 'Leafy Greens' },
  { name: 'Mustard Leaves (Sarson)', price: 20, group: 'Leafy Vegetables', category: 'Leafy Greens' },
  { name: 'Coriander', price: 30, group: 'Leafy Vegetables', category: 'Leafy Greens' },
  { name: 'Mint', price: 25, group: 'Leafy Vegetables', category: 'Leafy Greens' },
  { name: 'Bottle Gourd (Lauki)', price: 25, group: 'Gourd Vegetables', category: 'Fresh Vegetables' },
  { name: 'Ridge Gourd (Tori)', price: 40, group: 'Gourd Vegetables', category: 'Fresh Vegetables' },
  { name: 'Sponge Gourd', price: 40, group: 'Gourd Vegetables', category: 'Fresh Vegetables' },
  { name: 'Bitter Gourd (Karela)', price: 50, group: 'Gourd Vegetables', category: 'Fresh Vegetables' },
  { name: 'Pumpkin', price: 25, group: 'Gourd Vegetables', category: 'Fresh Vegetables' },
  { name: 'Ash Gourd (Petha)', price: 20, group: 'Gourd Vegetables', category: 'Fresh Vegetables' },
  { name: 'Snake Gourd', price: 40, group: 'Gourd Vegetables', category: 'Fresh Vegetables' },
  { name: 'French Beans', price: 60, group: 'Beans & Pods', category: 'Fresh Vegetables' },
  { name: 'Cluster Beans (Gawar)', price: 50, group: 'Beans & Pods', category: 'Fresh Vegetables' },
  { name: 'Broad Beans', price: 60, group: 'Beans & Pods', category: 'Fresh Vegetables' },
  { name: 'Drumstick', price: 70, group: 'Beans & Pods', category: 'Fresh Vegetables' },
  { name: 'Garlic', price: 130, group: 'Bulb / Spice Vegetables', category: 'Herbs & Seasonings' },
  { name: 'Ginger', price: 90, group: 'Bulb / Spice Vegetables', category: 'Herbs & Seasonings' },
  { name: 'Spring Onion', price: 35, group: 'Bulb / Spice Vegetables', category: 'Herbs & Seasonings' },
  { name: 'Broccoli', price: 80, group: 'Exotic / Other Vegetables', category: 'Fresh Vegetables' },
  { name: 'Zucchini', price: 90, group: 'Exotic / Other Vegetables', category: 'Fresh Vegetables' },
  { name: 'Lettuce', price: 60, group: 'Exotic / Other Vegetables', category: 'Leafy Greens' },
  { name: 'Mushroom', price: 100, group: 'Exotic / Other Vegetables', category: 'Fresh Vegetables' },
  { name: 'Baby Corn', price: 80, group: 'Exotic / Other Vegetables', category: 'Fresh Vegetables' },
  { name: 'Apple', price: 160, group: 'Common Fruits', category: 'Fresh Fruits' },
  { name: 'Banana', price: 40, group: 'Common Fruits', category: 'Fresh Fruits' },
  { name: 'Mango', price: 70, group: 'Common Fruits', category: 'Fresh Fruits' },
  { name: 'Orange', price: 80, group: 'Common Fruits', category: 'Fresh Fruits' },
  { name: 'Grapes', price: 90, group: 'Common Fruits', category: 'Fresh Fruits' },
  { name: 'Papaya', price: 40, group: 'Common Fruits', category: 'Fresh Fruits' },
  { name: 'Pineapple', price: 100, group: 'Common Fruits', category: 'Fresh Fruits' },
  { name: 'Pomegranate', price: 150, group: 'Common Fruits', category: 'Fresh Fruits' },
  { name: 'Guava', price: 50, group: 'Indian Fruits', category: 'Fresh Fruits' },
  { name: 'Chikoo', price: 60, group: 'Indian Fruits', category: 'Fresh Fruits' },
  { name: 'Custard Apple', price: 80, group: 'Indian Fruits', category: 'Fresh Fruits' },
  { name: 'Amla', price: 60, group: 'Indian Fruits', category: 'Fresh Fruits' },
  { name: 'Jamun', price: 70, group: 'Indian Fruits', category: 'Fresh Fruits' },
  { name: 'Ber', price: 40, group: 'Indian Fruits', category: 'Fresh Fruits' },
  { name: 'Bael', price: 50, group: 'Indian Fruits', category: 'Fresh Fruits' },
  { name: 'Lemon', price: 80, group: 'Citrus Fruits', category: 'Fresh Fruits' },
  { name: 'Sweet Lime (Mosambi)', price: 70, group: 'Citrus Fruits', category: 'Fresh Fruits' },
  { name: 'Watermelon', price: 20, group: 'Melons', category: 'Fresh Fruits' },
  { name: 'Muskmelon', price: 30, group: 'Melons', category: 'Fresh Fruits' },
  { name: 'Coconut', price: 35, group: 'Dry / Tropical Fruits', category: 'Fresh Fruits', unit: 'piece' },
  { name: 'Dates', price: 120, group: 'Dry / Tropical Fruits', category: 'Fresh Fruits' },
  { name: 'Fig (Anjeer)', price: 200, group: 'Dry / Tropical Fruits', category: 'Fresh Fruits' },
  { name: 'Kiwi', price: 250, group: 'Exotic Fruits', category: 'Exotic Fruits' },
  { name: 'Dragon Fruit', price: 120, group: 'Exotic Fruits', category: 'Exotic Fruits' },
  { name: 'Strawberry', price: 200, group: 'Exotic Fruits', category: 'Exotic Fruits' },
  { name: 'Blueberry', price: 400, group: 'Exotic Fruits', category: 'Exotic Fruits' }
];

const sellerByCategory = {
  'Fresh Fruits': 'freshfarm.bengaluru@marketloop.test',
  'Fresh Vegetables': 'greenbasket.pune@marketloop.test',
  'Root Vegetables': 'greenbasket.pune@marketloop.test',
  'Leafy Greens': 'greenbasket.pune@marketloop.test',
  'Herbs & Seasonings': 'dailyorganics.delhi@marketloop.test',
  'Exotic Fruits': 'dailyorganics.delhi@marketloop.test'
};

const locationByCategory = {
  'Fresh Fruits': { location: 'Bengaluru', coordinates: [77.6408, 12.9784] },
  'Fresh Vegetables': { location: 'Pune', coordinates: [73.8942, 18.5362] },
  'Root Vegetables': { location: 'Mumbai', coordinates: [72.8777, 19.076] },
  'Leafy Greens': { location: 'Pune', coordinates: [73.8567, 18.5204] },
  'Herbs & Seasonings': { location: 'Delhi', coordinates: [77.1025, 28.7041] },
  'Exotic Fruits': { location: 'Delhi', coordinates: [77.209, 28.6139] }
};

const imageQueryMap = {
  'Ladyfinger (Bhindi)': 'okra',
  'Yam (Suran)': 'yam vegetable',
  'Spinach (Palak)': 'spinach leaves',
  'Fenugreek (Methi)': 'fenugreek leaves',
  'Mustard Leaves (Sarson)': 'mustard greens',
  'Bottle Gourd (Lauki)': 'bottle gourd',
  'Ridge Gourd (Tori)': 'ridge gourd',
  'Bitter Gourd (Karela)': 'bitter gourd',
  'Ash Gourd (Petha)': 'ash gourd',
  'Cluster Beans (Gawar)': 'cluster beans',
  'Fig (Anjeer)': 'fig fruit',
  'Sweet Lime (Mosambi)': 'sweet lime fruit'
};

const buildProduceImageUrl = (name) => {
  const query = encodeURIComponent(imageQueryMap[name] || name.replace(/\([^)]*\)/g, '').trim());
  return `https://source.unsplash.com/900x700/?${query},fresh-produce`;
};

const mandiRateProducts = mandiRateItems.map((item, index) => {
  const listingLocation = locationByCategory[item.category] || locationByCategory['Fresh Vegetables'];
  const unitLabel = item.unit === 'piece' ? 'piece' : 'kg';

  return {
    sellerEmail: sellerByCategory[item.category] || 'greenbasket.pune@marketloop.test',
    title: `${item.name} - 1 ${unitLabel}`,
    description: `${item.name} from the ${item.group} mandi rate list. Fresh local stock listed at Rs. ${item.price} per ${unitLabel}.`,
    price: item.price,
    unit: 'Kg',
    category: item.category,
    location: listingLocation.location,
    coordinates: { type: 'Point', coordinates: listingLocation.coordinates },
    images: [buildProduceImageUrl(item.name)],
    views: 70 + (index % 95),
    interestCount: 8 + (index % 24)
  };
});

const allProducts = [...sampleProducts, ...mandiRateProducts];

const samplePurchases = [
  {
    purchaseId: 'PUR-301',
    supplierName: 'Nashik Wholesale Hub',
    contactDetails: '9977001122',
    productName: 'Onion',
    category: 'Vegetables',
    quantityPurchased: 80,
    unit: 'Quintal',
    purchasePrice: 1520,
    totalCost: 121600,
    purchaseDate: new Date('2026-04-20T10:00:00+05:30'),
    expectedDeliveryDate: new Date('2026-04-24T10:00:00+05:30'),
    purchaseStatus: 'ordered',
    paymentStatus: 'pending',
    invoiceStatus: 'pending',
    billStatus: 'unpaid'
  },
  {
    purchaseId: 'PUR-302',
    supplierName: 'Kolar Fruit Traders',
    contactDetails: '9988776655',
    productName: 'Mango',
    category: 'Fruits',
    quantityPurchased: 45,
    unit: 'Crate',
    purchasePrice: 820,
    totalCost: 36900,
    purchaseDate: new Date('2026-04-17T10:00:00+05:30'),
    expectedDeliveryDate: new Date('2026-04-21T10:00:00+05:30'),
    receivedDate: new Date('2026-04-21T12:00:00+05:30'),
    purchaseStatus: 'received',
    paymentStatus: 'paid',
    invoiceStatus: 'generated',
    billStatus: 'paid'
  }
];

const sampleProcurements = [
  {
    procurementId: 'PROC-91',
    supplierName: 'Kolar Fruit Traders',
    requestTitle: 'Summer mango sourcing',
    status: 'approved',
    quantityPlan: '600 Crates',
    expectedVsActual: '420 / 600',
    qualityScore: 4.6,
    deliveryScore: 4.2,
    priceCompetitiveness: 4.4,
    rejectionRate: 3.2,
    location: 'Kolar',
    season: 'Summer'
  },
  {
    procurementId: 'PROC-92',
    supplierName: 'Azadpur Veg Aggregator',
    requestTitle: 'Leafy greens weekly plan',
    status: 'partially received',
    quantityPlan: '350 Kg',
    expectedVsActual: '210 / 350',
    qualityScore: 4.1,
    deliveryScore: 3.9,
    priceCompetitiveness: 4.0,
    rejectionRate: 5.8,
    location: 'Delhi',
    season: 'All season'
  }
];

const sampleQualityChecks = [
  {
    inspectionId: 'QC-441',
    productName: 'Strawberry',
    supplierName: 'Kolar Fruit Traders',
    batchNumber: 'ST-APR-21',
    procurementReference: 'PROC-91',
    purchaseReference: 'PUR-302',
    inspectionDate: new Date('2026-04-21T09:00:00+05:30'),
    inspectorName: 'Neha (QI)',
    qualityStatus: 'red',
    freshnessRating: 2,
    ripenessLevel: 'Overripe',
    damageLevel: 'High',
    sizeWeightCompliance: 'Fail',
    appearanceCondition: 'Bruised',
    smellCondition: 'Fermented',
    shelfLifeEstimate: '1 day',
    remarks: 'Reject and return to supplier'
  },
  {
    inspectionId: 'QC-442',
    productName: 'Spinach',
    supplierName: 'Azadpur Veg Aggregator',
    batchNumber: 'SG-209',
    procurementReference: 'PROC-92',
    purchaseReference: 'PUR-301',
    inspectionDate: new Date('2026-04-22T09:00:00+05:30'),
    inspectorName: 'Aman (QI)',
    qualityStatus: 'orange',
    freshnessRating: 3,
    ripenessLevel: 'Fresh',
    damageLevel: 'Moderate',
    sizeWeightCompliance: 'Pass',
    appearanceCondition: 'Slight wilting',
    smellCondition: 'Normal',
    shelfLifeEstimate: '2 days',
    remarks: 'Discount sale recommended'
  },
  {
    inspectionId: 'QC-443',
    productName: 'Banana',
    supplierName: 'Nashik Wholesale Hub',
    batchNumber: 'BN-144',
    procurementReference: 'PROC-91',
    purchaseReference: 'PUR-301',
    inspectionDate: new Date('2026-04-22T11:00:00+05:30'),
    inspectorName: 'Aman (QI)',
    qualityStatus: 'green',
    freshnessRating: 5,
    ripenessLevel: 'Ready',
    damageLevel: 'Low',
    sizeWeightCompliance: 'Pass',
    appearanceCondition: 'Bright yellow',
    smellCondition: 'Sweet',
    shelfLifeEstimate: '4 days',
    remarks: 'Approved for sale'
  }
];

const sampleInventory = [
  {
    inventoryId: 'INV-7001',
    sku: 'BAN-001',
    batchNumber: 'BN-144',
    productName: 'Banana',
    category: 'Fruits',
    quantityInStock: 540,
    reservedQuantity: 120,
    availableQuantity: 420,
    incomingQuantity: 210,
    damagedQuantity: 8,
    rejectedQuantity: 0,
    unitType: 'Kg',
    warehouseLocation: 'Bengaluru A',
    purchaseSource: 'PUR-301',
    expiryDate: new Date('2026-04-26T00:00:00+05:30'),
    freshnessStatus: 'green',
    reorderLevel: 150
  },
  {
    inventoryId: 'INV-7002',
    sku: 'SPN-024',
    batchNumber: 'SG-209',
    productName: 'Spinach',
    category: 'Vegetables',
    quantityInStock: 62,
    reservedQuantity: 24,
    availableQuantity: 38,
    incomingQuantity: 0,
    damagedQuantity: 5,
    rejectedQuantity: 3,
    unitType: 'Bunch',
    warehouseLocation: 'Pune Cold Room',
    purchaseSource: 'PUR-301',
    expiryDate: new Date('2026-04-24T00:00:00+05:30'),
    freshnessStatus: 'orange',
    reorderLevel: 50
  }
];

const sampleMovements = [
  { movementId: 'MOV-1', movementType: 'Inward', itemName: 'Banana', quantity: '210 Kg', location: 'Bengaluru A', reference: 'PUR-301' },
  { movementId: 'MOV-2', movementType: 'Adjustment', itemName: 'Spinach', quantity: '-5 Bunch', location: 'Pune Cold Room', reference: 'QC-442' },
  { movementId: 'MOV-3', movementType: 'Wastage', itemName: 'Strawberry', quantity: '-12 Crates', location: 'Delhi Premium Bay', reference: 'QC-441' }
];

const sampleInvoices = [
  {
    invoiceNumber: 'INV-S-240423-0182',
    invoiceType: 'customer',
    linkedReference: 'ORD-5001',
    partyName: 'Riya Sharma',
    total: 1280,
    issueDate: new Date('2026-04-22T12:00:00+05:30'),
    dueDate: new Date('2026-04-25T12:00:00+05:30'),
    status: 'paid',
    buyerEmail: 'riya.sharma@marketloop.test',
    sellerEmail: 'freshfarm.bengaluru@marketloop.test',
    buyer: {
      name: 'Riya Sharma',
      email: 'riya.sharma@marketloop.test',
      phone: '9898989898',
      addressLine: 'HSR Layout',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India'
    },
    seller: {
      name: 'FreshFarm Bengaluru',
      email: 'freshfarm.bengaluru@marketloop.test',
      phone: '9876501234',
      gstNumber: '29ABCDE1234F1Z5',
      addressLine: 'Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India'
    },
    lineItems: [
      {
        itemName: 'Seasonal Watermelon Whole Fruit',
        quantity: 8,
        unit: 'Kg',
        rate: 140,
        grossAmount: 1120,
        discount: 40,
        offerLabel: 'Summer saver offer',
        hsnCode: '08071100',
        taxableAmount: 1080,
        taxRate: 5,
        taxAmount: 54,
        total: 1134
      }
    ],
    taxSummary: {
      grossAmount: 1120,
      discountTotal: 40,
      taxableAmount: 1080,
      cgstRate: 2.5,
      cgstAmount: 27,
      sgstRate: 2.5,
      sgstAmount: 27,
      igstRate: 0,
      igstAmount: 0,
      totalTax: 54,
      additionalCharges: 46,
      deliveryCharges: 100,
      grandTotal: 1280
    },
    meta: {
      currency: 'INR',
      placeOfSupply: 'Karnataka'
    }
  },
  {
    invoiceNumber: 'INV-P-240423-0091',
    invoiceType: 'purchase',
    linkedReference: 'PUR-301',
    partyName: 'Nashik Wholesale Hub',
    total: 121600,
    issueDate: new Date('2026-04-20T12:00:00+05:30'),
    dueDate: new Date('2026-04-24T12:00:00+05:30'),
    status: 'pending',
    buyerEmail: 'admin@marketloop.test',
    seller: {
      name: 'Nashik Wholesale Hub',
      email: 'nashik-wholesale@example.com',
      phone: '9977001122',
      gstNumber: '27ABCDE1234F1Z5',
      addressLine: 'Agriculture Yard',
      city: 'Nashik',
      state: 'Maharashtra',
      country: 'India'
    },
    buyer: {
      name: 'MarketLoop Admin',
      email: 'admin@marketloop.test',
      phone: '9000000000',
      gstNumber: '29ABCDE1234F1Z5',
      addressLine: 'Head Office',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India'
    },
    lineItems: [
      {
        itemName: 'Onion bulk lot',
        quantity: 80,
        unit: 'Quintal',
        rate: 1520,
        grossAmount: 121600,
        discount: 2000,
        offerLabel: 'Bulk procurement rate',
        hsnCode: '07031010',
        taxableAmount: 119600,
        taxRate: 5,
        taxAmount: 5980,
        total: 125580
      }
    ],
    taxSummary: {
      grossAmount: 121600,
      discountTotal: 2000,
      taxableAmount: 119600,
      cgstRate: 0,
      cgstAmount: 0,
      sgstRate: 0,
      sgstAmount: 0,
      igstRate: 5,
      igstAmount: 5980,
      totalTax: 5980,
      additionalCharges: 0,
      deliveryCharges: 20,
      grandTotal: 125600
    },
    meta: {
      linkedPurchaseId: 'PUR-301',
      currency: 'INR',
      placeOfSupply: 'Karnataka'
    }
  }
];

const sampleBills = [
  {
    billId: 'BILL-8001',
    linkedReference: 'INV-P-240423-0091',
    partyName: 'Nashik Wholesale Hub',
    billAmount: 121600,
    taxAmount: 6080,
    dueDate: new Date('2026-04-24T12:00:00+05:30'),
    paymentMode: 'Bank transfer',
    paymentStatus: 'pending'
  },
  {
    billId: 'BILL-8002',
    linkedReference: 'INV-P-240423-0082',
    partyName: 'Kolar Fruit Traders',
    billAmount: 36900,
    taxAmount: 1845,
    dueDate: new Date('2026-04-18T12:00:00+05:30'),
    paymentMode: 'UPI',
    paymentReference: 'UPI923401',
    paymentStatus: 'paid',
    paymentDate: new Date('2026-04-18T14:00:00+05:30')
  }
];

const sampleAuditLogs = [
  { entityType: 'Seller profile', entityId: 'SEL-2201', field: 'bankAccount', oldValue: 'XXXX2201', newValue: 'XXXX9912', updatedBy: 'admin@marketloop.test' },
  { entityType: 'Buyer profile', entityId: 'BUY-1001', field: 'phone', oldValue: '9876500000', newValue: '9876501234', updatedBy: 'support@marketloop.test' }
];

const sampleNotifications = [
  { title: 'New seller registration', detail: 'Pune Organic Yard needs approval', level: 'info' },
  { title: 'Payment failure', detail: 'Order ORD-5002 payment failed on card retry', level: 'danger' },
  { title: 'Near expiry alert', detail: 'Spinach batch SG-209 expires in 2 days', level: 'warning' }
];

const sampleComplaints = [
  { complaintId: 'CMP-1', complaintType: 'Buyer complaint', against: 'FreshFarm Bengaluru', status: 'open', note: 'Received underripe papaya in last order' },
  { complaintId: 'CMP-2', complaintType: 'Seller complaint', against: 'Riya Sharma', status: 'resolved', note: 'Disputed a delivered banana lot' }
];

const main = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  for (const sellerData of sampleSellers) {
    const existingSeller = await User.findOne({ email: sellerData.email });
    if (!existingSeller) {
      await User.create(sellerData);
      continue;
    }

    existingSeller.name = sellerData.name;
    existingSeller.phone = sellerData.phone;
    existingSeller.role = sellerData.role;
    existingSeller.roles = sellerData.roles || [sellerData.role];
    existingSeller.activeRole = sellerData.activeRole || sellerData.role;
    existingSeller.isVerified = sellerData.isVerified ?? existingSeller.isVerified;
    existingSeller.accountStatus = sellerData.accountStatus || existingSeller.accountStatus;
    existingSeller.isBanned = sellerData.isBanned ?? existingSeller.isBanned;
    existingSeller.location = sellerData.location || existingSeller.location;
    await existingSeller.save();
  }

  for (const productData of allProducts) {
    const seller = await User.findOne({ email: productData.sellerEmail });
    if (!seller) continue;

    const exists = await Product.findOne({ title: productData.title, seller: seller._id });
    const { sellerEmail, ...product } = productData;

    if (exists) {
      Object.assign(exists, { ...product, seller: seller._id });
      await exists.save();
    } else {
      await Product.create({ ...product, seller: seller._id });
    }
  }

  for (const purchase of samplePurchases) {
    await Purchase.updateOne({ purchaseId: purchase.purchaseId }, { $set: purchase }, { upsert: true });
  }

  for (const procurement of sampleProcurements) {
    await Procurement.updateOne({ procurementId: procurement.procurementId }, { $set: procurement }, { upsert: true });
  }

  for (const qualityCheck of sampleQualityChecks) {
    await QualityCheck.updateOne({ inspectionId: qualityCheck.inspectionId }, { $set: qualityCheck }, { upsert: true });
  }

  for (const inventoryItem of sampleInventory) {
    await InventoryItem.updateOne({ inventoryId: inventoryItem.inventoryId }, { $set: inventoryItem }, { upsert: true });
  }

  for (const movement of sampleMovements) {
    await InventoryMovement.updateOne({ movementId: movement.movementId }, { $set: movement }, { upsert: true });
  }

    for (const invoice of sampleInvoices) {
      const buyer = invoice.buyerEmail ? await User.findOne({ email: invoice.buyerEmail }) : null;
      const seller = invoice.sellerEmail ? await User.findOne({ email: invoice.sellerEmail }) : null;
      const { buyerEmail, sellerEmail, ...invoiceData } = invoice;
      await Invoice.updateOne(
        { invoiceNumber: invoice.invoiceNumber },
        {
          $set: {
            ...invoiceData,
            buyer: {
              ...invoiceData.buyer,
              ...(buyer?._id ? { user: buyer._id } : {})
            },
            seller: {
              ...invoiceData.seller,
              ...(seller?._id ? { user: seller._id } : {})
            }
          }
        },
        { upsert: true }
      );
    }

  for (const bill of sampleBills) {
    await Bill.updateOne({ billId: bill.billId }, { $set: bill }, { upsert: true });
  }

  for (const log of sampleAuditLogs) {
    const exists = await AuditLog.findOne({ entityType: log.entityType, entityId: log.entityId, field: log.field, newValue: log.newValue });
    if (!exists) await AuditLog.create(log);
  }

  for (const notification of sampleNotifications) {
    const exists = await AdminNotification.findOne({ title: notification.title, detail: notification.detail });
    if (!exists) await AdminNotification.create(notification);
  }

  for (const complaint of sampleComplaints) {
    await Complaint.updateOne({ complaintId: complaint.complaintId }, { $set: complaint }, { upsert: true });
  }

  console.log(`Sample grocery marketplace data seeded successfully with ${allProducts.length} listings.`);
  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error('Sample data seeding failed:', error.message);
  await mongoose.disconnect();
  process.exit(1);
});
