import Conversation from '../models/Conversation.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import User from '../models/User.js';

const sanitizeReviewText = (value = '') => value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 1000);

const buildBreakdown = (reviews) => [5, 4, 3, 2, 1].reduce((data, rating) => {
  data[rating] = reviews.filter((review) => review.rating === rating).length;
  return data;
}, {});

const calculateAverage = (reviews) => {
  if (!reviews.length) return 0;
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((total / reviews.length) * 10) / 10;
};

const sortReviews = (sort = 'latest') => {
  const sortMap = {
    latest: '-createdAt',
    oldest: 'createdAt',
    highest: '-rating -createdAt',
    lowest: 'rating -createdAt'
  };

  return sortMap[sort] || sortMap.latest;
};

const getInteractionEligibility = async ({ reviewerId, product }) => {
  if (product.status === 'sold') return true;

  const conversation = await Conversation.findOne({
    product: product._id,
    participants: { $all: [reviewerId, product.seller] }
  });

  return Boolean(conversation);
};

const recalculateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId, reviewType: 'product' }).select('rating');
  await Product.findByIdAndUpdate(productId, {
    averageRating: calculateAverage(reviews),
    totalReviews: reviews.length
  });
};

const recalculateSellerRating = async (sellerId) => {
  const reviews = await Review.find({ seller: sellerId, reviewType: 'seller' }).select('rating');
  await User.findByIdAndUpdate(sellerId, {
    averageRating: calculateAverage(reviews),
    totalReviews: reviews.length
  });
};

export const getReviewEligibility = async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const isOwner = product.seller.equals(req.user._id);
  const hasInteraction = !isOwner && await getInteractionEligibility({ reviewerId: req.user._id, product });
  const existingProductReview = await Review.findOne({ reviewer: req.user._id, product: product._id, reviewType: 'product' });
  const existingSellerReview = await Review.findOne({ reviewer: req.user._id, product: product._id, reviewType: 'seller' });

  res.json({
    eligible: hasInteraction,
    isOwner,
    alreadyReviewed: {
      product: Boolean(existingProductReview),
      seller: Boolean(existingSellerReview)
    },
    reason: isOwner
      ? 'You cannot review your own listing'
      : hasInteraction
        ? 'Eligible to review'
        : 'Start a chat with the seller or wait until the product is marked sold before reviewing'
  });
};

export const addReview = async (req, res) => {
  const { productId, reviewType } = req.body;
  const rating = Number(req.body.rating);
  const reviewText = sanitizeReviewText(req.body.reviewText);

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  if (product.seller.equals(req.user._id)) {
    return res.status(400).json({ message: 'You cannot review your own product' });
  }

  const hasInteraction = await getInteractionEligibility({ reviewerId: req.user._id, product });
  if (!hasInteraction) {
    return res.status(403).json({ message: 'You can review only after chatting with the seller or after the product is sold' });
  }

  const duplicate = await Review.findOne({ reviewer: req.user._id, product: product._id, reviewType });
  if (duplicate) {
    return res.status(409).json({ message: `You already submitted a ${reviewType} review for this product` });
  }

  const review = await Review.create({
    reviewer: req.user._id,
    seller: product.seller,
    product: product._id,
    rating,
    reviewText,
    reviewType,
    verifiedBuyer: true
  });

  if (reviewType === 'product') {
    await recalculateProductRating(product._id);
  } else {
    await recalculateSellerRating(product.seller);
  }

  await review.populate('reviewer', 'name profileImage');
  res.status(201).json({ review, message: 'Review submitted successfully' });
};

export const getProductReviews = async (req, res) => {
  const reviews = await Review.find({ product: req.params.id, reviewType: 'product' })
    .populate('reviewer', 'name profileImage')
    .sort(sortReviews(req.query.sort));

  res.json({
    reviews,
    averageRating: calculateAverage(reviews),
    totalReviews: reviews.length,
    breakdown: buildBreakdown(reviews)
  });
};

export const getSellerReviews = async (req, res) => {
  const reviews = await Review.find({ seller: req.params.id, reviewType: 'seller' })
    .populate('reviewer', 'name profileImage')
    .populate('product', 'title')
    .sort(sortReviews(req.query.sort));

  res.json({
    reviews,
    averageRating: calculateAverage(reviews),
    totalReviews: reviews.length,
    breakdown: buildBreakdown(reviews),
    topRated: reviews.length >= 3 && calculateAverage(reviews) >= 4.5
  });
};

export const markReviewHelpful = async (req, res) => {
  const update = req.body.helpful
    ? { $addToSet: { helpfulBy: req.user._id }, $pull: { notHelpfulBy: req.user._id } }
    : { $addToSet: { notHelpfulBy: req.user._id }, $pull: { helpfulBy: req.user._id } };

  const review = await Review.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!review) return res.status(404).json({ message: 'Review not found' });
  res.json({ review });
};

export const reportReview = async (req, res) => {
  const reason = sanitizeReviewText(req.body.reason || 'Inappropriate review');
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { reports: { user: req.user._id, reason } } },
    { new: true }
  );

  if (!review) return res.status(404).json({ message: 'Review not found' });
  res.json({ message: 'Review reported successfully' });
};
