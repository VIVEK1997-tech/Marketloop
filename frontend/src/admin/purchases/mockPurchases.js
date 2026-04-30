const suppliers = [
  ['Nashik Fresh Hub', 'Nashik'],
  ['Pune Farm Link', 'Pune'],
  ['Agri Roots Co', 'Indore'],
  ['Delhi Greens Supply', 'Delhi'],
  ['Surat Orchard Partners', 'Surat'],
  ['Jaipur Harvest Co', 'Jaipur'],
  ['Bengaluru Organics Yard', 'Bengaluru'],
  ['Hyderabad mandi Connect', 'Hyderabad'],
  ['Lucknow Agro Traders', 'Lucknow'],
  ['Chandigarh Produce Lane', 'Chandigarh'],
  ['Kochi Fresh Produce', 'Kochi'],
  ['Nagpur Citrus House', 'Nagpur']
];

const products = [
  ['Tomato', 'Vegetables', 'Kg'],
  ['Onion', 'Vegetables', 'Kg'],
  ['Potato', 'Vegetables', 'Kg'],
  ['Apple', 'Fruits', 'Crate'],
  ['Banana', 'Fruits', 'Dozen'],
  ['Mango', 'Fruits', 'Crate'],
  ['Cauliflower', 'Vegetables', 'Kg'],
  ['Carrot', 'Vegetables', 'Kg'],
  ['Capsicum', 'Vegetables', 'Kg'],
  ['Spinach', 'Leafy Greens', 'Bunch'],
  ['Coriander', 'Herbs', 'Bunch'],
  ['Watermelon', 'Fruits', 'Piece']
];

const purchaseStatuses = ['Draft', 'Pending Approval', 'Ordered', 'Partially Received', 'Received', 'Quality Check', 'Rejected', 'Cancelled', 'Closed'];
const billStatuses = ['Invoice Missing', 'Bill Ready', 'Bill Review', 'Bill Approved'];
const paymentStatuses = ['Unpaid', 'Partially Paid', 'Paid', 'Overdue', 'Invoice Missing', 'Payment Scheduled'];
const supplierRisks = ['Low Risk', 'Medium Risk', 'High Risk'];
const adminNames = ['Neha Admin', 'Rohan Ops', 'Anika Finance', 'Kabir Procurement', 'Sara Quality'];

const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (list) => list[random(0, list.length - 1)];

const formatDate = (date) => new Date(date).toISOString();

const createAuditLog = (purchaseId, purchaseStatus, paymentStatus) => {
  const base = [
    { id: `${purchaseId}-log-1`, actor: pick(adminNames), action: 'Purchase order created', detail: 'Initial supplier draft was recorded.', timestamp: formatDate(Date.now() - random(5, 22) * 86400000) },
    { id: `${purchaseId}-log-2`, actor: pick(adminNames), action: `Status updated to ${purchaseStatus}`, detail: 'Workflow state synced in admin operations.', timestamp: formatDate(Date.now() - random(2, 12) * 86400000) },
    { id: `${purchaseId}-log-3`, actor: pick(adminNames), action: `Bill state marked ${paymentStatus}`, detail: 'Finance activity captured for purchase ledger.', timestamp: formatDate(Date.now() - random(0, 6) * 86400000) }
  ];
  return base.sort((left, right) => new Date(right.timestamp) - new Date(left.timestamp));
};

const computeSupplierScoreBand = (score) => {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 55) return 'Average';
  return 'Needs Review';
};

const computeBillReadiness = ({ invoiceUploaded, invoiceMatched, purchaseStatus, quantityOrdered, quantityReceived }) => {
  const receivingComplete = quantityReceived >= quantityOrdered;
  const qualityPassed = ['Received', 'Closed'].includes(purchaseStatus);
  const ready = invoiceUploaded && invoiceMatched && receivingComplete && qualityPassed;
  return {
    ready,
    checks: {
      invoiceUploaded,
      invoiceMatched,
      receivingComplete,
      qualityPassed
    }
  };
};

export const generateDummyPurchases = (count = 1000) =>
  Array.from({ length: count }, (_, index) => {
    const [supplierName, supplierCity] = pick(suppliers);
    const [productName, category, unit] = pick(products);
    const quantityOrdered = random(40, 800);
    const purchaseStatus = pick(purchaseStatuses);
    const quantityReceived =
      purchaseStatus === 'Draft' || purchaseStatus === 'Pending Approval' ? 0 :
      purchaseStatus === 'Ordered' ? random(0, Math.floor(quantityOrdered * 0.2)) :
      purchaseStatus === 'Partially Received' ? random(Math.floor(quantityOrdered * 0.2), Math.floor(quantityOrdered * 0.8)) :
      purchaseStatus === 'Rejected' ? random(Math.floor(quantityOrdered * 0.2), quantityOrdered) :
      quantityOrdered;
    const quantityDamaged = quantityReceived > 0 ? random(0, Math.max(1, Math.floor(quantityReceived * 0.08))) : 0;
    const rate = random(18, 220);
    const totalCost = quantityOrdered * rate;
    const invoiceUploaded = Math.random() > 0.18;
    const invoiceMatched = invoiceUploaded ? Math.random() > 0.12 : false;
    const expectedDeliveryDate = Date.now() + random(-8, 14) * 86400000;
    const receivedDate = quantityReceived ? Date.now() - random(0, 6) * 86400000 : null;
    const supplierScore = random(42, 96);
    const supplierRiskLevel = supplierScore < 58 ? 'High Risk' : supplierScore < 78 ? 'Medium Risk' : 'Low Risk';
    const paymentStatus =
      !invoiceUploaded ? 'Invoice Missing' :
      purchaseStatus === 'Closed' ? 'Paid' :
      purchaseStatus === 'Cancelled' ? 'Unpaid' :
      purchaseStatus === 'Received' && Math.random() > 0.5 ? 'Payment Scheduled' :
      pick(paymentStatuses);
    const billStatus = !invoiceUploaded ? 'Invoice Missing' : invoiceMatched ? (Math.random() > 0.3 ? 'Bill Ready' : 'Bill Approved') : 'Bill Review';
    const readiness = computeBillReadiness({ invoiceUploaded, invoiceMatched, purchaseStatus, quantityOrdered, quantityReceived });
    const overdue = expectedDeliveryDate < Date.now() && !['Received', 'Closed', 'Cancelled'].includes(purchaseStatus);
    const riskFlags = [
      ...(overdue ? ['Overdue delivery'] : []),
      ...(!invoiceMatched && invoiceUploaded ? ['Invoice mismatch'] : []),
      ...(index % 19 === 0 ? ['Duplicate purchase order'] : []),
      ...(rate > 180 ? ['Unusually high rate'] : []),
      ...(supplierRiskLevel === 'High Risk' ? ['Supplier watchlist'] : [])
    ];
    const autoApproved = totalCost < 20000 && purchaseStatus !== 'Pending Approval';
    const approvalHistory = [
      { id: `approval-${index}-1`, actor: autoApproved ? 'System rule' : pick(adminNames), action: autoApproved ? 'Auto approved low-value purchase' : 'Sent for admin approval', timestamp: formatDate(Date.now() - random(7, 20) * 86400000) },
      { id: `approval-${index}-2`, actor: pick(adminNames), action: purchaseStatus === 'Pending Approval' ? 'Awaiting manual review' : `Purchase marked ${purchaseStatus}`, timestamp: formatDate(Date.now() - random(0, 8) * 86400000) }
    ];

    return {
      id: `purchase-${index + 1}`,
      purchaseId: `PUR-${String(3100 + index).padStart(4, '0')}`,
      supplierName,
      supplierContact: `+91 98${random(10000000, 99999999)}`,
      supplierScore,
      supplierScoreBand: computeSupplierScoreBand(supplierScore),
      supplierRiskLevel,
      productName,
      category,
      quantityOrdered,
      quantityReceived,
      quantityDamaged,
      quantityPending: Math.max(quantityOrdered - quantityReceived, 0),
      unit,
      rate,
      totalCost,
      purchaseStatus,
      deliveryStatus:
        purchaseStatus === 'Ordered' ? 'In Transit' :
        purchaseStatus === 'Partially Received' ? 'Partially Received' :
        purchaseStatus === 'Received' || purchaseStatus === 'Closed' ? 'Delivered' :
        purchaseStatus === 'Cancelled' ? 'Cancelled' :
        'Pending',
      billStatus,
      paymentStatus,
      invoiceNumber: invoiceUploaded ? `INV-P-${String(8200 + index).padStart(4, '0')}` : 'Not uploaded',
      invoiceUploaded,
      invoiceMatched,
      expectedDeliveryDate: formatDate(expectedDeliveryDate),
      receivedDate: receivedDate ? formatDate(receivedDate) : null,
      createdAt: formatDate(Date.now() - random(6, 35) * 86400000),
      updatedAt: formatDate(Date.now() - random(0, 5) * 86400000),
      approvedBy: autoApproved ? 'System auto-approval' : pick(adminNames),
      adminNote: `${productName} purchase for ${supplierCity} hub. Monitor ${riskFlags[0] ? riskFlags[0].toLowerCase() : 'invoice readiness before payment'}.`,
      riskFlags,
      billReady: readiness.ready,
      billReadinessChecks: readiness.checks,
      approvalHistory,
      paymentHistory: [
        { id: `pay-${index}-1`, label: 'Payment schedule', value: paymentStatus, timestamp: formatDate(Date.now() - random(0, 6) * 86400000) },
        { id: `pay-${index}-2`, label: 'Invoice state', value: billStatus, timestamp: formatDate(Date.now() - random(1, 10) * 86400000) }
      ],
      productList: [
        {
          id: `line-${index}-1`,
          name: productName,
          quantity: quantityOrdered,
          unit,
          rate,
          total: totalCost
        }
      ],
      auditLog: createAuditLog(`purchase-${index + 1}`, purchaseStatus, paymentStatus)
    };
  });

