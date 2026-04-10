import User from '../models/User.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import Conversation from '../models/Conversation.js';
import { resolveUserRoles, serializeAuthUser } from '../utils/roles.js';

const calculateAverage = (reviews) => {
  if (!reviews.length) return 0;
  return Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length) * 10) / 10;
};

const buildBreakdown = (reviews) => [5, 4, 3, 2, 1].reduce((data, rating) => {
  data[rating] = reviews.filter((review) => review.rating === rating).length;
  return data;
}, {});

export const getUserRatings = async (req, res) => {
  const user = await User.findById(req.params.id).select('name profileImage averageRating totalReviews');
  if (!user) return res.status(404).json({ message: 'User not found' });

  const reviews = await Review.find({ seller: req.params.id, reviewType: 'seller' })
    .populate('reviewer', 'name profileImage')
    .populate('product', 'title')
    .sort('-createdAt');

  res.json({
    seller: user,
    averageRating: user.averageRating || calculateAverage(reviews),
    totalReviews: user.totalReviews || reviews.length,
    breakdown: buildBreakdown(reviews),
    topRated: reviews.length >= 3 && calculateAverage(reviews) >= 4.5,
    reviews
  });
};

export const getProfile = async (req, res) => {
  const [user, listingsCount, conversationCount] = await Promise.all([
    User.findById(req.user._id).select('-password'),
    Product.countDocuments({ seller: req.user._id }),
    Conversation.countDocuments({ participants: req.user._id })
  ]);

  res.json({
    user: serializeAuthUser(user),
    stats: {
      listingsCount,
      wishlistCount: user?.wishlist?.length ?? 0,
      conversationCount,
      averageRating: user?.averageRating ?? 0,
      totalReviews: user?.totalReviews ?? 0,
      memberSince: user?.createdAt
    }
  });
};

export const updateProfile = async (req, res) => {
  const updates = ['name', 'phone', 'profileImage', 'location'].reduce((data, key) => {
    if (req.body[key] !== undefined) data[key] = req.body[key];
    return data;
  }, {});

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
  res.json({ user: serializeAuthUser(user) });
};

export const addToWishlist = async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  if (product.seller.equals(req.user._id)) {
    return res.status(400).json({ message: 'You cannot save your own listing' });
  }

  await Product.findByIdAndUpdate(req.params.productId, { $inc: { interestCount: 1 } });
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { wishlist: req.params.productId } },
    { new: true }
  ).populate('wishlist');
  res.json({ wishlist: user.wishlist });
};

export const removeFromWishlist = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { wishlist: req.params.productId } },
    { new: true }
  ).populate('wishlist');
  res.json({ wishlist: user.wishlist });
};

export const getWishlist = async (req, res) => {
  const user = await User.findById(req.user._id).populate({ path: 'wishlist', populate: { path: 'seller', select: 'name phone' } });
  res.json({ wishlist: user.wishlist });
};

export const becomeSeller = async (req, res) => {
  const user = await User.findById(req.user._id);
  const roles = new Set(resolveUserRoles(user));
  roles.add('seller');
  roles.add('buyer');
  user.roles = [...roles];
  user.activeRole = 'seller';
  user.role = 'seller';
  await user.save();
  res.json({ user: serializeAuthUser(user), message: 'Seller access enabled successfully' });
};

export const switchActiveRole = async (req, res) => {
  const { role } = req.body;
  const user = await User.findById(req.user._id);
  const roles = resolveUserRoles(user);

  if (!roles.includes(role)) {
    return res.status(403).json({ message: `Your account does not have access to switch to ${role}` });
  }

  user.activeRole = role;
  user.role = role;
  await user.save();
  res.json({ user: serializeAuthUser(user), message: `Active role switched to ${role}` });
};
