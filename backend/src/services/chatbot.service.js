import OpenAI from 'openai';
import Product from '../models/Product.js';

const defaultQuickReplies = [
  { label: 'Show mobiles', value: 'Show mobile phones' },
  { label: 'Post item', value: 'How do I post a product?' },
  { label: 'Pricing help', value: 'How should I price my item?' },
  { label: 'Go to dashboard', value: 'Where is my dashboard?' }
];

const sanitizeText = (value = '') => value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 800);

const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

const getProductMatches = async (query) => {
  const safeQuery = sanitizeText(query);
  if (!safeQuery) return [];

  const regex = new RegExp(safeQuery.split(' ').filter(Boolean).slice(0, 4).join('|'), 'i');
  return Product.find({
    status: 'available',
    $or: [{ title: regex }, { description: regex }, { category: regex }, { location: regex }]
  })
    .select('title price category location images')
    .sort('-createdAt')
    .limit(4);
};

const buildProductSummary = (products) => products
  .map((product) => `${product.title} | ${product.category} | ${product.location} | Rs ${product.price}`)
  .join('\n');

const getFallbackReply = ({ text, products }) => {
  const lower = text.toLowerCase();

  if (lower.includes('post') || lower.includes('sell')) {
    return 'To post a product, open Dashboard, enable seller access if needed, then click Sell or Post a product. Add title, description, price, category, location, and images.';
  }

  if (lower.includes('dashboard')) {
    return 'You can open Dashboard from the top-right header. It contains your wishlist, chats, profile, and seller listing tools.';
  }

  if (lower.includes('price') || lower.includes('pricing')) {
    return 'For pricing, compare similar listings by category, condition, and location. Start slightly above your minimum acceptable price so you have room to negotiate.';
  }

  if (products.length) {
    return `I found ${products.length} matching listing${products.length > 1 ? 's' : ''}. You can open any suggested product below or refine by category, city, and budget.`;
  }

  return 'I can help you find products, post listings, understand pricing, manage wishlist items, and navigate MarketLoop. Try asking “show mobiles in Delhi” or “how do I sell my sofa?”';
};

export const createChatbotReply = async ({ user, text, history = [] }) => {
  const safeText = sanitizeText(text);
  const products = await getProductMatches(safeText);
  const productCards = products.map((product) => ({
    _id: product._id,
    title: product.title,
    price: product.price,
    category: product.category,
    location: product.location,
    image: product.images?.[0] || ''
  }));

  const client = getOpenAIClient();
  if (!client) {
    return {
      text: getFallbackReply({ text: safeText, products }),
      quickReplies: defaultQuickReplies,
      products: productCards
    };
  }

  const recentHistory = history.slice(-8).map((message) => ({
    role: message.sender === 'user' ? 'user' : 'assistant',
    content: message.text
  }));

  const response = await client.responses.create({
    model: process.env.OPENAI_CHATBOT_MODEL || 'gpt-4.1-mini',
    instructions: [
      'You are LoopBot, the friendly AI assistant for MarketLoop, an OLX-like marketplace.',
      'Help users buy, sell, search products, understand pricing, navigate dashboard/wishlist/chat, and stay safe.',
      'Be concise, practical, and marketplace-specific. Do not claim to complete purchases or payments.',
      'When relevant products are provided, reference them briefly and tell the user they can open the cards.'
    ].join(' '),
    input: [
      ...recentHistory,
      {
        role: 'user',
        content: [
          `User name: ${user?.name || 'MarketLoop user'}`,
          `User roles: ${(user?.roles || [user?.role || 'buyer']).join(', ')}`,
          `Relevant products:\n${buildProductSummary(products) || 'No direct matches found.'}`,
          `User message: ${safeText}`
        ].join('\n\n')
      }
    ]
  });

  return {
    text: response.output_text || getFallbackReply({ text: safeText, products }),
    quickReplies: defaultQuickReplies,
    products: productCards
  };
};

export const sanitizeChatbotMessage = sanitizeText;
