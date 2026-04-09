import mongoose from 'mongoose';

const chatbotMessageSchema = new mongoose.Schema(
  {
    sender: { type: String, enum: ['user', 'bot'], required: true },
    text: { type: String, required: true, trim: true },
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
