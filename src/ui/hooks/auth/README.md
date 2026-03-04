# Firebase Bridge Auth (Client)

Questo hook mantiene **Clerk** e **Firebase Auth** sincronizzati, così
`request.auth.uid` nelle Firestore Rules corrisponde a `user.id` di Clerk.

## Uso
```jsx
import { useEnsureUserDoc, useFirebaseBridgeAuth } from "../../hooks";

export default function UserInit() {
  const { isReady } = useFirebaseBridgeAuth();
  useEnsureUserDoc({ enabled: isReady });
  return null;
}
```

## Cosa fa
1. Attende che Clerk sia `isLoaded`.
2. Se l’utente è loggato su Clerk:
   - ottiene un JWT (`getToken()`).
   - chiama `POST /firebase/token`.
   - usa `signInWithCustomToken()` su Firebase.
3. Se l’utente fa logout da Clerk:
   - fa `signOut()` su Firebase.

## Env client (Vite)
- `VITE_FIREBASE_TOKEN_ENDPOINT`
- `VITE_CLERK_JWT_TEMPLATE` (opzionale)

## Note
- L’endpoint è protetto server-side (Clerk token obbligatorio).
- Nessuna logica di sicurezza nel client.
