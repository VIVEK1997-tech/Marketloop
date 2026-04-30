import User from '../models/User.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import Conversation from '../models/Conversation.js';
import Order from '../models/Order.js';
import Invoice from '../models/Invoice.js';
import Complaint from '../models/Complaint.js';
import { resolveUserRoles, serializeAuthUser } from '../utils/roles.js';
import { sendError, sendSuccess } from '../utils/apiResponse.js';

const populateCart = (query) => query.populate({
  path: 'cart.product',
  populate: { path: 'seller', select: 'name phone profileImage location online' }
});

const serializeCart = (user) => (user?.cart || [])
  .filter((entry) => entry?.product)
  .map((entry) => ({
    productId: String(entry.product._id),
    quantity: entry.quantity,
    product: entry.product
  }));

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
  if (!user) return sendError(res, 'User not found', { statusCode: 404 });

  const reviews = await Review.find({ seller: req.params.id, reviewType: 'seller' })
    .populate('reviewer', 'name profileImage')
    .populate('product', 'title')
    .sort('-createdAt');

  return sendSuccess(res, {
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

  return sendSuccess(res, {
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

export const getBuyerDashboardSummary = async (req, res) => {
  const [user, orderCount, orders, wishlistUser] = await Promise.all([
    User.findById(req.user._id).select('-password'),
    Order.countDocuments({ buyer: req.user._id }),
    Order.find({ buyer: req.user._id })
      .populate('product', 'title images price unit status')
      .populate('seller', 'name profileImage')
      .sort('-createdAt')
      .limit(8),
    User.findById(req.user._id).populate({ path: 'wishlist', populate: { path: 'seller', select: 'name phone profileImage location online' } })
  ]);

  if (!user) return sendError(res, 'User not found', { statusCode: 404 });

  const pendingOrders = orders.filter((order) => ['pending', 'authorized'].includes(order.paymentStatus)).length;
  const paidOrders = orders.filter((order) => order.paymentStatus === 'success').length;

  return sendSuccess(res, {
    user: serializeAuthUser(user),
    summary: {
      wishlistCount: wishlistUser?.wishlist?.length || 0,
      orderCount,
      pendingOrders,
      paidOrders,
      recentOrders: orders,
      wishlist: wishlistUser?.wishlist || []
    }
  });
};

export const updateProfile = async (req, res) => {
  const updates = ['name', 'phone', 'profileImage', 'location'].reduce((data, key) => {
    if (req.body[key] !== undefined) data[key] = req.body[key];
    return data;
  }, {});

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
  return sendSuccess(res, { user: serializeAuthUser(user) }, { message: 'Profile updated successfully' });
};

export const addToWishlist = async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) return sendError(res, 'Product not found', { statusCode: 404 });
  if (product.seller.equals(req.user._id)) {
    return sendError(res, 'You cannot save your own listing', { statusCode: 400 });
  }

  await Product.findByIdAndUpdate(req.params.productId, { $inc: { interestCount: 1 } });
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { wishlist: req.params.productId } },
    { new: true }
  ).populate('wishlist');
  return sendSuccess(res, { wishlist: user.wishlist }, { message: 'Wishlist updated successfully' });
};

export const removeFromWishlist = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { wishlist: req.params.productId } },
    { new: true }
  ).populate('wishlist');
  return sendSuccess(res, { wishlist: user.wishlist }, { message: 'Wishlist updated successfully' });
};

export const getWishlist = async (req, res) => {
  const user = await User.findById(req.user._id).populate({ path: 'wishlist', populate: { path: 'seller', select: 'name phone' } });
  return sendSuccess(res, { wishlist: user.wishlist });
};

export const getCart = async (req, res) => {
  const user = await populateCart(User.findById(req.user._id));
  return sendSuccess(res, { cart: serializeCart(user) });
};

export const addOrUpdateCartItem = async (req, res) => {
  const quantity = Math.max(1, Number(req.body.quantity || 1));
  const product = await Product.findById(req.params.productId).select('_id seller status title price unit images location category');
  if (!product) return sendError(res, 'Product not found', { statusCode: 404 });
  if (product.status === 'sold') return sendError(res, 'This product is no longer available', { statusCode: 400 });
  if (product.seller.equals(req.user._id)) {
    return sendError(res, 'You cannot add your own listing to cart', { statusCode: 400 });
  }

  const user = await User.findById(req.user._id);
  const existingItem = (user.cart || []).find((entry) => String(entry.product) === String(product._id));

  if (existingItem) {
    existingItem.quantity = quantity;
  } else {
    user.cart.push({ product: product._id, quantity });
  }

  await user.save();
  const populatedUser = await populateCart(User.findById(req.user._id));
  return sendSuccess(res, { cart: serializeCart(populatedUser) }, { message: 'Cart updated successfully' });
};

export const removeCartItem = async (req, res) => {
  const user = await User.findById(req.user._id);
  user.cart = (user.cart || []).filter((entry) => String(entry.product) !== String(req.params.productId));
  await user.save();
  const populatedUser = await populateCart(User.findById(req.user._id));
  return sendSuccess(res, { cart: serializeCart(populatedUser) }, { message: 'Cart item removed successfully' });
};

export const clearCart = async (req, res) => {
  const user = await User.findById(req.user._id);
  user.cart = [];
  await user.save();
  return sendSuccess(res, { cart: [] }, { message: 'Cart cleared successfully' });
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
  return sendSuccess(res, { user: serializeAuthUser(user) }, { message: 'Seller access enabled successfully' });
};

export const switchActiveRole = async (req, res) => {
  const { role } = req.body;
  const user = await User.findById(req.user._id);
  const roles = resolveUserRoles(user);

  if (!roles.includes(role)) {
    return sendError(res, `Your account does not have access to switch to ${role}`, { statusCode: 403 });
  }

  user.activeRole = role;
  user.role = role;
  await user.save();
  return sendSuccess(res, { user: serializeAuthUser(user) }, { message: `Active role switched to ${role}` });
};

const buildDefaultNotifications = (user) => ([
  {
    title: 'Welcome to MarketLoop Mobile',
    message: 'Your mobile app session is active and ready for role-based navigation.',
    type: 'success',
    module: 'profile',
    linkedRecordId: String(user._id),
    read: false
  },
  {
    title: 'Invoice updates available',
    message: 'You can now review payment history and invoice PDFs in the app.',
    type: 'info',
    module: 'invoices',
    linkedRecordId: '',
    read: false
  }
]);

const buildComplaintId = () => `CMP-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

export const registerPushToken = async (req, res) => {
  const { token, platform = 'android', deviceName = '' } = req.body;
  if (!token) return sendError(res, 'Push token is required', { statusCode: 400 });

  const user = await User.findById(req.user._id);
  if (!user) return sendError(res, 'User not found', { statusCode: 404 });

  const nextTokens = (user.pushTokens || []).filter((entry) => entry.token !== token);
  nextTokens.unshift({
    token,
    platform,
    deviceName,
    updatedAt: new Date()
  });
  user.pushTokens = nextTokens.slice(0, 10);

  if (!user.appNotifications?.length) {
    user.appNotifications = buildDefaultNotifications(user);
  }

  await user.save();
  return sendSuccess(res, {}, { statusCode: 201, message: 'Push token registered successfully' });
};

export const getNotifications = async (req, res) => {
  const user = await User.findById(req.user._id).select('appNotifications');
  if (!user) return sendError(res, 'User not found', { statusCode: 404 });

  if (!user.appNotifications?.length) {
    user.appNotifications = buildDefaultNotifications(req.user);
    await user.save();
  }

  const notifications = [...user.appNotifications].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
  return sendSuccess(res, { notifications });
};

export const markNotificationRead = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return sendError(res, 'User not found', { statusCode: 404 });

  const notification = user.appNotifications.id(req.params.notificationId);
  if (!notification) return sendError(res, 'Notification not found', { statusCode: 404 });

  notification.read = true;
  await user.save();
  return sendSuccess(res, { notification }, { message: 'Notification marked as read' });
};

export const getSellerDashboardSummary = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (!user) return sendError(res, 'User not found', { statusCode: 404 });

  const roles = resolveUserRoles(user);
  if (!roles.includes('seller') && user.role !== 'seller' && user.role !== 'admin') {
    return sendError(res, 'Seller access is required', { statusCode: 403 });
  }

  const [listingsCount, soldCount, buyerChatsCount, pendingInvoices, paidInvoices, recentListings] = await Promise.all([
    Product.countDocuments({ seller: req.user._id }),
    Product.countDocuments({ seller: req.user._id, status: 'sold' }),
    Conversation.countDocuments({ participants: req.user._id }),
    Invoice.countDocuments({ 'seller.user': req.user._id, status: { $in: ['pending', 'partial'] } }),
    Invoice.countDocuments({ 'seller.user': req.user._id, status: 'paid' }),
    Product.find({ seller: req.user._id }).sort('-updatedAt').limit(5).select('title status price unit updatedAt')
  ]);

  const recentOrders = await Order.find({ seller: req.user._id })
    .populate('product', 'title images')
    .populate('buyer', 'name profileImage')
    .sort('-createdAt')
    .limit(5);

  return sendSuccess(res, {
    user: serializeAuthUser(user),
    summary: {
      listingsCount,
      soldCount,
      buyerChatsCount,
      pendingInvoices,
      paidInvoices,
      recentListings,
      recentOrders
    }
  });
};

export const getSupportComplaints = async (req, res) => {
  const complaints = await Complaint.find({ raisedBy: req.user._id }).sort('-createdAt');
  return sendSuccess(res, {
    complaints: complaints.map((complaint) => ({
      complaintId: complaint.complaintId,
      complaintType: complaint.complaintType,
      against: complaint.against,
      status: complaint.status,
      note: complaint.note,
      raisedByName: complaint.raisedByName,
      raisedByRole: complaint.raisedByRole,
      linkedOrderId: complaint.linkedOrderId,
      linkedPaymentId: complaint.linkedPaymentId,
      resolutionNotes: complaint.resolutionNotes,
      createdAt: complaint.createdAt,
      updatedAt: complaint.updatedAt
    }))
  });
};

export const getSupportComplaintDetail = async (req, res) => {
  const complaint = await Complaint.findOne({ complaintId: req.params.complaintId, raisedBy: req.user._id });
  if (!complaint) {
    return sendError(res, 'Support request not found', { statusCode: 404 });
  }

  return sendSuccess(res, {
    complaint: {
      complaintId: complaint.complaintId,
      complaintType: complaint.complaintType,
      against: complaint.against,
      status: complaint.status,
      note: complaint.note,
      raisedByName: complaint.raisedByName,
      raisedByRole: complaint.raisedByRole,
      linkedOrderId: complaint.linkedOrderId,
      linkedPaymentId: complaint.linkedPaymentId,
      resolutionNotes: complaint.resolutionNotes,
      createdAt: complaint.createdAt,
      updatedAt: complaint.updatedAt
    }
  });
};

export const createSupportComplaint = async (req, res) => {
  const { complaintType, against, note = '', linkedOrderId = '', linkedPaymentId = '' } = req.body;

  const complaint = await Complaint.create({
    complaintId: buildComplaintId(),
    complaintType,
    against,
    note,
    linkedOrderId,
    linkedPaymentId,
    raisedBy: req.user._id,
    raisedByName: req.user.name,
    raisedByRole: req.user.activeRole || req.user.role || 'buyer',
    status: 'open'
  });

  const user = await User.findById(req.user._id);
  if (user) {
    user.appNotifications = user.appNotifications || [];
    user.appNotifications.unshift({
      title: 'Support request created',
      message: `${complaint.complaintType} has been logged with ID ${complaint.complaintId}.`,
      type: 'warning',
      module: 'support',
      linkedRecordId: complaint.complaintId,
      read: false
    });
    user.appNotifications = user.appNotifications.slice(0, 25);
    await user.save();
  }

  return sendSuccess(res, {
    complaint: {
      complaintId: complaint.complaintId,
      complaintType: complaint.complaintType,
      against: complaint.against,
      status: complaint.status,
      note: complaint.note,
      raisedByName: complaint.raisedByName,
      raisedByRole: complaint.raisedByRole,
      linkedOrderId: complaint.linkedOrderId,
      linkedPaymentId: complaint.linkedPaymentId,
      resolutionNotes: complaint.resolutionNotes,
      createdAt: complaint.createdAt,
      updatedAt: complaint.updatedAt
    }
  }, {
    statusCode: 201,
    message: 'Support request created successfully'
  });
};
