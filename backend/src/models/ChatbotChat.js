import mongoose from 'mongoose';

const chatbotMessageSchema = new mongoose.Schema(
  {
    sender: { type: String, enum: ['user', 'bot'], required: true },
    text: { type: String, required: true, trim: true },
    intent: { type: String, trim: true },
    confidence: { type: Number, min: 0, max: 1 },
    contextSummary: { type: String, trim: true },
    sources: [
      {
        type: { type: String, trim: true },
        label: { type: String, trim: true },
        refId: { type: String, trim: true }
      }
    ],
    interactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatbotInteraction' },
    context: {
      pageType: String,
      currentPath: String,
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
      conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
      searchQuery: String
    },
    quickReplies: [{ label: String, value: String }],
    products: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        title: String,
        price: Number,
        category: String,
        location: String,
        image: String
      }
    ],
    feedback: {
      helpful: Boolean,
      note: String,
      submittedAt: Date
    },
    timestamp: { type: Date, default: Date.now }
  },
  { _id: false }
);

const chatbotChatSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    messages: [chatbotMessageSchema]
  },
  { timestamps: true }
);

export default mongoose.model('ChatbotChat', chatbotChatSchema);
