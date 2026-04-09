import Product from '../models/Product.js';
import { collectImageUrls } from '../utils/uploadImages.js';

const parseNumber = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const normalized = typeof value === 'string' ? value.trim() : value;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const categoryAliases = {
  mobiles: ['mobile', 'mobiles', 'mobile phone', 'mobile phones', 'smartphone', 'smartphones', 'phone', 'phones'],
  motorcycles: ['motorcycle', 'motorcycles', 'bike', 'bikes', 'scooter', 'scooters'],
  cars: ['car', 'cars', 'vehicle', 'vehicles'],
  furniture: ['furniture', 'sofa', 'table', 'chair', 'bed', 'wardrobe'],
  electronics: ['electronics', 'electronic', 'tv', 'tvs', 'video', 'audio', 'tv audio', 'tv video audio', 'tvs video audio', 'camera', 'soundbar'],
  houses: ['house', 'houses', 'apartment', 'apartments', 'flat', 'flats', 'property', 'properties', 'home', 'homes']
};

const canonicalCategoryMap = {
  mobiles: 'Mobiles',
  motorcycles: 'Motorcycles',
  cars: 'Cars',
  furniture: 'Furniture',
  electronics: 'Electronics',
  houses: 'Houses'
};

const normalizeCategoryValue = (value = '') => {
  const normalized = value.trim().toLowerCase();
  const match = Object.entries(categoryAliases).find(([, aliases]) => aliases.includes(normalized));
  return match ? canonicalCategoryMap[match[0]] : value;
};

const buildKeywordConditions = (keyword = '') => {
  const normalizedKeyword = keyword.trim().toLowerCase();
  const keywordRegex = new RegExp(escapeRegex(keyword.trim()), 'i');
  const conditions = [
    { title: keywordRegex },
    { description: keywordRegex },
    { category: keywordRegex },
    { location: keywordRegex }
  ];

  const categoryMatch = Object.entries(categoryAliases).find(([, aliases]) =>
    aliases.some((alias) => alias.includes(normalizedKeyword) || normalizedKeyword.includes(alias))
  );

  if (categoryMatch) {
    conditions.push({ category: new RegExp(`^${escapeRegex(canonicalCategoryMap[categoryMatch[0]])}$`, 'i') });
  }

  return conditions;
};

export const createProduct = async (req, res) => {
  const images = await collectImageUrls(req, req.files, req.body.imageUrls ?? req.body.images);
  const { title, description, price, category, location, coordinates } = req.body;

  const product = await Product.create({
    title,
    description,
    price,
    category,
    location,
    images,
    coordinates,
    seller: req.user._id
  });

  res.status(201).json({ product });
};

export const getProducts = async (req, res) => {
  const { keyword, category, location, sort = '-createdAt', status = 'available' } = req.query;
  const minPrice = parseNumber(req.query.minPrice);
  const maxPrice = parseNumber(req.query.maxPrice);
  const filter = { status };

  if (keyword) {
    filter.$or = buildKeywordConditions(keyword);
  }

  if (category) {
    const normalizedCategory = normalizeCategoryValue(category);
    filter.category = new RegExp(`^${escapeRegex(normalizedCategory.trim())}$`, 'i');
  }
  if (location) filter.location = new RegExp(location, 'i');
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

  const sortMap = {
    priceAsc: 'price',
    priceDesc: '-price',
    latest: '-createdAt',
    oldest: 'createdAt'
  };

  const products = await Product.find(filter)
    .populate('seller', 'name phone profileImage location online')
    .sort(sortMap[sort] || sort)
    .limit(100);

  res.json({ products });
};

export const getNearbyProducts = async (req, res) => {
  const lng = Number(req.query.lng);
  const lat = Number(req.query.lat);
  const maxDistance = Number(req.query.distance || 25000);

  if (Number.isNaN(lng) || Number.isNaN(lat)) {
    return res.status(400).json({ message: 'lng and lat query parameters are required' });
  }

  const products = await Product.find({
    status: 'available',
    coordinates: {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: maxDistance
      }
    }
  }).populate('seller', 'name phone profileImage online');

  res.json({ products });
};

export const getProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true }).populate(
    'seller',
    'name phone profileImage location online createdAt'
  );

  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json({ product });
};

export const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  if (!product.seller.equals(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only the seller can update this listing' });
  }

  const images = await collectImageUrls(req, req.files, req.body.imageUrls ?? req.body.images);
  const updates = ['title', 'description', 'price', 'category', 'location', 'coordinates', 'status'].reduce((data, key) => {
    if (req.body[key] !== undefined) data[key] = req.body[key];
    return data;
  }, {});
  if (images.length) updates.images = images;

  Object.assign(product, updates);
  await product.save();
  res.json({ product });
};

export const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  if (!product.seller.equals(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only the seller can delete this listing' });
  }
  await product.deleteOne();
  res.json({ message: 'Product deleted' });
};

export const markSold = async (req, res) => {
  req.body.status = 'sold';
  return updateProduct(req, res);
};

export const getSellerProducts = async (req, res) => {
  const seller = req.params.sellerId || req.user._id;
  const products = await Product.find({ seller }).sort('-createdAt');
  res.json({ products });
};
