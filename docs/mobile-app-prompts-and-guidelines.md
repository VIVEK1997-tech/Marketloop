# MarketLoop Mobile App Prompts and Implementation Guidelines

## Product Goal
Build Android and iOS apps with feature parity for the MarketLoop fruits-and-vegetables marketplace, keeping the mobile stack scalable, testable, and aligned with the existing MERN backend.

## Shared Product Scope
- Authentication with buyer, seller, and admin-aware sessions
- Product browsing, search, filters, and detail pages
- Wishlist, cart-like buy intent, and payment flows
- Seller listing management and order tracking
- Real-time chat, notifications, and chatbot assistance
- Invoice, payment history, and profile management

## Android Prompt
Use this prompt with an Android engineering team or code generation workflow:

```txt
Build the MarketLoop Android app in Kotlin using MVVM + Clean Architecture. Use Jetpack Compose for UI, Retrofit/OkHttp for APIs, Room for local cache, Kotlin Coroutines + Flow for async state, Hilt for DI, and DataStore for auth/session persistence. Match web feature parity for login, product discovery, product details, wishlist, seller dashboard, payments, invoices, chat, chatbot, and admin moderation read-only views where appropriate. Add offline-aware caching, robust error states, token refresh handling, and modular packages by domain.
```

## iOS Prompt
Use this prompt with an iOS engineering team or code generation workflow:

```txt
Build the MarketLoop iOS app in Swift using SwiftUI + MVVM + Clean Architecture. Use URLSession or Alamofire for APIs, Combine or async/await for state updates, Keychain for token storage, and a lightweight persistence layer for cached listings, invoices, and recent chats. Match Android/web feature parity for auth, browsing, wishlist, product details, seller listing management, payments, invoice access, chat, chatbot, and profile settings. Include resilient network handling, pagination, retry states, and modular domain-driven project structure.
```

## Architecture

### Recommended module layout
- `core`
  - networking
  - auth
  - storage
  - ui-kit
- `features/auth`
- `features/home`
- `features/products`
- `features/wishlist`
- `features/orders`
- `features/payments`
- `features/invoices`
- `features/chat`
- `features/chatbot`
- `features/profile`
- `features/seller-dashboard`
- `features/admin-readonly`

### Clean layering
- Presentation: screens, view models, UI state, navigation
- Domain: use cases, entities, business rules
- Data: DTOs, repositories, API services, cache

## API Integration Guidelines
- Use a single typed API client per platform
- Centralize auth token injection and refresh handling
- Normalize backend errors into user-friendly states
- Reuse the same API contract naming as the web app
- Add request tracing ids for chat, payment, and order flows

## Authentication and State
- Persist access token and refresh token securely
- Auto-logout on revoked or deactivated accounts
- Load the active role from the backend and allow role switching where supported
- Use per-screen view state:
  - idle
  - loading
  - success
  - empty
  - error

## Error Handling
- Show retry actions for:
  - network failure
  - timeout
  - payment verification delay
  - stale session
- Never expose raw backend stack traces
- Log recoverable failures with analytics breadcrumbs

## Recommended API Coverage
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `GET /api/orders`
- `GET /api/invoices`
- `GET /api/invoices/:invoiceIdOrNumber`
- `GET /api/invoices/:invoiceIdOrNumber/pdf`
- `POST /api/payment/create-order`
- `POST /api/payment/verify-payment`
- `POST /api/payment/payu/create-order`
- `GET /api/chatbot/history`

## Scalability Notes
- Keep all business logic out of views
- Support feature flags for new gateways and mandi data
- Add analytics events for search, wishlist, payments, and invoice downloads
- Keep platform-specific UI while preserving shared behavior and API contracts

## Delivery Milestones
1. Auth + home + product listing
2. Product detail + wishlist + seller flows
3. Payments + invoices + order tracking
4. Chat + chatbot + notifications
5. Admin read-only moderation tools
