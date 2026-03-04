# UniStays – Clerk → Firebase Auth Bridge (Cloud Functions)

Questa cartella contiene le **Cloud Functions** che fanno da “ponte” tra
**Clerk** (login principale) e **Firebase Auth** (necessario per avere
`request.auth.uid` e `request.auth.token.*` nelle **Firestore Rules**).

Obiettivo: **continuare a usare Clerk**, ma far risultare l’utente
**autenticato anche su Firebase Auth** con lo **stesso UID**
(uguale a `user.id` di Clerk).

---

## TL;DR (che fa sta roba)
1. **Client**: l’utente fa login con Clerk.
2. **Client**: il bridge hook prende un **JWT di Clerk** (`getToken()`).
3. **Client → Function**: manda quel JWT alla Cloud Function `POST /firebase/token`.
4. **Function**: verifica il JWT con Clerk, prende `clerkUserId = payload.sub`, calcola eventuale `role`.
5. **Function**: crea un **Firebase Custom Token** con `uid = clerkUserId` e claim `{ role: "admin" }` se serve.
6. **Client**: usa `signInWithCustomToken()` per loggarsi su Firebase Auth.
7. Ora in Firestore Rules hai:
   - `request.auth.uid === clerkUserId`
   - `request.auth.token.role === "admin"` (se admin)

---

## Perché serve
Firestore Rules **non possono fidarsi** di Clerk direttamente: ragionano solo su
`request.auth`. Quindi per regole tipo:

```js
function isOwner(userId) {
  return request.auth != null && request.auth.uid == userId;
}

function isAdmin() {
  return request.auth != null && request.auth.token.role == "admin";
}
```

Serve che l’utente sia autenticato anche in Firebase Auth.

---

## Struttura
- `index.js`: API Express esposta come Cloud Function Gen2

Endpoint principale:
- `POST /firebase/token` → ritorna `{ token: <firebaseCustomToken> }`

---

## Endpoint: POST /firebase/token
### Input
Header obbligatorio:

`Authorization: Bearer <CLERK_JWT>`

### Output (200)
```json
{ "token": "<FIREBASE_CUSTOM_TOKEN>" }
```

### Errori comuni
- **401 Missing Clerk token** → header Authorization mancante
- **401 Invalid Clerk token** → token Clerk non valido / scaduto / template sbagliato
- **500 Missing CLERK_SECRET_KEY** → secret non configurato nelle Functions
- **500 Permission 'iam.serviceAccounts.signBlob' denied** → permessi service account

---

## Come funziona la Function (logica)
1) **Verifica JWT Clerk**
- `verifyToken(jwt, { secretKey })` valida firma e decodifica payload
- usa `payload.sub` come Clerk User Id

2) **Role / claims**
- recupera l’utente da Clerk (`clerkClient.users.getUser(clerkUserId)`)
- decide `isAdmin` dai metadata (consigliato: `privateMetadata`)
- se admin, crea token con claim `{ role: "admin" }`

3) **Genera Firebase Custom Token**
```js
admin.auth().createCustomToken(
  clerkUserId,
  isAdmin ? { role: "admin" } : undefined
)
```

---

## Secrets & CORS (Gen2)
Secrets richiesti:
- `CLERK_SECRET_KEY`
- `ALLOWED_ORIGINS` (comma-separated)

Esempio:
```
https://uni-stays.netlify.app,http://localhost:5173
```

La function abilita CORS solo per quelle origini.

Nota: Gen2 gira su Cloud Run → serve invoker policy (`run.invoker`)
per far passare le preflight `OPTIONS`.

---

## Client-side: Bridge hook
Nel frontend c’è `useFirebaseBridgeAuth()` che:
- aspetta che Clerk sia loaded
- ottiene JWT di Clerk (`getToken()`)
- chiama `/firebase/token`
- usa `signInWithCustomToken()` su Firebase Auth
- fa `signOut(auth)` quando Clerk esce

---

## Variabili env (client)
- `VITE_FIREBASE_TOKEN_ENDPOINT`
- `VITE_CLERK_JWT_TEMPLATE` (opzionale)

---

## Firestore Rules: come sfruttarlo
```js
request.auth.uid == userId
request.auth.token.role == "admin"
```

---

## Deploy notes
- Functions Gen2 → invoker policy su Cloud Run
- Secrets Gen2 → `defineSecret()` + `secrets: [...]`

Per dettagli completi vedi `docs/firebase-auth-bridge-setup.md`.
