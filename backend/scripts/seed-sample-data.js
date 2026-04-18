import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Product from '../src/models/Product.js';

dotenv.config();

const sampleSellers = [
  {
    email: 'freshfarm.bengaluru@marketloop.test',
    name: 'FreshFarm Bengaluru',
    password: '123456',
    phone: '9876501234',
    role: 'seller',
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
    location: {
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      address: 'Dwarka',
      coordinates: { type: 'Point', coordinates: [77.046, 28.5921] }
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

const main = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  for (const sellerData of sampleSellers) {
    const existingSeller = await User.findOne({ email: sellerData.email });
    if (!existingSeller) {
      await User.create(sellerData);
    }
  }

  for (const productData of sampleProducts) {
    const seller = await User.findOne({ email: productData.sellerEmail });
    if (!seller) continue;

    const exists = await Product.findOne({ title: productData.title, seller: seller._id });
    if (exists) continue;

    const { sellerEmail, ...product } = productData;
    await Product.create({ ...product, seller: seller._id });
  }

  console.log('Sample grocery marketplace data seeded successfully.');
  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error('Sample data seeding failed:', error.message);
  await mongoose.disconnect();
  process.exit(1);
});
