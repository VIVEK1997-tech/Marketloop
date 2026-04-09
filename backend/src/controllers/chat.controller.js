import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Product from '../models/Product.js';

export const getOrCreateConversation = async ({ buyerId, sellerId, productId }) => {
  const participants = [buyerId, sellerId].sort();
  let conversation = await Conversation.findOne({ participants: { $all: participants }, product: productId || null });

  if (!conversation) {
    conversation = await Conversation.create({ participants, product: productId || null });
  }

  return conversation;
};

export const createConversation = async (req, res) => {
  if (!req.body.productId) {
    return res.status(400).json({ message: 'productId is required to start a buyer-seller chat' });
  }

  const product = await Product.findById(req.body.productId);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  if (product.seller.toString() !== req.body.sellerId) {
    return res.status(400).json({ message: 'Seller does not match the selected product' });
  }

  if (product.seller.equals(req.user._id)) {
    return res.status(400).json({ message: 'Sellers cannot start a buyer chat on their own listing' });
  }

  const conversation = await getOrCreateConversation({
    buyerId: req.user._id.toString(),
    sellerId: req.body.sellerId,
    productId: req.body.productId
  });
  await conversation.populate('participants', 'name profileImage online');
  res.status(201).json({ conversation });
};

export const getConversations = async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user._id })
    .populate('participants', 'name profileImage online')
    .populate('product', 'title images price status')
    .populate('lastMessage')
    .sort('-updatedAt');

  res.json({ conversations });
};

export const getMessages = async (req, res) => {
  const conversation = await Conversation.findOne({ _id: req.params.conversationId, participants: req.user._id });
  if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

  const messages = await Message.find({ conversation: conversation._id }).populate('sender receiver', 'name profileImage').sort('createdAt');
  res.json({ messages });
};

export const sendMessage = async ({ conversationId, senderId, receiverId, message }) => {
  const saved = await Message.create({ conversation: conversationId, sender: senderId, receiver: receiverId, message });
  await Conversation.findByIdAndUpdate(conversationId, { lastMessage: saved._id, updatedAt: new Date() });
  return saved.populate('sender receiver', 'name profileImage');
};
