# Feature: Dashboard host (annunci + analytics)

## Accesso e route

La dashboard host e' protetta da Clerk e vive sotto `/dashboard/annunci` con sotto-sezione analytics (`/dashboard/annunci/dettagli`).
File coinvolti: `src/app/router.jsx`, `src/app/routes/index.js`, `src/ui/components/common/clerk/ProtectedRoute.jsx`, `src/ui/pages/I_TuoiAnnunci.jsx`

## Gestione annunci (lista, edit, delete)

La lista mostra gli annunci dell'host con filtri e ordinamenti, supporta edit inline della descrizione e una modal per aggiornare le stanze (foto, disponibilita, arredamento, note, prezzo, tipologia) oltre al delete con conferma.
File coinvolti: `src/ui/pages/I_TuoiAnnunci.jsx`, `src/ui/components/sections/I_TuoiAnnunciSection/AnnunciGrid.jsx`, `src/ui/components/common/cards/annuncioCard/AnnuncioCard.jsx`, `src/ui/components/common/cards/annuncioCard/AnnuncioUpdate.jsx`, `src/ui/components/common/cards/annuncioCard/AnnuncioRoomsModal.jsx`, `src/ui/components/common/cards/annuncioCard/AnnuncioActions.jsx`, `src/infrastructure/firebase/adapters/annunci.js`

## PDF generator

Ogni annuncio consente la generazione di un PDF A4 con QR code per stampa.
File coinvolti: `src/ui/components/common/PdfGenerator/PDFGenerator.jsx`, `src/ui/components/common/PdfGenerator/PdfDoc.jsx`, `src/ui/helpers/generatePdf.js`

## Analytics host

La sezione "Dettagli Tecnici" aggrega metriche e trend per annuncio, con range temporali e grafici; usa subcollection `analytics`.
File coinvolti: `src/ui/pages/DettagliTecnici.jsx`, `src/ui/hooks/analytics/useAnalyticsData.js`, `src/ui/hooks/analytics/useApartmentAnalytics.js`, `src/infrastructure/firebase/analytics/ApartmentAnalyticsService.js`, `src/core/ports/AnalyticsRepository.js`, `src/ui/components/sections/dettagliTecniciSection`

La metrica `score` usata per ranking e riepilogo e' documentata in `docs/features/apartment-score.md`.
