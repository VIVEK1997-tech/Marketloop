import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import { backfillInvoiceRecords } from '../services/invoice.service.js';

const indexHasPartialFilter = (indexSpec = {}, fieldName) => {
  const filter = indexSpec.partialFilterExpression;
  return Boolean(filter && Object.prototype.hasOwnProperty.call(filter, fieldName));
};

const indexUsesUnsupportedNe = (indexSpec = {}, fieldName) => {
  const filter = indexSpec.partialFilterExpression?.[fieldName];
  return Boolean(filter && typeof filter === 'object' && Object.prototype.hasOwnProperty.call(filter, '$ne'));
};

const ensurePaymentIndexes = async () => {
  const orderCollection = Order.collection;
  const paymentCollection = Payment.collection;

  const [orderIndexes, paymentIndexes] = await Promise.all([
    orderCollection.indexes(),
    paymentCollection.indexes()
  ]);

  const outdatedOrderIndexes = orderIndexes
    .filter((index) => [
      'razorpayOrderId_1',
      'payuTxnId_1',
      'gatewayId_1_gatewayOrderId_1',
      'gatewayId_1_gatewayPaymentId_1'
    ].includes(index.name))
    .filter((index) => {
      if (index.name === 'razorpayOrderId_1') return !indexHasPartialFilter(index, 'razorpayOrderId');
      if (index.name === 'payuTxnId_1') return !indexHasPartialFilter(index, 'payuTxnId');
      if (index.name === 'gatewayId_1_gatewayOrderId_1') return indexUsesUnsupportedNe(index, 'gatewayOrderId');
      if (index.name === 'gatewayId_1_gatewayPaymentId_1') return indexUsesUnsupportedNe(index, 'gatewayPaymentId');
      return false;
    });

  const outdatedPaymentIndexes = paymentIndexes
    .filter((index) => [
      'razorpayPaymentId_1_razorpayOrderId_1',
      'payuTxnId_1_payuMihpayId_1',
      'gatewayId_1_gatewayOrderId_1_gatewayPaymentId_1'
    ].includes(index.name))
    .filter((index) => {
      if (index.name === 'razorpayPaymentId_1_razorpayOrderId_1') return !indexHasPartialFilter(index, 'razorpayOrderId');
      if (index.name === 'payuTxnId_1_payuMihpayId_1') return !indexHasPartialFilter(index, 'payuTxnId');
      if (index.name === 'gatewayId_1_gatewayOrderId_1_gatewayPaymentId_1') {
        return indexUsesUnsupportedNe(index, 'gatewayOrderId') || indexUsesUnsupportedNe(index, 'gatewayPaymentId');
      }
      return false;
    });

  await Promise.all([
    ...outdatedOrderIndexes.map((index) => orderCollection.dropIndex(index.name)),
    ...outdatedPaymentIndexes.map((index) => paymentCollection.dropIndex(index.name))
  ]);

  await Promise.all([Order.syncIndexes(), Payment.syncIndexes()]);
};

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is required');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  await ensurePaymentIndexes();
  await backfillInvoiceRecords();
  console.log('MongoDB connected');
};

export default connectDB;
