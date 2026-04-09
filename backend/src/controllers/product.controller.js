import Product from '../models/Product.js';
import User from '../models/User.js';
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

const getPriceClosenessScore = (basePrice, candidatePrice) => {
  if (!basePrice || !candidatePrice) return 0;
  const safeBase = Math.max(Number(basePrice), 1);
  const differenceRatio = Math.abs(Number(candidatePrice) - safeBase) / safeBase;
  if (differenceRatio <= 0.1) return 18;
  if (differenceRatio <= 0.2) return 14;
  if (differenceRatio <= 0.35) return 10;
  if (differenceRatio <= 0.5) return 6;
  return 0;
};

const buildRecommendationReasons = ({ sameCategory, sameLocation, priceClose, popularity, userCategoryMatch, wishlistMatch }) => {
  const reasons = [];
  if (sameCategory) reasons.push('Similar category to what you are viewing');
  if (sameLocation) reasons.push('Available in the same city or nearby area');
  if (priceClose) reasons.push('Price is close to your current budget range');
  if (userCategoryMatch) reasons.push('Matches categories you browse or save often');
  if (wishlistMatch) reasons.push('Similar to items in your wishlist');
  if (popularity) reasons.push('Popular with other buyers right now');
  return reasons.slice(0, 3);
};

const scoreRecommendation = ({ candidate, currentProduct, affinityCategories, affinityLocations, wishlistIds }) => {
  let score = 0;
  const sameCategory = currentProduct ? candidate.category?.toLowerCase() === currentProduct.category?.toLowerCase() : false;
  const sameLocation = currentProduct ? candidate.location?.toLowerCase() === currentProduct.location?.toLowerCase() : false;
  const priceClose = currentProduct ? getPriceClosenessScore(currentProduct.price, candidate.price) : 0;
  const categoryAffinity = affinityCategories.has(candidate.category?.toLowerCase()) ? 24 : 0;
  const locationAffinity = affinityLocations.has(candidate.location?.toLowerCase()) ? 12 : 0;
  const wishlistMatch = wishlistIds.has(String(candidate._id));
  const popularity = Math.min(Math.round((candidate.views || 0) / 8) + Math.round((candidate.interestCount || 0) * 3), 16);
  const freshness = Math.max(0, 8 - Math.floor((Date.now() - new Date(candidate.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 3)));

  if (sameCategory) score += 32;
  if (sameLocation) score += 14;
  score += priceClose;
  score += categoryAffinity;
  score += locationAffinity;
  score += popularity;
  score += freshness;
  if (wishlistMatch) score -= 100;

  return {
    score,
    reasons: buildRecommendationReasons({
      sameCategory,
      sameLocation,
      priceClose: priceClose > 0,
      popularity: popularity > 6,
      userCategoryMatch: categoryAffinity > 0,
      wishlistMatch
    })
  };
};

const getUserAffinity = async (userId) => {
  if (!userId) {
    return {
      wishlistIds: new Set(),
      affinityCategories: new Set(),
      affinityLocations: new Set()
    };
  }

  const user = await User.findById(userId).populate('wishlist', 'category location');

  if (!user) {
    return {
      wishlistIds: new Set(),
      affinityCategories: new Set(),
      affinityLocations: new Set()
    };
  }

  const wishlistIds = new Set(user.wishlist.map((item) => String(item._id)));
  const affinityCategories = new Set(user.wishlist.map((item) => item.category?.toLowerCase()).filter(Boolean));
  const affinityLocations = new Set(user.wishlist.map((item) => item.location?.toLowerCase()).filter(Boolean));

  if (user.location?.city) affinityLocations.add(user.location.city.toLowerCase());
  if (user.location?.state) affinityLocations.add(user.location.state.toLowerCase());

  return { wishlistIds, affinityCategories, affinityLocations };
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

export const getProductRecommendations = async (req, res) => {
  const currentProduct = await Product.findById(req.params.id).populate('seller', 'name phone profileImage location online createdAt');

  if (!currentProduct) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const { wishlistIds, affinityCategories, affinityLocations } = await getUserAffinity(req.user?._id);

  affinityCategories.add(currentProduct.category?.toLowerCase());
  if (currentProduct.location) affinityLocations.add(currentProduct.location.toLowerCase());

  const candidates = await Product.find({
    _id: { $ne: currentProduct._id, $nin: [...wishlistIds] },
    status: 'available'
  })
    .populate('seller', 'name phone profileImage location online')
    .sort('-createdAt')
    .limit(40);

  const recommendations = candidates
    .filter((candidate) => !candidate.seller?._id?.equals?.(req.user?._id))
    .map((candidate) => {
      const { score, reasons } = scoreRecommendation({
        candidate,
        currentProduct,
        affinityCategories,
        affinityLocations,
        wishlistIds
      });

      return {
        ...candidate.toObject(),
        recommendationScore: score,
        recommendationReasons: reasons
      };
    })
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, 6);

  res.json({
    recommendations,
    meta: {
      model: 'MarketLoop SmartMatch v1',
      explanation: 'Recommendations are ranked using listing similarity, buyer wishlist interest, location affinity, price proximity, and marketplace engagement.'
    }
  });
};

export const getPersonalizedRecommendations = async (req, res) => {
  const { wishlistIds, affinityCategories, affinityLocations } = await getUserAffinity(req.user?._id);
  const baseFilter = {
    status: 'available',
    _id: { $nin: [...wishlistIds] }
  };

  const categoryFilters = [...affinityCategories];
  if (categoryFilters.length) {
    baseFilter.category = { $in: categoryFilters.map((category) => new RegExp(`^${escapeRegex(category)}$`, 'i')) };
  }

  const candidates = await Product.find(baseFilter)
    .populate('seller', 'name phone profileImage location online')
    .sort('-createdAt')
    .limit(32);

  const recommendations = candidates
    .filter((candidate) => !candidate.seller?._id?.equals?.(req.user?._id))
    .map((candidate) => {
      const { score, reasons } = scoreRecommendation({
        candidate,
        currentProduct: null,
        affinityCategories,
        affinityLocations,
        wishlistIds
      });

      return {
        ...candidate.toObject(),
        recommendationScore: score,
        recommendationReasons: reasons.length ? reasons : ['Picked based on your saved categories and active marketplace trends']
      };
    })
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, 8);

  res.json({
    recommendations,
    meta: {
      model: 'MarketLoop SmartMatch v1',
      explanation: 'Personalized picks are based on your wishlist, preferred categories, location signals, and listing popularity.'
    }
  });
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
