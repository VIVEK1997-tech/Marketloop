import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import userRoutes from './routes/user.routes.js';
import chatRoutes from './routes/chat.routes.js';
import chatbotRoutes from './routes/chatbot.routes.js';
import reviewRoutes from './routes/review.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import adminRoutes from './routes/admin.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';
import coreRoutes from './routes/core.routes.js';
import paymentLinkRoutes from './routes/paymentLink.routes.js';
import { notFound, errorHandler } from './middleware/error.middleware.js';
import { sendSuccess } from './utils/apiResponse.js';
import { getAllowedOrigins } from './config/origins.js';

const app = express();
const allowedOrigins = new Set(getAllowedOrigins());

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true
}));
app.use(
  [
    '/api/payment/webhook',
    '/api/payments/webhook',
    '/api/payment/cashfree/webhook',
    '/api/payments/cashfree/webhook',
    '/api/payment/hdfc/webhook',
    '/api/payments/hdfc/webhook'
  ],
  express.raw({ type: '*/*', limit: '2mb' })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }));
app.use('/uploads', express.static('uploads'));

app.get('/api/health', (_req, res) => sendSuccess(res, {
  status: 'ok',
  database: 'mongodb',
  serverTime: new Date().toISOString()
}));
app.use('/api', coreRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', paymentLinkRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
