# UniStays

## Piattaforma digitale per la gestione e la ricerca di alloggi universitari

---

## 1. Executive Summary

**UniStays** è una piattaforma digitale avanzata progettata per semplificare, rendere sicura e ottimizzare l’incontro tra **studenti universitari** alla ricerca di alloggio e **proprietari/host** che desiderano affittare immobili in contesti universitari.

La piattaforma non si limita a essere un semplice portale di annunci, ma si configura come un **ecosistema completo**, dotato di strumenti di pubblicazione guidata, analytics evoluti, dashboard di gestione, chat contestualizzata per annuncio e sistemi di monitoraggio delle performance degli annunci.

UniStays è pensata con una logica **product-first**, scalabile e orientata a diventare un punto di riferimento per il mercato degli affitti universitari.

---

## 2. Problema e Opportunità

### 2.1 Problemi del mercato attuale

- Portali di annunci generici non ottimizzati per il contesto universitario
- Scarsa trasparenza sulla qualità degli annunci
- Assenza di strumenti di analisi per i proprietari
- Comunicazioni frammentate e poco contestualizzate
- Elevato rischio di annunci incompleti, fuorvianti o poco efficaci

### 2.2 Opportunità

UniStays intercetta il bisogno di:

- **Affitti mirati per studenti**
- **Strumenti professionali per host**
- **Esperienza utente moderna e guidata**
- **Dati e metriche per migliorare le performance degli annunci**

---

## 3. Target Utenti

### 3.1 Studenti

- Ricerca rapida e filtrata per città/università
- Visualizzazione chiara e dettagliata degli annunci
- Contatto diretto con l’host tramite chat contestualizzata
- Sistema di recensioni e rating

### 3.2 Host / Proprietari

- Pubblicazione guidata e step-by-step degli annunci
- Dashboard avanzata per la gestione degli immobili
- Analytics dettagliati sulle performance
- Comunicazione diretta con gli studenti

### 3.3 Amministratori

- Pannello di moderazione annunci
- Gestione città e università
- Analisi segnalazioni e comportamenti sospetti
- Supervisione della qualità della piattaforma

---

## 4. Architettura Generale

### 4.1 Frontend

- Single Page Application (SPA)
- UI moderna, responsive, accessibile
- Layout differenziati desktop/mobile
- Componentizzazione avanzata

### 4.2 Backend & Servizi

- **Firebase Firestore** per la gestione dei dati
- **Firebase Storage** per immagini
- **Firebase Analytics** per metriche e monitoraggio
- **Clerk** per autenticazione utenti
- **Auth Bridge tramite Cloud Functions** per sincronizzazione sicura tra Clerk e Firebase Auth
- **Google Maps API** per mappe, marker e geolocalizzazione

> Nota: la logica di business principale è lato frontend, mentre i punti critici di sicurezza sono gestiti lato backend.

---

## Architecture (Codebase)

- `src/app/`: routing, providers, config app-level
- `src/core/`: logica pura (policy, value objects, ports)
- `src/application/`: use cases e orchestrazione
- `src/infrastructure/`: implementazioni concrete (Firebase, HTTP, storage)
- `src/ui/`: pagine, componenti, hooks, helpers UI
- `src/shared/`: costanti e types condivisi

Linee guida rapide: UI sottile, niente Firebase SDK in `ui/`, `core/` puro.
Dettagli: `docs/ARCHITECTURE.md`.

---

## 5. Flussi Principali

### 5.1 Pubblicazione Annuncio (Host)

1. Accesso autenticato
2. Form avanzato step-by-step
3. Validazione realtime dei campi
4. Sistema di help contestuale sugli errori
5. Pagina di pre-pubblicazione con suggerimenti di ottimizzazione
6. Invio per revisione
7. Verifica manuale/admin
8. Annuncio reso visibile sulla piattaforma

### 5.2 Gestione Annunci (Dashboard Host)

- Layout con menu laterale per focus totale
- Vista elenco annunci con:
  - Modifica rapida campi principali
  - Eliminazione
  - Download PDF con QR code (cartello “Affittasi”)
- Barra superiore con ricerca e filtri dinamici

### 5.3 Analytics Annunci

- Card riepilogative:
  - Visualizzazioni
  - Like
  - Recensioni
  - Score medio
- Annunci monitorati (dinamici)
- Città coperte
- Annuncio top per:
  - Views
  - Like
  - Recensioni
  - Score
- Alert automatici su anomalie
- Grafici:
  - Pie chart (distribuzione città)
  - Line chart (andamento temporale)
- Analisi per singolo annuncio:
  - Range temporali selezionabili
  - Tabella giornaliera dati
  - Mappa con marker

---

## 6. Ricerca e Navigazione (Studenti)

### 6.1 Homepage

- Hero con ricerca avanzata (città/università)
- Suggerimenti dinamici in base all’input
- CTA: pubblica annuncio / contattaci
- Sezioni informative con modali
- Sezione annunci con scroll orizzontale infinito (ordinati per score)
- Sezione città di interesse (calcolate tramite interazioni e distanza)

### 6.2 Pagina Annunci

- Griglia annunci con doppia modalità:
  - Compatta
  - Dettagliata
- Filtri avanzati (prezzo, servizi, posti, Wi-Fi, ecc.)
- Mappa sticky sincronizzata con le card

### 6.3 Pagina Annuncio

- Header con:
  - Preferiti
  - Condivisione social
- Badge (nuovo, verificato, score)
- Galleria immagini avanzata
- Dettagli completi dell’appartamento
- Mappa posizione
- Card host con rimando al profilo
- Booking form sticky:
  - Data
  - Numero persone
  - Invio automatico messaggio in chat
- Sezione recensioni con filtri, like e risposte

---

## 7. Chat Contestualizzata

- Chat realtime per ogni coppia studente–host
- Conversazioni legate a uno specifico appartamento
- Messaggi standard + messaggi custom
- Invio automatico messaggio di contatto dal booking form
- Preview dell’appartamento nella chat
- Stato messaggi (inviato, consegnato, letto)

---

## 8. Area Host Pubblica

- Profilo pubblico host
- Statistiche aggregate
- Media recensioni
- Elenco annunci pubblicati
- Recensioni ricevute con filtri

---

## 9. Area Admin

- Pannello riservato
- Gestione annunci da verificare
- Rifiuto annunci sospetti
- Gestione città e università
- Gestione segnalazioni
- Ricerca utenti per ID
- Pagina debug componenti

---

## 10. Stato Attuale e Roadmap

### 10.1 Stato Attuale

- Prodotto funzionante
- UI/UX completa
- Architettura scalabile
- Mancano:
  - Termini e condizioni
  - Privacy & Cookie policy

### 10.2 Roadmap

- Integrazione legale completa
- Backend per score e anti-abuse
- Monetizzazione (featured, abbonamenti host)
- SEO e crescita organica
- Espansione città/università

---

## 11. Valore Strategico

UniStays rappresenta:

- Un prodotto pronto per validazione
- Una base solida per scalabilità
- Un progetto presentabile a:
  - Investitori
  - Università
  - Incubatori
  - Partner strategici

---

## 12. Conclusione

UniStays non è un semplice portale di annunci, ma una **piattaforma strutturata**, orientata alla qualità, ai dati e all’esperienza utente.

Il progetto è già oggi in una fase avanzata e può essere lanciato in modalità controllata, con ampi margini di crescita e monetizzazione futura.

---

**UniStays** – _Dove l’alloggio universitario diventa un’esperienza semplice, trasparente e intelligente._
