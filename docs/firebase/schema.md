# Schema Firestore

## Users (pubblico, privato, preferiti)

Documenti creati/aggiornati dal bridge utente e dai preferiti.
File coinvolti: `src/ui/hooks/auth/useEnsureUserDoc.js`, `src/ui/hooks/fetches/useToggleLike.js`, `src/infrastructure/firebase/repositories/FirestoreFavoritesRepository.js`

Esempio `usersPublic/{userId}`:

```json
{
  "userId": "user_abc",
  "displayName": "Mario Rossi",
  "firstName": "Mario",
  "lastName": "Rossi",
  "photoUrl": "https://...",
  "bio": "",
  "isHost": false,
  "isVerifiedHost": false,
  "isAgency": false,
  "publicStats": {
    "apartmentsCount": 0,
    "reportsCount": 0,
    "resolvedReportsCount": 0
  },
  "createdAt": "<timestamp>",
  "updatedAt": "<timestamp>"
}
```

Esempio `usersPrivate/{userId}`:

```json
{
  "userId": "user_abc",
  "email": "user@example.com",
  "phone": null,
  "address": null,
  "stripeCustomerId": null,
  "reportsCount": 0,
  "reportsCreatedCount": 0,
  "lastReportCreatedAt": null,
  "reportRateWindowStartedAt": null,
  "reportRateWindowCount": 0,
  "settings": {},
  "createdAt": "<timestamp>",
  "updatedAt": "<timestamp>"
}
```

Esempio `usersPrivate/{userId}/favorites/{apartmentId}`:

```json
{
  "apartmentId": "apt_123",
  "createdAt": "<timestamp>"
}
```

## Apartments

Schema principale annuncio e read model di listing. `aggregates`, `occupancySummary` e `occupantListingSnapshot` sono calcolati lato backend partendo da rooms/occupants.
Status: `draft | pending_review | published | rejected | archived`.
File coinvolti: `src/ui/hooks/forms/usePubblicaAnnuncioForm.js`, `src/infrastructure/firebase/repositories/FirestoreApartmentRepository.js`, `functions/src/modules/apartments/apartmentsService.js`

Esempio `apartments/{apartmentId}`:

```json
{
  "title": "Bilocale vicino campus",
  "description": "Appartamento luminoso con 3 stanze.",
  "address": {
    "street": "Via Roma 1",
    "city": "Roma",
    "provinceCode": "RM",
    "postalCode": "00100",
    "area": "Centro",
    "location": { "_lat": 41.9028, "_long": 12.4964 }
  },
  "features": {
    "totalAreaMq": 90,
    "bathroomsCount": 2,
    "heatingType": "autonomo",
    "utilitiesIncluded": false,
    "floor": 2,
    "propertyCondition": "buono",
    "garageType": "singolo",
    "gardenType": "assente"
  },
  "houseRules": {
    "studentsOnly": "",
    "petsAllowed": false,
    "smokingAllowed": false,
    "partiesForbidden": true
  },
  "amenities": {
    "parking": false,
    "wifi": true,
    "airConditioning": false,
    "kitchenType": "",
    "washer": false,
    "elevator": false,
    "balcony": false,
    "kitchenBasics": false,
    "kitchenware": false,
    "dishwasher": false,
    "oven": false,
    "tv": false,
    "deskInRoom": false,
    "dryer": false,
    "microwave": false
  },
  "additionalInfo": "",
  "apartmentPhotoUrls": ["https://..."],
  "ownerSnapshot": {
    "displayName": "Mario Rossi",
    "bio": "Host con esperienza",
    "roleBadge": null,
    "inPlatformSince": "<timestamp>",
    "photoUrl": "https://...",
    "ownerId": "user_abc"
  },
  "status": "pending_review",
  "isFeatured": false,
  "aggregates": {
    "minRoomPrice": 450,
    "maxRoomPrice": 650,
    "totalRooms": 3,
    "totalRoomsAvailable": 1,
    "isAvailableNow": true,
    "availableFromMin": "<timestamp>"
  },
  "occupancySummary": {
    "totalRooms": 3,
    "roomsFree": 1,
    "roomsOccupied": 1,
    "roomsPartiallyOccupied": 0,
    "roomsAvailableWithOccupants": 1,
    "roomsUnknown": 0,
    "currentOccupantsCount": 2,
    "updatedAt": "<timestamp>"
  },
  "occupantListingSnapshot": {
    "visibleOccupantsCount": 3,
    "avatarUrls": ["https://.../avatar-1.jpg", "https://.../avatar-2.jpg"],
    "items": [
      {
        "occupantId": "occ_1",
        "displayName": "Luca",
        "initials": "L",
        "avatarUrl": "https://.../avatar-1.jpg"
      },
      {
        "occupantId": "occ_2",
        "displayName": "Sara",
        "initials": "S",
        "avatarUrl": null
      },
      {
        "occupantId": "occ_3",
        "displayName": "Marco",
        "initials": "M",
        "avatarUrl": null
      }
    ],
    "topTags": ["Informatica", "Sportivo", "Non fumatore"],
    "vibeLabel": "Vibe: Informatica",
    "hasConsentBackedData": true,
    "updatedAt": "<timestamp>"
  },
  "metrics": {
    "totalViews": 0,
    "likesCount": 0,
    "totalReports": 0,
    "reviewsCount": 0,
    "ratingSum": 0,
    "ratingAvg": 0,
    "ratingCount": 0,
    "score": null,
    "updatedAt": "<timestamp>"
  },
  "createdAt": "<timestamp>",
  "updatedAt": "<timestamp>",
  "submittedAt": "<timestamp>",
  "publishedAt": null
}
```

## Rooms (subcollection apartments)

Le rooms sono obbligatorie per un annuncio pubblicabile.
File coinvolti: `src/ui/hooks/forms/usePubblicaAnnuncioForm.js`, `src/core/services/RoomValidator.js`, `src/infrastructure/firebase/repositories/FirestoreRoomRepository.js`

Esempio `apartments/{apartmentId}/rooms/{roomId}`:

```json
{
  "roomId": "room_1",
  "type": "single",
  "priceMonthly": 520,
  "areaMq": 18,
  "furnishing": "arredato",
  "availability": {
    "isAvailableNow": false,
    "availableFrom": "<timestamp>"
  },
  "occupancy": {
    "status": "available_with_occupants",
    "capacityTotal": 2,
    "spotsOccupied": 1,
    "spotsAvailable": 1
  },
  "occupantIds": ["occ_1"],
  "photoUrls": ["https://..."],
  "notes": "Bagno in comune",
  "createdAt": "<timestamp>",
  "updatedAt": "<timestamp>"
}
```

## Occupants (subcollection apartments)

Layer roommate discovery con separazione public/private e consenso esplicito.
File coinvolti: `functions/src/modules/apartments/apartmentsService.js`, `src/infrastructure/firebase/repositories/FirestoreOccupantRepository.js`, `src/ui/components/common/cards/annuncioCard/AnnuncioOccupantsModal.jsx`

Esempio `apartments/{apartmentId}/occupants/{occupantId}` (pubblico):

```json
{
  "occupantId": "occ_1",
  "apartmentId": "apt_123",
  "roomId": "room_1",
  "ownerId": "user_host",
  "city": "Roma",
  "provinceCode": "RM",
  "apartmentStatus": "published",
  "presenceStatus": "present",
  "publicProfile": {
    "displayName": "Luca",
    "avatarUrl": "https://...",
    "ageRange": "21_23",
    "university": "Sapienza",
    "faculty": "Informatica",
    "course": "Computer Science",
    "shortBio": "Studio e faccio sport.",
    "lifestyleTags": ["Informatica", "Sportivo", "Non fumatore"],
    "interests": ["Calcio", "Palestra"],
    "languages": ["Italiano", "English"],
    "livingRhythm": "early_bird",
    "cleanlinessLevel": "high",
    "socialLevel": "balanced",
    "weekendPresence": "mostly_home"
  },
  "searchableFacets": {
    "lifestyleTags": ["informatica", "sportivo", "non fumatore"],
    "interests": ["calcio", "palestra"],
    "languages": ["italiano", "english"],
    "university": "sapienza",
    "faculty": "informatica",
    "course": "computer science",
    "livingRhythm": "early_bird",
    "cleanlinessLevel": "high",
    "socialLevel": "balanced",
    "weekendPresence": "mostly_home"
  },
  "consent": {
    "status": "granted",
    "grantedAt": "<timestamp>",
    "revokedAt": null,
    "policyVersion": "2026-03-occupants-v1"
  },
  "visibility": {
    "isPublic": true,
    "reason": null
  },
  "moderation": {
    "status": "visible",
    "note": null,
    "flaggedAt": null
  },
  "privateRef": "apartments/apt_123/occupantsPrivate/occ_1",
  "createdAt": "<timestamp>",
  "updatedAt": "<timestamp>"
}
```

Esempio `apartments/{apartmentId}/occupantsPrivate/{occupantId}` (privato):

```json
{
  "occupantId": "occ_1",
  "roomId": "room_1",
  "privateIdentity": {
    "firstName": "Luca",
    "lastName": "Rossi",
    "email": "luca@example.com",
    "phone": "+39..."
  },
  "consent": {
    "status": "granted",
    "scopes": {
      "displayName": true,
      "avatarUrl": true,
      "ageRange": true,
      "university": true,
      "faculty": true
    },
    "grantedAt": "<timestamp>",
    "revokedAt": null,
    "policyVersion": "2026-03-occupants-v1",
    "declaration": "Consenso raccolto in forma esplicita...",
    "evidenceNote": "Conferma scritta in chat",
    "obtainedByHostId": "user_host",
    "obtainedAt": "<timestamp>"
  },
  "createdAt": "<timestamp>",
  "updatedAt": "<timestamp>"
}
```

## Analytics (subcollection apartments)

Dati aggregati e giornalieri per analytics host.
File coinvolti: `src/infrastructure/firebase/analytics/ApartmentAnalyticsService.js`, `src/core/ports/AnalyticsRepository.js`, `firestore.rules`

Esempio `apartments/{apartmentId}/analytics/summary`:

```json
{
  "createdAt": "<timestamp>",
  "updatedAt": "<timestamp>",
  "lastViewAt": "<timestamp>",
  "lastLikeAt": "<timestamp>",
  "lastReviewAt": "<timestamp>",
  "lastEventAt": "<timestamp>",
  "dailyViews": {}
}
```

Esempio `apartments/{apartmentId}/analytics/summary/daily/{dateKey}`:

```json
{
  "date": "2025-01-31",
  "views": 12,
  "likesDelta": 2,
  "reviewsAdded": 1,
  "ratingSumDelta": 4,
  "createdAt": "<timestamp>",
  "updatedAt": "<timestamp>",
  "lastEventAt": "<timestamp>"
}
```

## Reviews (subcollection apartments)

Recensioni e risposte legate a un annuncio.
File coinvolti: `src/infrastructure/firebase/adapters/reviews.js`, `src/ui/hooks/fetches/useFetchRecensioni.js`, `firestore.rules`

Esempio `apartments/{apartmentId}/reviews/{reviewId}`:

```json
{
  "authorId": "user_abc",
  "authorName": "Studente",
  "authorPhotoUrl": "https://...",
  "rating": 4,
  "text": "...",
  "createdAt": "<timestamp>",
  "helpfulCount": 0,
  "likedBy": [],
  "replyCount": 0,
  "lastReplyAt": null
}
```

Esempio `apartments/{apartmentId}/reviews/{reviewId}/replies/{replyId}`:

```json
{
  "authorId": "user_host",
  "authorName": "Host",
  "authorPhotoUrl": "https://...",
  "text": "...",
  "isOwner": true,
  "createdAt": "<timestamp>"
}
```

## Chat (conversazioni e messaggi)

Conversazioni tra utente e host, piu' canale separato per messaggi piattaforma.
File coinvolti: `src/infrastructure/firebase/adapters/chat.js`, `src/ui/hooks/chat/useChat.js`, `src/infrastructure/firebase/adapters/platformMessages.js`, `src/ui/hooks/chat/usePlatformMessages.js`

Esempio `conversations/{conversationId}`:

```json
{
  "participants": ["user_abc", "user_host"],
  "userId": "user_abc",
  "hostId": "user_host",
  "apartmentId": "apt_123",
  "lastMessage": "Ciao",
  "lastMessageTime": "<timestamp>",
  "lastMessageSender": "user_abc",
  "unreadCount": { "user_host": 1 },
  "createdAt": "<timestamp>",
  "updatedAt": "<timestamp>"
}
```

Esempio `conversations/{conversationId}/messages/{messageId}`:

```json
{
  "senderId": "user_abc",
  "content": "Messaggio",
  "timestamp": "<timestamp>",
  "isRead": false,
  "readAt": "<timestamp>",
  "type": "text",
  "metadata": {}
}
```

Esempio `platformConversations/{conversationId}`:

```json
{
  "userId": "user_abc",
  "createdAt": "<timestamp>"
}
```

Esempio `platformConversations/{conversationId}/messages/{messageId}`:

```json
{
  "senderId": "platform_unistays",
  "content": "Messaggio piattaforma",
  "timestamp": "<timestamp>",
  "isRead": false,
  "type": "text",
  "metadata": {},
  "platformMessageType": "success",
  "apartmentId": "apt_123"
}
```

## Reports (segnalazioni)

Segnalazioni utenti verso annunci o utenti, con metadati di moderazione backend-first.
File coinvolti: `functions/src/modules/reports/registerReportRoutes.js`, `src/infrastructure/firebase/repositories/FirestoreReportRepository.js`, `src/ui/hooks/fetches/useFetchSegnalazioni.js`, `src/ui/components/sections/adminSection/AdminSegnalazioniSection.jsx`, `firestore.rules`

Campi chiave:
- `status`: `open | reviewing | resolved | rejected`
- `priority`: `low | medium | high`
- `severity`: `low | medium | high | critical`
- `moderation`: ultimo intervento admin (`action`, `handledBy`, `handledAt`, `note`)
- `resolution`: esito (`code`, `note`, `resolvedAt`)
- `usersPrivate` reporter anti-abuse: `reportsCreatedCount`, `lastReportCreatedAt`, `reportRateWindowStartedAt`, `reportRateWindowCount`

Esempio `reports/{reportId}`:

```json
{
  "target": {
    "type": "apartment",
    "id": "apt_123",
    "apartmentId": "apt_123",
    "ownerId": "host_001"
  },
  "reporterId": "user_abc",
  "reporterSnapshot": {
    "displayName": "Utente",
    "photoUrl": "https://..."
  },
  "reason": "scam",
  "message": "...",
  "status": "open",
  "priority": "medium",
  "severity": "high",
  "moderation": {
    "action": "created",
    "handledBy": null,
    "handledAt": null,
    "note": null
  },
  "resolution": {
    "code": null,
    "note": null,
    "resolvedAt": null
  },
  "createdAt": "<timestamp>",
  "updatedAt": "<timestamp>"
}
```

## Citta

Catalogo citta universitarie con coordinate e conteggi.
File coinvolti: `src/infrastructure/firebase/repositories/FirestoreCityRepository.js`, `src/ui/hooks/fetches/useCities.js`, `src/ui/components/sections/adminSection/AdminCitiesSection.jsx`, `firestore.rules`

Esempio `cities/{cityId}`:

```json
{
  "city": "Roma",
  "provinceCode": "RM",
  "university": "Sapienza",
  "slug": "roma-rm",
  "imgUrl": "/img/cities/roma.webp",
  "coords": { "lat": 41.9028, "lng": 12.4964 },
  "active": true,
  "stats": { "listingsCount": 120 },
  "createdAt": "<timestamp>",
  "updatedAt": "<timestamp>"
}
```
