const categories = ['Sales', 'Purchase', 'Inventory', 'Quality', 'Finance', 'Supplier', 'Customer', 'Tax', 'Demand', 'Profit'];
const statuses = ['Ready', 'Queued', 'Running', 'Failed', 'Scheduled', 'Archived'];
const frequencies = ['None', 'Daily', 'Weekly', 'Monthly'];
const visibilities = ['Private', 'Admin Only', 'Finance Team', 'Operations Team'];
const owners = ['Finance Desk', 'Ops Control', 'Supply Chain Admin', 'Inventory Lead', 'Quality Desk'];
const formatsPool = ['CSV', 'PDF', 'ZIP', 'XLSX'];
const reportCatalog = [
  ['Sales Overview Report', 'Sales'],
  ['Purchase Reconciliation Report', 'Purchase'],
  ['Inventory Stock Report', 'Inventory'],
  ['Low Stock Alert Report', 'Inventory'],
  ['Expiry Exposure Report', 'Inventory'],
  ['Quality Inspection Report', 'Quality'],
  ['Rejection Trend Report', 'Quality'],
  ['Supplier Performance Report', 'Supplier'],
  ['Customer Invoice Report', 'Customer'],
  ['Bills Payable Report', 'Finance'],
  ['Tax Liability Report', 'Tax'],
  ['Profit and Margin Report', 'Profit'],
  ['Demand Forecasting Report', 'Demand'],
  ['Stock Movement Report', 'Inventory'],
  ['Outstanding Payable Report', 'Finance'],
  ['Outstanding Receivable Report', 'Finance']
];
const today = new Date('2026-04-24T10:00:00+05:30').getTime();

const createRng = (seed = 919191) => {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
};

const pick = (rng, list) => list[Math.floor(rng() * list.length)];
const randomInt = (rng, min, max) => Math.floor(rng() * (max - min + 1)) + min;
const isoDaysFromToday = (days) => new Date(today + days * 86400000).toISOString();
const formatBytes = (bytes) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

const makeFormats = (rng) => {
  const count = randomInt(rng, 1, 4);
  return [...formatsPool]
    .sort(() => rng() - 0.5)
    .slice(0, count)
    .sort((left, right) => formatsPool.indexOf(left) - formatsPool.indexOf(right));
};

const makePreviewRows = (rng, category) =>
  Array.from({ length: 5 }, (_, index) => ({
    id: `${category}-${index + 1}`,
    label: `${category} row ${index + 1}`,
    metric: randomInt(rng, 12, 9500).toLocaleString('en-IN'),
    region: pick(rng, ['North', 'South', 'East', 'West']),
    status: pick(rng, ['Healthy', 'Watch', 'Alert'])
  }));

const makeTimeline = ({ reportId, createdAt, lastRunAt, nextScheduledRun, status, scheduleFrequency }) => {
  const events = [
    {
      id: `${reportId}-event-1`,
      actor: 'Report Engine',
      action: 'Report created',
      detail: 'Report template created in Report Center.',
      timestamp: createdAt
    }
  ];

  if (lastRunAt) {
    events.push({
      id: `${reportId}-event-2`,
      actor: 'Export Worker',
      action: status === 'Failed' ? 'Report run failed' : 'Report generated',
      detail: status === 'Failed' ? 'Latest generation attempt failed.' : 'Report export generated successfully.',
      timestamp: lastRunAt
    });
  }

  if (scheduleFrequency !== 'None') {
    events.push({
      id: `${reportId}-event-3`,
      actor: 'Admin Scheduler',
      action: 'Report scheduled',
      detail: `${scheduleFrequency} schedule active for this report.`,
      timestamp: nextScheduledRun || createdAt
    });
  }

  if (status === 'Archived') {
    events.push({
      id: `${reportId}-event-4`,
      actor: 'Admin Console',
      action: 'Report archived',
      detail: 'Archived and removed from active export queue.',
      timestamp: isoDaysFromToday(-1)
    });
  }

  return events.sort((left, right) => new Date(right.timestamp) - new Date(left.timestamp));
};

export const generateDummyReports = (count = 500) => {
  const rng = createRng(240429);

  return Array.from({ length: count }, (_, index) => {
    const [baseName, categoryFromCatalog] = reportCatalog[index % reportCatalog.length];
    const category = categoryFromCatalog || pick(rng, categories);
    const formats = makeFormats(rng);
    const status = pick(rng, statuses);
    const scheduleFrequency = status === 'Scheduled' ? pick(rng, ['Daily', 'Weekly', 'Monthly']) : pick(rng, frequencies);
    const createdAt = isoDaysFromToday(-randomInt(rng, 8, 120));
    const lastRunAt = status === 'Queued' ? null : isoDaysFromToday(-randomInt(rng, 0, 20));
    const nextScheduledRun = scheduleFrequency === 'None' ? null : isoDaysFromToday(randomInt(rng, 1, 30));
    const totalRows = randomInt(rng, 35, 98000);
    const fileSizeBytes = totalRows * randomInt(rng, 250, 1200);
    const reportId = `RPT-${String(650000 + index).padStart(6, '0')}`;
    const dateRange = `${new Date(today - randomInt(rng, 7, 45) * 86400000).toLocaleDateString('en-IN')} - ${new Date(today - randomInt(rng, 0, 6) * 86400000).toLocaleDateString('en-IN')}`;

    return {
      id: `report-${index + 1}`,
      reportId,
      reportName: baseName,
      reportCategory: category,
      description: `${baseName} covering ${category.toLowerCase()} operations, exports, and exception metrics.`,
      formats,
      status,
      lastRunAt,
      nextScheduledRun,
      createdBy: pick(rng, owners),
      ownerAdmin: pick(rng, owners),
      dateRange,
      totalRows,
      fileSize: formatBytes(fileSizeBytes),
      fileSizeBytes,
      exportUrlPlaceholder: `/exports/${reportId.toLowerCase()}`,
      scheduleFrequency,
      visibility: pick(rng, visibilities),
      notes: `${category} report monitored by admin reporting workspace.`,
      previewRows: makePreviewRows(rng, category),
      timeline: makeTimeline({ reportId, createdAt, lastRunAt, nextScheduledRun, status, scheduleFrequency }),
      createdAt,
      updatedAt: lastRunAt || createdAt
    };
  });
};
