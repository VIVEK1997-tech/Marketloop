const names = ['Aarav', 'Riya', 'Neha', 'Karan', 'Ishita', 'Rahul', 'Meera', 'Kabir', 'Aditi', 'Pranav', 'Diya', 'Rohan', 'Saanvi', 'Vikas', 'Pooja', 'Aman'];
const surnames = ['Sharma', 'Patel', 'Gupta', 'Nair', 'Reddy', 'Mehta', 'Iyer', 'Singh', 'Kapoor', 'Desai', 'Yadav', 'Joshi'];
const cities = [
  { city: 'Bengaluru', state: 'Karnataka', area: 'HSR Layout' },
  { city: 'Pune', state: 'Maharashtra', area: 'Baner' },
  { city: 'Delhi', state: 'Delhi', area: 'Dwarka' },
  { city: 'Mumbai', state: 'Maharashtra', area: 'Powai' },
  { city: 'Hyderabad', state: 'Telangana', area: 'Gachibowli' },
  { city: 'Chennai', state: 'Tamil Nadu', area: 'Anna Nagar' },
  { city: 'Ahmedabad', state: 'Gujarat', area: 'Prahlad Nagar' },
  { city: 'Noida', state: 'Uttar Pradesh', area: 'Sector 62' }
];
const roles = ['Buyer', 'Seller', 'Admin', 'Support'];
const states = ['Online', 'Offline', 'Suspended', 'Locked', 'Idle'];
const sessionTypes = ['Web', 'Android', 'iOS'];
const browsers = ['Chrome 135', 'Edge 134', 'Safari 18', 'Firefox 136', 'MarketLoop App 4.8'];
const kycStatuses = ['Verified', 'Pending', 'Rejected', 'Not Required'];
const noteTemplates = [
  'Admin marked unusual login cluster for follow-up.',
  'User requested access help after device change.',
  'Support confirmed recovery email update.',
  'Fraud desk is watching repeated failed logins.',
  'Compliance team reviewed KYC mismatch.'
];
const actionTemplates = [
  'Logged in from primary device.',
  'Viewed order history.',
  'Opened invoice export.',
  'Triggered password reset flow.',
  'Updated profile phone number.'
];

const today = new Date('2026-04-23T14:00:00+05:30');
const dayMs = 24 * 60 * 60 * 1000;
const minutesMs = 60 * 1000;
const agoIso = ({ days = 0, hours = 0, minutes = 0 }) =>
  new Date(today.getTime() - (days * dayMs + hours * 60 * minutesMs + minutes * minutesMs)).toISOString();

const buildUserId = (index) => `USR-${String(100000 + index * 73).slice(-6)}`;
const buildName = (index) => `${names[index % names.length]} ${surnames[(index * 3) % surnames.length]}`;
const buildEmail = (name, index) => `${name.toLowerCase().replace(/\s+/g, '.')}.${index}@marketloop.test`;
const buildPhone = (index) => String(8100000000 + index * 149).slice(0, 10);
const buildIp = (index) => `10.${(index % 200) + 10}.${(index * 3) % 250}.${(index * 7) % 250}`;

const deriveRiskScore = ({ failedLogins, sessionCount, ipChanges, suspiciousLocation, kycStatus, complaints, inactiveDays, unusualReset }) => {
  const score =
    failedLogins * 8 +
    Math.max(0, sessionCount - 2) * 6 +
    ipChanges * 7 +
    (suspiciousLocation ? 16 : 0) +
    (kycStatus === 'Pending' ? 10 : kycStatus === 'Rejected' ? 22 : 0) +
    complaints * 5 +
    (inactiveDays > 45 ? 12 : inactiveDays > 20 ? 5 : 0) +
    (unusualReset ? 10 : 0);
  return Math.min(97, 8 + score);
};

const riskBand = (score) => (score >= 70 ? 'high_risk' : score >= 40 ? 'medium_risk' : 'low_risk');

const buildSessions = (index, sessionCount, location) =>
  Array.from({ length: sessionCount }, (_, sessionIndex) => {
    const sessionType = sessionTypes[(index + sessionIndex) % sessionTypes.length];
    const status = sessionIndex === 0 ? 'Active' : sessionIndex === 1 ? 'Suspicious' : sessionIndex % 2 === 0 ? 'Expired' : 'Revoked';
    return {
      id: `SESS-${index}-${sessionIndex}`,
      sessionType,
      device: sessionType === 'Web' ? (sessionIndex % 2 === 0 ? 'Windows Laptop' : 'MacBook Pro') : sessionType === 'Android' ? 'Pixel 8' : 'iPhone 15',
      platform: sessionType,
      browser: browsers[(index + sessionIndex) % browsers.length],
      os: sessionType === 'Web' ? (sessionIndex % 2 === 0 ? 'Windows 11' : 'macOS 15') : sessionType === 'Android' ? 'Android 15' : 'iOS 18',
      ip: buildIp(index + sessionIndex + 1),
      location: `${location.area}, ${location.city}`,
      loginTime: agoIso({ days: index % 18, hours: sessionIndex * 2 + 1 }),
      lastActive: agoIso({ hours: sessionIndex, minutes: (index + sessionIndex) % 50 }),
      status,
      trusted: status === 'Active' && sessionIndex === 0
    };
  });

const buildTimeline = (index, prefix, templates, count = 4) =>
  Array.from({ length: count }, (_, entryIndex) => ({
    id: `${prefix}-${index}-${entryIndex}`,
    label: templates[(index + entryIndex) % templates.length],
    createdAt: agoIso({ days: entryIndex, hours: (index + entryIndex) % 8 }),
    actor: entryIndex % 2 === 0 ? 'Admin' : 'System'
  }));

export const generateMockActiveUsers = (count = 1000) =>
  Array.from({ length: count }, (_, index) => {
    const name = buildName(index + 1);
    const location = cities[index % cities.length];
    const role = roles[index % roles.length];
    const state = index % 29 === 0 ? 'Locked' : index % 17 === 0 ? 'Suspended' : index % 9 === 0 ? 'Idle' : index % 3 === 0 ? 'Offline' : 'Online';
    const sessionCount = 1 + (index % 4);
    const failedLogins = index % 21 === 0 ? 5 : index % 8;
    const complaints = index % 18 === 0 ? 3 : index % 5 === 0 ? 1 : 0;
    const kycStatus = role === 'Buyer' ? (index % 4 === 0 ? 'Pending' : 'Verified') : kycStatuses[(index + 1) % kycStatuses.length];
    const suspiciousLocation = index % 16 === 0;
    const ipChanges = index % 6;
    const inactiveDays = state === 'Offline' ? 7 + (index % 50) : state === 'Idle' ? 2 + (index % 12) : index % 3;
    const unusualReset = index % 15 === 0;
    const score = deriveRiskScore({ failedLogins, sessionCount, ipChanges, suspiciousLocation, kycStatus, complaints, inactiveDays, unusualReset });
    const band = riskBand(score);
    const sessions = buildSessions(index + 1, sessionCount, location);

    return {
      id: buildUserId(index + 1),
      name,
      role,
      state,
      email: buildEmail(name, index + 1),
      phone: buildPhone(index + 1),
      city: location.city,
      location: `${location.area}, ${location.city}`,
      device: sessions[0].device,
      platform: sessions[0].platform,
      browser: sessions[0].browser,
      os: sessions[0].os,
      ip: sessions[0].ip,
      kycStatus,
      sessionCount,
      loginTime: sessions[0].loginTime,
      lastSeen: sessions[0].lastActive,
      failedLoginAttempts: failedLogins,
      suspicious: band === 'high_risk' || suspiciousLocation,
      watchlisted: index % 14 === 0 || band === 'high_risk',
      linkedProfileRef: role === 'Seller' ? `SEL-${String(200000 + index * 17).slice(-6)}` : `BUY-${String(100000 + index * 19).slice(-6)}`,
      notesCount: 1 + (index % 4),
      complaints,
      ipChanges,
      suspiciousLocation,
      unusualReset,
      riskScore: score,
      riskBand: band,
      sessions,
      deviceList: sessions.map((session) => `${session.device} · ${session.platform}`),
      internalNotes: buildTimeline(index + 1, 'note', noteTemplates, 3),
      recentActions: buildTimeline(index + 1, 'action', actionTemplates, 5),
      loginHistory: sessions.map((session, sessionIndex) => ({
        id: `login-${index}-${sessionIndex}`,
        ip: session.ip,
        location: session.location,
        timestamp: session.loginTime,
        outcome: session.status === 'Suspicious' ? 'Flagged' : 'Success'
      })),
      securityFlags: [
        suspiciousLocation ? 'Unusual location' : null,
        failedLogins >= 4 ? 'Multiple failed logins' : null,
        unusualReset ? 'Recent password reset' : null,
        state === 'Locked' ? 'Account locked for review' : null
      ].filter(Boolean)
    };
  });

export const generateMockAuditLogs = (users) =>
  users.map((user, index) => ({
    id: `AUD-${index + 1}`,
    entity: user.name,
    entityId: user.id,
    entityType: user.role,
    field: index % 4 === 0 ? 'phone' : index % 4 === 1 ? 'kycStatus' : index % 4 === 2 ? 'watchlisted' : 'state',
    oldValue: index % 4 === 0 ? '9876500000' : index % 4 === 1 ? 'Pending' : index % 4 === 2 ? 'false' : 'Offline',
    newValue: index % 4 === 0 ? user.phone : index % 4 === 1 ? user.kycStatus : index % 4 === 2 ? String(user.watchlisted) : user.state,
    updatedBy: index % 6 === 0 ? 'Security Admin' : index % 3 === 0 ? 'Support Agent' : 'System',
    updaterType: index % 6 === 0 ? 'admin' : index % 3 === 0 ? 'support' : 'system',
    updatedAt: agoIso({ days: index % 30, hours: index % 12 }),
    linkedUserId: user.id
  }));
