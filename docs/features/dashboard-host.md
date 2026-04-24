# Feature: Dashboard host (annunci + analytics)

## Accesso e route

La dashboard host e' protetta da Clerk e vive sotto `/dashboard/annunci` con sotto-sezione analytics (`/dashboard/annunci/dettagli`).
File coinvolti: `src/app/router.jsx`, `src/app/routes/index.js`, `src/ui/components/common/clerk/ProtectedRoute.jsx`, `src/ui/pages/I_TuoiAnnunci.jsx`

## Gestione annunci (lista, edit, delete)

La lista mostra gli annunci dell'host con filtri e ordinamenti, supporta edit inline della descrizione e una modal per aggiornare le stanze (foto, disponibilita, arredamento, note, prezzo, tipologia) oltre al delete con conferma.
File coinvolti: `src/ui/pages/I_TuoiAnnunci.jsx`, `src/ui/components/sections/I_TuoiAnnunciSection/AnnunciGrid.jsx`, `src/ui/components/common/cards/annuncioCard/AnnuncioCard.jsx`, `src/ui/components/common/cards/annuncioCard/AnnuncioUpdate.jsx`, `src/ui/components/common/cards/annuncioCard/AnnuncioRoomsModal.jsx`, `src/ui/components/common/cards/annuncioCard/AnnuncioActions.jsx`, `src/infrastructure/firebase/adapters/annunci.js`

### Gestione coinquilini presenti (occupants)

L'host puo gestire i coinquilini gia presenti con una modal dedicata:
- associazione coinquilino a stanza;
- profilo pubblico (snapshot lifestyle) con selezione tag a pulsanti;
- routine conviviale con pill selezionabili (ritmo, socialita, pulizia, weekend);
- consenso esplicito con conferma checkbox, senza campi tecnici di moderazione;
- controllo visibilita lato host.

Per sicurezza piattaforma:
- i campi moderazione non sono esposti nel form host;
- eventuali campi moderazione nel payload host vengono ignorati lato backend;
- la moderazione resta responsabilita di admin/platform.

Il salvataggio passa da backend route dedicata che aggiorna:
- `apartments/{apartmentId}/occupants`
- `apartments/{apartmentId}/occupantsPrivate`
- `apartments/{apartmentId}/rooms/*` (`occupancy`, `occupantIds`)
- snapshot denormalizzati `occupancySummary` e `occupantListingSnapshot`.

File coinvolti: `src/ui/components/common/cards/annuncioCard/AnnuncioOccupantsModal.jsx`, `src/infrastructure/firebase/repositories/FirestoreApartmentRepository.js`, `functions/src/modules/apartments/registerApartmentRoutes.js`, `functions/src/modules/apartments/apartmentsService.js`

### Coerenza disponibilita e occupazione stanza (2026-03-10)

La validazione stanze e' stata irrigidita con regole dominio condivise tra UI e validator:
- `occupied` non e' ammesso quando `availability.isAvailableNow == true`;
- `available_with_occupants` non e' ammesso quando `availability.isAvailableNow == false`;
- `free` richiede `spotsOccupied == 0`;
- `occupied` richiede `spotsOccupied == capacityTotal`;
- `partially_occupied` / `available_with_occupants` richiedono `0 < spotsOccupied < capacityTotal`.

In UI il select stato occupazione mostra solo opzioni coerenti con `Disponibile subito`, e la modifica stato sincronizza automaticamente `spotsOccupied` ai casi base (`free`/`occupied`) per ridurre errori lato host.

File coinvolti: `src/core/services/RoomOccupancyDomain.js`, `src/core/services/RoomValidator.js`, `src/ui/components/common/rooms/RoomsEditor.jsx`, `src/ui/hooks/forms/roomsValidationRules.js`

## PDF generator

Ogni annuncio consente la generazione di un PDF A4 con QR code per stampa.
File coinvolti: `src/ui/components/common/PdfGenerator/PDFGenerator.jsx`, `src/ui/components/common/PdfGenerator/PdfDoc.jsx`, `src/ui/helpers/generatePdf.js`

## Analytics host

La sezione "Dettagli Tecnici" aggrega metriche e trend per annuncio, con range temporali e grafici; usa subcollection `analytics`.
File coinvolti: `src/ui/pages/DettagliTecnici.jsx`, `src/ui/hooks/analytics/useAnalyticsData.js`, `src/ui/hooks/analytics/useApartmentAnalytics.js`, `src/infrastructure/firebase/analytics/ApartmentAnalyticsService.js`, `src/core/ports/AnalyticsRepository.js`, `src/ui/components/sections/dettagliTecniciSection`

La metrica `score` usata per ranking e riepilogo e' documentata in `docs/features/apartment-score.md`.
