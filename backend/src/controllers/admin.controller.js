import User from '../models/User.js';
import Product from '../models/Product.js';
import Conversation from '../models/Conversation.js';

export const getStats = async (_req, res) => {
  const [users, products, soldProducts, conversations] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Product.countDocuments({ status: 'sold' }),
    Conversation.countDocuments()
  ]);

  res.json({ stats: { users, products, soldProducts, conversations } });
};

export const getUsers = async (_req, res) => {
  const users = await User.find().select('-password').sort('-createdAt');
  res.json({ users });
};

export const setBanStatus = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.userId, { isBanned: req.body.isBanned }, { new: true }).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user });
};

export const removeListing = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json({ message: 'Listing removed' });
};
