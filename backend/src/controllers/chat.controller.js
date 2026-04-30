import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Product from '../models/Product.js';
import { sendSuccess } from '../utils/apiResponse.js';

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
  return sendSuccess(res, { conversation }, { statusCode: 201, message: 'Conversation ready' });
};

export const getConversations = async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user._id })
    .populate('participants', 'name profileImage online')
    .populate('product', 'title images price status')
    .populate('lastMessage')
    .sort('-updatedAt');

  return sendSuccess(res, { conversations });
};

export const getMessages = async (req, res) => {
  const conversation = await Conversation.findOne({ _id: req.params.conversationId, participants: req.user._id });
  if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

  const messages = await Message.find({ conversation: conversation._id }).populate('sender receiver', 'name profileImage').sort('createdAt');
  return sendSuccess(res, { messages });
};

export const postConversationMessage = async (req, res) => {
  const conversation = await Conversation.findOne({ _id: req.params.conversationId, participants: req.user._id }).populate('participants', 'name profileImage');
  if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

  const receiverId = conversation.participants.find((participant) => participant._id.toString() !== req.user._id.toString())?._id?.toString();
  if (!receiverId) return res.status(400).json({ message: 'Conversation receiver not found' });

  const message = await sendMessage({
    conversationId: conversation._id.toString(),
    senderId: req.user._id.toString(),
    receiverId,
    message: req.body.message
  });

  return sendSuccess(res, { message }, { statusCode: 201, message: 'Message sent successfully' });
};

export const sendMessage = async ({ conversationId, senderId, receiverId, message }) => {
  const saved = await Message.create({ conversation: conversationId, sender: senderId, receiver: receiverId, message });
  await Conversation.findByIdAndUpdate(conversationId, { lastMessage: saved._id, updatedAt: new Date() });
  return saved.populate('sender receiver', 'name profileImage');
};
