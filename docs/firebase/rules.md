# Firestore Rules (sintesi aggiornata)

## Panoramica
Le regole usano helper `isAuthenticated`, `isAdmin` e `isOwner`, ma il modello corrente e' **admin-centric**: quasi tutte le write client-side sono bloccate e avvengono tramite Cloud Functions (Admin SDK), che bypassa le rules.
File coinvolti: `firestore.rules`, `functions/index.js`, `functions/src/modules/reports/registerReportRoutes.js`, `src/ui/hooks/auth/useFirebaseBridgeAuth.js`

## Nota architetturale importante
- Le regole Firestore governano il traffico diretto dal client.
- Le operazioni write applicative sono gestite principalmente da endpoint backend (`functions/index.js` + moduli `functions/src/modules/*`) autenticati con Firebase token e poi eseguite server-side con privilegi admin.
- Di conseguenza, molte collection risultano "read dal client, write solo admin" nelle rules.

## Users
- `usersPublic/{userId}`: `read` pubblico; `create/update/delete` solo admin.
- `usersPrivate/{userId}`: `read` owner/admin; `create/update/delete` solo admin.
- I campi anti-abuso reporter (`reportsCreatedCount`, `lastReportCreatedAt`, `reportRateWindowStartedAt`, `reportRateWindowCount`) sono aggiornati solo lato backend.
- `usersPrivate/{userId}/favorites/{apartmentId}`: `read` owner/admin; `create/update/delete` solo admin.
File coinvolti: `firestore.rules`, `functions/index.js`, `functions/src/modules/favorites/registerFavoritesRoutes.js`, `functions/src/modules/reports/registerReportRoutes.js`

## Apartments, Rooms, Analytics
- `apartments/{apartmentId}`:
  - `get/list` se `status == "published"` oppure owner/admin.
  - `create/update/delete` solo admin.
- `apartments/{apartmentId}/rooms/{roomId}`:
  - `get/list` se annuncio pubblicato oppure owner/admin.
  - `create/update/delete` solo admin.
- `apartments/{apartmentId}/analytics/summary` e `/daily/{dayId}`:
  - `read` owner/admin.
  - `create/update/delete` solo admin.
File coinvolti: `firestore.rules`, `functions/index.js`, `functions/src/modules/analytics/registerAnalyticsRoutes.js`

## Cities e Reports
- `cities/{cityId}`: `read` solo se `active == true`; `create/update/delete` solo admin.
- `reports/{reportId}`:
  - `read` admin o reporter.
  - `create/update` solo admin **con validazione schema** (`reason`, `status`, `priority`, `severity`, `moderation`, `resolution`, `target.ownerId`, reporter snapshot).
  - `update` richiede `createdAt` immutabile.
  - `delete` solo admin.
  - le segnalazioni utente continuano a passare dal backend (`functions/src/modules/reports/registerReportRoutes.js`) e non scrivono direttamente da client.
File coinvolti: `firestore.rules`, `functions/src/modules/reports/registerReportRoutes.js`

## Chat e messaggi piattaforma
- `conversations/{conversationId}`: `read` partecipanti/admin; `create/update/delete` solo admin.
- `conversations/{conversationId}/messages/{messageId}`: `read` partecipanti/admin; `create/update/delete` solo admin.
- `platformConversations/{conversationId}` e subcollection `messages`:
  - `read` admin o owner della conversazione piattaforma.
  - `create/update/delete` solo admin.
File coinvolti: `firestore.rules`, `functions/src/modules/chat/registerChatRoutes.js`, `functions/src/modules/platform/registerPlatformRoutes.js`

## Reviews
- `apartments/{apartmentId}/reviews/{reviewId}`: `read` pubblico; `create/update/delete` solo admin.
- `apartments/{apartmentId}/reviews/{reviewId}/replies/{replyId}`: `read` pubblico; `create/update/delete` solo admin.
File coinvolti: `firestore.rules`, `functions/src/modules/reviews/registerReviewRoutes.js`
