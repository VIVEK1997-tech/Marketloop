const cityPool = [
  { city: 'Bengaluru', state: 'Karnataka', zone: 'Indiranagar' },
  { city: 'Pune', state: 'Maharashtra', zone: 'Baner' },
  { city: 'Delhi', state: 'Delhi', zone: 'Dwarka' },
  { city: 'Mumbai', state: 'Maharashtra', zone: 'Powai' },
  { city: 'Hyderabad', state: 'Telangana', zone: 'Banjara Hills' },
  { city: 'Chennai', state: 'Tamil Nadu', zone: 'Anna Nagar' },
  { city: 'Ahmedabad', state: 'Gujarat', zone: 'Prahlad Nagar' },
  { city: 'Jaipur', state: 'Rajasthan', zone: 'Malviya Nagar' },
  { city: 'Lucknow', state: 'Uttar Pradesh', zone: 'Gomti Nagar' },
  { city: 'Kolkata', state: 'West Bengal', zone: 'Salt Lake' }
];

const storePrefixes = ['Fresh', 'Green', 'Daily', 'Urban', 'Harvest', 'Royal', 'Organic', 'Prime', 'Smart', 'Farm'];
const storeSuffixes = ['Basket', 'Produce Hub', 'MandI Mart', 'Farm Fresh', 'Agro Link', 'Veggie Circle', 'Fruit House', 'Supply Desk', 'Harvest Lane', 'Wholesale Point'];
const names = ['Amit', 'Rohit', 'Neha', 'Kavya', 'Sanjay', 'Priya', 'Vikas', 'Sonal', 'Arvind', 'Megha', 'Deepak', 'Nisha'];
const surnames = ['Sharma', 'Patel', 'Gupta', 'Reddy', 'Nair', 'Mehta', 'Iyer', 'Singh', 'Kapoor', 'Yadav', 'Joshi', 'Desai'];
const kycStatuses = ['verified', 'pending', 'rejected'];
const accountStatuses = ['active', 'deactivated', 'kyc_pending', 'inactive', 'suspended', 'blacklisted'];
const payoutStatuses = ['healthy', 'hold', 'delayed', 'failed'];
const noteTemplates = [
  'Seller requested faster payout reconciliation for weekend settlements.',
  'Support reviewed recent cancellation pattern and advised stock sync.',
  'KYC document scan was blurry and needs resubmission.',
  'Admin flagged seller for manual review after repeated refund spikes.',
  'Store meets premium produce standards and is a candidate for featured placement.'
];
const activityTemplates = [
  'Updated store catalog pricing.',
  'Uploaded new GST document set.',
  'Resolved a buyer complaint with replacement delivery.',
  'Logged in from a new device and completed 2FA.',
  'Requested payout settlement status update.'
];

const today = new Date('2026-04-23T11:30:00+05:30');
const dayMs = 24 * 60 * 60 * 1000;
const daysAgo = (days) => new Date(today.getTime() - days * dayMs).toISOString();
const formatCurrency = (value) => `Rs. ${Math.round(value).toLocaleString('en-IN')}`;

const buildSellerId = (index) => `SEL-${(1000000 + index * 7919).toString(16).toUpperCase().slice(-6)}`;
const buildStoreName = (index) => `${storePrefixes[index % storePrefixes.length]} ${storeSuffixes[(index * 3) % storeSuffixes.length]}`;
const buildOwner = (index) => `${names[index % names.length]} ${surnames[(index * 5) % surnames.length]}`;
const buildEmail = (storeName, index) => `${storeName.toLowerCase().replace(/[^a-z0-9]+/g, '.')}.${index}@marketloop.test`;
const buildPhone = (index) => String(8000000000 + index * 191).slice(0, 10);

const deriveRiskScore = ({ kycStatus, complaintCount, cancellationRate, refundRate, inactiveDays, payoutStatus, suspiciousLogins }) => {
  const score =
    (kycStatus === 'verified' ? 5 : kycStatus === 'pending' ? 22 : 38) +
    complaintCount * 6 +
    Math.round(cancellationRate * 1.5) +
    Math.round(refundRate * 1.2) +
    (inactiveDays > 45 ? 18 : inactiveDays > 20 ? 8 : 0) +
    (payoutStatus === 'failed' ? 20 : payoutStatus === 'hold' ? 12 : payoutStatus === 'delayed' ? 7 : 0) +
    suspiciousLogins * 9;

  return Math.min(98, score);
};

const deriveRiskBand = (score) => (score >= 70 ? 'high_risk' : score >= 40 ? 'medium_risk' : 'low_risk');

const buildTimeline = (index, prefix, templates, count = 4) =>
  Array.from({ length: count }, (_, itemIndex) => ({
    id: `${prefix}-${index}-${itemIndex}`,
    label: templates[(index + itemIndex) % templates.length],
    createdAt: daysAgo((index % 16) + itemIndex + 1),
    actor: itemIndex % 2 === 0 ? 'Admin' : 'System'
  }));

export const generateMockSellers = (count = 1000) =>
  Array.from({ length: count }, (_, index) => {
    const storeName = buildStoreName(index + 1);
    const location = cityPool[index % cityPool.length];
    const ownerName = buildOwner(index + 1);
    const createdDaysAgo = 10 + (index % 480);
    const lastLoginDaysAgo = index % 70;
    const kycStatus = index % 13 === 0 ? 'rejected' : index % 6 === 0 ? 'pending' : 'verified';
    const baseStatus =
      index % 27 === 0 ? 'blacklisted' :
      index % 16 === 0 ? 'suspended' :
      index % 11 === 0 ? 'deactivated' :
      index % 7 === 0 ? 'inactive' :
      kycStatus === 'pending' ? 'kyc_pending' :
      'active';
    const productCount = 5 + ((index * 9) % 180);
    const orderCount = 12 + ((index * 11) % 720);
    const revenue = 45000 + index * 1880 + orderCount * 530;
    const rating = Math.min(4.9, 2.8 + ((index % 18) * 0.12));
    const complaintCount = index % 23 === 0 ? 6 : index % 8;
    const cancellationRate = 2 + (index % 14) * 1.7;
    const refundRate = 1 + (index % 12) * 1.4;
    const payoutStatus = payoutStatuses[index % payoutStatuses.length];
    const suspiciousLogins = index % 29 === 0 ? 2 : index % 17 === 0 ? 1 : 0;
    const riskScore = deriveRiskScore({
      kycStatus,
      complaintCount,
      cancellationRate,
      refundRate,
      inactiveDays: lastLoginDaysAgo,
      payoutStatus,
      suspiciousLogins
    });
    const riskBand = deriveRiskBand(riskScore);

    return {
      id: buildSellerId(index + 1),
      ownerName,
      storeName,
      email: buildEmail(storeName, index + 1),
      phone: buildPhone(index + 1),
      city: location.city,
      state: location.state,
      location: `${location.zone}, ${location.city}`,
      verificationStatus: kycStatus,
      status: baseStatus,
      productCount,
      revenue,
      revenueLabel: formatCurrency(revenue),
      rating: Number(rating.toFixed(1)),
      createdAt: daysAgo(createdDaysAgo),
      lastLogin: daysAgo(lastLoginDaysAgo),
      kycSubmittedAt: daysAgo(createdDaysAgo - 3),
      payoutStatus,
      complaintCount,
      orderCount,
      cancellationRate: Number(cancellationRate.toFixed(1)),
      refundRate: Number(refundRate.toFixed(1)),
      riskScore,
      riskBand,
      flaggedForReview: riskBand === 'high_risk' || suspiciousLogins > 0,
      suspiciousLogins,
      notes: noteTemplates[index % noteTemplates.length],
      adminNotes: buildTimeline(index + 1, 'note', noteTemplates, 3),
      activityTimeline: buildTimeline(index + 1, 'activity', activityTemplates, 5),
      complaints: buildTimeline(index + 1, 'complaint', [
        'Buyer reported delayed dispatch.',
        'Invoice tax line mismatch was escalated.',
        'Payout settlement query reopened.',
        'Quality complaint resolved with refund.'
      ], 3),
      payoutHistory: buildTimeline(index + 1, 'payout', [
        'Weekly payout processed.',
        'Payout placed on temporary hold.',
        'Finance team cleared previous settlement issue.',
        'Bank validation completed successfully.'
      ], 3),
      documents: [
        { id: `doc-gst-${index + 1}`, name: 'GST Certificate', status: kycStatus === 'verified' ? 'accepted' : kycStatus === 'pending' ? 'under_review' : 'rejected' },
        { id: `doc-pan-${index + 1}`, name: 'PAN Card', status: 'accepted' },
        { id: `doc-bank-${index + 1}`, name: 'Bank Proof', status: index % 9 === 0 ? 'under_review' : 'accepted' }
      ]
    };
  });
