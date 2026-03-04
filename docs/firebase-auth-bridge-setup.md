# Firebase Auth Bridge (Clerk → Firebase)

## Obiettivo

- Clerk resta il sistema di login principale.
- Firebase Auth usa custom token server-side per fornire `request.auth.uid` nelle Firestore Rules.
- UID Firebase = `user.id` di Clerk.

## Env richieste

### Client (Vite)

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_FIREBASE_TOKEN_ENDPOINT` (es. `https://europe-west1-<PROJECT_ID>.cloudfunctions.net/api/firebase/token`)
- `VITE_CLERK_JWT_TEMPLATE` (opzionale, es. `firebase`)

### Server (Cloud Functions)

- `CLERK_SECRET_KEY`
- `ALLOWED_ORIGINS` (comma-separated, es. `https://www.UniStays.it,https://UniStays.netlify.app`)

## Clerk

1. Dashboard Clerk → API Keys → copia `CLERK_SECRET_KEY` per il backend.
2. (Opzionale) Se vuoi usare un template JWT specifico, crea un template e imposta `VITE_CLERK_JWT_TEMPLATE`.
3. Per admin, imposta `publicMetadata.role = "admin"` sullo user in Clerk.

## Deploy Cloud Functions

1. `cd functions`
2. `npm i`
3. `firebase functions:secrets:set CLERK_SECRET_KEY`
4. `firebase functions:secrets:set ALLOWED_ORIGINS`
5. `firebase deploy --only functions`

Endpoint risultante:
`https://europe-west1-appartamenti-universitari.cloudfunctions.net/api/firebase/token`

## Troubleshooting

- Errore `iam.serviceAccounts.signBlob`: assegna il ruolo `Service Account Token Creator` al service account usato dalla Cloud Function (di solito `appartamenti-universitari@appspot.gserviceaccount.com` o quello configurato nella function).

## Integrazione Client

Il bridge è già attivo in `src/ui/components/common/clerk/UserInit.jsx` tramite `useFirebaseBridgeAuth()`.

Se vuoi spostarlo nel root layout:

```
import useFirebaseBridgeAuth from "@/ui/hooks/auth/useFirebaseBridgeAuth";

export default function AppRoot() {
  useFirebaseBridgeAuth();
  return <App />;
}
```

## Firestore Rules

Esempio `isAdmin`:

```
function isAdmin() {
  return isAuthenticated() && request.auth.token.role == "admin";
}
```

## Test (Emulator)

1. Avvia emulator Firestore.
2. Usa `VITE_FIREBASE_TOKEN_ENDPOINT` puntando al tuo endpoint locale.
3. Verifica che `request.auth.uid` sia uguale a `user.id` di Clerk.
