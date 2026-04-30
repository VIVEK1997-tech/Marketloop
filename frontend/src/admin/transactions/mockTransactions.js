const buyers = ['Riya Sharma', 'Karan Mehta', 'Naina Patel', 'Aarav Singh', 'Meera Joshi', 'Kabir Reddy', 'Diya Kapoor', 'Pranav Desai'];
const sellers = ['FreshFarm Bengaluru', 'Green Basket Pune', 'Daily Organics Delhi', 'Urban Harvest Mumbai', 'Prime Agro Hyderabad'];
const methods = ['UPI', 'Card', 'Net Banking', 'Wallet', 'COD', 'PayPal', 'Stripe'];
const statuses = ['successful', 'pending', 'failed', 'refunded', 'partially_refunded', 'disputed', 'chargeback', 'settlement_pending', 'gateway_timeout'];
const refundStatuses = ['none', 'requested', 'approved', 'rejected', 'partial', 'completed'];
const gateways = ['Razorpay', 'PayU', 'Stripe', 'PayPal', 'Cashfree'];
const notes = [
  'Finance team reviewed settlement and cleared transaction.',
  'Refund request is awaiting manual validation.',
  'Gateway webhook mismatch required manual reconciliation.',
  'Chargeback alert escalated to risk desk.',
  'Support added comment after buyer dispute call.'
];
const failureReasons = [
  'Gateway timeout after authorization hold.',
  'UPI PSP declined due to bank downtime.',
  'Card 3DS challenge was abandoned by user.',
  'Wallet balance insufficient at capture stage.',
  'Settlement API returned inconsistent state.'
];

const today = new Date('2026-04-24T16:00:00+05:30');
const hourMs = 60 * 60 * 1000;
const dayMs = 24 * hourMs;
const agoIso = ({ days = 0, hours = 0 }) => new Date(today.getTime() - (days * dayMs + hours * hourMs)).toISOString();

const buildId = (index) => `TXN-${String(900000 + index * 29).slice(-6)}`;
const buildOrderId = (index) => `ORD-${String(500000 + index * 17).slice(-6)}`;
const buildPaymentReference = (index) => `PAYREF-${String(300000 + index * 41).slice(-6)}`;

const riskLevel = (amount, status, method) => {
  if (status === 'chargeback' || status === 'disputed') return 'high';
  if (amount > 12000 || status === 'gateway_timeout' || method === 'COD') return 'medium';
  return 'low';
};

export const generateMockTransactions = (count = 1000) =>
  Array.from({ length: count }, (_, index) => {
    const buyerName = buyers[index % buyers.length];
    const sellerName = sellers[index % sellers.length];
    const status = statuses[index % statuses.length];
    const method = methods[index % methods.length];
    const amount = 240 + index * 117 + ((index % 6) * 325);
    const refundStatus =
      status === 'refunded' ? 'completed' :
      status === 'partially_refunded' ? 'partial' :
      status === 'disputed' ? 'requested' :
      index % 11 === 0 ? 'requested' :
      'none';

    return {
      id: buildId(index + 1),
      buyerName,
      sellerName,
      orderId: buildOrderId(index + 1),
      method,
      status,
      amount,
      refundStatus,
      createdAt: agoIso({ days: index % 35, hours: index % 12 }),
      updatedAt: agoIso({ days: index % 18, hours: (index + 3) % 8 }),
      paymentReference: buildPaymentReference(index + 1),
      gateway: gateways[index % gateways.length],
      riskLevel: riskLevel(amount, status, method),
      failureReason: ['failed', 'gateway_timeout', 'chargeback'].includes(status) ? failureReasons[index % failureReasons.length] : '',
      adminNote: notes[index % notes.length],
      reviewed: index % 4 === 0
    };
  });
