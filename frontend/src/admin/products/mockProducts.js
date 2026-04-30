const productNames = ['Banana Premium Lot', 'Organic Spinach Bunch', 'Dragon Fruit Crate', 'Tomato Essentials Basket', 'Mango Family Pack', 'Leafy Greens Combo', 'Root Vegetables Kit', 'Strawberry Premium Box', 'Onion Bulk Pack', 'Exotic Lettuce Mix'];
const categories = ['Fruits', 'Vegetables', 'Organic Produce', 'Seasonal Products', 'Exotic Produce'];
const units = ['Kg', 'Crate', 'Bunch', 'Piece', 'Dozen'];
const qualities = ['Premium', 'Standard', 'Average', 'Damaged', 'Fresh'];
const approvals = ['Approved', 'Pending Review', 'Rejected'];
const lifecycleStatuses = ['Draft', 'Pending Review', 'Approved', 'Rejected', 'Out of Stock', 'Archived', 'Discontinued'];
const vendors = ['FreshFarm Bengaluru', 'Green Basket Pune', 'Daily Organics Delhi', 'Urban Harvest Mumbai', 'Prime Agro Hyderabad', 'Royal Produce Chennai'];
const trustLevels = ['Trusted', 'Normal', 'Watchlist'];
const notes = [
  'Admin reviewed image quality and approved listing.',
  'Missing HSN-like metadata was requested from vendor.',
  'Organic claim needs document validation.',
  'Price looked unusually low compared to peer listings.',
  'Stock sync appears delayed from seller dashboard.'
];
const flags = ['Duplicate product', 'Suspicious pricing', 'Missing product data', 'Zero-stock approved'];
const today = new Date('2026-04-24T17:00:00+05:30');
const dayMs = 24 * 60 * 60 * 1000;
const agoIso = (days = 0) => new Date(today.getTime() - days * dayMs).toISOString();

const imagePalette = [
  'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80'
];

const buildId = (index) => `PRD-${String(100000 + index * 31).slice(-6)}`;
const buildSku = (index) => `SKU-${String(200000 + index * 17).slice(-6)}`;

const deriveHealthScore = ({ stock, price, approvalStatus, quality, metadataComplete }) => {
  let score = 40;
  score += stock > 80 ? 20 : stock > 20 ? 10 : stock > 0 ? 4 : -10;
  score += price > 0 ? 10 : -12;
  score += approvalStatus === 'Approved' ? 15 : approvalStatus === 'Pending Review' ? 4 : -10;
  score += ['Premium', 'Fresh', 'Standard'].includes(quality) ? 12 : quality === 'Average' ? 3 : -12;
  score += metadataComplete ? 12 : -8;
  return Math.max(8, Math.min(98, score));
};

const healthBand = (score) => (score >= 85 ? 'Excellent' : score >= 65 ? 'Good' : score >= 40 ? 'Needs Review' : 'Critical');

export const generateDummyProducts = (count = 1000) =>
  Array.from({ length: count }, (_, index) => {
    const productName = productNames[index % productNames.length];
    const category = categories[index % categories.length];
    const stock = index % 17 === 0 ? 0 : 6 + ((index * 7) % 140);
    const approvalStatus = index % 9 === 0 ? 'Rejected' : index % 5 === 0 ? 'Pending Review' : 'Approved';
    const lifecycleStatus =
      stock === 0 && approvalStatus === 'Approved' ? 'Out of Stock' :
      approvalStatus === 'Rejected' ? 'Rejected' :
      index % 13 === 0 ? 'Archived' :
      index % 19 === 0 ? 'Discontinued' :
      approvalStatus;
    const quality = qualities[index % qualities.length];
    const price = 18 + index * 11 + ((index % 6) * 23);
    const metadataComplete = index % 8 !== 0;
    const suspiciousFlags = [
      approvalStatus === 'Approved' && stock === 0 ? 'Zero-stock approved' : null,
      index % 16 === 0 ? 'Duplicate product' : null,
      index % 11 === 0 ? 'Suspicious pricing' : null,
      !metadataComplete ? 'Missing product data' : null
    ].filter(Boolean);
    const vendorTrustLevel = index % 14 === 0 ? 'Watchlist' : index % 5 === 0 ? 'Trusted' : 'Normal';
    const autoApproved = vendorTrustLevel === 'Trusted' && metadataComplete && suspiciousFlags.length === 0 && approvalStatus === 'Approved';
    const healthScore = deriveHealthScore({ stock, price, approvalStatus, quality, metadataComplete });

    return {
      id: buildId(index + 1),
      sku: buildSku(index + 1),
      productName,
      category,
      price,
      unit: units[index % units.length],
      stock,
      quality,
      organic: index % 3 === 0,
      approvalStatus,
      lifecycleStatus,
      vendorName: vendors[index % vendors.length],
      vendorTrustLevel,
      healthScore,
      healthBand: healthBand(healthScore),
      featured: index % 21 === 0,
      suspiciousFlags,
      imageUrl: imagePalette[index % imagePalette.length],
      description: `${productName} listed under ${category} with traceable supply and seller-updated metadata for MarketLoop admin moderation.`,
      createdAt: agoIso((index % 180) + 10),
      updatedAt: agoIso(index % 45),
      adminNote: notes[index % notes.length],
      metadataComplete,
      autoApproved,
      pricingHistory: [
        { date: agoIso(20 + (index % 12)), price: Math.max(10, price - 18) },
        { date: agoIso(10 + (index % 8)), price: Math.max(12, price - 8) },
        { date: agoIso(index % 5), price }
      ],
      approvalHistory: [
        { id: `app-${index}-0`, action: 'Listing created', actor: 'Vendor', createdAt: agoIso((index % 30) + 3) },
        { id: `app-${index}-1`, action: approvalStatus === 'Approved' ? 'Admin approved product' : approvalStatus === 'Rejected' ? 'Admin rejected product' : 'Admin requested review', actor: 'Admin', createdAt: agoIso(index % 12) }
      ],
      auditLog: [
        { id: `audit-${index}-0`, action: 'Stock synced from seller dashboard', actor: 'System', createdAt: agoIso((index % 10) + 1) },
        { id: `audit-${index}-1`, action: notes[index % notes.length], actor: 'Admin', createdAt: agoIso(index % 6) }
      ]
    };
  });
