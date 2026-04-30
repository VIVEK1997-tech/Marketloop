const alertTypes = ['Payment Failure', 'Low Stock', 'Near Expiry', 'Procurement Delay', 'Suspicious Activity', 'New Seller Registration', 'Quality Risk', 'System Error', 'Refund Issue'];
const alertLevels = ['Info', 'Warning', 'Danger', 'Critical'];
const alertStatuses = ['New', 'Acknowledged', 'Investigating', 'Resolved', 'Dismissed'];
const complaintTypes = ['Buyer Complaint', 'Seller Complaint', 'Payment Dispute', 'Refund Request', 'Quality Complaint', 'Delivery Issue', 'Blocked User Appeal', 'Fraud Report'];
const complaintStatuses = ['Open', 'In Review', 'Escalated', 'Resolved', 'Rejected', 'Blocked', 'Suspended'];
const severityLevels = ['Low', 'Medium', 'High', 'Critical'];
const roles = ['Buyer', 'Seller', 'Supplier', 'Admin', 'Delivery Partner'];
const admins = ['Safety Desk', 'Support Lead', 'Fraud Desk', 'Ops Control', 'Finance Desk'];
const modules = ['Payments', 'Inventory', 'Procurement', 'Orders', 'Quality', 'Auth', 'Refunds', 'Support'];
const people = ['Riya Sharma', 'Arun Traders', 'Mehta Retail Foods', 'FreshFarm Bengaluru', 'Golden Fruit Depot', 'Daily Organics Delhi', 'Urban Greens Hub', 'Nashik Orchard Collective'];
const today = new Date('2026-04-24T10:00:00+05:30').getTime();

const createRng = (seed = 313131) => {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
};

const pick = (rng, list) => list[Math.floor(rng() * list.length)];
const randomInt = (rng, min, max) => Math.floor(rng() * (max - min + 1)) + min;
const isoDaysFromToday = (days) => new Date(today + days * 86400000).toISOString();

const buildAlertTimeline = ({ alertId, createdAt, updatedAt, status }) => {
  const timeline = [
    { id: `${alertId}-event-1`, actor: 'Risk Engine', action: 'Alert created', detail: 'Safety signal generated from system scan.', timestamp: createdAt }
  ];
  if (status !== 'New') {
    timeline.push({ id: `${alertId}-event-2`, actor: 'Safety Desk', action: 'Alert triaged', detail: `Alert status moved to ${status}.`, timestamp: updatedAt });
  }
  return timeline.sort((left, right) => new Date(right.timestamp) - new Date(left.timestamp));
};

const buildComplaintTimeline = ({ complaintId, createdAt, updatedAt, status, assignedAdmin }) => {
  const timeline = [
    { id: `${complaintId}-event-1`, actor: 'Support Intake', action: 'Complaint created', detail: 'Complaint entered into safety workflow.', timestamp: createdAt }
  ];
  if (status !== 'Open') {
    timeline.push({ id: `${complaintId}-event-2`, actor: assignedAdmin, action: 'Complaint reviewed', detail: `Complaint status moved to ${status}.`, timestamp: updatedAt });
  }
  return timeline.sort((left, right) => new Date(right.timestamp) - new Date(left.timestamp));
};

export const generateSafetyData = (count = 1000) => {
  const rng = createRng(240430);

  const alerts = Array.from({ length: count }, (_, index) => {
    const alertType = pick(rng, alertTypes);
    const level = pick(rng, alertLevels);
    const status = pick(rng, alertStatuses);
    const createdAt = isoDaysFromToday(-randomInt(rng, 0, 75));
    const updatedAt = isoDaysFromToday(-randomInt(rng, 0, 15));
    const linkedRecordType = pick(rng, ['Order', 'Payment', 'Product', 'Purchase Order', 'Inventory Batch', 'Seller Account']);
    const linkedRecordId = `${linkedRecordType.slice(0, 3).toUpperCase()}-${String(54000 + index).padStart(5, '0')}`;
    const assignedAdmin = pick(rng, admins);
    const priority = pick(rng, ['Low', 'Medium', 'High', 'Urgent']);
    const sourceModule = pick(rng, modules);
    const alertId = `ALT-${String(710000 + index).padStart(6, '0')}`;
    const details = `${alertType} detected in ${sourceModule}. Review linked ${linkedRecordType.toLowerCase()} ${linkedRecordId}.`;

    return {
      id: `alert-${index + 1}`,
      alertId,
      alertTitle: alertType,
      alertType,
      details,
      level,
      status,
      linkedRecordType,
      linkedRecordId,
      assignedAdmin,
      createdAt,
      updatedAt,
      priority,
      sourceModule,
      recommendedAction: level === 'Critical' ? 'Escalate immediately and review linked record.' : 'Acknowledge and review linked record.',
      timeline: buildAlertTimeline({ alertId, createdAt, updatedAt, status })
    };
  });

  const complaints = Array.from({ length: count }, (_, index) => {
    const complaintType = pick(rng, complaintTypes);
    const againstName = pick(rng, people);
    const againstRole = pick(rng, roles);
    const raisedBy = pick(rng, people);
    const raisedByRole = pick(rng, ['Buyer', 'Seller', 'Admin', 'Support']);
    const status = pick(rng, complaintStatuses);
    const severity = pick(rng, severityLevels);
    const assignedAdmin = pick(rng, admins);
    const createdAt = isoDaysFromToday(-randomInt(rng, 0, 90));
    const updatedAt = isoDaysFromToday(-randomInt(rng, 0, 20));
    const complaintId = `CMP-${String(820000 + index).padStart(6, '0')}`;
    const isBlocked = status === 'Blocked' || (severity === 'Critical' && rng() > 0.6);
    const isSuspended = status === 'Suspended' || (severity === 'Critical' && rng() > 0.72);
    const linkedOrderId = `ORD-${String(46000 + index).padStart(5, '0')}`;
    const linkedPaymentId = `PAY-${String(67000 + index).padStart(5, '0')}`;

    return {
      id: `complaint-${index + 1}`,
      complaintId,
      complaintType,
      againstName,
      againstRole,
      raisedBy,
      raisedByRole,
      status,
      severity,
      notes: `${complaintType} requires ${severity.toLowerCase()} severity review and follow-up.`,
      evidenceCount: randomInt(rng, 0, 6),
      assignedAdmin,
      createdAt,
      updatedAt,
      resolutionNotes: status === 'Resolved' ? 'Issue resolved after admin review.' : status === 'Rejected' ? 'Claim rejected after evidence review.' : '',
      linkedOrderId,
      linkedPaymentId,
      isBlocked,
      isSuspended,
      timeline: buildComplaintTimeline({ complaintId, createdAt, updatedAt, status, assignedAdmin })
    };
  });

  return { alerts, complaints };
};
