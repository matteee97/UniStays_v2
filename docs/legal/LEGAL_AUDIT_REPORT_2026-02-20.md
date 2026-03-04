# Audit Legale e Privacy - UniStays

Data audit: `2026-02-20`
Ambiente analizzato: codice applicativo frontend (`src/`), backend serverless (`functions/`), rules Firestore (`firestore.rules`), documentazione (`docs/`).

## 1) Obiettivo e perimetro
Questo report fornisce:
- analisi del funzionamento del sito e delle interazioni con l'utente;
- mappatura dei dati trattati e dei soggetti coinvolti;
- punti critici legali/compliance con priorita;
- piano operativo per arrivare a una documentazione legale "production-grade" (Privacy Policy, Cookie Policy, Termini e Condizioni);
- backlog tecnico immediato per ridurre il rischio.

Assunzioni:
- Titolare del trattamento: UniStays (da formalizzare con dati societari completi).
- Normativa target: GDPR + ePrivacy/cookie rules UE/Italia.
- Questo documento e' operativo/tecnico, non sostituisce il parere legale professionale.

## 2) Architettura funzionale (sintesi)
- Frontend SPA React con routing client-side (`src/app/router.jsx`).
- Auth principale via Clerk, bridge verso Firebase Auth (`src/ui/hooks/auth/useFirebaseBridgeAuth.js`, `functions/index.js`).
- Dati su Firestore/Storage, con write principalmente via backend API (`functions/index.js`).
- Analytics:
  - GA4 client (`src/main.jsx`, `src/ui/helpers/analytics.js`);
  - analytics annuncio interni su Firestore (`/v1/analytics/events`).
- Contatti:
  - segnalazioni verso Firestore via backend (`/v1/reports`, con route legacy `/v1/reports/apartments/:apartmentId`);
  - richieste generiche via EmailJS (`src/ui/hooks/forms/useContactForm.js`).
- Mappe/geocoding via Google Maps e Geocoding API (`src/ui/components/common/mapComponents/GoogleMapComponent.jsx`, `src/ui/helpers/getCoordinates.js`).

## 3) Interazioni utente e trattamenti collegati

### 3.1 Utente anonimo
- Naviga annunci pubblicati, mappe, pagine statiche.
- Può essere tracciato da GA4 all'avvio app.
- Su pagina annuncio viene registrato evento view interno (session dedupe con `sessionStorage`).

Dati coinvolti:
- path/query URL, device/browser metadata (da provider analytics);
- interazioni UI non autenticata;
- city click history in `localStorage` (`clicked_cities`).

### 3.2 Utente registrato (studente/host)
- Login/registrazione con Clerk.
- Bridge auth con Firebase custom token.
- Creazione documenti utente pubblici/privati (`usersPublic`, `usersPrivate`).
- Preferiti, chat, recensioni, segnalazioni, notifiche piattaforma.

Dati coinvolti:
- identificativi account (`userId`), email, eventuale telefono;
- contenuti chat e metadati;
- recensioni e risposte (anche pubbliche);
- preferiti e cronologia interazioni funzionali.

### 3.3 Host
- Pubblica annuncio con dettagli immobile + immagini + stanze.
- Inserisce indirizzo completo, geocodificato lato client.
- Può inserire dati owner aggiuntivi (nome/cognome, bio, telefono se primo annuncio).

Dati coinvolti:
- dati anagrafici/profilo host;
- dati immobile e geolocalizzazione precisa;
- immagini caricate su Storage.

### 3.4 Admin
- Modera annunci e segnalazioni.
- Lookup utenti con unione dati pubblici/privati.
- Export snapshot JSON dal pannello admin.

Dati coinvolti:
- dati personali completi utenti (inclusi email/telefono dove presenti);
- contenuti segnalazioni e metadati moderazione.

## 4) Inventario dati trattati (operativo)

| Area | Dati principali | Origine | Finalita | Base giuridica suggerita | Conservazione (da formalizzare) |
|---|---|---|---|---|---|
| Auth/account | userId, email, nome, foto profilo, metadata ruolo | Clerk + utente | autenticazione, autorizzazione, sicurezza | contratto + legittimo interesse sicurezza | durata account + finestra post-chiusura |
| Profilo pubblico | displayName, foto, bio, stats host | utente/app | visualizzazione host e reputazione | contratto | fino a rimozione account/contenuto |
| Profilo privato | email, telefono, address opzionale, settings | utente/app | operativita piattaforma, supporto | contratto | minimo necessario + policy retention |
| Annunci | descrizione immobile, coordinate, foto, regole casa | host | pubblicazione e matching | contratto | fino a rimozione annuncio + backup window |
| Chat | contenuti messaggi, senderId, timestamp, metadata booking | utenti | comunicazione utente-host | contratto | retention definita (es. 24 mesi inattivita) |
| Recensioni | rating, testo, authorName/photo, likedBy | utenti | reputazione e qualita piattaforma | legittimo interesse/contratto | fino a rimozione o policy moderazione |
| Segnalazioni | motivo, messaggio, reporterId, snapshot reporter | utenti | anti-abuso e moderazione | legittimo interesse + obblighi legali eventuali | retention dedicata (es. 24 mesi) |
| Analytics interno | views/likes/reviews aggregati per annuncio | app | metriche host e ranking | legittimo interesse (non marketing) | aggregati con limite temporale |
| Analytics GA4 | pageview e dati analytics web | browser | misurazione traffico | consenso cookie (UE) | secondo configurazione GA e policy |
| Contatti EmailJS | nome, email, messaggio, reason | form contatti | supporto commerciale/operativo | consenso o pre-contrattuale (caso per caso) | retention ticketing definita |
| Geolocalizzazione browser | posizione utente (se concessa) | browser API | suggerimento citta vicine | consenso esplicito browser + informativa | non persistente o retention breve |

## 5) Fornitori terzi / trasferimenti
Soggetti che vanno formalizzati in Privacy/Cookie Policy e registro trattamenti:
- Clerk (autenticazione);
- Google Firebase (Auth, Firestore, Storage, Cloud Functions);
- Google Maps JavaScript API + Geocoding API;
- Google Analytics 4 (GA4);
- EmailJS (invio contatti);
- Iubenda (policy/CMP, se attivata in modalita completa).

Azioni richieste:
- verificare e archiviare DPA/termini da ciascun fornitore;
- mappare eventuali trasferimenti extra-SEE e SCC/garanzie;
- allineare l'elenco fornitori tra policy pubblica e documentazione interna.

## 6) Cookie e tecnologie similari (stato attuale)

### 6.1 Stato attuale riscontrato
- `GA4` inizializzato subito all'avvio app (`src/main.jsx` + `src/ui/helpers/analytics.js`).
- Script CMP/autoblocking Iubenda presenti ma commentati in `index.html`.
- Link policy Iubenda presenti nel footer (`src/ui/components/common/LegalLinks.jsx`), ma non sostituiscono il blocco preventivo script.
- Uso esteso di `localStorage`/`sessionStorage` per funzioni UX e deduplica eventi.

### 6.2 Categorie cookie/strumenti da adottare
- Necessari:
  - autenticazione/sessione (Clerk/Firebase), sicurezza, load balancing, anti-frode.
- Funzionali:
  - preferenze tema, suggerimenti citta, one-time hints UI.
- Analytics:
  - GA4 (solo dopo consenso esplicito in UE).
- Marketing/profilazione:
  - attualmente non evidenziati nel codice analizzato; mantenere disattivi finche non necessari.

### 6.3 Raccomandazione pratica
- Attivare CMP con blocco preventivo script non necessari.
- Caricare GA4 solo dopo consenso categoria analytics.
- Fornire gestione consenso granulare e revoca sempre accessibile.

## 7) Punti critici (priorita)

### P0 - Bloccanti pre-go-live legale
1. Consenso cookie analytics non implementato correttamente.
   - Evidenze: `src/main.jsx`, `src/ui/helpers/analytics.js`, `index.html`.
2. Payload chat "booking-preview" in query string URL.
   - Rischio: esposizione in history, logs, referrer.
   - Evidenze: `src/ui/pages/Apartment.jsx`, `src/ui/helpers/chatPayload.js`, `src/ui/pages/ChatPage.jsx`.
3. Form contatti generico senza checkbox/registro consenso privacy esplicito.
   - Evidenze: `src/ui/components/sections/ContactPageSection/ContactFormSection.jsx`, `src/ui/hooks/forms/useContactForm.js`.
4. Mancanza di procedure applicative DSAR (accesso/export/cancellazione) e retention enforce.
   - Evidenza: assenza endpoint/processi dedicati nel backend `functions/index.js`.

### P1 - Alta priorita
1. Caching persistente Firestore sul client (dati anche offline) senza disclosure specifica in policy.
   - Evidenza: `src/infrastructure/firebase/index.js`.
2. Recensioni pubbliche includono `authorId` e `likedBy` (ID utente potenzialmente esposto pubblicamente).
   - Evidenze: `functions/index.js` (payload review), `firestore.rules` (read pubblico reviews).
3. Pannello admin espone/concatena dati privati utente e export JSON locale.
   - Evidenze: `src/ui/components/sections/adminSection/AdminUserLookupSection.jsx`, `src/ui/components/sections/adminSection/AdminSegnalazioniSection.jsx`.
4. Hardening backend incompleto (rate limiting, header security middleware).
   - Evidenze: `functions/index.js` (assenza rate limit/helmet).
5. Rotte legali `/privacy` e `/termini` definite ma non servite dal router.
   - Evidenze: `src/app/routes/index.js`, `src/app/router.jsx`.

### P2 - Miglioramenti consigliati
1. Policy di retention per chat/reports/reviews/analytics da formalizzare e implementare.
2. Governance log/error handling con minimizzazione dati personali nei log.
3. Data classification interna e SOP incident response.

## 8) Step operativi per Privacy Policy (checklist)
1. Definire dati titolare (ragione sociale, sede, contatti privacy, eventuale DPO).
2. Elencare finalita reali per ciascun flusso (account, pubblicazione, chat, moderation, supporto, analytics).
3. Associare base giuridica per finalita (contratto, consenso, legittimo interesse, obbligo legale).
4. Mappare categorie dati e fonti (utente diretto, provider auth, browser APIs).
5. Elencare destinatari/responsabili esterni (Clerk, Firebase, Google, EmailJS, Iubenda).
6. Formalizzare trasferimenti internazionali e garanzie.
7. Definire retention puntuale per ogni dataset.
8. Documentare diritti interessati e canali DSAR con SLA interni.
9. Documentare misure di sicurezza tecniche e organizzative.
10. Versionare la policy (data efficacia, changelog sintetico).

## 9) Step operativi per Cookie Policy + CMP
1. Inventariare cookie/SDK reali in ambiente produzione.
2. Classificare per categoria (necessari/funzionali/analytics/marketing).
3. Configurare CMP con blocco preventivo script non necessari.
4. Rendere GA4 condizionato al consenso analytics.
5. Salvare prova consenso (timestamp, versione policy, categorie accettate).
6. Esporre centro preferenze sempre accessibile nel footer/header.
7. Gestire revoca consenso con stop tracciamento e cleanup ove possibile.
8. Allineare cookie policy pubblica con configurazione tecnica reale.

## 10) Step operativi per Termini e Condizioni
1. Definire ruolo piattaforma (marketplace/board, non parte del contratto locativo salvo diversa scelta).
2. Definire regole account (idoneita, veridicita dati, credenziali, sospensione).
3. Definire regole pubblicazione annunci (contenuti vietati, verifiche, rifiuto/rimozione).
4. Definire responsabilita utente/host su contenuti e condotte in chat.
5. Definire policy recensioni e moderazione (abusi, rimozioni, contestazioni).
6. Definire policy segnalazioni e tempi medi di gestione.
7. Definire limiti di responsabilita e disclaimer.
8. Definire IP/licenze sui contenuti caricati.
9. Definire legge applicabile, foro, risoluzione controversie.
10. Definire clausola modifica termini con notifica utenti.

## 11) Backlog tecnico-legale immediato (30 giorni)
1. Implementare consent mode/cookie gating per GA4 prima del deploy pubblico.
2. Rimuovere payload booking dalla URL:
   - opzione A: stato transitorio (sessionStorage) + token corto;
   - opzione B: creazione messaggio direttamente lato backend dopo redirect senza payload.
3. Aggiungere checkbox consenso privacy nei form contatti non-segnalazione.
4. Introdurre endpoint/processo per export/cancellazione account e retention jobs.
5. Minimizzare dati pubblici recensioni (valutare rimozione `authorId` e `likedBy` dal read pubblico).
6. Aggiungere pagine legali first-party (`/privacy`, `/termini`, `/cookie`) e mantenerle allineate ai provider esterni.
7. Hardening backend: rate limiting, security headers, audit logging minimale.

## 12) Deliverable "bulletproof" da produrre
- Privacy Policy completa e versionata.
- Cookie Policy completa + registro cookie aggiornato.
- Termini e Condizioni completi.
- Registro trattamenti interno (ROPA).
- Elenco responsabili esterni + DPA firmati.
- Procedura DSAR interna (accesso, rettifica, cancellazione, opposizione, portabilita).
- Procedura data breach e incident response.
- Retention schedule con enforcement tecnico.

## 13) Nota finale
Il codice mostra una base tecnica solida, ma la postura legale non e' ancora "bulletproof" senza:
- consenso cookie correttamente implementato;
- riduzione data leakage via URL;
- retention + diritti interessati operativi;
- documentazione contrattuale/policy allineata al comportamento reale del sistema.
