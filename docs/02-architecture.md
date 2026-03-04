# Architettura

## Panoramica architettura
Il progetto e' una SPA React con backend serverless su Firebase (Firestore + Storage) e Cloud Functions per il bridge auth tra Clerk e Firebase Auth. La logica di business e' prevalentemente client-side, con enforcement di sicurezza tramite Firestore Rules.
File coinvolti: `src/main.jsx`, `src/app/router.jsx`, `src/infrastructure/firebase/index.js`, `functions/index.js`, `firebase.json`, `firestore.rules`

## Frontend (SPA, routing, stato)
- Routing: React Router con layout separati (pubblico e auth) e route protette.
- Stato: Redux per lista appartamenti e citta selezionata.
- UI: componenti modulari per sezioni pagina e layout.
File coinvolti: `src/app/router.jsx`, `src/app/routes/index.js`, `src/ui/components/layouts/MainLayout.jsx`, `src/ui/components/layouts/AuthLayout.jsx`, `src/app/store/store.jsx`, `src/app/store/slices/appartamentiSlice.jsx`, `src/app/store/slices/citySlice.jsx`, `src/ui/components`

## Auth (Clerk + Firebase bridge)
- Clerk gestisce login e sessioni.
- Bridge client (`useFirebaseBridgeAuth`) ottiene JWT Clerk e lo scambia con custom token Firebase tramite Cloud Function.
- Admin gating: custom claims Firebase (`role=admin`) + `AdminRoute`.
File coinvolti: `src/main.jsx`, `src/ui/components/common/clerk/UserInit.jsx`, `src/ui/hooks/auth/useFirebaseBridgeAuth.js`, `functions/index.js`, `src/ui/hooks/users/useIsAdmin.js`, `src/ui/components/common/clerk/AdminRoute.jsx`, `docs/firebase-auth-bridge-setup.md`

## Firebase (Firestore, Storage, Analytics)
- Firestore: documenti per users, apartments, conversations, reports, reviews.
- Storage: immagini annuncio e stanze (`immagini/apt_<id>` e `immagini/apt_<id>/rooms/<roomId>`).
- Analytics: metriche annuncio aggiornate via transazioni e subcollection `analytics`.
File coinvolti: `src/infrastructure/firebase/index.js`, `firestore.rules`, `src/infrastructure/firebase/adapters/compressAndUploadImages.js`, `src/infrastructure/firebase/adapters/annunci.js`, `src/infrastructure/firebase/analytics/ApartmentAnalyticsService.js`, `src/infrastructure/firebase/repositories/FirestoreAnalyticsRepository.js`

## Mappe e geocoding
- Google Maps JS API per mappa e marker.
- Geocoding client per trasformare indirizzo in coordinate al publish.
File coinvolti: `src/ui/components/common/mapComponents/GoogleMapComponent.jsx`, `src/ui/components/sections/apartmentsSection/ApartmentsMapSection.jsx`, `src/ui/helpers/getCoordinates.js`, `src/ui/pages/Apartments.jsx`, `src/ui/pages/Apartment.jsx`

## Flussi principali (Mermaid)
**Publish listing**
```mermaid
sequenceDiagram
  actor Host
  participant UI as PubblicaAnnuncio UI
  participant Form as usePubblicaAnnuncioForm
  participant Maps as Google Geocode API
  participant Storage as Firebase Storage
  participant FS as Firestore
  participant Admin as Admin Panel
  participant Platform as Platform Messages

  Host->>UI: compila form a step
  UI->>Form: handleSubmit
  Form->>Maps: getCoordinates(address)
  Form->>Storage: compressAndUploadImages()
  Form->>FS: batch set apartments/{id} (status=pending_review, aggregates)
  Form->>FS: batch set apartments/{id}/rooms/{roomId}
  Form->>FS: set apartments/{id}/analytics/summary
  Form->>FS: update usersPublic/usersPrivate
  Admin->>FS: verifica annuncio (status -> published)
  Admin->>Platform: sendVerificationSuccessMessage
```
File coinvolti: `src/ui/pages/PubblicaAnnuncio.jsx`, `src/ui/hooks/forms/usePubblicaAnnuncioForm.js`, `src/ui/helpers/getCoordinates.js`, `src/infrastructure/firebase/adapters/compressAndUploadImages.js`, `src/ui/components/sections/adminSection/AdminAnnunciSection.jsx`, `src/infrastructure/firebase/adapters/platformMessages.js`

**Search + map sync**
```mermaid
sequenceDiagram
  actor User
  participant Page as Apartments page
  participant Query as useFetchAppartamenti
  participant FS as Firestore
  participant List as ApartmentsListSection
  participant Map as GoogleMapComponent

  User->>Page: apre /alloggi/:city
  Page->>Query: build filters (city + status=published)
  Query->>FS: query apartments
  FS-->>Query: docs
  Query-->>List: appartamenti
  Query-->>Map: appartamenti
  User->>List: hover card
  List-->>Map: hoveredApartmentId
  Map-->>User: marker highlight + info card
```
File coinvolti: `src/ui/pages/Apartments.jsx`, `src/ui/hooks/fetches/useFetchAppartamenti.js`, `src/infrastructure/firebase/repositories/FirestoreApartmentRepository.js`, `src/ui/components/sections/apartmentsSection/ApartmentsListSection.jsx`, `src/ui/components/sections/apartmentsSection/ApartmentsMapSection.jsx`, `src/ui/components/common/mapComponents/GoogleMapComponent.jsx`, `src/ui/components/common/mapComponents/ApartmentMarker.jsx`

**Booking -> chat**
```mermaid
sequenceDiagram
  actor User
  participant Apt as Apartment page
  participant Utils as chatPayload
  participant Chat as ChatPage
  participant Boot as useChatBootstrapFromUrl
  participant FS as Firestore

  User->>Apt: invia booking form
  Apt->>Utils: create payload + encode
  Apt-->>Chat: redirect /chat?hostId&apartmentId&payload
  Chat->>Utils: decode/normalize payload
  Chat->>Boot: startConversation + sendMessage
  Boot->>FS: create conversation (if missing)
  Boot->>FS: add message type booking-preview
```
File coinvolti: `src/ui/pages/Apartment.jsx`, `src/ui/helpers/chatPayload.js`, `src/ui/pages/ChatPage.jsx`, `src/ui/hooks/chat/useChatBootstrapFromUrl.js`, `src/infrastructure/firebase/adapters/chat.js`

**Admin verify**
```mermaid
sequenceDiagram
  actor Admin
  participant Panel as AdminPanel
  participant FS as Firestore
  participant Platform as platformMessages
  participant Host as Host UI

  Admin->>Panel: apri "Annunci Non Verificati"
  Panel->>FS: fetch apartments (status == pending_review)
  Admin->>FS: update status + publishedAt
  Admin->>Platform: sendVerificationSuccessMessage
  Platform->>FS: add platformConversations/{id}/messages
  Host-->>Platform: riceve notifica in UI
```
File coinvolti: `src/ui/pages/AdminPanel.jsx`, `src/ui/hooks/fetches/useFetchUncheckedAnnunci.js`, `src/ui/components/sections/adminSection/AdminAnnunciSection.jsx`, `src/infrastructure/firebase/adapters/platformMessages.js`, `src/ui/hooks/chat/usePlatformMessages.js`
