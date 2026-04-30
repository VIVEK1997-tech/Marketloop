const supplierPool = [
  'Nashik Orchard Collective',
  'Azadpur mandi Link',
  'Pune Green Basket Supply',
  'Indore Fresh Route',
  'Kolar Fruit Corridor',
  'Delhi Wholesale Yard',
  'Jaipur Harvest Network',
  'Surat Agro Lines',
  'Bengaluru Farm Connect',
  'Nagpur Citrus Source',
  'Lucknow Greens Depot',
  'Kochi Premium Produce'
];

const requestPool = [
  ['Summer mango sourcing', 'Fruits', 'Crate'],
  ['Leafy greens replenishment', 'Leafy Greens', 'Kg'],
  ['Root vegetables weekly plan', 'Vegetables', 'Kg'],
  ['Organic herbs forecast', 'Herbs', 'Bunch'],
  ['Seasonal citrus allocation', 'Fruits', 'Crate'],
  ['Banana ripening lane support', 'Fruits', 'Dozen'],
  ['Onion buffer stocking', 'Vegetables', 'Quintal'],
  ['Tomato dispatch planning', 'Vegetables', 'Kg'],
  ['Premium exotic fruit import', 'Exotic Produce', 'Crate'],
  ['Festival fresh-cut demand', 'Seasonal', 'Kg']
];

const regions = ['North', 'South', 'West', 'East', 'Central'];
const priorities = ['Low', 'Medium', 'High', 'Urgent'];
const statuses = ['Draft', 'Requested', 'Approved', 'Ordered', 'Partially Received', 'Fully Received', 'Closed', 'Rejected', 'Archived'];
const admins = ['Neha Admin', 'Rohan Ops', 'Anika Planning', 'Kabir Procurement', 'Sara Quality'];
const today = new Date('2026-04-24T10:00:00+05:30').getTime();

const createRng = (seed = 424242) => {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
};

const pick = (rng, list) => list[Math.floor(rng() * list.length)];
const randomInt = (rng, min, max) => Math.floor(rng() * (max - min + 1)) + min;
const isoDaysFromToday = (days) => new Date(today + days * 86400000).toISOString();

const createActivityEntry = (id, actor, action, detail, timestamp) => ({
  id,
  actor,
  action,
  detail,
  timestamp
});

const buildTimeline = ({ procurementId, status, expectedDeliveryDate, actualQty, assignedAdmin, createdAt, updatedAt }) => {
  const timeline = [
    createActivityEntry(`${procurementId}-tl-1`, assignedAdmin, 'Request created', 'Initial procurement planning request recorded.', createdAt)
  ];

  if (['Approved', 'Ordered', 'Partially Received', 'Fully Received', 'Closed'].includes(status)) {
    timeline.push(createActivityEntry(`${procurementId}-tl-2`, assignedAdmin, 'Request approved', 'Admin approved the procurement requirement.', isoDaysFromToday(-randomInt(createRng(procurementId.length), 8, 3))));
  }

  timeline.push(createActivityEntry(`${procurementId}-tl-3`, assignedAdmin, 'Expected delivery', `Expected delivery set for ${new Date(expectedDeliveryDate).toLocaleDateString('en-IN')}.`, expectedDeliveryDate));

  if (actualQty > 0) {
    timeline.push(createActivityEntry(`${procurementId}-tl-4`, assignedAdmin, 'Receipt updated', `Actual received quantity updated to ${actualQty}.`, updatedAt));
  }

  if (status === 'Rejected') {
    timeline.push(createActivityEntry(`${procurementId}-tl-5`, assignedAdmin, 'Request rejected', 'Procurement request rejected due to quality or pricing concerns.', updatedAt));
  }

  return timeline.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

export const generateDummyProcurements = (count = 1000) => {
  const rng = createRng(240424);

  return Array.from({ length: count }, (_, index) => {
    const supplier = pick(rng, supplierPool);
    const [requestTitle, category, unit] = pick(rng, requestPool);
    const status = pick(rng, statuses);
    const quantityPlan = randomInt(rng, 80, 1200);
    const expectedQty = Math.max(quantityPlan - randomInt(rng, 0, 140), 40);
    const actualQty =
      status === 'Draft' || status === 'Requested' ? 0 :
      status === 'Approved' || status === 'Ordered' ? randomInt(rng, 0, Math.floor(expectedQty * 0.2)) :
      status === 'Partially Received' ? randomInt(rng, Math.floor(expectedQty * 0.25), Math.floor(expectedQty * 0.75)) :
      status === 'Rejected' ? randomInt(rng, 0, Math.floor(expectedQty * 0.45)) :
      expectedQty - randomInt(rng, 0, 18);
    const qualityScore = Number((3.1 + rng() * 1.8).toFixed(1));
    const rejectionRate = Number((rng() * 11.8).toFixed(1));
    const priority = pick(rng, priorities);
    const region = pick(rng, regions);
    const assignedAdmin = pick(rng, admins);
    const createdAt = isoDaysFromToday(-randomInt(rng, 4, 45));
    const updatedAt = isoDaysFromToday(-randomInt(rng, 0, 8));
    const expectedDeliveryDate = isoDaysFromToday(randomInt(rng, -5, 16));
    const isRisk = rejectionRate > 8 || qualityScore < 3.8;
    const notes = `${category} sourcing for ${region.toLowerCase()} region. ${isRisk ? 'Needs close monitoring due to risk indicators.' : 'Standard procurement monitoring flow.'}`;
    const procurementId = `PROC-${String(9100 + index).padStart(4, '0')}`;

    return {
      id: `procurement-${index + 1}`,
      procurementId,
      supplier,
      requestTitle,
      category,
      status,
      quantityPlan,
      unit,
      expectedQty,
      actualQty,
      qualityScore,
      rejectionRate,
      priority,
      region,
      assignedAdmin,
      createdAt,
      updatedAt,
      expectedDeliveryDate,
      notes,
      riskLevel: isRisk ? (rejectionRate > 9.5 || qualityScore < 3.5 ? 'High Risk' : 'Medium Risk') : 'Low Risk',
      isRisk,
      auditTrail: [
        createActivityEntry(`${procurementId}-audit-1`, assignedAdmin, 'Procurement created', 'Request captured in procurement planning board.', createdAt),
        createActivityEntry(`${procurementId}-audit-2`, assignedAdmin, `Status set to ${status}`, 'Workflow state synchronized for procurement visibility.', updatedAt)
      ],
      timeline: buildTimeline({ procurementId, status, expectedDeliveryDate, actualQty, assignedAdmin, createdAt, updatedAt })
    };
  });
};

