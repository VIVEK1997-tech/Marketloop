# MarketLoop Mobile Implementation Status

## Current Delivery

### Phase 1: Foundation and Shell
- Complete
- Expo + TypeScript workspace created
- Expo Router navigation scaffold created
- auth store with SecureStore persistence added
- onboarding, login, register, verify OTP routes added
- reusable UI primitives added
- role-aware navigation added for buyer and seller flows

### Phase 2: Buyer Marketplace MVP
- Complete
- buyer home, search, wishlist, and product detail screens scaffolded
- marketplace repository wired to existing product APIs
- recommendation and seller-chat entry points added
- marketplace browsing polished with reusable cards, filters, wishlist sync, and recommendations
- modern grocery-style buyer UI pass added with category tiles, promo banners, cart state, and premium card system

### Phase 3: Checkout, Payments, and Invoices
- In progress
- checkout flow upgraded with explicit gateway selection
- payment repository and mobile payment service abstraction added
- payment result screen added
- payment history, invoice list, invoice detail, and PDF share/download flows upgraded
- cart-first checkout and order-success UI pass added for buyer flow

### Phase 4: Orders and Chat
- In progress
- orders list and order detail upgraded with payment, invoice, and tracking context
- conversations inbox upgraded with online status and local unread badges
- chat thread upgraded with socket refresh, typing signals, and better message presentation
- REST chat send-message support added on backend

### Phase 5: Seller Workspace
- In progress
- seller dashboard upgraded with recent listings and recent orders
- listings management upgraded with filters, edit flow, and mark-sold action
- finance tab upgraded with invoice summary and richer invoice cards
- listing form upgraded for both create and edit flows
- listing image picker and multipart create/update flow added
- seller summary endpoint added on backend

### Phase 6: Notifications, Support, and Hardening
- In progress
- push-token registration backend wired into mobile app providers
- notification feed backend exposed through a mobile notifications screen
- profile/settings flow upgraded with role switching and shared shortcuts
- mobile-ready app notification DTOs added
- mobile support center added for creating and tracking complaints/disputes
- user-facing support complaint APIs added on backend

## Backend Additions For Mobile
- `POST /api/users/push-token`
- `GET /api/users/notifications`
- `PATCH /api/users/notifications/:notificationId/read`
- `GET /api/users/seller-summary`
- `POST /api/chats/conversations/:conversationId/messages`
- normalized order detail response updates in payment controller

## Next Recommended Build Steps
1. Run the mobile app locally with `npm run dev:mobile`
2. Connect push notification permission flow and device token registration
3. Replace checkout placeholder flow with gateway-specific native/web handoff
4. Add richer order detail and invoice UI polish
5. Finish payment hardening and release readiness polish
