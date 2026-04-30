const buyerNames = ['Riya Sharma', 'Karan Mehta', 'Naina Patel', 'Aarav Singh', 'Meera Joshi', 'Kabir Reddy', 'Diya Kapoor', 'Pranav Desai'];
const sellerNames = ['FreshFarm Bengaluru', 'Green Basket Pune', 'Daily Organics Delhi', 'Urban Harvest Mumbai', 'Prime Agro Hyderabad', 'Royal Produce Chennai'];
const cities = [
  { city: 'Bengaluru', state: 'Karnataka', area: 'HSR Layout' },
  { city: 'Pune', state: 'Maharashtra', area: 'Baner' },
  { city: 'Delhi', state: 'Delhi', area: 'Dwarka' },
  { city: 'Mumbai', state: 'Maharashtra', area: 'Powai' },
  { city: 'Hyderabad', state: 'Telangana', area: 'Gachibowli' },
  { city: 'Chennai', state: 'Tamil Nadu', area: 'Anna Nagar' }
];
const productCatalog = [
  { name: 'Banana Premium Lot', price: 42 },
  { name: 'Organic Spinach Bunch', price: 24 },
  { name: 'Dragon Fruit Crate', price: 1450 },
  { name: 'Tomato Essentials Basket', price: 160 },
  { name: 'Mango Family Pack', price: 320 },
  { name: 'Leafy Greens Combo', price: 110 },
  { name: 'Root Vegetables Kit', price: 210 },
  { name: 'Strawberry Premium Box', price: 280 }
];
const paymentStatuses = ['Pending', 'Paid', 'Failed', 'Refunded', 'Partially Refunded', 'COD Pending', 'Chargeback'];
const deliveryStatuses = ['Pending', 'Assigned', 'Packed', 'Shipped', 'In Transit', 'Out for Delivery', 'Delivered', 'Failed Attempt', 'Returned', 'Cancelled'];
const orderStatuses = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Failed', 'Returned', 'Refunded', 'Partially Refunded', 'On Hold', 'Disputed'];
const gateways = ['Razorpay', 'PayU', 'Stripe', 'PayPal', 'COD'];
const deliveryPartners = ['Delhivery', 'Blue Dart', 'XpressBees', 'DTDC', 'Shadowfax', 'Ecom Express'];
const exceptionPool = ['Payment Mismatch', 'Delivery Delay', 'Refund Watch', 'Fraud Review'];
const noteTemplates = [
  'Admin reviewed payment discrepancy and requested gateway sync.',
  'Seller informed about packing delay due to fresh stock arrival.',
  'Buyer asked for expedited delivery before event date.',
  'Refund queue flagged this order for manual verification.',
  'Ops team escalated delivery SLA breach to courier partner.'
];
const timelineTemplates = [
  'Order created',
  'Payment attempted',
  'Warehouse packed shipment',
  'Courier updated shipment status',
  'Customer support touched the order'
];

const today = new Date('2026-04-24T10:30:00+05:30');
const dayMs = 24 * 60 * 60 * 1000;
const hourMs = 60 * 60 * 1000;
const agoIso = ({ days = 0, hours = 0 }) => new Date(today.getTime() - (days * dayMs + hours * hourMs)).toISOString();
const futureIso = ({ days = 0, hours = 0 }) => new Date(today.getTime() + (days * dayMs + hours * hourMs)).toISOString();

const buildOrderId = (index) => `ORD-${String(500000 + index * 17).slice(-6)}`;
const buildBuyerId = (index) => `BUY-${String(100000 + index * 13).slice(-6)}`;
const buildSellerId = (index) => `SEL-${String(200000 + index * 19).slice(-6)}`;
const buildTransactionId = (index) => `TXN-${String(900000 + index * 23).slice(-6)}`;
const buildTrackingId = (index) => `TRK-${String(700000 + index * 29).slice(-6)}`;

const deriveRiskScore = ({ paymentStatus, amount, isNewBuyer, sellerScore, deliveryDelayHours, refundRequests, failedAttempts, disputeStatus, chargebackHistory }) => {
  const score =
    (paymentStatus === 'Failed' ? 18 : paymentStatus === 'Chargeback' ? 35 : paymentStatus === 'Pending' ? 10 : 0) +
    (amount > 15000 && isNewBuyer ? 16 : 0) +
    (sellerScore < 3.8 ? 10 : 0) +
    (deliveryDelayHours > 24 ? 12 : deliveryDelayHours > 12 ? 6 : 0) +
    refundRequests * 7 +
    failedAttempts * 8 +
    (disputeStatus !== 'None' ? 16 : 0) +
    (chargebackHistory ? 18 : 0);

  return Math.min(97, 10 + score);
};

const riskBand = (score) => (score >= 70 ? 'high_risk' : score >= 40 ? 'medium_risk' : 'low_risk');

const buildLineItems = (index) => {
  const count = 1 + (index % 3);
  return Array.from({ length: count }, (_, itemIndex) => {
    const product = productCatalog[(index + itemIndex) % productCatalog.length];
    const quantity = 1 + ((index + itemIndex) % 5);
    return {
      id: `line-${index}-${itemIndex}`,
      productName: product.name,
      quantity,
      unit: itemIndex % 2 === 0 ? 'Kg' : 'Crate',
      unitPrice: product.price,
      subtotal: quantity * product.price
    };
  });
};

const buildTimeline = (index, prefix, count = 5) =>
  Array.from({ length: count }, (_, entryIndex) => ({
    id: `${prefix}-${index}-${entryIndex}`,
    label: timelineTemplates[(index + entryIndex) % timelineTemplates.length],
    createdAt: agoIso({ days: index % 8, hours: entryIndex * 4 }),
    actor: entryIndex % 2 === 0 ? 'System' : 'Admin'
  }));

export const generateMockOrders = (count = 1000) =>
  Array.from({ length: count }, (_, index) => {
    const buyerName = buyerNames[index % buyerNames.length];
    const sellerName = sellerNames[index % sellerNames.length];
    const buyerId = buildBuyerId(index + 1);
    const sellerId = buildSellerId(index + 1);
    const location = cities[index % cities.length];
    const lineItems = buildLineItems(index + 1);
    const quantity = lineItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = lineItems.reduce((sum, item) => sum + item.subtotal, 0);
    const discount = index % 5 === 0 ? Math.round(subtotal * 0.08) : index % 3 === 0 ? Math.round(subtotal * 0.04) : 0;
    const shipping = subtotal > 1200 ? 0 : 80 + (index % 4) * 20;
    const tax = Math.round((subtotal - discount) * 0.05);
    const totalAmount = subtotal - discount + tax + shipping;
    const paymentStatus = paymentStatuses[index % paymentStatuses.length];
    const deliveryStatus = deliveryStatuses[index % deliveryStatuses.length];
    const orderStatus =
      paymentStatus === 'Refunded' ? 'Refunded' :
      paymentStatus === 'Partially Refunded' ? 'Partially Refunded' :
      deliveryStatus === 'Delivered' ? 'Delivered' :
      deliveryStatus === 'Cancelled' ? 'Cancelled' :
      deliveryStatus === 'Returned' ? 'Returned' :
      deliveryStatus === 'Out for Delivery' ? 'Out for Delivery' :
      deliveryStatus === 'Shipped' ? 'Shipped' :
      deliveryStatus === 'Packed' ? 'Packed' :
      index % 11 === 0 ? 'Disputed' :
      index % 7 === 0 ? 'On Hold' :
      index % 5 === 0 ? 'Confirmed' :
      'Pending';
    const disputeStatus = orderStatus === 'Disputed' ? 'Open' : index % 23 === 0 ? 'Resolved' : 'None';
    const refundStatus = paymentStatus.includes('Refund') ? paymentStatus : 'None';
    const deliveryDelayHours = deliveryStatus === 'In Transit' ? 14 + (index % 20) : deliveryStatus === 'Failed Attempt' ? 30 : index % 6;
    const failedAttempts = deliveryStatus === 'Failed Attempt' ? 1 + (index % 3) : 0;
    const refundRequests = refundStatus !== 'None' ? 1 + (index % 2) : 0;
    const sellerScore = 3.4 + ((index % 12) * 0.12);
    const isNewBuyer = index % 9 === 0;
    const chargebackHistory = paymentStatus === 'Chargeback';
    const score = deriveRiskScore({ paymentStatus, amount: totalAmount, isNewBuyer, sellerScore, deliveryDelayHours, refundRequests, failedAttempts, disputeStatus, chargebackHistory });
    const band = riskBand(score);
    const exceptionBadges = [
      paymentStatus === 'Pending' && ['Shipped', 'Delivered'].includes(deliveryStatus) ? 'Payment Mismatch' : null,
      deliveryDelayHours > 24 ? 'Delivery Delay' : null,
      refundStatus !== 'None' ? 'Refund Watch' : null,
      band === 'high_risk' ? 'Fraud Review' : null
    ].filter(Boolean);

    return {
      id: buildOrderId(index + 1),
      orderId: buildOrderId(index + 1),
      buyerId,
      buyerName,
      sellerId,
      sellerName,
      productList: lineItems.map((item) => item.productName).join(', '),
      lineItems,
      quantity,
      amount: totalAmount,
      amountLabel: `Rs. ${totalAmount.toLocaleString('en-IN')}`,
      orderDate: agoIso({ days: index % 40, hours: index % 12 }),
      paymentStatus,
      deliveryStatus,
      orderStatus,
      transactionId: buildTransactionId(index + 1),
      paymentGateway: gateways[index % gateways.length],
      trackingId: buildTrackingId(index + 1),
      deliveryPartner: deliveryPartners[index % deliveryPartners.length],
      shippingAddress: `${location.area}, ${location.city}, ${location.state}`,
      estimatedDeliveryDate: futureIso({ days: 1 + (index % 4) }),
      actualDeliveryDate: deliveryStatus === 'Delivered' ? agoIso({ days: index % 3 }) : null,
      refundStatus,
      disputeStatus,
      riskFlag: band,
      riskScore: score,
      exceptionBadges,
      adminNoteCount: 1 + (index % 5),
      paymentAttempts: 1 + (index % 3),
      coupon: index % 4 === 0 ? 'FRESH50' : null,
      tax,
      shipping,
      discount,
      notes: noteTemplates[index % noteTemplates.length],
      auditTrail: buildTimeline(index + 1, 'audit', 4).map((entry, entryIndex) => ({
        ...entry,
        field: entryIndex % 2 === 0 ? 'orderStatus' : 'deliveryStatus',
        oldValue: entryIndex % 2 === 0 ? 'Pending' : 'Assigned',
        newValue: entryIndex % 2 === 0 ? orderStatus : deliveryStatus,
        reason: noteTemplates[(index + entryIndex) % noteTemplates.length]
      })),
      deliveryTimeline: buildTimeline(index + 1, 'delivery', 5),
      paymentHistory: buildTimeline(index + 1, 'payment', 3).map((entry, entryIndex) => ({
        ...entry,
        gatewayResponse: entryIndex === 0 ? 'Captured' : entryIndex === 1 ? 'Pending confirmation' : 'Webhook synced'
      })),
      suspicious: band === 'high_risk'
    };
  });
