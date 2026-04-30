const producePool = [
  ['Banana', 'Fruits'],
  ['Mango', 'Fruits'],
  ['Apple', 'Fruits'],
  ['Tomato', 'Vegetables'],
  ['Onion', 'Vegetables'],
  ['Potato', 'Vegetables'],
  ['Spinach', 'Leafy Greens'],
  ['Coriander', 'Herbs'],
  ['Capsicum', 'Vegetables'],
  ['Strawberry', 'Exotic Produce'],
  ['Dragon Fruit', 'Exotic Produce'],
  ['Cauliflower', 'Vegetables']
];

const suppliers = [
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

const warehouses = ['Bengaluru A', 'Pune Cold Room', 'Delhi Premium Bay', 'Nashik Dry Store', 'Indore Fresh Dock'];
const regions = ['North', 'South', 'West', 'East', 'Central'];
const inspectors = ['Neha Quality', 'Aman Inspector', 'Sara Quality', 'Kabir QA', 'Rohit Checkpoint'];
const priorities = ['Low', 'Medium', 'High', 'Urgent'];
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
const isoDaysFromToday = (days) => new Date(today + days * 86400000).toISOString();

const getRecommendedAction = (grade, shelfLifeDays, damagePercentage) => {
  if (grade === 'Red') return 'Reject and return';
  if (shelfLifeDays <= 2 || damagePercentage > 12) return 'Quarantine batch';
  if (grade === 'Orange') return 'Send to discount sale';
  return 'Approve for sale';
};

const getStatusFromAction = (action) => {
  if (action === 'Reject and return') return 'Rejected';
  if (action === 'Quarantine batch') return 'Quarantined';
  if (action === 'Send to discount sale') return 'Discount Sale';
  return 'Approved for Sale';
};

const createTimeline = ({ inspectionId, createdAt, inspectedAt, grade, recommendedAction }) => [
  { id: `${inspectionId}-tl-1`, actor: 'Receiving Dock', action: 'Batch received', detail: 'Batch arrived and was queued for quality inspection.', timestamp: createdAt },
  { id: `${inspectionId}-tl-2`, actor: 'Quality Desk', action: 'Inspection created', detail: 'Inspection ticket was opened for QA review.', timestamp: createdAt },
  { id: `${inspectionId}-tl-3`, actor: 'Inspector', action: `Grade assigned: ${grade}`, detail: 'Inspection scorecards were submitted.', timestamp: inspectedAt },
  { id: `${inspectionId}-tl-4`, actor: 'Admin Console', action: recommendedAction, detail: 'Admin moderation decision recommended from inspection data.', timestamp: inspectedAt }
].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

export const generateDummyQualityChecks = (count = 1000) => {
  const rng = createRng(240425);

  return Array.from({ length: count }, (_, index) => {
    const [product, category] = pick(rng, producePool);
    const supplier = pick(rng, suppliers);
    const warehouse = pick(rng, warehouses);
    const region = pick(rng, regions);
    const inspectorName = pick(rng, inspectors);
    const freshnessScore = Number((2.9 + rng() * 2.1).toFixed(1));
    const shelfLifeDays = randomInt(rng, 1, 12);
    const damagePercentage = Number((rng() * 18).toFixed(1));
    const grade =
      freshnessScore >= 4.3 && shelfLifeDays >= 5 && damagePercentage < 6 ? 'Green' :
      freshnessScore < 3.6 || shelfLifeDays <= 2 || damagePercentage > 12 ? 'Red' :
      'Orange';
    const rejectionReason =
      grade === 'Red'
        ? pick(rng, ['Bruising detected', 'Temperature breach', 'Ripeness beyond limit', 'Moisture damage', 'Decay spotted'])
        : '';
    const recommendedAction = getRecommendedAction(grade, shelfLifeDays, damagePercentage);
    const inspectionStatus = getStatusFromAction(recommendedAction);
    const createdAt = isoDaysFromToday(-randomInt(rng, 3, 38));
    const inspectedAt = isoDaysFromToday(-randomInt(rng, 0, 14));
    const expiryDate = isoDaysFromToday(shelfLifeDays);
    const inspectionId = `QC-${String(5100 + index).padStart(4, '0')}`;

    return {
      id: `quality-${index + 1}`,
      inspectionId,
      product,
      supplier,
      batchCode: `${product.slice(0, 3).toUpperCase()}-${String(100 + (index % 900)).padStart(3, '0')}`,
      category,
      grade,
      freshnessScore,
      shelfLifeDays,
      remarks:
        grade === 'Green'
          ? 'Fresh lot cleared for immediate sale.'
          : grade === 'Orange'
            ? 'Caution stock; monitor shelf movement.'
            : 'Quality risk; quarantine or reject.',
      inspectionStatus,
      priority: pick(rng, priorities),
      warehouse,
      region,
      inspectorName,
      createdAt,
      inspectedAt,
      expiryDate,
      rejectionReason,
      recommendedAction,
      temperatureReading: Number((2 + rng() * 9).toFixed(1)),
      moistureLevel: Number((40 + rng() * 35).toFixed(1)),
      damagePercentage,
      adminNotes: `${product} batch from ${supplier}. ${grade === 'Red' ? 'Escalate to supplier review.' : 'Routine quality follow-up.'}`,
      isRisk: grade === 'Red' || shelfLifeDays <= 2 || damagePercentage > 12,
      auditLog: [
        {
          id: `${inspectionId}-audit-1`,
          actor: inspectorName,
          action: 'Inspection recorded',
          detail: `Grade ${grade} captured with freshness ${freshnessScore}.`,
          timestamp: inspectedAt
        },
        {
          id: `${inspectionId}-audit-2`,
          actor: 'Admin Console',
          action: recommendedAction,
          detail: 'Recommended quality workflow synced for operations visibility.',
          timestamp: inspectedAt
        }
      ],
      timeline: createTimeline({ inspectionId, createdAt, inspectedAt, grade, recommendedAction })
    };
  });
};

