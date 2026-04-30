const today = new Date('2026-04-23T10:00:00+05:30');

const daysAgo = (days) => new Date(today.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

export const adminSections = [
  { id: 'overview', label: 'Overview' },
  { id: 'paymentStatus', label: 'Payment Status' },
  { id: 'buyers', label: 'Buyers' },
  { id: 'sellers', label: 'Sellers' },
  { id: 'active', label: 'Active Users' },
  { id: 'orders', label: 'Orders' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'products', label: 'Products' },
  { id: 'purchases', label: 'Purchases' },
  { id: 'procurement', label: 'Procurement' },
  { id: 'quality', label: 'Quality' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'invoices', label: 'Invoices' },
  { id: 'bills', label: 'Bills' },
  { id: 'reports', label: 'Reports' },
  { id: 'safety', label: 'Safety & Support' }
];

export const baseAdminData = {
  kpis: [
    { key: 'buyers', label: 'Total buyers', value: 1248, tone: 'emerald' },
    { key: 'sellers', label: 'Total sellers', value: 214, tone: 'cyan' },
    { key: 'activeUsers', label: 'Active users', value: 382, tone: 'violet' },
    { key: 'newRegistrations', label: 'New registrations', value: 46, tone: 'amber' },
    { key: 'orders', label: 'Total orders', value: 3890, tone: 'emerald' },
    { key: 'pendingOrders', label: 'Pending orders', value: 118, tone: 'amber' },
    { key: 'completedOrders', label: 'Completed orders', value: 3546, tone: 'emerald' },
    { key: 'cancelledOrders', label: 'Cancelled orders', value: 61, tone: 'rose' },
    { key: 'sales', label: 'Total sales', value: 'Rs. 42.8L', tone: 'cyan' },
    { key: 'revenue', label: 'Revenue', value: 'Rs. 6.9L', tone: 'violet' },
    { key: 'refundRequests', label: 'Refund requests', value: 17, tone: 'rose' },
    { key: 'lowStock', label: 'Low stock products', value: 29, tone: 'amber' },
    { key: 'purchases', label: 'Total purchases', value: 421, tone: 'cyan' },
    { key: 'procurementPending', label: 'Procurement pending', value: 14, tone: 'amber' },
    { key: 'inventoryValue', label: 'Inventory value', value: 'Rs. 18.4L', tone: 'emerald' },
    { key: 'rejectedQuality', label: 'Rejected quality items', value: 11, tone: 'rose' },
    { key: 'pendingInvoices', label: 'Pending invoices', value: 37, tone: 'amber' },
    { key: 'paidBills', label: 'Paid bills', value: 112, tone: 'emerald' },
    { key: 'unpaidBills', label: 'Unpaid bills', value: 23, tone: 'rose' }
  ],
  charts: {
    daily: [12, 18, 14, 22, 28, 24, 31],
    weekly: [122, 135, 160, 148, 172, 190],
    monthly: [480, 520, 610, 640, 705, 760]
  },
  topSelling: [
    { name: 'Banana', category: 'Fresh Fruits', sold: '12.4 tons', growth: '+18%' },
    { name: 'Tomato', category: 'Fresh Vegetables', sold: '10.1 tons', growth: '+11%' },
    { name: 'Onion', category: 'Root Vegetables', sold: '9.6 tons', growth: '+9%' },
    { name: 'Mango', category: 'Fresh Fruits', sold: '8.8 tons', growth: '+22%' }
  ],
  activity: [
    { title: 'New seller waiting for approval', meta: 'Nashik Orchard Hub submitted KYC documents', time: '8 min ago', type: 'warning' },
    { title: 'Low stock alert', meta: 'Spinach batch SG-209 fell below reorder level', time: '14 min ago', type: 'alert' },
    { title: 'Invoice generated', meta: 'Sales invoice INV-S-240423-0182 created for Delhi order', time: '32 min ago', type: 'success' },
    { title: 'Quality rejection', meta: '12 crates of strawberries moved to rejected stock', time: '49 min ago', type: 'danger' }
  ],
  widgets: {
    procurement: [
      { label: 'Draft requests', value: 8 },
      { label: 'Approved today', value: 5 },
      { label: 'Partially received', value: 3 }
    ],
    billing: [
      { label: 'Bills due in 3 days', value: 7 },
      { label: 'Overdue payables', value: 4 },
      { label: 'Partial payments', value: 6 }
    ],
    inventory: [
      { label: 'Near expiry batches', value: 15 },
      { label: 'Damaged stock lots', value: 9 },
      { label: 'Warehouse transfers', value: 12 }
    ]
  },
  buyers: [
    { id: 'BUY-1001', name: 'Riya Sharma', email: 'riya@marketloop.test', phone: '9876501234', location: 'Bengaluru', registeredAt: daysAgo(18), status: 'active', lastActive: '3 min ago', orders: 24, spent: 'Rs. 18,420', wishlistCount: 11 },
    { id: 'BUY-1002', name: 'Karan Mehta', email: 'karan@marketloop.test', phone: '9911002200', location: 'Delhi', registeredAt: daysAgo(7), status: 'suspended', lastActive: '2 days ago', orders: 8, spent: 'Rs. 5,610', wishlistCount: 4 },
    { id: 'BUY-1003', name: 'Naina Patel', email: 'naina@marketloop.test', phone: '9822334455', location: 'Pune', registeredAt: daysAgo(40), status: 'blocked', lastActive: '7 days ago', orders: 37, spent: 'Rs. 29,810', wishlistCount: 17 }
  ],
  sellers: [
    { id: 'SEL-2201', name: 'FreshFarm Bengaluru', storeName: 'FreshFarm Bengaluru', email: 'freshfarm.bengaluru@marketloop.test', phone: '9876501234', location: 'Bengaluru', verificationStatus: 'verified', registeredAt: daysAgo(90), status: 'active', totalProducts: 42, totalOrders: 312, revenue: 'Rs. 4.8L', rating: 4.7 },
    { id: 'SEL-2202', name: 'Green Basket Pune', storeName: 'Green Basket Pune', email: 'greenbasket.pune@marketloop.test', phone: '9988001122', location: 'Pune', verificationStatus: 'pending', registeredAt: daysAgo(22), status: 'pending verification', totalProducts: 28, totalOrders: 164, revenue: 'Rs. 2.1L', rating: 4.5 },
    { id: 'SEL-2203', name: 'Daily Organics Delhi', storeName: 'Daily Organics Delhi', email: 'dailyorganics.delhi@marketloop.test', phone: '9090901111', location: 'Delhi', verificationStatus: 'verified', registeredAt: daysAgo(120), status: 'active', totalProducts: 51, totalOrders: 281, revenue: 'Rs. 3.9L', rating: 4.8 }
  ],
  activeUsers: [
    { id: 'SESS-1', user: 'Riya Sharma', role: 'Buyer', state: 'online', lastSeen: 'Now', device: 'Chrome / Android', history: '5 sessions this week' },
    { id: 'SESS-2', user: 'FreshFarm Bengaluru', role: 'Seller', state: 'recent', lastSeen: '12 min ago', device: 'Chrome / Windows', history: '19 logins this month' },
    { id: 'SESS-3', user: 'Daily Organics Delhi', role: 'Seller', state: 'offline', lastSeen: '6 hrs ago', device: 'Safari / iPhone', history: '9 logins this week' }
  ],
  auditLogs: [
    { id: 'AUD-1', actor: 'super-admin', entity: 'Seller profile', field: 'bankAccount', oldValue: 'XXXX2201', newValue: 'XXXX9912', date: daysAgo(1) },
    { id: 'AUD-2', actor: 'support-agent', entity: 'Buyer profile', field: 'phone', oldValue: '9876500000', newValue: '9876501234', date: daysAgo(2) },
    { id: 'AUD-3', actor: 'finance-manager', entity: 'Invoice', field: 'status', oldValue: 'pending', newValue: 'paid', date: daysAgo(3) }
  ],
  transactions: [
    { id: 'TXN-9031', buyer: 'Riya Sharma', seller: 'FreshFarm Bengaluru', orderId: 'ORD-5001', method: 'UPI', status: 'successful', date: daysAgo(1), amount: 'Rs. 1,280', refundStatus: 'none' },
    { id: 'TXN-9032', buyer: 'Karan Mehta', seller: 'Green Basket Pune', orderId: 'ORD-5002', method: 'Card', status: 'pending', date: daysAgo(0), amount: 'Rs. 860', refundStatus: 'requested' },
    { id: 'TXN-9033', buyer: 'Naina Patel', seller: 'Daily Organics Delhi', orderId: 'ORD-5003', method: 'Wallet', status: 'refunded', date: daysAgo(4), amount: 'Rs. 1,940', refundStatus: 'completed' }
  ],
  orders: [
    { id: 'ORD-5001', buyer: 'Riya Sharma', seller: 'FreshFarm Bengaluru', products: 'Banana, Papaya, Mango', quantity: '34 Kg', amount: 'Rs. 1,280', paymentStatus: 'paid', deliveryStatus: 'packed', orderDate: daysAgo(1) },
    { id: 'ORD-5002', buyer: 'Karan Mehta', seller: 'Green Basket Pune', products: 'Tomato, Onion, Potato', quantity: '52 Kg', amount: 'Rs. 860', paymentStatus: 'pending', deliveryStatus: 'pending', orderDate: daysAgo(0) },
    { id: 'ORD-5003', buyer: 'Naina Patel', seller: 'Daily Organics Delhi', products: 'Kiwi, Strawberry', quantity: '7 Crates', amount: 'Rs. 1,940', paymentStatus: 'refunded', deliveryStatus: 'cancelled', orderDate: daysAgo(4) }
  ],
  wishlistAnalytics: [
    { item: 'Mango', type: 'fruit', wishlists: 184, stock: 'healthy' },
    { item: 'Spinach', type: 'vegetable', wishlists: 139, stock: 'low' },
    { item: 'Tomato', type: 'vegetable', wishlists: 121, stock: 'healthy' }
  ],
  products: [
    { id: 'PRD-101', name: 'Banana Premium Lot', category: 'Fruits', price: 'Rs. 42', stock: 420, unitType: 'kg', quality: 'green', organic: 'No', seller: 'FreshFarm Bengaluru', approvalStatus: 'approved' },
    { id: 'PRD-102', name: 'Organic Spinach Bunch', category: 'Organic produce', price: 'Rs. 24', stock: 38, unitType: 'bunch', quality: 'orange', organic: 'Yes', seller: 'Daily Organics Delhi', approvalStatus: 'approved' },
    { id: 'PRD-103', name: 'Dragon Fruit Crate', category: 'Exotic produce', price: 'Rs. 1,450', stock: 6, unitType: 'crate', quality: 'green', organic: 'No', seller: 'Daily Organics Delhi', approvalStatus: 'pending' }
  ],
  purchases: [
    { id: 'PUR-301', supplier: 'Nashik Wholesale Hub', contact: '9977001122', product: 'Onion', category: 'Vegetables', quantity: '80 Quintal', unit: 'Quintal', purchasePrice: 'Rs. 1,520', totalCost: 'Rs. 1,21,600', purchaseDate: daysAgo(3), expectedDate: daysAgo(-1), receivedDate: '-', status: 'ordered', paymentStatus: 'pending', invoiceStatus: 'pending', billStatus: 'unpaid' },
    { id: 'PUR-302', supplier: 'Kolar Fruit Traders', contact: '9988776655', product: 'Mango', category: 'Fruits', quantity: '45 Crates', unit: 'Crate', purchasePrice: 'Rs. 820', totalCost: 'Rs. 36,900', purchaseDate: daysAgo(6), expectedDate: daysAgo(2), receivedDate: daysAgo(2), status: 'received', paymentStatus: 'paid', invoiceStatus: 'generated', billStatus: 'paid' }
  ],
  procurement: [
    { id: 'PROC-91', supplier: 'Kolar Fruit Traders', request: 'Summer mango sourcing', status: 'approved', quantityPlan: '600 Crates', expectedVsActual: '420 / 600', qualityScore: 4.6, deliveryScore: 4.2, priceScore: 4.4, rejectionRate: '3.2%' },
    { id: 'PROC-92', supplier: 'Azadpur Veg Aggregator', request: 'Leafy greens weekly plan', status: 'partially received', quantityPlan: '350 Kg', expectedVsActual: '210 / 350', qualityScore: 4.1, deliveryScore: 3.9, priceScore: 4.0, rejectionRate: '5.8%' }
  ],
  qualityChecks: [
    { id: 'QC-441', product: 'Strawberry', supplier: 'Kolar Fruit Traders', batch: 'ST-APR-21', procurement: 'PROC-91', purchase: 'PUR-302', date: daysAgo(2), inspector: 'Neha (QI)', status: 'red', freshness: 2, ripeness: 'Overripe', damage: 'High', compliance: 'Fail', appearance: 'Bruised', smell: 'Fermented', shelfLife: '1 day', remarks: 'Reject and return to supplier' },
    { id: 'QC-442', product: 'Spinach', supplier: 'Azadpur Veg Aggregator', batch: 'SG-209', procurement: 'PROC-92', purchase: 'PUR-301', date: daysAgo(1), inspector: 'Aman (QI)', status: 'orange', freshness: 3, ripeness: 'Fresh', damage: 'Moderate', compliance: 'Pass', appearance: 'Slight wilting', smell: 'Normal', shelfLife: '2 days', remarks: 'Discount sale recommended' },
    { id: 'QC-443', product: 'Banana', supplier: 'Nashik Wholesale Hub', batch: 'BN-144', procurement: 'PROC-88', purchase: 'PUR-298', date: daysAgo(1), inspector: 'Aman (QI)', status: 'green', freshness: 5, ripeness: 'Ready', damage: 'Low', compliance: 'Pass', appearance: 'Bright yellow', smell: 'Sweet', shelfLife: '4 days', remarks: 'Approved for sale' }
  ],
  inventory: [
    { id: 'INV-7001', sku: 'BAN-001', batch: 'BN-144', name: 'Banana', category: 'Fruits', inStock: 540, reserved: 120, available: 420, incoming: 210, damaged: 8, rejected: 0, unit: 'Kg', warehouse: 'Bengaluru A', source: 'PUR-298', expiry: daysAgo(-3), freshness: 'green', reorderLevel: 150 },
    { id: 'INV-7002', sku: 'SPN-024', batch: 'SG-209', name: 'Spinach', category: 'Vegetables', inStock: 62, reserved: 24, available: 38, incoming: 0, damaged: 5, rejected: 3, unit: 'Bunch', warehouse: 'Pune Cold Room', source: 'PUR-301', expiry: daysAgo(1), freshness: 'orange', reorderLevel: 50 },
    { id: 'INV-7003', sku: 'DRF-010', batch: 'DF-318', name: 'Dragon Fruit', category: 'Exotic produce', inStock: 12, reserved: 6, available: 6, incoming: 18, damaged: 0, rejected: 0, unit: 'Crate', warehouse: 'Delhi Premium Bay', source: 'PUR-305', expiry: daysAgo(-7), freshness: 'green', reorderLevel: 8 }
  ],
  stockMovements: [
    { id: 'MOV-1', type: 'Inward', item: 'Banana', qty: '210 Kg', location: 'Bengaluru A', date: daysAgo(1) },
    { id: 'MOV-2', type: 'Adjustment', item: 'Spinach', qty: '-5 Bunch', location: 'Pune Cold Room', date: daysAgo(1) },
    { id: 'MOV-3', type: 'Wastage', item: 'Strawberry', qty: '-12 Crates', location: 'Delhi Premium Bay', date: daysAgo(2) }
  ],
  invoices: [
    { id: 'INV-S-240423-0182', type: 'Customer invoice', linkedTo: 'ORD-5001', party: 'Riya Sharma', total: 'Rs. 1,280', issueDate: daysAgo(1), dueDate: daysAgo(-6), status: 'paid' },
    { id: 'INV-P-240423-0091', type: 'Purchase invoice', linkedTo: 'PUR-301', party: 'Nashik Wholesale Hub', total: 'Rs. 1,21,600', issueDate: daysAgo(3), dueDate: daysAgo(2), status: 'pending' }
  ],
  bills: [
    { id: 'BILL-8001', linkedTo: 'INV-P-240423-0091', party: 'Nashik Wholesale Hub', amount: 'Rs. 1,21,600', tax: 'Rs. 6,080', dueDate: daysAgo(2), mode: 'Bank transfer', reference: '-', status: 'pending', paidDate: '-' },
    { id: 'BILL-8002', linkedTo: 'INV-P-240423-0082', party: 'Kolar Fruit Traders', amount: 'Rs. 36,900', tax: 'Rs. 1,845', dueDate: daysAgo(8), mode: 'UPI', reference: 'UPI923401', status: 'paid', paidDate: daysAgo(5) }
  ],
  reports: [
    { id: 'RPT-1', name: 'Sales report', format: 'CSV / PDF', lastRun: daysAgo(1), status: 'ready' },
    { id: 'RPT-2', name: 'Inventory stock report', format: 'CSV / ZIP', lastRun: daysAgo(0), status: 'ready' },
    { id: 'RPT-3', name: 'Outstanding payable report', format: 'CSV / PDF', lastRun: daysAgo(2), status: 'queued' }
  ],
  notifications: [
    { id: 'NT-1', title: 'New seller registration', detail: 'Pune Organic Yard needs approval', level: 'info' },
    { id: 'NT-2', title: 'Payment failure', detail: 'Order ORD-5002 payment failed on card retry', level: 'danger' },
    { id: 'NT-3', title: 'Near expiry alert', detail: 'Spinach batch SG-209 expires in 2 days', level: 'warning' }
  ],
  complaints: [
    { id: 'CMP-1', type: 'Buyer complaint', against: 'FreshFarm Bengaluru', status: 'open', note: 'Received underripe papaya in last order' },
    { id: 'CMP-2', type: 'Seller complaint', against: 'Riya Sharma', status: 'resolved', note: 'Disputed a delivered banana lot' }
  ],
  blockedUsers: [
    { id: 'BLK-1', name: 'Naina Patel', reason: 'Repeated chargeback attempts', status: 'blocked' },
    { id: 'BLK-2', name: 'Vendor East Hub', reason: 'KYC mismatch on payout account', status: 'suspended' }
  ],
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

export const buildAdminData = ({ stats, users = [], products = [] } = {}) => {
  const next = structuredClone(baseAdminData);

  if (stats) {
    next.kpis = next.kpis.map((item) => {
      const mappedValue =
        item.key === 'buyers' ? stats.users :
        item.key === 'sellers' ? next.sellers.length :
        item.key === 'orders' ? stats.conversations :
        item.key === 'completedOrders' ? stats.soldProducts :
        item.key === 'products' ? stats.products :
        undefined;
      return mappedValue !== undefined ? { ...item, value: mappedValue } : item;
    });
  }

  if (users.length) {
    next.buyers = users
      .filter((user) => (user.roles || [user.role]).includes('buyer'))
      .slice(0, 6)
      .map((user, index) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '-',
        location: user.location?.city || user.location?.state || 'Unknown',
        registeredAt: user.createdAt,
        status: user.isBanned ? 'blocked' : 'active',
        lastActive: user.online ? 'Now' : 'Recently active',
        orders: 8 + index * 3,
        spent: `Rs. ${(5200 + index * 2100).toLocaleString('en-IN')}`,
        wishlistCount: 2 + index
      }));

    next.sellers = users
      .filter((user) => (user.roles || [user.role]).includes('seller'))
      .slice(0, 6)
      .map((user, index) => ({
        id: user._id,
        name: user.name,
        storeName: user.name,
        email: user.email,
        phone: user.phone || '-',
        location: user.location?.city || user.location?.state || 'Unknown',
        verificationStatus: user.isVerified ? 'verified' : 'pending',
        registeredAt: user.createdAt,
        status: user.isBanned ? 'blocked' : 'active',
        totalProducts: 10 + index * 4,
        totalOrders: 40 + index * 11,
        revenue: `Rs. ${(80000 + index * 22500).toLocaleString('en-IN')}`,
        rating: Number((4.2 + index * 0.1).toFixed(1))
      }));
  }

  if (products.length) {
    next.products = products.slice(0, 8).map((product) => ({
      id: product._id,
      name: product.title,
      category: product.category,
      price: `Rs. ${Number(product.price || 0).toLocaleString('en-IN')}`,
      stock: product.quantity || 0,
      unitType: product.unit || 'Kg',
      quality: 'green',
      organic: /organic/i.test(product.category || '') ? 'Yes' : 'No',
      seller: product.seller?.name || 'Unknown seller',
      approvalStatus: 'approved'
    }));
  }

  return next;
};
