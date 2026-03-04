# Feature Deep Dive: Apartments Search Architecture

## Scopo del documento
Questo documento descrive in dettaglio la nuova architettura di ricerca pubblica degli alloggi UniStays, con focus su:
- motivazioni tecniche delle scelte
- impatti su costi, scalabilita e manutenzione
- tradeoff (vantaggi e svantaggi)
- comportamento in edge case
- linee guida per estendere il sistema

Ambito: ricerca pubblica su route `/alloggi/:city` e input di ricerca da `SearchTray`.

## Executive summary
La ricerca e' stata rifattorizzata con approccio **ranking-first + progressive client-side filtering**.

In pratica:
- Firestore esegue solo query base ordinata per ranking.
- I filtri avanzati vengono applicati lato client.
- Il client non scarica blocchi fissi grandi, ma cicla su batch piccoli (progressivi) finche' riempie la pagina o esaurisce dataset.

Questo elimina la dipendenza da combinazioni complesse di composite indexes per i filtri range/combinati, mantenendo una UX stabile e prevedibile.

## Problema iniziale (prima del refactor)
Il modello precedente tendeva a spingere troppa logica di filtraggio su Firestore:
- filtri range su prezzo, camere, area
- filtri combinati su servizi
- bounding geospaziale
- disponibilita con condizioni miste

Con questa impostazione cresceva la complessita:
- molte combinazioni di indici compositi da mantenere
- rigidita nell'aggiungere nuovi filtri
- rischio di query non supportate o degradate
- aumento del costo di manutenzione operativa

In sintesi, il data layer era troppo accoppiato alla logica di prodotto.

## Obiettivi architetturali
1. Ridurre drasticamente la complessita di query Firestore.
2. Mantenere ordinamento ranking (`metrics.score desc`) come asse principale della ricerca.
3. Rendere i filtri estendibili e testabili in modo isolato.
4. Controllare i costi read con fetch progressivo.
5. Gestire in modo robusto race condition e cambi rapidi di filtro.

## Contratto Firestore (vincolante per la ricerca pubblica)
Per la ricerca pubblica, Firestore deve limitarsi a:
- `where("address.city", "==", cityName)`
- `where("status", "==", APARTMENT_STATUS.PUBLISHED)`
- opzionale `where("aggregates.isAvailableNow", "==", true)` solo se richiesto
- `orderBy("metrics.score", "desc")`
- `startAfter(lastDoc)` per cursor pagination
- `limit(batchSize)`

Riferimenti:
- `src/infrastructure/firebase/queries/apartmentQueries.js`
- `src/ui/hooks/fetches/useFetchAppartamenti.js`

## Architettura target per layer

### 1) Data layer
Responsabilita:
- recuperare batch ordinati
- gestire cursor Firestore
- normalizzare documenti

Nessuna logica business di filtro avanzato.

Riferimenti:
- `src/infrastructure/firebase/repositories/FirestoreApartmentRepository.js`
- `src/infrastructure/firebase/queries/apartmentQueries.js`

### 2) Application layer
Responsabilita:
- normalizzazione DTO filtri UI
- strategia di matching filtri (funzioni pure, componibili)
- creazione payload filtri per orchestrazione

Riferimenti:
- `src/application/filters/apartmentFilters.js`
- `src/application/useCases/createApartmentFilters.js`

### 3) Orchestrazione (UI hooks applicativi)
Responsabilita:
- coordinare fetch progressivo + filtro client-side
- accumulo risultati per pagina
- stop conditions intelligenti
- gestione concorrenza/race condition

Riferimenti:
- `src/ui/hooks/fetches/useFetchAppartamenti.js`
- `src/ui/hooks/apartments/useApartmentsFilters.js`
- `src/ui/hooks/apartments/useApartmentsPage.js`

### 4) Presentation/UI
Responsabilita:
- render risultati e controlli di pagina
- nessuna logica business di filtro
- gestione stato totale noto/sconosciuto in modo chiaro

Riferimenti:
- `src/ui/components/sections/apartmentsSection/ApartmentsListSection.jsx`
- `src/ui/components/common/form/PageNavigation.jsx`
- `src/ui/components/common/search/SearchTray/index.jsx`

## Flusso end-to-end (nuovo)
1. L'utente seleziona citta e filtri UI.
2. `createApartmentFilters` produce:
   - constraints base Firestore
   - `uiFilters` normalizzato
3. `useFetchAppartamenti` avvia fetch progressivo:
   - legge batch 40-60 (dinamico)
   - applica matcher client-side al batch
   - accumula risultati unici
4. Stop quando:
   - risultati accumulati >= pageSize richiesto
   - oppure dataset esaurito (`allLoaded`)
5. UI renderizza pagina corrente; se totale non e' ancora noto, usa navigazione "open-ended".

## Perche' ranking-first
Ordinare sempre per `metrics.score desc` prima del filtro avanzato garantisce:
- coerenza semantica: i risultati piu' rilevanti vengono valutati prima
- stabilita UX: niente cambi di ordinamento tra batch
- miglior controllo sul fetch progressivo: si riempie prima la pagina con candidati ad alta qualita

Svantaggio:
- con filtri molto restrittivi potrebbero servire piu' batch prima di trovare abbastanza match.

Mitigazione:
- loop progressivo con stop conditions
- batch size dinamico
- interruzione appena la pagina e' piena

## Perche' filtri client-side (advanced)
### Vantaggi
- riduzione dipendenza da indici compositi complessi
- maggiore flessibilita nel cambiare/aggiungere filtri
- testabilita alta (funzioni pure)
- separazione netta tra data access e business logic

### Svantaggi
- aumento CPU client per matching
- possibili read extra su filtri iper-restrittivi
- totale filtrato non immediatamente noto

### Mitigazioni
- matcher precompilato (`createApartmentFilterMatcher`) per evitare lavoro ripetuto
- singola scansione per batch
- dedup per ID
- totale dichiarato `null` finche' non si ha certezza

## Strategia filtri: composizione e OCP
Le strategie sono funzioni pure dedicate (esempi):
- `filterByPrice`
- `filterByRooms`
- `filterByAvailableRooms`
- `filterByBathrooms`
- `filterByArea`
- `filterByAvailabilityNow`
- `filterByRoomType`
- `filterByServices`
- `filterByDistance`

Pattern pratico:
- `createApartmentFilterMatcher` pre-calcola variabili statiche del filtro (es. chiavi servizi richieste, date parse)
- ritorna una funzione `(apartment) => boolean`
- il fetch loop applica il matcher ai soli documenti del batch corrente

Questo riduce copie inutili, mantiene costo lineare e rende l'estensione semplice.

## Fetch progressivo: dettagli algoritmici
Parametri principali:
- `progressiveBatchRange: { min: 40, max: 60 }`
- `MAX_PROGRESSIVE_LOOPS` come guardrail difensivo

Logica:
1. calcola `targetCount` = risultati gia' cache + pageSize
2. recupera batch con dimensione dinamica
3. filtra batch client-side
4. deduplica per ID
5. aggiorna cursor
6. ripete finche':
   - non raggiunge `targetCount`
   - o `snapshotLength < batchSize` (dataset finito)

Vantaggio: evita over-fetch statico (es. 200 fissi) e mantiene controllo sul costo.

## Race condition e coerenza stato
Problema tipico:
- cambi rapidi di query/filtri possono fare arrivare risposte fuori ordine.

Scelta implementativa:
- token request per `queryKey` nell'hook fetch.
- ogni nuova richiesta incrementa token della chiave.
- una risposta viene ignorata se token non e' piu' corrente.

Effetto:
- nessuna contaminazione di stato tra richieste vecchie e nuove
- niente override accidentale dei risultati correnti.

## Paginazione e total count
Principi:
- paginazione solo cursor-based lato Firestore
- niente offset/index pagination Firestore
- quando i filtri avanzati sono attivi:
  - `totalCount` resta `null` finche' il dataset non e' esaurito
  - quando `allLoaded` diventa true, il totale e' noto (`appartamenti.length`)

Impatti UX:
- la UI mostra conteggio "aperto" (es. `N+`) quando il totale e' non deterministico
- `PageNavigation` supporta modalita con totale sconosciuto via `hasNextPage`

## Caching e memoria
Lo slice `appartamenti` mantiene stato per `queryKey`:
- `items`, `cursor`, `allLoaded`, `loading`, `error`, `totalCount`
- eviction LRU per limitare memoria (`MAX_QUERIES_IN_MEMORY`)

Benefici:
- evita refetch non necessari quando si torna su query recenti
- separa chiaramente dataset per scope/query diverse

## Impatto su costi Firestore e indici
### Indici
Con il nuovo approccio, la ricerca pubblica necessita di un set di indici molto piu' semplice rispetto a combinazioni range/composite precedenti.

### Read
- caso medio: read piu' efficienti rispetto a blocchi statici grandi.
- caso peggiore (filtri ultra-restrittivi): piu' batch necessari, ma comunque controllati da stop conditions e batch size.

In generale il modello migliora la prevedibilita del costo e riduce il rischio operativo legato agli indici.

## Edge case e comportamento atteso
- Dataset vuoto: `allLoaded=true`, lista vuota, empty state.
- Filtri molto restrittivi: loop continua finche' dataset esaurito.
- Risultati insufficienti: pagina parziale ma consistente.
- Cambi filtri rapidi: richieste stale ignorate.
- Duplicati da batch multipli: bloccati via dedup ID.
- Ordine ranking: preservato dal fetch ordinato + append stabile.

## Limiti noti
1. Il totale filtrato non e' immediato per filtri avanzati.
2. Il filtro `roomType` puo' dipendere dalla disponibilita del campo `rooms` nel listing doc.
3. I documenti che cambiano ranking durante la sessione possono alterare la "fotografia" tra pagine (limite naturale delle query live su dataset mutabile).

## Linee guida di estensione (nuovi filtri)
Per aggiungere un filtro nuovo:
1. Aggiungi il campo nel DTO normalizzato in `normalizeApartmentFilters`.
2. Implementa una nuova strategia pura in `apartmentFilters.js`.
3. Collega la strategia nel matcher.
4. Aggiorna serializzazione query URL (se necessario) in `apartmentFiltersQuery.js`.
5. Aggiorna test unitari e test di orchestrazione.

Regola: non espandere Firestore query con range/combinazioni per la ricerca pubblica, salvo decisione architetturale esplicita.

## Testing strategy consigliata
Minimo indispensabile:
- orchestrazione progressiva: piu' batch fino al target
- filtri restrittivi: esaurimento dataset
- race condition: stale response ignorata
- dedup ID tra batch

Riferimento test esistente:
- `src/ui/hooks/fetches/useFetchAppartamenti.test.jsx`

## Decision log sintetico
- Decisione: ranking-first come asse principale.
  - Motivo: coerenza UX + stabilita.
- Decisione: filtri avanzati client-side.
  - Motivo: riduzione complessita indici + estendibilita.
- Decisione: fetch progressivo dinamico.
  - Motivo: controllo costo/read e latenza percepita.
- Decisione: totale filtrato differito.
  - Motivo: evitare valori inaccurati.

## File map rapida
- Query base Firestore: `src/infrastructure/firebase/queries/apartmentQueries.js`
- Matcher filtri: `src/application/filters/apartmentFilters.js`
- Payload filtri: `src/application/useCases/createApartmentFilters.js`
- Orchestratore fetch: `src/ui/hooks/fetches/useFetchAppartamenti.js`
- Hook filtri pagina: `src/ui/hooks/apartments/useApartmentsFilters.js`
- Page orchestration: `src/ui/hooks/apartments/useApartmentsPage.js`
- Paginazione UI: `src/ui/components/common/form/PageNavigation.jsx`
- Lista UI: `src/ui/components/sections/apartmentsSection/ApartmentsListSection.jsx`

