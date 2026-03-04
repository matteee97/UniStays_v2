# Backend Modules Architecture

## Goals
- Keep `functions/index.js` as composition root.
- Move feature endpoints to `register...Routes` modules.
- Keep business logic reusable, transaction-safe, and testable via dependency injection.

## Composition root
- `functions/index.js`
  - bootstraps Express/Firebase/Secrets
  - defines shared primitives (`ApiError`, auth middlewares, normalizers)
  - instantiates domain services
  - wires route modules with service dependencies

## Modules
- `modules/auth/authService.js`
  - Clerk token verification + Firebase custom token issuance
- `modules/auth/registerAuthRoutes.js`
  - `/firebase/token`

- `modules/users/usersService.js`
  - user bootstrap (`usersPublic`, `usersPrivate`)
- `modules/users/registerUserRoutes.js`
  - `/v1/users/public`, `/v1/users/private`

- `modules/apartments/apartmentsService.js`
  - apartment create/update/publish/reject workflows
  - room normalization and ownership checks
  - moderation side-effects (host counters + platform messages + storage cleanup)
- `modules/apartments/registerApartmentRoutes.js`
  - apartment owner/admin endpoints

- `modules/analytics/analyticsService.js`
  - analytics counters and apartment score updates in transactions
- `modules/analytics/registerAnalyticsRoutes.js`
  - analytics event endpoints

- `modules/favorites/favoritesService.js`
  - favorite add/remove workflow
  - sync of likes + apartment metrics + analytics daily counters
- `modules/favorites/registerFavoritesRoutes.js`
  - favorites endpoints (HTTP adapter only)

- `modules/reports/reportsService.js`
  - report creation and admin moderation workflows
  - anti-abuse guardrails (`reportsCreatedCount`, `lastReportCreatedAt`, rate window)
  - side effects for host counters and `apartments.metrics.totalReports`
  - optional platform notifications to reporter/target with admin-authored messages
- `modules/reports/registerReportRoutes.js`
  - reports endpoints (HTTP adapter only)

- `modules/platform/platformService.js`
  - platform conversation and platform message delivery
- `modules/platform/registerPlatformRoutes.js`
  - platform conversation ensure + mark-read endpoints

- `modules/reviews/reviewsService.js`
  - review create/like/reply business logic
- `modules/reviews/registerReviewRoutes.js`
  - reviews creation, likes, replies endpoints

- `modules/chat/chatService.js`
  - conversation lifecycle and message write/read workflows
- `modules/chat/registerChatRoutes.js`
  - chat conversation lifecycle and messages endpoints

- `modules/cities/citiesService.js`
  - city payload normalization, CRUD and listings recount
- `modules/cities/registerAdminCityRoutes.js`
  - admin city CRUD and listings recount endpoint

## Shared utility
- `functions/utils/reportPatch.js`
  - safe nested patch helpers for report mutation payloads
