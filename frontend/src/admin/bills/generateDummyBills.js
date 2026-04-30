const statuses = ['Draft', 'Pending', 'Partially Paid', 'Paid', 'Overdue', 'Failed', 'Cancelled'];
const paymentModes = ['UPI', 'Bank Transfer', 'Wallet', 'Card', 'Cash', 'Cheque', 'Manual'];
const priorities = ['Low', 'Medium', 'High', 'Urgent'];
const admins = ['Finance Desk', 'Accounts Team', 'Procurement Desk', 'Treasury Ops'];
const suppliers = [
  'Nashik Orchard Collective',
  'Azadpur Fresh Supply',
  'Pune Green Basket',
  'Surat Farm Traders',
  'Indore mandi Hub',
  'Jaipur Harvest Partners',
  'Bengaluru Organic Yard',
  'Mumbai Coastal Produce'
];
const productAreas = ['Fruit lots', 'Vegetable crates', 'Organic produce', 'Cold storage', 'Wholesale dispatch'];
const cities = ['Bengaluru', 'Mumbai', 'Pune', 'Nashik', 'Delhi', 'Indore', 'Jaipur', 'Surat'];
const today = new Date('2026-04-24T10:00:00+05:30').getTime();

const createRng = (seed = 515151) => {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
};

const pick = (rng, list) => list[Math.floor(rng() * list.length)];
const randomInt = (rng, min, max) => Math.floor(rng() * (max - min + 1)) + min;
const daysFromNowIso = (days) => new Date(today + days * 86400000).toISOString();

const buildTimeline = ({ billId, createdAt, paymentDate, reminderAt, status }) => {
  const events = [
    {
      id: `${billId}-event-1`,
      actor: 'Billing Engine',
      action: 'Bill created',
      detail: 'Payable record generated in billing workspace.',
      timestamp: createdAt
    },
    {
      id: `${billId}-event-2`,
      actor: 'Finance Desk',
      action: 'Bill approved',
      detail: 'Billing record reviewed for supplier payment processing.',
      timestamp: createdAt
    }
  ];

  if (reminderAt) {
    events.push({
      id: `${billId}-event-3`,
      actor: 'Accounts Team',
      action: 'Payment reminder sent',
      detail: 'Reminder logged for payable follow-up.',
      timestamp: reminderAt
    });
  }

  if (paymentDate) {
    events.push({
      id: `${billId}-event-4`,
      actor: 'Treasury Ops',
      action: status === 'Paid' ? 'Bill paid' : 'Payment recorded',
      detail: 'Payment activity updated against this bill.',
      timestamp: paymentDate
    });
  }

  if (status === 'Cancelled') {
    events.push({
      id: `${billId}-event-5`,
      actor: 'Finance Desk',
      action: 'Bill cancelled',
      detail: 'Billing record was cancelled by admin action.',
      timestamp: daysFromNowIso(-1)
    });
  }

  return events.sort((left, right) => new Date(right.timestamp) - new Date(left.timestamp));
};

export const generateDummyBills = (count = 1000) => {
  const rng = createRng(240428);

  return Array.from({ length: count }, (_, index) => {
    const supplierName = pick(rng, suppliers);
    const taxableAmount = randomInt(rng, 2500, 185000);
    const discount = randomInt(rng, 0, Math.floor(taxableAmount * 0.08));
    const lateFee = rng() > 0.88 ? randomInt(rng, 50, 900) : 0;
    const cgst = Number((taxableAmount * (rng() > 0.4 ? 0.025 : 0)).toFixed(2));
    const sgst = Number((cgst > 0 ? cgst : 0).toFixed(2));
    const igst = Number((cgst === 0 ? taxableAmount * 0.05 : 0).toFixed(2));
    const taxAmount = Number((cgst + sgst + igst).toFixed(2));
    const amount = taxableAmount - discount;
    const grandTotal = Number((amount + taxAmount + lateFee).toFixed(2));
    const createdAt = daysFromNowIso(-randomInt(rng, 2, 60));
    const billDate = createdAt;
    const dueDate = daysFromNowIso(randomInt(rng, -12, 20));
    const rawStatus = pick(rng, statuses);
    const paymentMode = pick(rng, paymentModes);
    const paidAmount =
      rawStatus === 'Paid' ? grandTotal :
      rawStatus === 'Partially Paid' ? Number((grandTotal * (0.25 + rng() * 0.5)).toFixed(2)) :
      0;
    const balanceDue = Number(Math.max(grandTotal - paidAmount, 0).toFixed(2));
    const status =
      rawStatus === 'Pending' && balanceDue > 0 && new Date(dueDate).getTime() < today ? 'Overdue' :
      rawStatus;
    const paymentDate = paidAmount > 0 ? daysFromNowIso(-randomInt(rng, 0, 8)) : null;
    const reminderAt = status === 'Pending' || status === 'Overdue' || status === 'Partially Paid'
      ? daysFromNowIso(-randomInt(rng, 0, 5))
      : null;
    const billId = `BILL-${String(830000 + index).padStart(6, '0')}`;
    const invoiceId = `INV-${String(910000 + index).padStart(6, '0')}`;
    const purchaseOrderId = `PUR-${String(42000 + index).padStart(5, '0')}`;
    const priority = pick(rng, priorities);
    const supplierCity = pick(rng, cities);
    const dueInMs = new Date(dueDate).getTime() - today;

    return {
      id: `bill-${index + 1}`,
      billId,
      linkedInvoiceId: invoiceId,
      linkedPurchaseOrderId: purchaseOrderId,
      supplierName,
      supplierGstin: `27${String(1000000000 + index).slice(0, 10)}Z${index % 9}`,
      supplierPhone: `9${String(100000000 + index).slice(0, 9)}`,
      supplierEmail: `${supplierName.toLowerCase().replace(/[^a-z0-9]+/g, '.')}@marketloop.test`,
      billingAddress: `${randomInt(rng, 12, 94)}, ${supplierCity} Trade Center, India`,
      amount,
      taxableAmount,
      taxAmount,
      cgst,
      sgst,
      igst,
      discount,
      lateFee,
      grandTotal,
      paidAmount,
      balanceDue,
      dueDate,
      billDate,
      paymentDate,
      paymentMode,
      paymentReference:
        paymentMode === 'Cash' || paymentMode === 'Manual'
          ? ''
          : `${paymentMode.slice(0, 3).toUpperCase()}-${String(700000 + index).slice(-6)}`,
      status,
      priority,
      assignedAdmin: pick(rng, admins),
      createdAt,
      updatedAt: paymentDate || reminderAt || createdAt,
      notes: `${pick(rng, productAreas)} payable monitored for ${supplierName}. ${status === 'Overdue' ? 'Immediate follow-up required.' : 'Routine billing check.'}`,
      lastReminderAt: reminderAt,
      paymentHistory: paidAmount > 0 ? [
        {
          id: `${billId}-payment-1`,
          date: paymentDate,
          amount: paidAmount,
          mode: paymentMode,
          reference:
            paymentMode === 'Cash' || paymentMode === 'Manual'
              ? 'Manual register'
              : `${paymentMode.slice(0, 3).toUpperCase()}-${String(750000 + index).slice(-6)}`,
          adminName: pick(rng, admins)
        }
      ] : [],
      dueRisk:
        status === 'Overdue' ? 'Overdue' :
        balanceDue > 0 && dueInMs <= 3 * 86400000 && dueInMs >= 0 ? 'Due Soon' :
        balanceDue > 0 && ['High', 'Urgent'].includes(priority) ? 'Priority Watch' :
        'Normal',
      timeline: buildTimeline({ billId, createdAt, paymentDate, reminderAt, status })
    };
  });
};
