# Apartment Feedback Section - Componenti

Questa sezione contiene i componenti per la gestione delle recensioni degli appartamenti.

## Struttura dei Componenti

### Componenti Principali

- **`ApartmentFeedbackSection.jsx`** - Componente principale che orchestra tutti gli altri
- **`ReviewsStats.jsx`** - Statistiche delle recensioni (rating medio, distribuzione)
- **`ReviewsFilters.jsx`** - Filtri e ordinamento delle recensioni
- **`ReviewCard.jsx`** - Card per la singola recensione
- **`EmptyReviewsState.jsx`** - Stato vuoto quando non ci sono recensioni

### Componenti UI

- **`RatingBar.jsx`** - Barra di distribuzione del rating (in `src/ui/components/common/indicators/`)

### Hook Personalizzati

- **`useFetchRecensioni.js`** - Hook per il fetch delle recensioni (in `src/ui/hooks/fetches/`)

### Utility Functions

- **`renderStars.jsx`** - Funzione per renderizzare le stelle (in `src/ui/helpers/`)
- **`formatDate.js`** - Funzione per formattare le date (in `src/ui/helpers/`)

## Utilizzo

```jsx
import { ApartmentFeedbackSection } from "@/ui/components/sections/apartmentSection";

// Nel componente
<ApartmentFeedbackSection
  app={apartmentData}
  reviews={reviews}
  stats={stats}
  loading={loading}
/>;
```

## Funzionalità

- ✅ Fetch automatico delle recensioni quando il componente è visibile
- ✅ Statistiche in tempo reale (rating medio, distribuzione)
- ✅ Filtri per rating (1-5 stelle)
- ✅ Ordinamento (recenti, rating, utili)
- ✅ **Paginazione intelligente**: mostra solo 2 recensioni inizialmente
- ✅ **Caricamento progressivo**: "Mostra altre 2 recensioni"
- ✅ **Mostra tutte**: pulsante per visualizzare tutte le recensioni
- ✅ Reset automatico della paginazione quando cambiano i filtri
- ✅ Stato di caricamento
- ✅ Stato vuoto con call-to-action
- ✅ Componenti riutilizzabili
- ✅ Gestione errori

## Sistema di Paginazione

Il componente implementa un sistema di paginazione intelligente:

1. **Caricamento iniziale**: Mostra solo 2 recensioni
2. **Caricamento progressivo**: Al click di "Mostra altre 2 recensioni" ne carica altre 2
3. **Mostra tutte**: Pulsante per visualizzare tutte le recensioni disponibili
4. **Reset automatico**: Quando cambiano i filtri, torna a mostrare solo 2 recensioni
5. **Contatore**: Mostra sempre quante recensioni sono visibili rispetto al totale

## Struttura Dati

Le recensioni sono memorizzate in Firestore come sottocollezione:

```
apartments/{apartmentId}/reviews/{reviewId}
```

Ogni recensione contiene:

- `authorId`: id dell'autore
- `authorName`: nome visualizzato
- `authorPhotoUrl`: foto profilo (opzionale)
- `rating`: numero da 1 a 5
- `text`: testo della recensione
- `createdAt`: timestamp Firestore
- `helpfulCount`: numero di "utile"
- `likedBy`: array di userId
- `replyCount`: numero risposte (opzionale)
- `lastReplyAt`: ultima risposta (opzionale)

Le risposte sono una sottocollezione:

```
apartments/{apartmentId}/reviews/{reviewId}/replies/{replyId}
```

Ogni risposta contiene:

- `authorId`
- `authorName`
- `authorPhotoUrl`
- `text`
- `createdAt`
