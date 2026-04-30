# MarketLoop eMandi Integration Guidelines

## Goal
Bring real-time mandi intelligence into MarketLoop so buyers, sellers, and admins can see commodity prices, arrivals, demand trends, and regional movement.

## Integration Scope
- Commodity prices by mandi / market
- Market arrivals
- Demand and supply trends
- Historical snapshots when the API provides them
- Region and market filtering
- Admin analytics widgets and customer-facing trend cards

## Recommended Backend Design

### Service structure
- `backend/src/integrations/emandi/emandi.client.js`
- `backend/src/integrations/emandi/emandi.service.js`
- `backend/src/integrations/emandi/emandi.mapper.js`
- `backend/src/routes/emandi.routes.js`

### Suggested caching
- Cache latest responses in MongoDB or Redis
- Use TTL:
  - prices: 5 to 15 minutes
  - arrivals: 15 minutes
  - historical summaries: 6 to 24 hours

## API Behavior
- Fetch from configured eMandi provider with retries and timeout handling
- Normalize to a stable internal shape:

```json
{
  "commodity": "Onion",
  "market": "Nashik",
  "state": "Maharashtra",
  "modalPrice": 1520,
  "minPrice": 1450,
  "maxPrice": 1600,
  "arrivals": 80,
  "unit": "Quintal",
  "observedAt": "2026-04-23T10:00:00.000Z"
}
```

## Frontend Visualization
- Price cards for major commodities
- Trend line chart for 7-day and 30-day history
- Table view with:
  - commodity
  - market
  - min
  - modal
  - max
  - arrivals
  - updated at
- Filters:
  - state
  - market
  - commodity
  - category
  - date range

## Error Handling
- Show cached data when upstream API is unavailable
- Mark stale data clearly with last sync time
- Retry transient failures with exponential backoff
- Avoid blocking page render on eMandi timeouts

## Admin Use Cases
- Procurement planning
- Region-wise price comparison
- Seasonal sourcing strategy
- Low margin or high spread alerts
- Demand and stock prediction inputs

## Suggested Routes
- `GET /api/emandi/prices`
- `GET /api/emandi/arrivals`
- `GET /api/emandi/trends`
- `GET /api/emandi/history`

## Implementation Prompt
Use this prompt with a backend/frontend delivery workflow:

```txt
Integrate eMandi APIs into MarketLoop with a resilient backend proxy, normalized response models, caching, retry logic, and frontend charts/tables. Support commodity, region, mandi, and date filters. Expose near real-time prices, arrivals, demand/supply indicators, and historical trends where available. Add clean loading, stale-data, and error states, plus admin analytics widgets for procurement and pricing decisions.
```

## Rollout Plan
1. Add backend proxy and normalized models
2. Add cached admin dashboard widgets
3. Add customer-facing market insight cards
4. Add trend charts and alerts
5. Feed mandi data into pricing recommendations and AI assistant context
