import User from '../models/User.js';
import Product from '../models/Product.js';

export const updateProfile = async (req, res) => {
  const updates = ['name', 'phone', 'profileImage', 'location'].reduce((data, key) => {
    if (req.body[key] !== undefined) data[key] = req.body[key];
    return data;
  }, {});

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
  res.json({ user });
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
