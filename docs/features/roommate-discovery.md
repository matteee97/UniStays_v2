# Feature: Roommate Discovery (Occupants)

## Obiettivo
Esporre in modo sicuro e utile chi vive gia nell'alloggio, con:
- UX ad alto impatto su card/listing e dettaglio annuncio;
- modello privacy-by-design con consenso esplicito;
- denormalizzazione per performance.

## Domain model adottato
- `rooms` descrive la disponibilita fisica (capienza, posti occupati/liberi).
- `occupants` descrive il layer umano pubblico (profilo coinquilino pubblicabile).
- `occupantsPrivate` separa i dati privati/consenso.
- `occupancySummary` e `occupantListingSnapshot` sono read model leggeri su `apartments/{apartmentId}`.

## Collections
- `apartments/{apartmentId}`
- `apartments/{apartmentId}/rooms/{roomId}`
- `apartments/{apartmentId}/occupants/{occupantId}`
- `apartments/{apartmentId}/occupantsPrivate/{occupantId}`

## Write path
Tutte le write passano da backend (admin SDK):
- route: `PATCH /v1/apartments/:apartmentId/occupants`
- service: `functions/src/modules/apartments/apartmentsService.js`

Il service aggiorna in un'unica transazione batch:
1. public/private occupant docs;
2. room occupancy + occupantIds;
3. snapshot denormalizzati in `apartments`.

### Contratto endpoint (strict)
- Nessuna write alternativa lato client: il salvataggio coinquilini usa **solo** `PATCH /v1/apartments/:apartmentId/occupants`.
- Se l'endpoint non esiste nel deploy attivo, il client espone errore esplicito con URL chiamato.
- In ambiente corretto, chiamando senza token l'endpoint deve rispondere `401` (`Missing Firebase token`), non `404`.

### Config backend base URL
- `VITE_BACKEND_API_BASE_URL` viene normalizzato per puntare alla root API (`.../api`).
- Se non impostato, viene derivato da `VITE_FIREBASE_TOKEN_ENDPOINT` (`.../api/firebase/token` -> `.../api`).
- URL cloud functions del tipo `...cloudfunctions.net/<functionName>` vengono normalizzati a `.../<functionName>/api`.

## Read path
- Dettaglio annuncio: carica `occupants` pubblici con `FirestoreOccupantRepository`.
- Listing: usa snapshot denormalizzato sul documento annuncio (`occupantListingSnapshot`).

## Stabilita integrazione host (2026-03-10)
- `AnnuncioOccupantsModal` usa fetch indipendenti (`Promise.allSettled`) per evitare regressioni: un errore su `occupants` non deve bloccare il caricamento `rooms`.
- Se il fetch `rooms` non restituisce dati, la modale usa fallback `roomCandidates` (snapshot gia disponibile nell'annuncio, se presente).
- Se non esistono stanze selezionabili, la UI mostra messaggio esplicito e blocca il salvataggio coinquilini.
- `FirestoreRoomRepository` normalizza sempre `id` e `roomId` (fallback al document id) per prevenire select vuote dovute a shape legacy/incompleta.
- Le regole di coerenza `availability`/`occupancy` delle stanze sono centralizzate in `RoomOccupancyDomain` e riusate dai validator host per evitare combinazioni incoerenti (es. stanza `free` con posti occupati).
- Evitato loop di ricarica modale host: il caricamento iniziale coinquilini non dipende piu da un array `roomCandidates` ricreato a ogni render (gestione via `ref` + dipendenze effetto ridotte a `annuncioId/isOpen`).
- Form host riallineato al design system: input/select/checkbox usano i componenti condivisi (`FormInput`, `FormSelect`, `Checkbox`) e struttura visuale coerente con le altre modali annuncio.
- UX host semplificata per sezione: identita pubblica, studio/routine, vibe/interessi, consenso/privacy.
- Selezione caratteristiche conviventi tramite tag button con icone, riducendo input manuali liberi.
- Routine di convivenza gestita con scelta a pulsanti (ritmo, socialita, pulizia, weekend), evitando testo libero non necessario.
- Consenso host semplificato: stato consenso + checkbox di conferma esplicita; rimossi textarea tecnici non necessari al flusso host.
- Rimossi dal form host i campi tecnici non necessari (`moderation`, dati privati anagrafici): il form raccoglie solo dati utili a matching e consenso.

## Privacy e consenso
- un occupant e' pubblico solo se:
  - `consent.status == "granted"`
  - `visibility.isPublic == true`
  - `moderation.status == "visible"`
- `occupantsPrivate` resta leggibile solo da owner/admin.
- in assenza consenso, il profilo resta non pubblico ma il dato operativo puo restare lato host.
- hardening backend: i campi `moderation` inviati da host non vengono applicati; solo admin puo gestirli.

## UI coinvolta
- Host dashboard:
  - `AnnuncioOccupantsModal` per CRUD coinquilini + consenso.
  - `AnnuncioRoomsModal` esteso con stato occupazione stanza.
- Studente:
  - `OccupantsSection` nel dettaglio annuncio.
  - snapshot coinquilini in `ApartmentCard`.

## Stati principali
- Room occupancy: `free | occupied | partially_occupied | available_with_occupants | unknown`
- Occupant consent: `pending | granted | revoked`
- Occupant moderation: `visible | pending_review | hidden`

## Retrocompatibilita
- Feature additiva: i documenti esistenti senza `occupancy/occupants` continuano a funzionare.
- fallback UI:
  - nessun occupant => sezione vuota con messaggio esplicito;
  - occupant non pubblicabili => messaggio privacy-safe.
