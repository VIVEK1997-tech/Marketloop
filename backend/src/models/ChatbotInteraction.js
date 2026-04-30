import mongoose from 'mongoose';

const retrievedItemSchema = new mongoose.Schema(
  {
    type: { type: String, trim: true },
    refId: { type: String, trim: true },
    label: { type: String, trim: true },
    score: { type: Number, min: 0 },
    metadata: mongoose.Schema.Types.Mixed
  },
  { _id: false }
);

const chatbotInteractionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sessionContext: {
      pageType: { type: String, trim: true, index: true },
      currentPath: { type: String, trim: true },
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
      conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
      searchQuery: { type: String, trim: true }
    },
    query: { type: String, required: true, trim: true },
    response: { type: String, required: true, trim: true },
    intent: { type: String, trim: true, index: true },
    confidence: { type: Number, min: 0, max: 1 },
    queryEmbedding: [{ type: Number }],
    retrievedContext: {
      summary: { type: String, trim: true },
      products: [retrievedItemSchema],
      orders: [retrievedItemSchema],
      conversations: [retrievedItemSchema],
      memories: [retrievedItemSchema],
      faqs: [retrievedItemSchema],
      userSignals: mongoose.Schema.Types.Mixed
    },
    feedback: {
      helpful: Boolean,
      note: String,
      rating: { type: Number, min: 1, max: 5 },
      submittedAt: Date
    },
    learningMeta: {
      usedModel: { type: String, trim: true },
      usedEmbeddings: { type: Boolean, default: false },
      sourceCount: { type: Number, min: 0 },
      quickReplies: [{ label: String, value: String }]
    }
  },
  { timestamps: true }
);

chatbotInteractionSchema.index({ user: 1, createdAt: -1 });
chatbotInteractionSchema.index({ intent: 1, createdAt: -1 });

export default mongoose.model('ChatbotInteraction', chatbotInteractionSchema);
