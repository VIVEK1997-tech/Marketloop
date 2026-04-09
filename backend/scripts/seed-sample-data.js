import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Product from '../src/models/Product.js';

dotenv.config();

const sampleSellers = [
  {
    email: 'cars.seller@marketloop.test',
    name: 'City Cars Hub',
    password: '123456',
    phone: '9876543210',
    role: 'seller',
    location: {
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      address: 'HSR Layout',
      coordinates: { type: 'Point', coordinates: [77.6505, 12.9116] }
    }
  },
  {
    email: 'furniture.seller@marketloop.test',
    name: 'Urban Furniture Store',
    password: '123456',
    phone: '9988776655',
    role: 'seller',
    location: {
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      address: 'Viman Nagar',
      coordinates: { type: 'Point', coordinates: [73.9143, 18.5679] }
    }
  },
  {
    email: 'mobiles.seller@marketloop.test',
    name: 'Smartphone World',
    password: '123456',
    phone: '9090909090',
    role: 'seller',
    location: {
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      address: 'Karol Bagh',
      coordinates: { type: 'Point', coordinates: [77.1907, 28.6519] }
    }
  },
  {
    email: 'bikes.seller@marketloop.test',
    name: 'Rider Point',
    password: '123456',
    phone: '9123456780',
    role: 'seller',
    location: {
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      address: 'Madhapur',
      coordinates: { type: 'Point', coordinates: [78.3913, 17.4483] }
    }
  },
  {
    email: 'homes.seller@marketloop.test',
    name: 'Prime Homes Realty',
    password: '123456',
    phone: '9012345678',
    role: 'seller',
    location: {
      city: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      address: 'Velachery',
      coordinates: { type: 'Point', coordinates: [80.2206, 12.9759] }
    }
  },
  {
    email: 'electronics.seller@marketloop.test',
    name: 'AV Gallery',
    password: '123456',
    phone: '9345678901',
    role: 'seller',
    location: {
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      address: 'Andheri West',
      coordinates: { type: 'Point', coordinates: [72.8331, 19.1197] }
    }
  }
];

const sampleProducts = [
  {
    sellerEmail: 'cars.seller@marketloop.test',
    title: 'Mahindra Scorpio S11 2019',
    description: 'Single-owner SUV in excellent condition with service history, touchscreen infotainment, reverse camera, alloy wheels, and clean insurance record.',
    price: 1295000,
    category: 'Cars',
    location: 'Bengaluru',
    coordinates: { type: 'Point', coordinates: [77.6505, 12.9116] },
    images: [
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80'
    ],
    views: 184,
    interestCount: 23
  },
  {
    sellerEmail: 'cars.seller@marketloop.test',
    title: 'Hyundai i20 Sportz 2021',
    description: 'Petrol hatchback with company-maintained service record, push start, Apple CarPlay, and brand new tyres. Ideal for city drives.',
    price: 725000,
    category: 'Cars',
    location: 'Bengaluru',
    coordinates: { type: 'Point', coordinates: [77.5946, 12.9716] },
    images: [
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80'
    ],
    views: 143,
    interestCount: 17
  },
  {
    sellerEmail: 'cars.seller@marketloop.test',
    title: 'Honda City VX CVT 2018',
    description: 'Automatic sedan with leather seats, sunroof, complete documentation, and spotless interiors. Recently serviced and ready for transfer.',
    price: 890000,
    category: 'Cars',
    location: 'Mysuru',
    coordinates: { type: 'Point', coordinates: [76.6394, 12.2958] },
    images: [
      'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1200&q=80'
    ],
    views: 119,
    interestCount: 11
  },
  {
    sellerEmail: 'furniture.seller@marketloop.test',
    title: '6-Seater Solid Wood Dining Set',
    description: 'Premium sheesham wood dining table with six cushioned chairs. Minimal scratches, polished finish, and perfect for family homes.',
    price: 28500,
    category: 'Furniture',
    location: 'Pune',
    coordinates: { type: 'Point', coordinates: [73.9143, 18.5679] },
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'
    ],
    views: 98,
    interestCount: 14
  },
  {
    sellerEmail: 'furniture.seller@marketloop.test',
    title: 'Modern Office Workstation Desk',
    description: 'Engineered wood office desk with cable management, side storage, and sturdy metal legs. Great for WFH setups or small offices.',
    price: 8200,
    category: 'Furniture',
    location: 'Pune',
    coordinates: { type: 'Point', coordinates: [73.8567, 18.5204] },
    images: [
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80'
    ],
    views: 121,
    interestCount: 19
  },
  {
    sellerEmail: 'furniture.seller@marketloop.test',
    title: 'L-Shaped Sofa with Storage',
    description: 'Comfortable grey fabric sofa with hidden storage, detachable cushions, and spacious seating. Only 10 months old.',
    price: 33500,
    category: 'Furniture',
    location: 'Mumbai',
    coordinates: { type: 'Point', coordinates: [72.8777, 19.076] },
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80'
    ],
    views: 167,
    interestCount: 26
  },
  {
    sellerEmail: 'mobiles.seller@marketloop.test',
    title: 'iPhone 13 128GB Midnight',
    description: 'Excellent condition iPhone 13 with original box, 89% battery health, scratch-free display, and clean bill. Ideal for premium users.',
    price: 42999,
    category: 'Mobiles',
    location: 'Delhi',
    coordinates: { type: 'Point', coordinates: [77.209, 28.6139] },
    images: [
      'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=1200&q=80'
    ],
    views: 211,
    interestCount: 31
  },
  {
    sellerEmail: 'mobiles.seller@marketloop.test',
    title: 'Samsung Galaxy S23 256GB',
    description: 'Flagship Samsung phone with superb camera, AMOLED display, and original accessories. Used carefully for 8 months.',
    price: 51999,
    category: 'Mobiles',
    location: 'Noida',
    coordinates: { type: 'Point', coordinates: [77.391, 28.5355] },
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1200&q=80'
    ],
    views: 146,
    interestCount: 22
  },
  {
    sellerEmail: 'bikes.seller@marketloop.test',
    title: 'Royal Enfield Classic 350 2022',
    description: 'Well-maintained Royal Enfield with low mileage, insurance valid, recent servicing, and no accidental history.',
    price: 178000,
    category: 'Motorcycles',
    location: 'Hyderabad',
    coordinates: { type: 'Point', coordinates: [78.4867, 17.385] },
    images: [
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80'
    ],
    views: 188,
    interestCount: 29
  },
  {
    sellerEmail: 'bikes.seller@marketloop.test',
    title: 'Yamaha R15 V4 Racing Blue',
    description: 'Sporty and clean R15 V4 with brand new tyres, digital display, and complete documents. Great for enthusiasts.',
    price: 162000,
    category: 'Motorcycles',
    location: 'Hyderabad',
    coordinates: { type: 'Point', coordinates: [78.3913, 17.4483] },
    images: [
      'https://images.unsplash.com/photo-1611242320536-f12d3541249b?auto=format&fit=crop&w=1200&q=80'
    ],
    views: 132,
    interestCount: 18
  },
  {
    sellerEmail: 'homes.seller@marketloop.test',
    title: '2 BHK Apartment for Sale in Velachery',
    description: 'Spacious semi-furnished 2 BHK apartment with covered parking, modular kitchen, balcony, and 24x7 security in a prime locality.',
    price: 6850000,
    category: 'Houses',
    location: 'Chennai',
    coordinates: { type: 'Point', coordinates: [80.2206, 12.9759] },
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
    ],
    views: 94,
    interestCount: 9
  },
  {
    sellerEmail: 'homes.seller@marketloop.test',
    title: '3 BHK Ready to Move Apartment',
    description: 'Modern apartment with lift, power backup, gym access, and proximity to schools and IT parks. Clear title and bank approved.',
    price: 9200000,
    category: 'Houses',
    location: 'Chennai',
    coordinates: { type: 'Point', coordinates: [80.2707, 13.0827] },
    images: [
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80'
    ],
    views: 81,
    interestCount: 7
  },
  {
    sellerEmail: 'electronics.seller@marketloop.test',
    title: 'Sony Bravia 55-inch 4K Smart TV',
    description: 'Crystal-clear 4K UHD smart TV with Android TV, Dolby Audio, and slim bezel design. Includes wall mount and original remote.',
    price: 42900,
    category: 'Electronics',
    location: 'Mumbai',
    coordinates: { type: 'Point', coordinates: [72.8331, 19.1197] },
    images: [
      'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=1200&q=80'
    ],
    views: 154,
    interestCount: 21
  },
  {
    sellerEmail: 'electronics.seller@marketloop.test',
    title: 'JBL 5.1 Surround Soundbar',
    description: 'Powerful home theatre soundbar with wireless subwoofer, Bluetooth, HDMI ARC, and cinematic bass for movies and music.',
    price: 21900,
    category: 'Electronics',
    location: 'Mumbai',
    coordinates: { type: 'Point', coordinates: [72.8777, 19.076] },
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=80'
    ],
    views: 127,
    interestCount: 16
  },
  {
    sellerEmail: 'electronics.seller@marketloop.test',
    title: 'Canon EOS M50 Mark II Vlogging Kit',
    description: 'Mirrorless camera with kit lens, mic adapter, extra battery, and tripod. Perfect for content creators and YouTube setup.',
    price: 46800,
    category: 'Electronics',
    location: 'Navi Mumbai',
    coordinates: { type: 'Point', coordinates: [73.0297, 19.033] },
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80'
    ],
    views: 109,
    interestCount: 13
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

  console.log('Sample car and furniture data seeded successfully.');
  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error('Sample data seeding failed:', error.message);
  await mongoose.disconnect();
  process.exit(1);
});
