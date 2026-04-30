import OpenAI from 'openai';
import mongoose from 'mongoose';
import ChatbotInteraction from '../models/ChatbotInteraction.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

const defaultQuickReplies = [
  { label: 'Show fresh fruits', value: 'Show fresh fruits available near me' },
  { label: 'Track my orders', value: 'Show my recent order status' },
  { label: 'Sell an item', value: 'How do I create a product listing?' },
  { label: 'Pricing help', value: 'Help me decide a good selling price' }
];

const faqKnowledge = [
  {
    key: 'listing',
    trigger: ['post', 'sell', 'listing', 'upload'],
    answer: 'Sellers can post a product from the Sell button or Dashboard. Add title, description, price, category, location, unit, quantity, and product images before publishing.',
    quickReplies: [
      { label: 'Open sell flow', value: 'Take me to the sell flow' },
      { label: 'Pricing tips', value: 'How should I price my listing?' }
    ]
  },
  {
    key: 'orders',
    trigger: ['order', 'delivery', 'payment', 'track'],
    answer: 'You can view payment and order activity from Payment History and chat with the seller before pickup. Completed payments mark the listing sold after verification.',
    quickReplies: [
      { label: 'Payment history', value: 'Show my recent order status' },
      { label: 'Chat seller', value: 'How do I chat with a seller?' }
    ]
  },
  {
    key: 'safety',
    trigger: ['safe', 'fraud', 'scam', 'trust'],
    answer: 'For marketplace safety, compare seller ratings, review product details carefully, prefer in-platform chat, and only complete payments through the supported checkout flow.',
    quickReplies: [
      { label: 'Check ratings', value: 'How do I check seller ratings?' },
      { label: 'Payment safety', value: 'How is payment verified?' }
    ]
  },
  {
    key: 'navigation',
    trigger: ['dashboard', 'wishlist', 'where', 'navigate'],
    answer: 'Dashboard gives you profile, listings, wishlist, and chat access. The header search helps you browse products, while Wishlist stores saved listings across sessions.',
    quickReplies: [
      { label: 'Open dashboard', value: 'Where is my dashboard?' },
      { label: 'Wishlist help', value: 'How do I save an item?' }
    ]
  }
];

const sanitizeText = (value = '') => value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 1000);

const sanitizeContext = (context = {}) => ({
  pageType: sanitizeText(context.pageType || '').slice(0, 60),
  currentPath: sanitizeText(context.currentPath || '').slice(0, 200),
  productId: sanitizeText(context.productId || '').slice(0, 60),
  orderId: sanitizeText(context.orderId || '').slice(0, 60),
  conversationId: sanitizeText(context.conversationId || '').slice(0, 60),
  searchQuery: sanitizeText(context.searchQuery || '').slice(0, 120)
});

const toOptionalObjectId = (value) => {
  const normalized = sanitizeText(value || '').slice(0, 60);
  return normalized && mongoose.Types.ObjectId.isValid(normalized) ? new mongoose.Types.ObjectId(normalized) : undefined;
};

const normalizeInteractionSessionContext = (context = {}) => {
  const sanitized = sanitizeContext(context);
  return {
    ...(sanitized.pageType ? { pageType: sanitized.pageType } : {}),
    ...(sanitized.currentPath ? { currentPath: sanitized.currentPath } : {}),
    ...(toOptionalObjectId(sanitized.productId) ? { productId: toOptionalObjectId(sanitized.productId) } : {}),
    ...(toOptionalObjectId(sanitized.orderId) ? { orderId: toOptionalObjectId(sanitized.orderId) } : {}),
    ...(toOptionalObjectId(sanitized.conversationId) ? { conversationId: toOptionalObjectId(sanitized.conversationId) } : {}),
    ...(sanitized.searchQuery ? { searchQuery: sanitized.searchQuery } : {})
  };
};

const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

const tokenize = (value = '') => sanitizeText(value)
  .toLowerCase()
  .split(/[^a-z0-9]+/i)
  .filter((token) => token.length > 1);

const tokenScore = (query, candidate) => {
  const queryTokens = tokenize(query);
  const candidateTokens = tokenize(candidate);
  if (!queryTokens.length || !candidateTokens.length) return 0;
  const candidateSet = new Set(candidateTokens);
  let score = 0;
  queryTokens.forEach((token) => {
    if (candidateSet.has(token)) score += 1;
    else if (candidateTokens.some((candidateToken) => candidateToken.startsWith(token) || token.startsWith(candidateToken))) score += 0.45;
  });
  return score / queryTokens.length;
};

const cosineSimilarity = (a = [], b = []) => {
  if (!a.length || !b.length || a.length !== b.length) return 0;
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let index = 0; index < a.length; index += 1) {
    dot += a[index] * b[index];
    magA += a[index] ** 2;
    magB += b[index] ** 2;
  }
  if (!magA || !magB) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
};

const getQueryIntent = (text, sessionContext) => {
  const lower = text.toLowerCase();
  if (sessionContext.productId && /(available|stock|still there|this item|this product|this listing)/.test(lower)) return 'product_availability';
  if (/(price|pricing|rate|cheap|expensive|cost|offer)/.test(lower)) return 'pricing_help';
  if (/(order|delivery|payment|paid|receipt|refund)/.test(lower)) return 'order_payment_support';
  if (/(post|sell|listing|upload|create product)/.test(lower)) return 'seller_listing_help';
  if (/(wishlist|save item|favourite|favorite)/.test(lower)) return 'wishlist_help';
  if (/(chat|seller|message buyer|conversation)/.test(lower)) return 'chat_support';
  if (/(dashboard|where|navigate|open)/.test(lower)) return 'navigation_help';
  if (/(recommend|suggest|show|find|looking for|need)/.test(lower)) return 'product_discovery';
  return 'general_marketplace_help';
};

const buildProductCard = (product) => ({
  _id: product._id,
  title: product.title,
  price: product.price,
  category: product.category,
  location: product.location,
  image: product.images?.[0] || ''
});

const buildSource = (type, label, refId) => ({ type, label, refId: String(refId || '') });

const getEmbedding = async (client, input) => {
  if (!client || !input) return null;
  try {
    const response = await client.embeddings.create({
      model: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
      input
    });
    return response.data?.[0]?.embedding || null;
  } catch {
    return null;
  }
};

const getRelevantProducts = async ({ query, sessionContext }) => {
  const filters = { status: 'available' };
  const queryFilter = sanitizeText(query || sessionContext.searchQuery || '');
  const queryRegex = queryFilter
    ? new RegExp(queryFilter.split(' ').filter(Boolean).slice(0, 5).join('|'), 'i')
    : null;

  if (queryRegex) {
    filters.$or = [
      { title: queryRegex },
      { description: queryRegex },
      { category: queryRegex },
      { location: queryRegex }
    ];
  }

  const products = await Product.find(filters)
    .select('title price category location images seller unit quantity normalizedPricePerKg status views createdAt')
    .sort('-createdAt')
    .limit(sessionContext.productId ? 8 : 6)
    .lean();

  let scored = products.map((product) => ({
    product,
    score: tokenScore(query, `${product.title} ${product.category} ${product.location}`) + (String(product._id) === sessionContext.productId ? 2 : 0)
  }));

  if (sessionContext.productId) {
    const currentProduct = await Product.findById(sessionContext.productId)
      .populate('seller', 'name averageRating totalReviews profileImage online createdAt')
      .lean();

    if (currentProduct) {
      const existing = scored.find((item) => String(item.product._id) === String(currentProduct._id));
      if (!existing) {
        scored.unshift({ product: currentProduct, score: 3 });
      }
    }
  }

  return scored
    .sort((left, right) => right.score - left.score || new Date(right.product.createdAt) - new Date(left.product.createdAt))
    .slice(0, 4);
};

const getUserSignals = async (userId) => {
  const [user, orders, recentInteractions] = await Promise.all([
    User.findById(userId).populate('wishlist', 'title category location price').lean(),
    Order.find({ buyer: userId })
      .populate('product', 'title category price')
      .populate('seller', 'name')
      .sort('-createdAt')
      .limit(5)
      .lean(),
    ChatbotInteraction.find({ user: userId, 'feedback.helpful': true })
      .sort('-updatedAt')
      .limit(10)
      .lean()
  ]);

  const categoryFrequency = recentInteractions.reduce((accumulator, interaction) => {
    interaction.retrievedContext?.products?.forEach((product) => {
      const category = product.metadata?.category;
      if (!category) return;
      accumulator[category] = (accumulator[category] || 0) + 1;
    });
    return accumulator;
  }, {});

  return {
    user: user
      ? {
          name: user.name,
          roles: user.roles || [user.role || 'buyer'],
          location: user.location?.city || user.location?.state || user.location?.country || '',
          wishlistCount: user.wishlist?.length || 0,
          averageRating: user.averageRating || 0,
          memberSince: user.createdAt
        }
      : null,
    wishlist: (user?.wishlist || []).slice(0, 4).map((item) => ({
      title: item.title,
      category: item.category,
      location: item.location,
      price: item.price
    })),
    recentOrders: orders.map((order) => ({
      orderId: order._id,
      product: order.product?.title || 'Product',
      category: order.product?.category || '',
      amount: order.amount,
      status: order.paymentStatus,
      seller: order.seller?.name || '',
      createdAt: order.createdAt
    })),
    preferredCategories: Object.entries(categoryFrequency)
      .sort((left, right) => right[1] - left[1])
      .slice(0, 3)
      .map(([category]) => category)
  };
};

const getRelevantOrders = async ({ userId, query, sessionContext }) => {
  const orders = await Order.find({ buyer: userId })
    .populate('product', 'title category')
    .populate('seller', 'name')
    .sort('-createdAt')
    .limit(6)
    .lean();

  return orders
    .map((order) => ({
      order,
      score:
        tokenScore(query, `${order.product?.title || ''} ${order.product?.category || ''} ${order.seller?.name || ''} ${order.paymentStatus}`) +
        (String(order._id) === sessionContext.orderId ? 2 : 0)
    }))
    .filter((item) => item.score > 0 || String(item.order._id) === sessionContext.orderId)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);
};

const getConversationContext = async ({ userId, query, sessionContext }) => {
  const selector = sessionContext.conversationId
    ? { _id: sessionContext.conversationId, participants: userId }
    : { participants: userId };

  const conversations = await Conversation.find(selector)
    .populate('product', 'title category price location')
    .populate('participants', 'name')
    .sort('-updatedAt')
    .limit(sessionContext.conversationId ? 1 : 3)
    .lean();

  const enriched = await Promise.all(
    conversations.map(async (conversation) => {
      const messages = await Message.find({ conversation: conversation._id }).sort('-createdAt').limit(6).lean();
      const otherParticipant = conversation.participants.find((participant) => String(participant._id) !== String(userId));
      return {
        conversation,
        messages: messages.reverse(),
        score:
          tokenScore(
            query,
            `${conversation.product?.title || ''} ${conversation.product?.category || ''} ${otherParticipant?.name || ''} ${messages.map((message) => message.message).join(' ')}`
          ) + (String(conversation._id) === sessionContext.conversationId ? 2 : 0)
      };
    })
  );

  return enriched
    .filter((item) => item.score > 0 || String(item.conversation._id) === sessionContext.conversationId)
    .sort((left, right) => right.score - left.score)
    .slice(0, 2);
};

const getFaqMatches = (query) => faqKnowledge
  .map((item) => ({
    ...item,
    score: Math.max(...item.trigger.map((trigger) => tokenScore(query, trigger)), 0)
  }))
  .filter((item) => item.score > 0.2)
  .sort((left, right) => right.score - left.score)
  .slice(0, 2);

const getRelevantMemories = async ({ userId, query, embedding }) => {
  const candidates = await ChatbotInteraction.find({ user: userId })
    .sort('-createdAt')
    .limit(25)
    .lean();

  return candidates
    .map((interaction) => {
      const lexical = tokenScore(query, `${interaction.query} ${interaction.response} ${interaction.intent || ''}`);
      const vector = embedding && interaction.queryEmbedding?.length ? cosineSimilarity(embedding, interaction.queryEmbedding) : 0;
      const helpfulBoost = interaction.feedback?.helpful ? 0.35 : 0;
      return {
        interaction,
        score: lexical + vector + helpfulBoost
      };
    })
    .filter((item) => item.score > 0.18)
    .sort((left, right) => right.score - left.score)
    .slice(0, 4);
};

const buildContextSummary = ({ intent, sessionContext, products, orders, conversations, memories, faqs, userSignals }) => {
  const summary = [];
  summary.push(`Intent: ${intent.replace(/_/g, ' ')}`);
  if (sessionContext.pageType) summary.push(`Page: ${sessionContext.pageType}`);
  if (sessionContext.currentPath) summary.push(`Path: ${sessionContext.currentPath}`);
  if (products[0]?.product) summary.push(`Current product focus: ${products[0].product.title}`);
  if (orders.length) summary.push(`Recent order context: ${orders[0].order.product?.title || 'Recent order'}`);
  if (conversations.length) summary.push(`Active marketplace chat context is available`);
  if (userSignals.preferredCategories?.length) summary.push(`User often explores: ${userSignals.preferredCategories.join(', ')}`);
  if (faqs.length) summary.push(`FAQ support matched: ${faqs.map((item) => item.key).join(', ')}`);
  if (memories.length) summary.push(`Past similar chatbot interactions found: ${memories.length}`);
  return summary.join(' | ');
};

const buildRetrievalPayload = ({ products, orders, conversations, memories, faqs, userSignals }) => ({
  products: products.map(({ product, score }) => ({
    type: 'product',
    refId: String(product._id),
    label: product.title,
    score,
    metadata: {
      category: product.category,
      location: product.location,
      price: product.price,
      status: product.status
    }
  })),
  orders: orders.map(({ order, score }) => ({
    type: 'order',
    refId: String(order._id),
    label: order.product?.title || 'Order',
    score,
    metadata: {
      paymentStatus: order.paymentStatus,
      amount: order.amount,
      seller: order.seller?.name || ''
    }
  })),
  conversations: conversations.map(({ conversation, messages, score }) => ({
    type: 'conversation',
    refId: String(conversation._id),
    label: conversation.product?.title || 'Marketplace chat',
    score,
    metadata: {
      lastMessages: messages.map((message) => ({
        sender: String(message.sender),
        text: message.message,
        createdAt: message.createdAt
      }))
    }
  })),
  memories: memories.map(({ interaction, score }) => ({
    type: 'memory',
    refId: String(interaction._id),
    label: interaction.query,
    score,
    metadata: {
      response: interaction.response,
      intent: interaction.intent,
      helpful: interaction.feedback?.helpful
    }
  })),
  faqs: faqs.map((faq) => ({
    type: 'faq',
    refId: faq.key,
    label: faq.key,
    score: faq.score,
    metadata: {
      answer: faq.answer
    }
  })),
  userSignals
});

const buildPromptContext = ({ user, query, history, sessionContext, retrieval, contextSummary }) => {
  const recentHistory = history.slice(-10).map((message) => ({
    role: message.sender === 'user' ? 'user' : 'assistant',
    content: `${message.sender === 'user' ? 'User' : 'LoopBot'}: ${message.text}`
  }));

  return [
    `User profile: ${JSON.stringify({
      name: user?.name || 'MarketLoop user',
      roles: user?.roles || [user?.role || 'buyer'],
      activeRole: user?.activeRole || user?.role || 'buyer'
    })}`,
    `Session context: ${JSON.stringify(sessionContext)}`,
    `Context summary: ${contextSummary}`,
    `Retrieved products: ${JSON.stringify(retrieval.products.slice(0, 4))}`,
    `Retrieved orders: ${JSON.stringify(retrieval.orders.slice(0, 2))}`,
    `Retrieved conversations: ${JSON.stringify(retrieval.conversations.slice(0, 1))}`,
    `Relevant memories: ${JSON.stringify(retrieval.memories.slice(0, 3))}`,
    `FAQ matches: ${JSON.stringify(retrieval.faqs.slice(0, 2))}`,
    `User signals: ${JSON.stringify(retrieval.userSignals)}`,
    `Recent conversation history: ${JSON.stringify(recentHistory)}`,
    `User message: ${query}`
  ].join('\n\n');
};

const getContextAwareFallbackReply = ({ intent, sessionContext, retrieval }) => {
  if (intent === 'product_availability' && retrieval.products[0]) {
    const product = retrieval.products[0];
    return `You are looking at ${product.label}. It is currently marked ${product.metadata?.status || 'available'} in MarketLoop. You can open the product card, save it, or chat with the seller for the latest availability and pickup details.`;
  }

  if (intent === 'order_payment_support' && retrieval.orders[0]) {
    const order = retrieval.orders[0];
    return `Your recent order for ${order.label} is currently ${order.metadata?.paymentStatus || 'pending'}. You can review payment history, receipts, and seller details from the payments section.`;
  }

  if (intent === 'seller_listing_help') {
    return 'To create a listing, use the Sell button or open Dashboard and start a new product post. Add a clear title, location, images, unit of measure, quantity, and a realistic price so buyers trust the listing faster.';
  }

  if (intent === 'pricing_help' && retrieval.products.length) {
    return `I found similar listings like ${retrieval.products.slice(0, 2).map((item) => item.label).join(' and ')}. Compare category, city, condition, and unit so your pricing feels competitive without underselling.`;
  }

  if (retrieval.faqs[0]) {
    return retrieval.faqs[0].metadata?.answer || 'I can help with buying, selling, order tracking, pricing, and navigation inside MarketLoop.';
  }

  if (retrieval.products.length) {
    return `I found ${retrieval.products.length} relevant listing${retrieval.products.length > 1 ? 's' : ''} for you. Open the product cards below, or tell me your city, budget, or category to narrow the results.`;
  }

  return 'I can help with products, chats, orders, pricing, wishlist actions, payments, and seller workflows inside MarketLoop. Tell me what you are viewing or what you want to do next.';
};

const buildQuickReplies = ({ intent, sessionContext, retrieval }) => {
  if (intent === 'product_availability' && retrieval.products[0]) {
    return [
      { label: 'Show similar', value: `Show products similar to ${retrieval.products[0].label}` },
      { label: 'Chat seller', value: 'How do I chat with the seller?' },
      { label: 'Save item', value: 'How do I save this item to wishlist?' }
    ];
  }

  if (intent === 'order_payment_support') {
    return [
      { label: 'Payment history', value: 'Show my recent order status' },
      { label: 'Refund help', value: 'What happens if a payment fails?' },
      { label: 'Seller chat', value: 'How do I contact the seller?' }
    ];
  }

  if (intent === 'seller_listing_help') {
    return [
      { label: 'Add photos', value: 'How do I upload product images?' },
      { label: 'Choose pricing', value: 'Help me decide a good selling price' },
      { label: 'Listing tips', value: 'What makes a listing trustworthy?' }
    ];
  }

  if (sessionContext.pageType === 'product-details') {
    return [
      { label: 'Availability', value: 'Is this available?' },
      { label: 'Compare price', value: 'Is this price reasonable?' },
      { label: 'Seller trust', value: 'How do I evaluate this seller?' }
    ];
  }

  return defaultQuickReplies;
};

export const createChatbotReply = async ({ user, text, history = [], sessionContext = {} }) => {
  const safeText = sanitizeText(text);
  const safeContext = sanitizeContext(sessionContext);
  const intent = getQueryIntent(safeText, safeContext);
  const client = getOpenAIClient();
  const queryEmbedding = await getEmbedding(client, safeText);

  const [products, userSignals, orders, conversations, faqs, memories] = await Promise.all([
    getRelevantProducts({ query: safeText, sessionContext: safeContext }),
    getUserSignals(user?._id),
    getRelevantOrders({ userId: user?._id, query: safeText, sessionContext: safeContext }),
    getConversationContext({ userId: user?._id, query: safeText, sessionContext: safeContext }),
    Promise.resolve(getFaqMatches(safeText)),
    getRelevantMemories({ userId: user?._id, query: safeText, embedding: queryEmbedding })
  ]);

  const retrieval = buildRetrievalPayload({ products, orders, conversations, memories, faqs, userSignals });
  const contextSummary = buildContextSummary({ intent, sessionContext: safeContext, products, orders, conversations, memories, faqs, userSignals });
  const productCards = products.map(({ product }) => buildProductCard(product));
  const quickReplies = buildQuickReplies({ intent, sessionContext: safeContext, retrieval });

  let responseText = '';
  let confidence = 0.65;

  if (client) {
    try {
      const response = await client.responses.create({
        model: process.env.OPENAI_CHATBOT_MODEL || 'gpt-4.1-mini',
        instructions: [
          'You are LoopBot, a real-time intelligent marketplace assistant for MarketLoop.',
          'Use the provided marketplace context before answering.',
          'Be human, practical, and specific to the current product, orders, seller chat, or user workflow when available.',
          'Do not invent data. If something is uncertain, say what you know from context and suggest the next best action.',
          'Keep replies concise but useful. Mention relevant products/orders only when grounded in the retrieved context.'
        ].join(' '),
        input: buildPromptContext({
          user,
          query: safeText,
          history,
          sessionContext: safeContext,
          retrieval,
          contextSummary
        })
      });

      responseText = response.output_text?.trim() || '';
      confidence = responseText ? 0.86 : confidence;
    } catch {
      responseText = '';
    }
  }

  if (!responseText) {
    responseText = getContextAwareFallbackReply({ intent, sessionContext: safeContext, retrieval });
    confidence = Math.min(confidence, 0.72);
  }

  return {
    text: responseText,
    quickReplies,
    products: productCards,
    intent,
    confidence,
    contextSummary,
    sources: [
      ...retrieval.products.slice(0, 2).map((item) => buildSource('product', item.label, item.refId)),
      ...retrieval.orders.slice(0, 1).map((item) => buildSource('order', item.label, item.refId)),
      ...retrieval.conversations.slice(0, 1).map((item) => buildSource('conversation', item.label, item.refId)),
      ...retrieval.memories.slice(0, 1).map((item) => buildSource('memory', item.label, item.refId))
    ],
    logPayload: {
      sessionContext: safeContext,
      query: safeText,
      response: responseText,
      intent,
      confidence,
      queryEmbedding: queryEmbedding || [],
      retrievedContext: {
        summary: contextSummary,
        ...retrieval
      },
      learningMeta: {
        usedModel: client ? process.env.OPENAI_CHATBOT_MODEL || 'gpt-4.1-mini' : 'fallback',
        usedEmbeddings: Boolean(queryEmbedding?.length),
        sourceCount:
          retrieval.products.length +
          retrieval.orders.length +
          retrieval.conversations.length +
          retrieval.memories.length +
          retrieval.faqs.length,
        quickReplies
      }
    }
  };
};

export const storeChatbotInteraction = async ({ userId, logPayload, feedback }) => ChatbotInteraction.create({
  user: userId,
  ...logPayload,
  sessionContext: normalizeInteractionSessionContext(logPayload.sessionContext),
  ...(feedback ? { feedback } : {})
});

export const updateInteractionFeedback = async ({ interactionId, userId, helpful, note, rating }) => ChatbotInteraction.findOneAndUpdate(
  { _id: interactionId, user: userId },
  {
    $set: {
      feedback: {
        helpful,
        note: sanitizeText(note || '').slice(0, 240),
        rating,
        submittedAt: new Date()
      }
    }
  },
  { new: true }
);

export const sanitizeChatbotMessage = sanitizeText;
export const sanitizeChatbotContext = sanitizeContext;
export const normalizeChatbotInteractionContext = normalizeInteractionSessionContext;
