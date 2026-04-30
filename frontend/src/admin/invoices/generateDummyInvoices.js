const invoiceTypes = ['customer', 'purchase', 'supplier', 'sales', 'return', 'credit-note'];
const linkedTypes = ['Order', 'Purchase Order', 'Return', 'Delivery', 'Stock Adjustment'];
const partyTypes = ['Customer', 'Supplier', 'Vendor', 'Distributor'];
const paymentMethods = ['UPI', 'Bank Transfer', 'Card', 'Wallet', 'Cash', 'Net Banking'];
const owners = ['Finance Desk', 'Accounts Team', 'Procurement Desk', 'Sales Admin'];
const cities = ['Bengaluru', 'Pune', 'Delhi', 'Mumbai', 'Nashik', 'Indore', 'Jaipur', 'Surat'];
const names = [
  'Riya Sharma',
  'FreshFarm Bengaluru',
  'Nashik Orchard Collective',
  'Daily Organics Delhi',
  'Pune Green Basket Supply',
  'Azadpur mandi Link',
  'Arun Traders',
  'Mehta Retail Foods',
  'Golden Fruit Depot',
  'Urban Greens Hub'
];
const today = new Date('2026-04-24T10:00:00+05:30').getTime();

const createRng = (seed = 717171) => {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
};

const pick = (rng, list) => list[Math.floor(rng() * list.length)];
const randomInt = (rng, min, max) => Math.floor(rng() * (max - min + 1)) + min;
const isoDaysFromToday = (days) => new Date(today + days * 86400000).toISOString();

const resolveStatus = ({ grandTotal, paidAmount, dueDate, cancelled, draft }) => {
  if (cancelled) return 'Cancelled';
  if (draft) return 'Draft';
  const balanceDue = Math.max(grandTotal - paidAmount, 0);
  if (balanceDue === 0) return 'Paid';
  if (paidAmount > 0 && balanceDue > 0) return 'Partially Paid';
  if (new Date(dueDate).getTime() < today) return 'Overdue';
  return 'Pending';
};

const createTimeline = ({ invoiceId, issueDate, paymentDate, lastReminderAt, status }) => {
  const timeline = [
    { id: `${invoiceId}-tl-1`, actor: 'Invoice Engine', action: 'Invoice created', detail: 'Invoice record generated in workspace.', timestamp: issueDate },
    { id: `${invoiceId}-tl-2`, actor: 'Finance Desk', action: 'Invoice issued', detail: 'Invoice shared to relevant party.', timestamp: issueDate }
  ];
  if (lastReminderAt) {
    timeline.push({ id: `${invoiceId}-tl-3`, actor: 'Accounts Team', action: 'Reminder sent', detail: 'Payment reminder sent to party.', timestamp: lastReminderAt });
  }
  if (paymentDate) {
    timeline.push({ id: `${invoiceId}-tl-4`, actor: 'Finance Desk', action: 'Payment recorded', detail: `Invoice status is ${status}.`, timestamp: paymentDate });
  }
  return timeline.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

export const generateDummyInvoices = (count = 1000) => {
  const rng = createRng(240427);

  return Array.from({ length: count }, (_, index) => {
    const type = pick(rng, invoiceTypes);
    const linkedRecordType = pick(rng, linkedTypes);
    const partyType = pick(rng, partyTypes);
    const partyName = pick(rng, names);
    const taxableAmount = randomInt(rng, 800, 125000);
    const discount = randomInt(rng, 0, Math.floor(taxableAmount * 0.12));
    const shippingCharge = randomInt(rng, 0, 850);
    const cgst = Number((taxableAmount * (rng() > 0.55 ? 0.025 : 0.045)).toFixed(2));
    const sgst = Number((cgst > 0 ? cgst : 0).toFixed(2));
    const igst = Number((cgst === 0 ? taxableAmount * 0.09 : 0).toFixed(2));
    const totalAmount = taxableAmount - discount + shippingCharge;
    const grandTotal = Number((totalAmount + cgst + sgst + igst).toFixed(2));
    const paidAmount = Number((grandTotal * (rng() > 0.62 ? 1 : rng() > 0.35 ? 0.5 : 0)).toFixed(2));
    const issueDate = isoDaysFromToday(-randomInt(rng, 3, 48));
    const dueDate = isoDaysFromToday(randomInt(rng, -9, 18));
    const cancelled = rng() > 0.965;
    const draft = !cancelled && rng() > 0.955;
    const paymentDate = paidAmount > 0 ? isoDaysFromToday(-randomInt(rng, 0, 10)) : null;
    const status = resolveStatus({ grandTotal, paidAmount, dueDate, cancelled, draft });
    const balanceDue = Number(Math.max(grandTotal - paidAmount, 0).toFixed(2));
    const lastReminderAt = status === 'Pending' || status === 'Overdue' || status === 'Partially Paid' ? isoDaysFromToday(-randomInt(rng, 0, 7)) : null;
    const invoiceId = `INV-${String(910000 + index).padStart(6, '0')}`;

    return {
      id: `invoice-${index + 1}`,
      invoiceId,
      type,
      linkedRecordId: `${linkedRecordType.slice(0, 3).toUpperCase()}-${String(5000 + index).padStart(4, '0')}`,
      linkedRecordType,
      partyName,
      partyType,
      partyGstin: `29${String(1000000000 + index).slice(0, 10)}Z${index % 9}`,
      billingAddress: `${randomInt(rng, 10, 90)}, ${pick(rng, cities)} Business Park, India`,
      totalAmount,
      taxableAmount,
      cgst,
      sgst,
      igst,
      discount,
      shippingCharge,
      grandTotal,
      paidAmount,
      balanceDue,
      issueDate,
      dueDate,
      paymentDate,
      status,
      paymentMethod: pick(rng, paymentMethods),
      invoiceOwner: pick(rng, owners),
      createdAt: issueDate,
      updatedAt: paymentDate || issueDate,
      notes: `${type} invoice monitored by ${pick(rng, owners)}. ${status === 'Overdue' ? 'Follow-up required for overdue balance.' : 'Routine invoice tracking.'}`,
      lastReminderAt,
      taxType: igst > 0 ? 'IGST' : 'CGST+SGST',
      lineItems: [
        {
          id: `${invoiceId}-line-1`,
          description: `${type === 'purchase' ? 'Procurement lot' : 'Produce order'} line item`,
          quantity: randomInt(rng, 5, 80),
          rate: Number((taxableAmount / randomInt(rng, 6, 20)).toFixed(2)),
          subtotal: taxableAmount
        }
      ],
      paymentHistory: paidAmount > 0 ? [
        {
          id: `${invoiceId}-pay-1`,
          amount: paidAmount,
          method: pick(rng, paymentMethods),
          date: paymentDate || issueDate,
          note: status === 'Partially Paid' ? 'Partial payment recorded.' : 'Payment cleared.'
        }
      ] : [],
      timeline: createTimeline({ invoiceId, issueDate, paymentDate, lastReminderAt, status }),
      isOverdueRisk: balanceDue > 0 && new Date(dueDate).getTime() < today
    };
  });
};

