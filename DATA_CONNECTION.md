# MarketLoop Data Connection Guide

## Current Stack
- Frontend: Vite + React
- Backend: Express
- Database: MongoDB via Mongoose
- Auth: JWT bearer token stored in browser local storage
- Realtime: Socket.IO for chat and presence

## Project Architecture
- Frontend web app lives in [frontend](C:/Users/yadav/OneDrive/Documents/e-commerce-web/frontend)
- Backend API lives in [backend](C:/Users/yadav/OneDrive/Documents/e-commerce-web/backend)
- The frontend talks to the backend through a centralized Axios client in [frontend/src/services/api.js](C:/Users/yadav/OneDrive/Documents/e-commerce-web/frontend/src/services/api.js)
- MongoDB is configured in [backend/src/config/db.js](C:/Users/yadav/OneDrive/Documents/e-commerce-web/backend/src/config/db.js)

## Required Environment Variables

### Frontend
Create `frontend/.env` from [frontend/.env.example](C:/Users/yadav/OneDrive/Documents/e-commerce-web/frontend/.env.example)

Required:
- `VITE_API_URL`
- `VITE_SOCKET_URL`
- `VITE_API_TIMEOUT_MS`

Example:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_API_TIMEOUT_MS=15000
```

### Backend
Create `backend/.env` from [backend/.env.example](C:/Users/yadav/OneDrive/Documents/e-commerce-web/backend/.env.example)

Core required variables:
- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL`

Recommended for local multi-origin development:
- `CLIENT_URLS`
- `CORS_ALLOWED_ORIGINS`

Example:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/olx_marketplace
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
CLIENT_URLS=http://localhost:5173,http://127.0.0.1:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

## How Frontend Connects To Backend
- The frontend resolves its API base URL in [frontend/src/config/env.js](C:/Users/yadav/OneDrive/Documents/e-commerce-web/frontend/src/config/env.js)
- If `VITE_API_URL` is defined, that is used directly
- If it is not defined:
  - local development falls back to `http://localhost:5000/api`
  - production falls back to the current origin plus `/api`

This prevents production from accidentally hardcoding localhost.

### Live frontend route aliases now in use
- `GET /api/me`
- `PUT /api/me`
- `GET /api/cart`
- `POST /api/cart`
- `PUT /api/cart/:productId`
- `DELETE /api/cart/:productId`
- `GET /api/wishlist`
- `POST /api/wishlist`
- `DELETE /api/wishlist/:id`
- `GET /api/orders`
- `POST /api/orders`
- `GET /api/orders/:id`
- `GET /api/buyer/dashboard`
- `GET /api/seller/dashboard`
- `GET /api/admin/dashboard`

## Auth And Session Flow
- Login/register/verify OTP requests go through [frontend/src/context/AuthContext.jsx](C:/Users/yadav/OneDrive/Documents/e-commerce-web/frontend/src/context/AuthContext.jsx)
- On successful login:
  - JWT token is saved in `localStorage`
  - normalized user data is saved in `localStorage`
- Every API request automatically attaches `Authorization: Bearer <token>` from [frontend/src/services/api.js](C:/Users/yadav/OneDrive/Documents/e-commerce-web/frontend/src/services/api.js)
- On refresh, the frontend calls `/api/auth/me` to restore the session
- If a request returns `401`, the app emits an auth-expired event and clears the stale session

## Backend Response Format
The backend now standardizes success/error responses around:

```json
{
  "success": true,
  "data": { "...": "..." }
}
```

or

```json
{
  "success": false,
  "error": "message"
}
```

For compatibility with the existing UI, major routes also keep legacy top-level keys such as `user`, `products`, `orders`, `invoice`, and `wishlist`.

## Core Connected Data Areas
The following sections are wired to real API and MongoDB data:
- users and auth
- buyer/seller profile
- seller role switching
- products/listings
- categories through `/api/products/categories`
- cart through `/api/users/cart`
- wishlist
- reviews
- chat conversations/messages
- orders and payments
- invoices
- seller dashboard
- admin API surfaces

## Cart And Category Sync
- Cart now persists both:
  - locally in browser storage for fast UI response
  - remotely in MongoDB through the authenticated user record
- On login or session restore, the frontend hydrates cart state from `/api/users/cart`
- Product categories are exposed from MongoDB via `/api/products/categories`
- The home page uses live categories when available and falls back to the curated grocery category map only if the API is empty or unavailable

## Current Web-App Note
- The web app still uses a product-direct checkout flow rather than a dedicated cart page-first flow.
- Admin dashboards include several intentionally mocked operational modules that are UI-first and not yet fully backed by MongoDB. Buyer/seller marketplace, auth, products, wishlist, cart, orders, payments, invoices, chat, and profile flows are the real connected surfaces.

## CORS And Deployment
- Express CORS uses:
  - `CLIENT_URL`
  - `CLIENT_URLS`
  - `CORS_ALLOWED_ORIGINS`
- Socket.IO uses the same allowed-origins list
- Do not expose backend secrets in frontend env files
- Use frontend env variables only for public URLs and non-secret runtime settings

## Common Troubleshooting

### Data is not loading
1. Start MongoDB
2. Start backend from [backend](C:/Users/yadav/OneDrive/Documents/e-commerce-web/backend)
3. Start frontend from [frontend](C:/Users/yadav/OneDrive/Documents/e-commerce-web/frontend)
4. Check `VITE_API_URL`
5. Open `http://localhost:5000/api/health`

### Login works but pages still act logged out
- Clear browser local storage
- Login again
- Confirm `/api/auth/me` returns `200`
- Check `JWT_SECRET` is stable between backend restarts

### CORS errors
- Add the browser origin to:
  - `CLIENT_URLS`
  - `CORS_ALLOWED_ORIGINS`

### Socket chat not connecting
- Confirm `VITE_SOCKET_URL` points to the backend origin, not `/api`
- Confirm the user is logged in and a valid token exists

### Products or wishlist look stale
- Verify the backend is returning `success: true`
- Verify the browser request includes the bearer token for protected routes
- Check the product and wishlist collections in MongoDB directly if needed

## Local Run Order

### Backend
```powershell
cd C:\Users\yadav\OneDrive\Documents\e-commerce-web\backend
npm install
npm run dev
```

### Frontend
```powershell
cd C:\Users\yadav\OneDrive\Documents\e-commerce-web\frontend
npm install
npm run dev
```

## Files To Check First During Future Data Issues
- [frontend/src/services/api.js](C:/Users/yadav/OneDrive/Documents/e-commerce-web/frontend/src/services/api.js)
- [frontend/src/config/env.js](C:/Users/yadav/OneDrive/Documents/e-commerce-web/frontend/src/config/env.js)
- [frontend/src/context/AuthContext.jsx](C:/Users/yadav/OneDrive/Documents/e-commerce-web/frontend/src/context/AuthContext.jsx)
- [backend/src/app.js](C:/Users/yadav/OneDrive/Documents/e-commerce-web/backend/src/app.js)
- [backend/src/middleware/auth.middleware.js](C:/Users/yadav/OneDrive/Documents/e-commerce-web/backend/src/middleware/auth.middleware.js)
- [backend/src/middleware/error.middleware.js](C:/Users/yadav/OneDrive/Documents/e-commerce-web/backend/src/middleware/error.middleware.js)
- [backend/src/config/db.js](C:/Users/yadav/OneDrive/Documents/e-commerce-web/backend/src/config/db.js)
