const products = [
  ['Banana', 'Fruits', 'Kg'],
  ['Mango', 'Fruits', 'Crate'],
  ['Apple', 'Fruits', 'Kg'],
  ['Tomato', 'Vegetables', 'Kg'],
  ['Onion', 'Vegetables', 'Kg'],
  ['Potato', 'Vegetables', 'Kg'],
  ['Spinach', 'Leafy Greens', 'Bunch'],
  ['Coriander', 'Herbs', 'Bunch'],
  ['Capsicum', 'Vegetables', 'Kg'],
  ['Strawberry', 'Exotic Produce', 'Crate'],
  ['Dragon Fruit', 'Exotic Produce', 'Crate'],
  ['Cauliflower', 'Vegetables', 'Kg']
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
  'Nagpur Citrus Source'
];

const warehouses = ['Bengaluru A', 'Pune Cold Room', 'Delhi Premium Bay', 'Nashik Dry Store', 'Indore Fresh Dock'];
const buyerStatuses = ['Ready to Buy', 'Low Stock Alert', 'Pending Quality Check', 'Supplier Return'];
const sellerStatuses = ['Sellable', 'Reserved', 'Blocked', 'Discount Sale', 'Dispatched'];
const admins = ['Neha Admin', 'Rohan Ops', 'Anika Planner', 'Kabir Warehouse', 'Sara Quality'];
const today = new Date('2026-04-24T10:00:00+05:30').getTime();

const createRng = (seed = 616161) => {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
};

const pick = (rng, list) => list[Math.floor(rng() * list.length)];
const randomInt = (rng, min, max) => Math.floor(rng() * (max - min + 1)) + min;
const isoDaysFromToday = (days) => new Date(today + days * 86400000).toISOString();

const getFreshnessGrade = (expiryDays, damagedQty, availableQty) => {
  if (expiryDays <= 1 || damagedQty > Math.max(10, availableQty * 0.15)) return 'Red';
  if (expiryDays <= 4 || damagedQty > Math.max(4, availableQty * 0.06)) return 'Orange';
  return 'Green';
};

const getBatchRiskFlags = ({ availableQty, reorderLevel, freshnessGrade, expiryDate, damagedQty, sellerStatus }) => {
  const flags = [];
  if (availableQty <= reorderLevel) flags.push('Low stock');
  if (new Date(expiryDate).getTime() < today) flags.push('Expired');
  else if ((new Date(expiryDate).getTime() - today) / 86400000 <= 2) flags.push('Near expiry');
  if (damagedQty >= 18) flags.push('High damaged quantity');
  if (sellerStatus === 'Blocked') flags.push('Blocked from sale');
  return flags;
};

const movementTypes = ['Inward', 'Outward', 'Adjustment', 'Return', 'Transfer', 'Wastage', 'Reserved', 'Released'];
const referenceTypes = ['Purchase Order', 'Sales Order', 'Return', 'Manual Adjustment', 'Transfer'];

export const generateDummyInventory = (count = 1000) => {
  const rng = createRng(240426);
  const batches = Array.from({ length: count }, (_, index) => {
    const [product, category, unit] = pick(rng, products);
    const warehouse = pick(rng, warehouses);
    const supplier = pick(rng, suppliers);
    const incomingQty = randomInt(rng, 0, 180);
    const availableQty = randomInt(rng, 0, 260);
    const reservedQty = randomInt(rng, 0, Math.min(availableQty, 80));
    const soldQty = randomInt(rng, 0, 220);
    const damagedQty = randomInt(rng, 0, 28);
    const returnedQty = randomInt(rng, 0, 18);
    const reorderLevel = randomInt(rng, 25, 90);
    const purchasePrice = randomInt(rng, 18, 180);
    const sellingPrice = purchasePrice + randomInt(rng, 6, 70);
    const margin = Number((((sellingPrice - purchasePrice) / Math.max(purchasePrice, 1)) * 100).toFixed(1));
    const expiryDate = isoDaysFromToday(randomInt(rng, -2, 12));
    const freshnessGrade = getFreshnessGrade((new Date(expiryDate).getTime() - today) / 86400000, damagedQty, availableQty);
    const buyerStatus =
      availableQty <= reorderLevel ? 'Low Stock Alert' :
      incomingQty > 0 && freshnessGrade !== 'Green' ? 'Pending Quality Check' :
      returnedQty > 6 ? 'Supplier Return' :
      'Ready to Buy';
    const sellerStatus =
      freshnessGrade === 'Red' ? 'Blocked' :
      reservedQty > availableQty * 0.25 ? 'Reserved' :
      ((new Date(expiryDate).getTime() - today) / 86400000 <= 3 || freshnessGrade === 'Orange') ? 'Discount Sale' :
      soldQty > 120 ? 'Dispatched' :
      'Sellable';
    const sku = `${product.slice(0, 3).toUpperCase()}-${String(1000 + index).slice(-4)}`;
    const batchCode = `${product.slice(0, 2).toUpperCase()}-${String(200 + (index % 700)).padStart(3, '0')}`;
    const createdAt = isoDaysFromToday(-randomInt(rng, 8, 60));
    const lastUpdated = isoDaysFromToday(-randomInt(rng, 0, 6));

    return {
      id: `inventory-${index + 1}`,
      sku,
      product,
      category,
      warehouse,
      availableQty,
      incomingQty,
      reservedQty,
      soldQty,
      damagedQty,
      returnedQty,
      unit,
      freshnessGrade,
      expiryDate,
      batchCode,
      supplier,
      buyerStatus,
      sellerStatus,
      reorderLevel,
      purchasePrice,
      sellingPrice,
      margin,
      estimatedValue: availableQty * sellingPrice,
      lastUpdated,
      createdAt,
      adminNotes: `${product} batch at ${warehouse}. ${availableQty <= reorderLevel ? 'Monitor reorder workflow.' : 'Normal stock movement.'}`,
      riskFlags: getBatchRiskFlags({ availableQty, reorderLevel, freshnessGrade, expiryDate, damagedQty, sellerStatus })
    };
  });

  const movements = Array.from({ length: count + 250 }, (_, index) => {
    const batch = batches[index % batches.length];
    const type = movementTypes[index % movementTypes.length];
    const quantity = randomInt(createRng(index + 91), 4, 90);
    const adminName = admins[index % admins.length];
    return {
      id: `movement-${index + 1}`,
      movementId: `MOV-${String(7000 + index).padStart(4, '0')}`,
      type,
      item: batch.product,
      sku: batch.sku,
      quantity,
      unit: batch.unit,
      location: batch.warehouse,
      referenceType: referenceTypes[index % referenceTypes.length],
      referenceId: `${['PO', 'SO', 'RET', 'ADJ', 'TRF'][index % 5]}-${String(5000 + index).padStart(4, '0')}`,
      adminName,
      date: isoDaysFromToday(-randomInt(createRng(index + 12), 0, 20)),
      notes: `${type} entry processed for ${batch.product} batch ${batch.batchCode}.`
    };
  });

  return { batches, movements };
};

