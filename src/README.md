# UniStays - Struttura del Progetto

Questo documento descrive l'organizzazione e la struttura del progetto UniStays.

## 📁 Struttura delle Cartelle

```
src/
├── components/          # Componenti React
│   ├── ui/             # Componenti UI riutilizzabili
│   │   ├── buttons/    # Pulsanti e controlli interattivi
│   │   ├── forms/      # Form, input e controlli
│   │   ├── charts/     # Grafici e statistiche
│   │   └── layout/     # Layout e sezioni
│   ├── shared/         # Componenti condivisi
│   │   └── icons/      # Icone SVG riutilizzabili
│   ├── sections/       # Sezioni delle pagine
│   ├── cards/          # Card e componenti di lista
│   ├── navigation/     # Componenti di navigazione
│   ├── modals/         # Modal e dialoghi
│   ├── messages/       # Messaggi e alert
│   ├── badges/         # Badge e indicatori
│   ├── form/           # Componenti form specifici
│   ├── clerk/          # Componenti autenticazione
│   ├── dividers/       # Divisori e separatori
│   ├── texts/          # Componenti testuali
│   ├── mapComponents/  # Componenti mappa
│   ├── PdfGenerator/   # Generazione PDF
│   └── index.js        # Esportazioni centralizzate
├── hooks/              # Custom React Hooks
│   ├── analytics/      # Hook per analytics
│   ├── auth/           # Hook per autenticazione
│   ├── fetches/        # Hook per fetch dati
│   ├── forms/          # Hook per form
│   ├── interactives/   # Hook per interazioni
│   ├── ui/             # Hook per UI
│   ├── users/          # Hook per utenti
│   └── index.js        # Esportazioni centralizzate
├── config/             # Configurazioni
│   └── index.js        # Configurazioni centralizzate
├── constants/          # Costanti globali
│   └── index.js        # Esportazioni centralizzate
├── types/              # Definizioni tipi
│   └── index.js        # Tipi centralizzati
├── routes/             # Configurazione route
│   └── index.js        # Route centralizzate
├── utils/              # Utility e helper
│   ├── analyticsConstants.js
│   └── index.js        # Esportazioni centralizzate
├── pages/              # Pagine dell'applicazione
├── layouts/            # Layout delle pagine
├── data/               # Dati statici
├── functions/          # Funzioni Firebase
├── lib/                # Librerie esterne
├── redux/              # Store Redux
└── firebase.js         # Configurazione Firebase
```

## 🎯 Convenzioni di Nomenclatura

### File e Cartelle

- **PascalCase**: Componenti React (`UserProfile.jsx`)
- **camelCase**: Hook, utility, funzioni (`useUserData.js`)
- **kebab-case**: File di configurazione (`analytics-constants.js`)
- **SCREAMING_SNAKE_CASE**: Costanti globali (`API_ENDPOINTS`)

### Componenti

- **PascalCase**: Nomi componenti (`UserProfile`)
- **camelCase**: Props e variabili (`userData`, `onClick`)
- **kebab-case**: Classi CSS (`user-profile-card`)

### Hook

- **use** + **PascalCase**: Custom hooks (`useAnalyticsData`)
- **camelCase**: Variabili interne (`isLoading`, `setData`)

### Costanti

- **SCREAMING_SNAKE_CASE**: Costanti globali (`MAX_FILE_SIZE`)
- **camelCase**: Configurazioni (`defaultZoom`)

## 📦 Importazioni Centralizzate

### Componenti

```javascript
// Prima
import StatsCard from "../components/sections/dettagliTecniciSection/StatsCard";
import FormInput from "../components/form/FormInput";

// Dopo
import { StatsCard, FormInput } from "../components";
```

### Hook

```javascript
// Prima
import { useAnalyticsData } from "../hooks/analytics/useAnalyticsData";
import { useAnalyticsSuggestions } from "../hooks/analytics/useAnalyticsSuggestions";

// Dopo
import { useAnalyticsData, useAnalyticsSuggestions } from "../hooks";
```

### Costanti

```javascript
// Prima
import { SUGGESTION_KEYS } from "../utils/analyticsConstants";
import { ROUTES } from "../routes";

// Dopo
import { SUGGESTION_KEYS, ROUTES } from "../constants";
```

## 🔧 Configurazioni

### Configurazione App

```javascript
import { APP_CONFIG, UI_CONFIG, FEATURE_FLAGS } from "../config";

// Configurazione app
console.log(APP_CONFIG.name); // 'UniStays'

// Configurazione UI
console.log(UI_CONFIG.colors.primary); // '#228E8D'

// Feature flags
console.log(FEATURE_FLAGS.enableAnalytics); // true
```

### Tipi e Costanti

```javascript
import { USER_ROLES, PROPERTY_TYPES, TOAST_TYPES } from "../types";

// Tipi utente
console.log(USER_ROLES.STUDENT); // 'student'

// Tipi proprietà
console.log(PROPERTY_TYPES.STUDIO); // 'studio'

// Tipi toast
console.log(TOAST_TYPES.SUCCESS); // 'success'
```

### Route

```javascript
import { ROUTES, ROUTE_METADATA, NAVIGATION } from "../routes";

// Route
console.log(ROUTES.HOME); // '/'

// Metadata route
console.log(ROUTE_METADATA[ROUTES.HOME].title); // 'UniStays - Trova la tua casa universitaria'

// Navigazione
console.log(NAVIGATION.main); // Array con link principali
```

## 🎨 Organizzazione Componenti

### UI Components (`components/ui/`)

Componenti riutilizzabili e generici:

- **buttons/**: Pulsanti e controlli interattivi
- **forms/**: Input, form e controlli
- **charts/**: Grafici e visualizzazioni dati
- **layout/**: Layout e sezioni

### Shared Components (`components/shared/`)

Componenti condivisi tra feature:

- **icons/**: Icone SVG riutilizzabili

### Legacy Components

Componenti esistenti mantenuti per compatibilità:

- **sections/**: Sezioni di pagina
- **cards/**: Card e componenti di lista
- **navigation/**: Componenti di navigazione
- **modals/**: Modal e dialoghi
- **messages/**: Messaggi e alert
- **badges/**: Badge e indicatori
- **form/**: Componenti form specifici
- **clerk/**: Componenti autenticazione
- **dividers/**: Divisori e separatori
- **texts/**: Componenti testuali
- **mapComponents/**: Componenti mappa
- **PdfGenerator/**: Generazione PDF

## 🪝 Organizzazione Hook

### Analytics Hooks (`hooks/analytics/`)

Hook per gestione analytics e statistiche:

- `useAnalyticsData`: Fetch e elaborazione dati analytics
- `useAnalyticsSuggestions`: Suggerimenti personalizzati
- `useAnalyticsNavigation`: Navigazione dai grafici

### Auth Hooks (`hooks/auth/`)

Hook per autenticazione e autorizzazione:

- `useEnsureUserDoc`: Verifica documento utente

### Fetch Hooks (`hooks/fetches/`)

Hook per fetch dati:

- `useFetchApartment`: Fetch singolo appartamento
- `useFetchAppartamenti`: Fetch lista appartamenti
- `useFetchFavoriteApartments`: Fetch preferiti

## 📋 Best Practices

### 1. Importazioni

- Usa sempre le importazioni centralizzate
- Evita importazioni relative profonde
- Raggruppa le importazioni per tipo

### 2. Nomenclatura

- Sii consistente con le convenzioni
- Usa nomi descrittivi e chiari
- Evita abbreviazioni non standard

### 3. Organizzazione

- Mantieni i componenti piccoli e focalizzati
- Raggruppa logicamente i file correlati
- Usa cartelle per organizzare meglio

### 4. Configurazione

- Centralizza le configurazioni
- Usa costanti per valori magici
- Mantieni le configurazioni separate per ambiente

### 5. Tipizzazione

- Definisci tipi per strutture dati comuni
- Usa costanti per valori enumerati
- Mantieni la tipizzazione consistente

## 🚀 Vantaggi della Nuova Struttura

1. **Manutenibilità**: Codice più organizzato e facile da mantenere
2. **Scalabilità**: Struttura che cresce con il progetto
3. **Riutilizzabilità**: Componenti e hook facilmente riutilizzabili
4. **Consistenza**: Convenzioni uniformi in tutto il progetto
5. **Performance**: Importazioni ottimizzate e bundle splitting
6. **Developer Experience**: Sviluppo più veloce e intuitivo

## 🔄 Migrazione Graduale

La nuova struttura è stata implementata mantenendo la compatibilità con il codice esistente:

1. **Importazioni centralizzate**: Tutti i componenti e hook sono ora esportati da file index.js
2. **Percorsi corretti**: Le importazioni sono state aggiornate per riflettere la nuova struttura
3. **Compatibilità**: Il codice esistente continua a funzionare senza modifiche
4. **Migrazione graduale**: I componenti possono essere gradualmente spostati nelle nuove cartelle

## 📚 Risorse Aggiuntive

- [React Best Practices](https://react.dev/learn)
- [JavaScript Naming Conventions](https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Writing_style_guide/Code_style_guide/JavaScript)
- [CSS Naming Conventions](https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Writing_style_guide/Code_style_guide/CSS)
