# Feature: Apartments (lista e ricerca)

## Approfondimento architetturale
Per analisi dettagliata su architettura ricerca, motivazioni, tradeoff, costi e strategie di estensione:
- `docs/features/apartments-search-architecture.md`

## Scopo e route
Pagina di listing con ricerca per citta, filtri e mappa sincronizzata. Route principale `/alloggi/:city`.
File coinvolti: `src/ui/pages/Apartments.jsx`, `src/app/routes/index.js`

## Query, paginazione e stato
La lista usa query Firestore con paginazione incrementale e cache in Redux. `useFetchAppartamenti` gestisce reset quando cambiano i filtri e carica pagine tramite repository dedicato.
File coinvolti: `src/ui/hooks/fetches/useFetchAppartamenti.js`, `src/infrastructure/firebase/repositories/FirestoreApartmentRepository.js`, `src/app/store/slices/appartamentiSlice.jsx`, `src/ui/pages/Apartments.jsx`

## Filtri e ordinamento
I filtri sono organizzati in sezioni UX friendly (Budget, Distanza, Stanze e spazi, Disponibilita, Servizi). La distanza usa le coordinate degli alloggi rispetto all'universita (formula Haversine) e viene calcolata lato client; anche i range numerici (prezzo, camere, bagni, superficie) vengono applicati lato client.
File coinvolti: `src/ui/components/sections/apartmentsSection/filters/components/Filters.jsx`, `src/ui/components/common/search/SearchTray/index.jsx`, `src/ui/hooks/apartments/useApartmentsPage.js`

L'ordinamento principale usa `metrics.score` in ordine decrescente. Per formula, pesi e regole di aggiornamento: `docs/features/apartment-score.md`.

## Architettura filtri
La logica filtri e' centralizzata in `application/filters` per evitare coupling UI. La UI invoca un use case che costruisce vincoli Firestore base (city, status published, availability equality opzionale), mentre i filtri avanzati vengono applicati lato client in modo progressivo durante il fetch.
File coinvolti: `src/application/filters/apartmentFilters.js`, `src/application/useCases/createApartmentFilters.js`, `src/ui/hooks/apartments/useApartmentsFilters.js`

## Mappa e sincronizzazione lista
La mappa mostra marker con prezzo e highlight su hover della card. Il listato passa `hoveredApartmentId` alla mappa per sincronizzare UI. Marker e info card sono gestiti in `GoogleMapComponent`.
File coinvolti: `src/ui/components/sections/apartmentsSection/ApartmentsListSection.jsx`, `src/ui/components/sections/apartmentsSection/ApartmentsMapSection.jsx`, `src/ui/components/common/mapComponents/GoogleMapComponent.jsx`, `src/ui/components/common/mapComponents/ApartmentMarker.jsx`
