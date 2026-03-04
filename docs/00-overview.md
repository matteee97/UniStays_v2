# UniStays - Overview

## Scopo e valore

UniStays e' una SPA per la ricerca e la gestione di alloggi universitari: studenti possono cercare annunci con mappa e filtri, gli host pubblicano e gestiscono annunci con dashboard e analytics, gli admin verificano contenuti e segnalazioni. Include chat contestualizzata per annuncio e flussi di prenotazione guidati.
File coinvolti: `README.md`, `src/ui/pages/App.jsx`, `src/ui/pages/Apartments.jsx`, `src/ui/pages/Apartment.jsx`, `src/ui/pages/ChatPage.jsx`, `src/ui/pages/I_TuoiAnnunci.jsx`, `src/ui/pages/AdminPanel.jsx`, `src/ui/pages/PubblicaAnnuncio.jsx`

## Mappa repository

- `src/`: app bootstrap, core, application, infrastructure, ui, shared.
- `functions/`: Cloud Functions (bridge Clerk -> Firebase Auth).
- `public/`: asset statici e redirect SPA.
- `docs/`: documentazione di progetto.
- `firebase.json` e `firestore.rules`: config Firebase e regole Firestore.
  File coinvolti: `src`, `functions`, `public`, `docs`, `firebase.json`, `firestore.rules`

## Stack principale

- Frontend: React + Vite, routing via React Router, stato con Redux.
- Auth: Clerk, con bridge su Firebase Auth per le rules.
- Dati: Firestore e Storage (immagini).
- Mappe: Google Maps JS API.
- UI: Tailwind CSS.
  File coinvolti: `package.json`, `src/main.jsx`, `src/app/router.jsx`, `src/infrastructure/firebase/index.js`, `functions/index.js`, `src/ui/components/common/mapComponents/GoogleMapComponent.jsx`, `tailwind.config.js`, `src/app/store/store.jsx`

## Entry points e routing

L'app e' bootstrap in `src/main.jsx` con provider Clerk, Router, Redux e Theme. Le rotte sono centralizzate in `src/app/router.jsx` e `src/app/routes/index.js`, con layout separati per sezioni pubbliche e auth.
File coinvolti: `src/main.jsx`, `src/app/router.jsx`, `src/app/routes/index.js`, `src/ui/components/layouts/MainLayout.jsx`, `src/ui/components/layouts/AuthLayout.jsx`
