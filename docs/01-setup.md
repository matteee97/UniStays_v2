# Setup e deployment

## Prerequisiti

- Node.js: consigliata Node 20.
- Tooling: npm (scripts in `package.json`).
  File coinvolti: `package.json`, `functions/package.json`

## Installazione e comandi locali

Comandi principali (root):

- `npm install`
- `npm run dev` (sviluppo Vite)
- `npm run build` / `npm run preview`
- `npm run lint`
- `npm test`
  File coinvolti: `package.json`

## Variabili ambiente

### Client (Vite, `.env`)

Variabili lette dal frontend. Non committare segreti.

- `VITE_CLERK_PUBLISHABLE_KEY` - obbligatoria: si. Chiave publishable per inizializzare Clerk (`ClerkProvider`).
- `VITE_FIREBASE_API_KEY` - obbligatoria: si. Config base Firebase per init app.
- `VITE_FIREBASE_AUTH_DOMAIN` - obbligatoria: si. Dominio auth Firebase.
- `VITE_FIREBASE_PROJECT_ID` - obbligatoria: si. Project ID Firebase.
- `VITE_FIREBASE_STORAGE_BUCKET` - obbligatoria: si. Bucket Storage per upload immagini.
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - obbligatoria: si. Sender ID Firebase (config).
- `VITE_FIREBASE_APP_ID` - obbligatoria: si. App ID Firebase.
- `VITE_FIREBASE_MEASUREMENT_ID` - obbligatoria: no (solo Firebase Analytics). TODO: confermare se usata in modo attivo nel progetto.
- `VITE_GOOGLE_MAPS_API_KEY` - obbligatoria: si per mappe e geocoding. Se assente, mappe e coordinate non funzionano.
- `VITE_EMAILJS_PUBLIC_KEY` - obbligatoria: condizionale. Serve per invio email dal form contatti non-segnalazioni.
- `VITE_FIREBASE_TOKEN_ENDPOINT` - obbligatoria: condizionale. Default `/api/firebase/token`; serve puntare alla Cloud Function se non c'e' proxy.
- `VITE_CLERK_JWT_TEMPLATE` - obbligatoria: no. Template JWT Clerk opzionale per il bridge.
- `VITE_BASE_URL` - obbligatoria: no. Base URL app, default `http://localhost:5173`.
- `VITE_API_URL` - obbligatoria: no. API base URL, default `https://api.unistays.com`.
- `VITE_GA_TRACKING_ID` - obbligatoria: condizionale. Necessaria per Google Analytics (GA4); se assente, GA non registra eventi.

File coinvolti: `.env`, `src/main.jsx`, `src/infrastructure/firebase/index.js`, `src/app/config/index.js`, `src/ui/hooks/auth/useFirebaseBridgeAuth.js`, `src/ui/helpers/getCoordinates.js`, `src/ui/components/common/mapComponents/GoogleMapComponent.jsx`, `src/ui/hooks/forms/useContactForm.js`, `src/ui/helpers/analytics.js`

### Server (Cloud Functions)

Secrets usati dal bridge Clerk -> Firebase Auth.

- `CLERK_SECRET_KEY` - obbligatoria: si. Usata per validare JWT Clerk.
- `ALLOWED_ORIGINS` - obbligatoria: no (ma raccomandata). Lista CORS separata da virgola; se vuota, la function accetta tutte le origini.

File coinvolti: `functions/index.js`, `functions/README.md`, `docs/firebase-auth-bridge-setup.md`

### Runtime (auto-impostate)

Variabili/flag fornite da tooling o build, non vanno settate in `.env`.

- `NODE_ENV` - obbligatoria: no. Usata per `debugMode` in config.
- `import.meta.env.DEV` - obbligatoria: no. Flag Vite per debug warnings analytics.

File coinvolti: `src/app/config/index.js`, `src/ui/hooks/analytics/useApartmentAnalytics.js`

### Variabili citate in docs ma non trovate nel codice

- `VITE_FIREBASE_PUBLISHABLE_KEY` - TODO: e' citata in `docs/firebase-auth-bridge-setup.md` ma non e' referenziata dal codice client.

File coinvolti: `docs/firebase-auth-bridge-setup.md`

## Deploy frontend

- `npm run deploy` usa Netlify CLI e pubblica la cartella `dist`.
- Redirect SPA per Netlify in `public/_redirects`.

File coinvolti: `package.json`, `public/_redirects`

## Deploy Cloud Functions

Passi documentati:

1. `cd functions` + `npm install`
2. `firebase functions:secrets:set CLERK_SECRET_KEY`
3. `firebase functions:secrets:set ALLOWED_ORIGINS`
4. `firebase deploy --only functions`
   Ricordarsi di aggiornare `VITE_FIREBASE_TOKEN_ENDPOINT` con l'endpoint deployato.
   File coinvolti: `functions/README.md`, `docs/firebase-auth-bridge-setup.md`, `firebase.json`, `functions/index.js`
