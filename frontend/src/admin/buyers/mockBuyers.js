const firstNames = ['Aarav', 'Riya', 'Ishita', 'Karan', 'Neha', 'Arjun', 'Meera', 'Kabir', 'Ananya', 'Rahul', 'Saanvi', 'Vivaan', 'Pooja', 'Nikhil', 'Diya', 'Manav', 'Aditi', 'Rohan', 'Tanya', 'Pranav'];
const lastNames = ['Sharma', 'Patel', 'Gupta', 'Verma', 'Nair', 'Joshi', 'Mehta', 'Iyer', 'Singh', 'Kapoor', 'Reddy', 'Desai', 'Mishra', 'Malhotra', 'Yadav'];
const cities = [
  { city: 'Bengaluru', state: 'Karnataka', area: 'HSR Layout' },
  { city: 'Pune', state: 'Maharashtra', area: 'Koregaon Park' },
  { city: 'Delhi', state: 'Delhi', area: 'Dwarka' },
  { city: 'Mumbai', state: 'Maharashtra', area: 'Powai' },
  { city: 'Hyderabad', state: 'Telangana', area: 'Gachibowli' },
  { city: 'Chennai', state: 'Tamil Nadu', area: 'Anna Nagar' },
  { city: 'Noida', state: 'Uttar Pradesh', area: 'Sector 62' },
  { city: 'Ahmedabad', state: 'Gujarat', area: 'Prahlad Nagar' },
  { city: 'Jaipur', state: 'Rajasthan', area: 'Malviya Nagar' },
  { city: 'Kolkata', state: 'West Bengal', area: 'Salt Lake' }
];
const communicationTemplates = [
  'Support called buyer to confirm delivery slot.',
  'Buyer requested fresher stock preference for leafy greens.',
  'Payment team resolved delayed refund query.',
  'Order desk shared bulk purchase quote for seasonal mangoes.',
  'Admin reviewed suspicious COD activity and added follow-up note.'
];
const activityTemplates = [
  'Logged in from mobile app.',
  'Added produce items to wishlist.',
  'Viewed invoice and downloaded PDF.',
  'Raised a support request about delivery timing.',
  'Placed a repeat order for fruit basket.'
];

const today = new Date('2026-04-23T12:00:00+05:30');
const dayMs = 24 * 60 * 60 * 1000;
const isoDaysAgo = (days) => new Date(today.getTime() - days * dayMs).toISOString();

const buildTags = ({ totalSpent, orders, riskScore, wishlistCount, disputes }) => {
  const tags = [];
  if (totalSpent >= 85000) tags.push('VIP');
  if (riskScore >= 72) tags.push('Fraud Risk');
  if (orders >= 18) tags.push('Repeat Buyer');
  if (orders >= 8 && disputes >= 2) tags.push('High Return Rate');
  if (wishlistCount >= 14) tags.push('COD Heavy');
  return tags;
};

const buildCommunicationLog = (index) =>
  Array.from({ length: 3 }, (_, itemIndex) => ({
    id: `comm-${index}-${itemIndex}`,
    actor: itemIndex % 2 === 0 ? 'Support agent' : 'Admin',
    channel: itemIndex === 0 ? 'Email' : itemIndex === 1 ? 'Call' : 'Internal note',
    message: communicationTemplates[(index + itemIndex) % communicationTemplates.length],
    createdAt: isoDaysAgo((index % 20) + itemIndex + 1)
  }));

const buildActivityTimeline = (index) =>
  Array.from({ length: 4 }, (_, itemIndex) => ({
    id: `activity-${index}-${itemIndex}`,
    label: activityTemplates[(index + itemIndex) % activityTemplates.length],
    createdAt: isoDaysAgo((index % 15) + itemIndex)
  }));

export const generateMockBuyers = (count = 1000) =>
  Array.from({ length: count }, (_, index) => {
    const name = `${firstNames[index % firstNames.length]} ${lastNames[(index * 3) % lastNames.length]}`;
    const location = cities[index % cities.length];
    const status = index % 17 === 0 ? 'blocked' : index % 9 === 0 ? 'pending' : index % 7 === 0 ? 'inactive' : 'active';
    const verified = index % 5 !== 0;
    const lastActivityDays = status === 'blocked' ? 45 + (index % 90) : index % 35;
    const totalOrders = (index * 7) % 34;
    const wishlistCount = (index * 5) % 21;
    const totalSpent = 1500 + index * 327 + totalOrders * 950;
    const disputes = index % 11 === 0 ? 2 : index % 29 === 0 ? 1 : 0;
    const refunds = index % 13 === 0 ? 3 : index % 8 === 0 ? 1 : 0;
    const riskScore = Math.min(96, 18 + (index % 37) + disputes * 18 + (status === 'blocked' ? 24 : 0));
    const segment = lastActivityDays > 90 ? 'Dormant' : totalOrders >= 20 ? 'Loyal' : lastActivityDays > 30 ? 'At Risk' : 'New';
    const tags = buildTags({ totalSpent, orders: totalOrders, riskScore, wishlistCount, disputes });
    const buyerId = `BUY-${String(index + 1).padStart(4, '0')}`;

    return {
      id: buyerId,
      name,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}${index + 1}@marketloop.test`,
      phone: String(7000000000 + index * 137).slice(0, 10),
      city: location.city,
      state: location.state,
      location: `${location.area}, ${location.city}`,
      status,
      verificationStatus: verified ? 'Verified' : 'Unverified',
      kycStatus: verified ? 'Verified' : index % 2 === 0 ? 'Pending' : 'Unverified',
      isVip: tags.includes('VIP'),
      isVerified: verified,
      isBlacklisted: status === 'blocked',
      isWhitelisted: tags.includes('VIP') && riskScore < 40,
      totalOrders,
      totalSpent,
      wishlistCount,
      joinDate: isoDaysAgo(12 + (index % 360)),
      lastActivity: isoDaysAgo(lastActivityDays),
      lastLogin: isoDaysAgo(Math.max(0, lastActivityDays - 1)),
      lastOrderDate: totalOrders ? isoDaysAgo(Math.max(1, lastActivityDays + 3)) : null,
      segment,
      tags,
      riskScore,
      refundCount: refunds,
      disputeCount: disputes,
      notes: `${name} prefers ${index % 2 === 0 ? 'morning' : 'evening'} delivery and often buys ${totalOrders > 12 ? 'in bulk' : 'weekly essentials'}.`,
      accountHealth: riskScore >= 75 ? 'critical' : riskScore >= 50 ? 'watch' : 'healthy',
      communicationLog: buildCommunicationLog(index + 1),
      activityTimeline: buildActivityTimeline(index + 1)
    };
  });
