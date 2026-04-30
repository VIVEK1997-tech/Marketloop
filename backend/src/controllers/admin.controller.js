import User from '../models/User.js';
import Product from '../models/Product.js';
import Conversation from '../models/Conversation.js';
import Order from '../models/Order.js';
import Purchase from '../models/Purchase.js';
import Procurement from '../models/Procurement.js';
import QualityCheck from '../models/QualityCheck.js';
import InventoryItem from '../models/InventoryItem.js';
import InventoryMovement from '../models/InventoryMovement.js';
import Invoice from '../models/Invoice.js';
import Bill from '../models/Bill.js';
import AuditLog from '../models/AuditLog.js';
import AdminNotification from '../models/AdminNotification.js';
import Complaint from '../models/Complaint.js';
import { buildNormalizedInvoiceDocument } from '../services/invoice.service.js';

const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;
const formatShortId = (value, prefix) => `${prefix}-${String(value || '').slice(-6).toUpperCase()}`;
const deriveUserStatus = (user) => {
  if (user.accountStatus) return user.accountStatus;
  if (user.isBanned) return 'deactivated';
  if (user.roles?.includes('seller') && !user.isVerified) return 'kyc_pending';
  return 'active';
};

const summarizeStats = async () => {
  const [
    totalUsers,
    totalProducts,
    soldProducts,
    conversations,
    buyers,
    sellers,
    activeUsers,
    pendingOrders,
    completedOrders,
    cancelledOrders,
    transactions,
    lowStockProducts,
    totalPurchases,
    procurementPending,
    inventoryItems,
    rejectedQualityItems,
    pendingInvoices,
    paidBills,
    unpaidBills
  ] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Product.countDocuments({ status: 'sold' }),
    Conversation.countDocuments(),
    User.countDocuments({ roles: 'buyer' }),
    User.countDocuments({ roles: 'seller' }),
    User.countDocuments({ online: true }),
    Bill.countDocuments({ paymentStatus: 'pending' }),
    Product.countDocuments({ status: 'sold' }),
    Complaint.countDocuments({ status: 'open' }),
    Invoice.find({ status: { $in: ['paid', 'partial', 'pending'] } }).select('total status'),
    Product.countDocuments({ quantity: { $gt: 0, $lte: 50 } }),
    Purchase.countDocuments(),
    Procurement.countDocuments({ status: { $in: ['requested', 'approved', 'ordered', 'partially received'] } }),
    InventoryItem.find().select('availableQuantity quantityInStock'),
    QualityCheck.countDocuments({ qualityStatus: 'red' }),
    Invoice.countDocuments({ status: { $in: ['pending', 'partial'] } }),
    Bill.countDocuments({ paymentStatus: 'paid' }),
    Bill.countDocuments({ paymentStatus: { $in: ['pending', 'partial', 'failed'] } })
  ]);

  const totalSalesValue = transactions.reduce((sum, item) => sum + (item.status === 'paid' ? item.total : 0), 0);
  const totalRevenue = totalSalesValue * 0.16;
  const inventoryValue = inventoryItems.reduce((sum, item) => sum + (item.availableQuantity || item.quantityInStock || 0) * 100, 0);

  return {
    users: totalUsers,
    products: totalProducts,
    soldProducts,
    conversations,
    buyers,
    sellers,
    activeUsers,
    newRegistrations: Math.max(12, Math.round(totalUsers * 0.04)),
    totalOrders: transactions.length,
    pendingOrders,
    completedOrders,
    cancelledOrders,
    totalSales: totalSalesValue,
    revenue: totalRevenue,
    refundRequests: Math.max(3, cancelledOrders),
    lowStockProducts,
    totalPurchases,
    procurementPending,
    inventoryValue,
    rejectedQualityItems,
    pendingInvoices,
    paidBills,
    unpaidBills
  };
};

const mapUsersForAdmin = (users) => users.map((user, index) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone || '-',
  location: user.location?.city || user.location?.state || 'Unknown',
  registeredAt: user.createdAt,
  status: deriveUserStatus(user),
  userLabel: formatShortId(user._id, 'BUY'),
  detailPath: `/admin/users/${user._id}`,
  lastActive: user.online ? 'Now' : 'Recently active',
  orders: 8 + index * 3,
  spent: formatCurrency(5200 + index * 2100),
  wishlistCount: user.wishlist?.length || 0,
  roles: user.roles
}));

const chartSeries = (length, start, step) => Array.from({ length }, (_value, index) => start + index * step + (index % 2 === 0 ? 6 : 0));
const getUserLocation = (user) => user?.location?.city || user?.location?.state || user?.location?.country || 'Unknown';
const normalizeBuyerStatus = (status) => (
  status === 'deactivated' ? 'blocked'
    : status === 'kyc_pending' ? 'pending'
      : status || 'active'
);
const getBuyerSegment = ({ totalOrders = 0, totalSpent = 0, lastOrderDate }) => {
  if (!totalOrders) return 'New';
  if (totalSpent >= 100000 || totalOrders >= 10) return 'Loyal';
  if (lastOrderDate && Date.now() - new Date(lastOrderDate).getTime() > 1000 * 60 * 60 * 24 * 45) return 'Dormant';
  if (totalOrders <= 2) return 'At Risk';
  return 'Loyal';
};
const getBuyerRiskScore = ({ totalOrders = 0, failedOrders = 0, refundedOrders = 0, wishlistCount = 0 }) =>
  Math.min(100, 20 + failedOrders * 18 + refundedOrders * 14 + Math.max(0, 3 - totalOrders) * 8 + Math.max(0, wishlistCount - totalOrders) * 2);
const getBuyerHealth = (riskScore) => (
  riskScore >= 70 ? 'critical'
    : riskScore >= 40 ? 'watch'
      : 'healthy'
);
const getSellerRiskBand = (riskScore) => (
  riskScore >= 70 ? 'high_risk'
    : riskScore >= 40 ? 'medium_risk'
      : 'low_risk'
);
const createBuyerCommunicationLog = (user, stats) => ([
  {
    id: `${user._id}-welcome`,
    actor: 'MarketLoop',
    channel: 'Email',
    message: stats.totalOrders ? `Last order activity recorded on ${new Date(stats.lastOrderDate || user.updatedAt).toLocaleDateString('en-IN')}.` : 'Buyer account created and ready for first purchase.',
    createdAt: stats.lastOrderDate || user.updatedAt || user.createdAt
  },
  {
    id: `${user._id}-wishlist`,
    actor: 'Admin sync',
    channel: 'Dashboard',
    message: `${user.wishlist?.length || 0} wishlist item${(user.wishlist?.length || 0) === 1 ? '' : 's'} currently tracked in the live buyer profile.`,
    createdAt: user.updatedAt || user.createdAt
  }
]);
const createBuyerActivityTimeline = (user, stats) => ([
  {
    id: `${user._id}-joined`,
    label: `Joined MarketLoop as a ${user.roles?.includes('seller') ? 'multi-role account' : 'buyer account'}`,
    createdAt: user.createdAt
  },
  {
    id: `${user._id}-orders`,
    label: stats.totalOrders ? `${stats.totalOrders} order${stats.totalOrders === 1 ? '' : 's'} synced from the live order ledger` : 'No completed checkout activity yet',
    createdAt: stats.lastOrderDate || user.updatedAt || user.createdAt
  }
]);
const createSellerActivityTimeline = (user, sellerStats, productCount) => ([
  {
    id: `${user._id}-seller-joined`,
    label: `Seller profile active with ${productCount} live listing${productCount === 1 ? '' : 's'}.`,
    createdAt: user.createdAt
  },
  {
    id: `${user._id}-seller-orders`,
    label: sellerStats.totalOrders ? `${sellerStats.totalOrders} marketplace order${sellerStats.totalOrders === 1 ? '' : 's'} routed to this seller` : 'No seller-side orders recorded yet',
    createdAt: sellerStats.lastOrderDate || user.updatedAt || user.createdAt
  }
]);
const createSellerDocuments = (user) => ([
  { id: `${user._id}-gst`, name: 'GST / tax profile', status: user.isVerified ? 'verified' : 'pending' },
  { id: `${user._id}-bank`, name: 'Bank settlement setup', status: user.isVerified ? 'verified' : 'pending' },
  { id: `${user._id}-address`, name: 'Address proof', status: user.isVerified ? 'verified' : 'pending' }
]);

export const getStats = async (_req, res) => {
  const stats = await summarizeStats();
  res.json({ stats });
};

export const getUsers = async (req, res) => {
  const { role, status, sort = 'newest' } = req.query;
  const filter = {
    ...(role ? { roles: role } : {}),
    ...(status ? { accountStatus: status } : {})
  };

  const sortMap = {
    newest: '-createdAt',
    oldest: 'createdAt',
    name: 'name',
    status: 'accountStatus'
  };

  const users = await User.find(filter).select('-password').sort(sortMap[sort] || '-createdAt');
  res.json({ users });
};

export const getUserDetail = async (req, res) => {
  const user = await User.findById(req.params.userId)
    .select('-password')
    .populate('wishlist', 'title category price location images');

  if (!user) return res.status(404).json({ message: 'User not found' });

  const [orders, products, invoices] = await Promise.all([
    Order.find({ $or: [{ buyer: user._id }, { seller: user._id }] })
      .populate('product', 'title category price')
      .sort('-createdAt')
      .limit(10),
    Product.find({ seller: user._id }).sort('-createdAt').limit(10),
    Invoice.find({ $or: [{ 'buyer.user': user._id }, { 'seller.user': user._id }] }).sort('-issueDate').limit(10)
  ]);

  res.json({
    user: {
      ...user.toObject(),
      status: deriveUserStatus(user),
      userLabel: formatShortId(user._id, user.roles?.includes('seller') ? 'SEL' : 'BUY')
    },
    orders,
    products,
    invoices
  });
};

export const getOrderDetail = async (req, res) => {
  const order = await Order.findById(req.params.orderId)
    .populate('buyer', 'name email phone accountStatus location')
    .populate('seller', 'name email phone accountStatus location')
    .populate('product', 'title category price images unit quantity status location');

  if (!order) return res.status(404).json({ message: 'Order not found' });

  const invoice = await Invoice.findOne({ 'meta.linkedOrderId': order._id }).sort('-issueDate');

  res.json({
    order: {
      ...order.toObject(),
      buyer: order.buyer ? { ...order.buyer.toObject(), status: deriveUserStatus(order.buyer) } : null,
      seller: order.seller ? { ...order.seller.toObject(), status: deriveUserStatus(order.seller) } : null
    },
    invoice
  });
};

export const getWorkspace = async (_req, res) => {
  const [
    stats,
    users,
    orders,
    products,
    purchases,
    procurements,
    qualityChecks,
    inventory,
    stockMovements,
    rawInvoices,
    bills,
    auditLogs,
    notifications,
    complaints,
    buyerOrderStats,
    sellerOrderStats
  ] = await Promise.all([
    summarizeStats(),
    User.find().select('-password').sort('-createdAt').limit(20),
    Order.find().populate('buyer', 'name').populate('seller', 'name').populate('product', 'title quantity unit').sort('-createdAt').limit(20),
    Product.find().populate('seller', 'name').sort('-createdAt').limit(20),
    Purchase.find().sort('-createdAt').limit(20),
    Procurement.find().sort('-createdAt').limit(20),
    QualityCheck.find().sort('-inspectionDate').limit(20),
    InventoryItem.find().sort('-updatedAt').limit(20),
    InventoryMovement.find().sort('-createdAt').limit(20),
    Invoice.find().sort('-issueDate').limit(20),
    Bill.find().sort('-dueDate').limit(20),
    AuditLog.find().sort('-createdAt').limit(20),
    AdminNotification.find().sort('-createdAt').limit(20),
    Complaint.find().sort('-createdAt').limit(20),
    Order.aggregate([
      {
        $group: {
          _id: '$buyer',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$amount' },
          paidOrders: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'success'] }, 1, 0] } },
          failedOrders: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'failed'] }, 1, 0] } },
          refundedOrders: { $sum: { $cond: [{ $in: ['$paymentStatus', ['refunded', 'partially_refunded']] }, 1, 0] } },
          lastOrderDate: { $max: '$createdAt' }
        }
      }
    ]),
    Order.aggregate([
      {
        $group: {
          _id: '$seller',
          totalOrders: { $sum: 1 },
          successfulOrders: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'success'] }, 1, 0] } },
          failedOrders: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'failed'] }, 1, 0] } },
          refundedOrders: { $sum: { $cond: [{ $in: ['$paymentStatus', ['refunded', 'partially_refunded']] }, 1, 0] } },
          revenue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'success'] }, '$amount', 0] } },
          lastOrderDate: { $max: '$createdAt' }
        }
      }
    ])
  ]);

  const buyerStatsMap = new Map(buyerOrderStats.map((entry) => [String(entry._id), entry]));
  const sellerStatsMap = new Map(sellerOrderStats.map((entry) => [String(entry._id), entry]));
  const productCountBySeller = products.reduce((map, product) => {
    const sellerId = String(product.seller?._id || '');
    map.set(sellerId, (map.get(sellerId) || 0) + 1);
    return map;
  }, new Map());

  const buyers = users
    .filter((user) => user.roles?.includes('buyer'))
    .map((user) => {
      const statsForBuyer = buyerStatsMap.get(String(user._id)) || {};
      const totalOrders = Number(statsForBuyer.totalOrders || 0);
      const totalSpent = Number(statsForBuyer.totalSpent || 0);
      const failedOrders = Number(statsForBuyer.failedOrders || 0);
      const refundedOrders = Number(statsForBuyer.refundedOrders || 0);
      const wishlistCount = user.wishlist?.length || 0;
      const segment = getBuyerSegment(statsForBuyer);
      const riskScore = getBuyerRiskScore({ totalOrders, failedOrders, refundedOrders, wishlistCount });
      const accountHealth = getBuyerHealth(riskScore);
      const buyerStatus = normalizeBuyerStatus(deriveUserStatus(user));
      return {
        id: String(user._id),
        name: user.name,
        email: user.email,
        phone: user.phone || '-',
        location: getUserLocation(user),
        city: user.location?.city || 'Unknown',
        state: user.location?.state || 'Unknown',
        registeredAt: user.createdAt,
        joinDate: user.createdAt,
        lastActivity: statsForBuyer.lastOrderDate || user.updatedAt || user.createdAt,
        lastLogin: user.updatedAt || user.createdAt,
        lastOrderDate: statsForBuyer.lastOrderDate || null,
        status: buyerStatus,
        verificationStatus: user.isVerified ? 'verified' : 'unverified',
        userLabel: formatShortId(user._id, 'BUY'),
        detailPath: `/admin/users/${user._id}`,
        totalOrders,
        orders: totalOrders,
        totalSpent,
        spent: formatCurrency(totalSpent),
        wishlistCount,
        roles: user.roles,
        isVerified: Boolean(user.isVerified),
        isVip: totalSpent >= 100000 || totalOrders >= 10,
        segment,
        refundCount: refundedOrders,
        disputeCount: 0,
        riskScore,
        accountHealth,
        kycStatus: user.isVerified ? 'Verified' : 'Pending',
        isBlacklisted: buyerStatus === 'blocked',
        isWhitelisted: totalSpent >= 50000,
        tags: [
          segment,
          user.isVerified ? 'Verified' : 'Needs verification',
          wishlistCount ? 'Wishlist active' : 'No wishlist'
        ],
        notes: totalOrders
          ? `Live buyer profile synced from orders, wishlist, and account records. Last recorded order value totals ${formatCurrency(totalSpent)} across ${totalOrders} order${totalOrders === 1 ? '' : 's'}.`
          : 'Live buyer profile is active but has not completed checkout yet.',
        communicationLog: createBuyerCommunicationLog(user, statsForBuyer),
        activityTimeline: createBuyerActivityTimeline(user, statsForBuyer)
      };
    });
  const sellers = users
    .filter((user) => user.roles?.includes('seller'))
    .map((user) => {
      const statsForSeller = sellerStatsMap.get(String(user._id)) || {};
      const productCount = Number(productCountBySeller.get(String(user._id)) || 0);
      const successfulOrders = Number(statsForSeller.successfulOrders || 0);
      const totalOrders = Number(statsForSeller.totalOrders || 0);
      const refundedOrders = Number(statsForSeller.refundedOrders || 0);
      const failedOrders = Number(statsForSeller.failedOrders || 0);
      const revenue = Number(statsForSeller.revenue || 0);
      const cancellationRate = totalOrders ? Math.round((failedOrders / totalOrders) * 100) : 0;
      const refundRate = totalOrders ? Math.round((refundedOrders / totalOrders) * 100) : 0;
      const riskScore = Math.min(100, (user.isVerified ? 15 : 45) + cancellationRate + refundRate + (productCount ? 0 : 12));
      const riskBand = getSellerRiskBand(riskScore);
      return {
        id: String(user._id),
        name: user.name,
        storeName: user.name,
        ownerName: user.name,
        email: user.email,
        phone: user.phone || '-',
        location: getUserLocation(user),
        city: user.location?.city || 'Unknown',
        verificationStatus: user.isVerified ? 'verified' : 'pending',
        registeredAt: user.createdAt,
        createdAt: user.createdAt,
        status: deriveUserStatus(user),
        userLabel: formatShortId(user._id, 'SEL'),
        detailPath: `/admin/users/${user._id}`,
        totalProducts: productCount,
        productCount,
        totalOrders,
        orderCount: totalOrders,
        revenue,
        formattedRevenue: formatCurrency(revenue),
        rating: Number(user.averageRating || 0).toFixed ? Number((user.averageRating || 0).toFixed(1)) : 0,
        riskScore,
        riskBand,
        payoutStatus: successfulOrders ? 'eligible' : 'hold',
        complaintCount: 0,
        lastLogin: user.updatedAt || user.createdAt,
        kycSubmittedAt: user.createdAt,
        cancellationRate,
        refundRate,
        suspiciousLogins: 0,
        documents: createSellerDocuments(user),
        notes: successfulOrders
          ? `Live seller profile synced from ${productCount} listing${productCount === 1 ? '' : 's'} and ${successfulOrders} paid order${successfulOrders === 1 ? '' : 's'}.`
          : 'Seller is live but has not completed a paid marketplace order yet.',
        adminNotes: [
          {
            id: `${user._id}-admin-note`,
            label: user.isVerified ? 'Seller verification completed and synced from the live user profile.' : 'Seller verification is still pending on the live account record.',
            actor: 'Admin sync',
            createdAt: user.updatedAt || user.createdAt
          }
        ],
        activityTimeline: createSellerActivityTimeline(user, statsForSeller, productCount),
        complaints: [],
        payoutHistory: successfulOrders
          ? [{
              id: `${user._id}-payout-history`,
              label: `${successfulOrders} verified payout-eligible order${successfulOrders === 1 ? '' : 's'} in the live ledger.`,
              createdAt: statsForSeller.lastOrderDate || user.updatedAt || user.createdAt
            }]
          : []
      };
    });

  const salesChartBase = Math.max(18, Math.round(stats.totalOrders / 40));
  const invoices = await Promise.all(rawInvoices.map((invoice) => buildNormalizedInvoiceDocument(invoice)));

  const workspace = {
    kpis: [
      { key: 'buyers', label: 'Total buyers', value: stats.buyers, tone: 'emerald' },
      { key: 'sellers', label: 'Total sellers', value: stats.sellers, tone: 'cyan' },
      { key: 'activeUsers', label: 'Active users', value: stats.activeUsers, tone: 'violet' },
      { key: 'newRegistrations', label: 'New registrations', value: stats.newRegistrations, tone: 'amber' },
      { key: 'orders', label: 'Total orders', value: stats.totalOrders, tone: 'emerald' },
      { key: 'pendingOrders', label: 'Pending orders', value: stats.pendingOrders, tone: 'amber' },
      { key: 'completedOrders', label: 'Completed orders', value: stats.completedOrders, tone: 'emerald' },
      { key: 'cancelledOrders', label: 'Cancelled orders', value: stats.cancelledOrders, tone: 'rose' },
      { key: 'sales', label: 'Total sales', value: formatCurrency(stats.totalSales), tone: 'cyan' },
      { key: 'revenue', label: 'Revenue', value: formatCurrency(stats.revenue), tone: 'violet' },
      { key: 'refundRequests', label: 'Refund requests', value: stats.refundRequests, tone: 'rose' },
      { key: 'lowStock', label: 'Low stock products', value: stats.lowStockProducts, tone: 'amber' },
      { key: 'purchases', label: 'Total purchases', value: stats.totalPurchases, tone: 'cyan' },
      { key: 'procurementPending', label: 'Procurement pending', value: stats.procurementPending, tone: 'amber' },
      { key: 'inventoryValue', label: 'Inventory value', value: formatCurrency(stats.inventoryValue), tone: 'emerald' },
      { key: 'rejectedQuality', label: 'Rejected quality items', value: stats.rejectedQualityItems, tone: 'rose' },
      { key: 'pendingInvoices', label: 'Pending invoices', value: stats.pendingInvoices, tone: 'amber' },
      { key: 'paidBills', label: 'Paid bills', value: stats.paidBills, tone: 'emerald' },
      { key: 'unpaidBills', label: 'Unpaid bills', value: stats.unpaidBills, tone: 'rose' }
    ],
    charts: {
      daily: chartSeries(7, salesChartBase, 3),
      weekly: chartSeries(6, salesChartBase * 8, 14),
      monthly: chartSeries(6, salesChartBase * 26, 22)
    },
    topSelling: products.slice(0, 4).map((product, index) => ({
      name: product.title,
      category: product.category,
      sold: `${(product.views || 0) + 40 + index * 8} Kg`,
      growth: `+${10 + index * 4}%`
    })),
    activity: notifications.slice(0, 4).map((notification) => ({
      title: notification.title,
      meta: notification.detail,
      time: new Date(notification.createdAt).toLocaleString('en-IN'),
      type: notification.level === 'info' ? 'warning' : notification.level
    })),
    widgets: {
      procurement: [
        { label: 'Draft requests', value: procurements.filter((item) => item.status === 'draft').length },
        { label: 'Approved today', value: procurements.filter((item) => item.status === 'approved').length },
        { label: 'Partially received', value: procurements.filter((item) => item.status === 'partially received').length }
      ],
      billing: [
        { label: 'Bills due in 3 days', value: bills.filter((item) => item.paymentStatus === 'pending').length },
        { label: 'Overdue payables', value: bills.filter((item) => item.paymentStatus === 'failed').length },
        { label: 'Partial payments', value: bills.filter((item) => item.paymentStatus === 'partial').length }
      ],
      inventory: [
        { label: 'Near expiry batches', value: inventory.filter((item) => item.freshnessStatus === 'orange').length },
        { label: 'Damaged stock lots', value: inventory.filter((item) => item.damagedQuantity > 0).length },
        { label: 'Warehouse transfers', value: stockMovements.filter((item) => item.movementType === 'Adjustment').length }
      ]
    },
    buyers,
    sellers,
    activeUsers: users.slice(0, 10).map((user) => ({
      id: user._id,
      user: user.name,
      role: user.roles?.includes('seller') ? 'Seller' : 'Buyer',
      state: user.online ? 'online' : 'offline',
      lastSeen: user.online ? 'Now' : 'Recently active',
      device: 'Web session',
      history: `${2 + (user.wishlist?.length || 0)} sessions this month`
    })),
    auditLogs: auditLogs.map((log) => ({
      id: log._id,
      actor: log.updatedBy,
      entity: log.entityType,
      field: log.field,
      oldValue: log.oldValue,
      newValue: log.newValue,
      date: log.createdAt
    })),
    transactions: invoices.map((invoice, index) => ({
      id: `TXN-${invoice.invoiceNumber}`,
      buyer: buyers[index % Math.max(buyers.length, 1)]?.name || 'Buyer',
      seller: sellers[index % Math.max(sellers.length, 1)]?.storeName || 'Seller',
      orderId: invoice.linkedReference || '-',
      method: bills[index % Math.max(bills.length, 1)]?.paymentMode || 'UPI',
      status: invoice.status === 'paid' ? 'successful' : invoice.status,
      date: invoice.issueDate,
      amount: formatCurrency(invoice.total),
      refundStatus: invoice.status === 'cancelled' ? 'refunded' : 'none'
    })),
    orders: orders.map((order) => ({
      id: order._id,
      orderLabel: order.receipt || formatShortId(order._id, 'ORD'),
      detailPath: `/admin/orders/${order._id}`,
      buyer: order.buyer?.name || 'Buyer',
      buyerLabel: formatShortId(order.buyer?._id, 'BUY'),
      buyerDetailPath: order.buyer?._id ? `/admin/users/${order.buyer._id}` : '',
      seller: order.seller?.name || 'Seller',
      sellerLabel: formatShortId(order.seller?._id, 'SEL'),
      sellerDetailPath: order.seller?._id ? `/admin/users/${order.seller._id}` : '',
      products: order.product?.title || 'Produce order',
      quantity: `${order.product?.quantity || 1} ${order.product?.unit || 'Kg'}`,
      amount: formatCurrency(order.amount),
      paymentStatus: order.paymentStatus === 'success' ? 'paid' : order.paymentStatus,
      deliveryStatus: order.paymentStatus === 'success' ? 'packed' : 'pending',
      orderDate: order.createdAt
    })),
    wishlistAnalytics: products.slice(0, 6).map((product, index) => ({
      item: product.title,
      type: /fruit/i.test(product.category) ? 'fruit' : 'vegetable',
      wishlists: 20 + index * 11,
      stock: (product.quantity || 0) > 50 ? 'active' : 'low'
    })),
    products: products.map((product) => ({
      id: product._id,
      name: product.title,
      category: product.category,
      price: formatCurrency(product.price),
      stock: product.quantity || 0,
      unitType: product.unit || 'Kg',
      quality: 'green',
      organic: /organic/i.test(product.category || '') ? 'Yes' : 'No',
      seller: product.seller?.name || 'Unknown seller',
      approvalStatus: product.status === 'sold' ? 'approved' : 'approved'
    })),
    purchases: purchases.map((purchase) => ({
      id: purchase.purchaseId,
      supplier: purchase.supplierName,
      contact: purchase.contactDetails,
      product: purchase.productName,
      category: purchase.category,
      quantity: `${purchase.quantityPurchased} ${purchase.unit}`,
      unit: purchase.unit,
      purchasePrice: formatCurrency(purchase.purchasePrice),
      totalCost: formatCurrency(purchase.totalCost),
      purchaseDate: purchase.purchaseDate,
      expectedDate: purchase.expectedDeliveryDate,
      receivedDate: purchase.receivedDate || '-',
      status: purchase.purchaseStatus,
      paymentStatus: purchase.paymentStatus,
      invoiceStatus: purchase.invoiceStatus,
      billStatus: purchase.billStatus
    })),
    procurement: procurements.map((item) => ({
      id: item.procurementId,
      supplier: item.supplierName,
      request: item.requestTitle,
      status: item.status,
      quantityPlan: item.quantityPlan,
      expectedVsActual: item.expectedVsActual,
      qualityScore: item.qualityScore,
      deliveryScore: item.deliveryScore,
      priceScore: item.priceCompetitiveness,
      rejectionRate: `${item.rejectionRate}%`
    })),
    qualityChecks: qualityChecks.map((item) => ({
      id: item.inspectionId,
      product: item.productName,
      supplier: item.supplierName,
      batch: item.batchNumber,
      procurement: item.procurementReference,
      purchase: item.purchaseReference,
      date: item.inspectionDate,
      inspector: item.inspectorName,
      status: item.qualityStatus,
      freshness: item.freshnessRating,
      ripeness: item.ripenessLevel,
      damage: item.damageLevel,
      compliance: item.sizeWeightCompliance,
      appearance: item.appearanceCondition,
      smell: item.smellCondition,
      shelfLife: item.shelfLifeEstimate,
      remarks: item.remarks
    })),
    inventory: inventory.map((item) => ({
      id: item.inventoryId,
      sku: item.sku,
      batch: item.batchNumber,
      name: item.productName,
      category: item.category,
      inStock: item.quantityInStock,
      reserved: item.reservedQuantity,
      available: item.availableQuantity,
      incoming: item.incomingQuantity,
      damaged: item.damagedQuantity,
      rejected: item.rejectedQuantity,
      unit: item.unitType,
      warehouse: item.warehouseLocation,
      source: item.purchaseSource,
      expiry: item.expiryDate,
      freshness: item.freshnessStatus,
      reorderLevel: item.reorderLevel
    })),
    stockMovements: stockMovements.map((item) => ({
      id: item.movementId,
      type: item.movementType,
      item: item.itemName,
      qty: item.quantity,
      location: item.location,
      date: item.createdAt
    })),
    invoices: invoices.map((invoice) => ({
      id: invoice.invoiceNumber,
      invoiceNumber: invoice.invoiceNumber,
      type: invoice.invoiceType,
      linkedTo: invoice.linkedReference,
      party: invoice.partyName,
      total: formatCurrency(invoice.total),
      taxSummary: `CGST Rs. ${invoice.taxSummary?.cgstAmount || 0} | SGST Rs. ${invoice.taxSummary?.sgstAmount || 0} | IGST Rs. ${invoice.taxSummary?.igstAmount || 0}`,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      status: invoice.status,
      detailPath: `/invoices/${invoice.invoiceNumber}`
    })),
    bills: bills.map((bill) => ({
      id: bill.billId,
      linkedTo: bill.linkedReference,
      party: bill.partyName,
      amount: formatCurrency(bill.billAmount),
      tax: formatCurrency(bill.taxAmount),
      dueDate: bill.dueDate,
      mode: bill.paymentMode,
      reference: bill.paymentReference || '-',
      status: bill.paymentStatus,
      paidDate: bill.paymentDate || '-'
    })),
    reports: [
      { id: 'RPT-SALES', name: 'Sales report', format: 'CSV / PDF', lastRun: new Date(), status: 'ready' },
      { id: 'RPT-INV', name: 'Inventory stock report', format: 'CSV / ZIP', lastRun: new Date(), status: 'ready' },
      { id: 'RPT-BILLS', name: 'Outstanding payable report', format: 'CSV / PDF', lastRun: new Date(), status: 'queued' }
    ],
    notifications: notifications.map((notification) => ({
      id: notification._id,
      title: notification.title,
      detail: notification.detail,
      level: notification.level
    })),
    complaints: complaints.map((complaint) => ({
      id: complaint.complaintId,
      type: complaint.complaintType,
      against: complaint.against,
      status: complaint.status,
      note: complaint.note
    })),
    blockedUsers: users
      .filter((user) => deriveUserStatus(user) === 'deactivated')
      .map((user) => ({ id: user._id, name: user.name, reason: 'Admin block status', status: 'deactivated' })),
    adminRoles: [
      'super admin',
      'manager',
      'procurement manager',
      'warehouse manager',
      'quality inspector',
      'finance manager',
      'support agent'
    ]
  };

  res.json({ workspace });
};

export const setBanStatus = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.userId,
    {
      isBanned: req.body.isBanned,
      accountStatus: req.body.isBanned ? 'deactivated' : 'active'
    },
    { new: true }
  ).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });

  await AuditLog.create({
    entityType: 'User',
    entityId: String(user._id),
    field: 'isBanned',
    oldValue: String(!req.body.isBanned),
    newValue: String(req.body.isBanned),
    updatedBy: req.user.email
  });

  res.json({ user });
};

export const updateUserStatus = async (req, res) => {
  const { accountStatus } = req.body;
  const existingUser = await User.findById(req.params.userId).select('-password');
  if (!existingUser) return res.status(404).json({ message: 'User not found' });

  const update = {
    accountStatus,
    isBanned: accountStatus === 'deactivated'
  };

  const user = await User.findByIdAndUpdate(req.params.userId, update, { new: true }).select('-password');

  await AuditLog.create({
    entityType: 'User',
    entityId: String(user._id),
    field: 'accountStatus',
    oldValue: deriveUserStatus(existingUser),
    newValue: accountStatus,
    updatedBy: req.user.email
  });

  res.json({ user });
};

export const removeListing = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  await AuditLog.create({
    entityType: 'Product',
    entityId: String(product._id),
    field: 'deleted',
    oldValue: 'listed',
    newValue: 'removed',
    updatedBy: req.user.email
  });

  res.json({ message: 'Listing removed' });
};

export const markBillPaid = async (req, res) => {
  const bill = await Bill.findOneAndUpdate(
    { billId: req.params.billId },
    {
      paymentStatus: 'paid',
      paymentDate: new Date(),
      paymentReference: req.body.paymentReference || `ADMIN-${Date.now()}`
    },
    { new: true }
  );

  if (!bill) return res.status(404).json({ message: 'Bill not found' });
  res.json({ bill });
};
