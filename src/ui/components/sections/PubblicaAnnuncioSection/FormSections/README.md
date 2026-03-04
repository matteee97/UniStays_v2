# Form Sections Components

Questo modulo contiene i componenti separati per ogni sezione del form di pubblicazione annuncio, seguendo i principi di Clean Architecture e SOLID.

## Struttura

```
FormSections/
├── index.js                    # Export centralizzato
├── BasicInfoSection.jsx        # Sezione informazioni base
├── CharacteristicsSection.jsx  # Sezione caratteristiche
├── AddressSection.jsx          # Sezione indirizzo
├── DetailsSection.jsx          # Sezione dettagli
├── OwnerSection.jsx            # Sezione proprietario
├── ImagesSection.jsx           # Sezione immagini
├── SectionRenderer.jsx         # Renderer dinamico delle sezioni
├── NavigationButtons.jsx       # Pulsanti di navigazione
├── StepWrapper.jsx             # Wrapper per le sezioni
└── README.md                   # Documentazione
```

## Componenti

### BasicInfoSection

Gestisce il titolo e la descrizione dell'annuncio.

- **Props**: `formData`, `handleChange`, `handleBlur`, `showTips`, `getFieldError`, `hasFieldError`

### CharacteristicsSection

Gestisce le caratteristiche dell'alloggio (camere, bagni, superficie, posti).

- **Props**: `formData`, `setFormData`, `superficie`, `setSuperficie`, `camere`, `setCamere`, `bagni`, `setBagni`, `postiTotali`, `setPostiTotali`, `postiDisponibili`, `setPostiDisponibili`, `showTips`

### AddressSection

Gestisce l'indirizzo e la posizione dell'alloggio.

- **Props**: `formData`, `handleChange`, `handleBlur`, `cityHandle`, `showTips`, `getFieldError`, `hasFieldError`

### DetailsSection

Gestisce i dettagli e le caratteristiche dell'alloggio.

- **Props**: `formData`, `handleChange`, `handleBlur`, `showTips`

### OwnerSection

Gestisce le informazioni del proprietario.

- **Props**: `getOwnerInfo`, `formData`, `handleChange`

### ImagesSection

Gestisce il caricamento delle immagini.

- **Props**: `formData`, `handleChange`, `handleBlur`, `showTips`, `getFieldError`

### SectionRenderer

Componente per renderizzare dinamicamente la sezione corrente del form.

- **Props**: `currentStepId`, `formData`, `setFormData`, `handleChange`, `handleBlur`, `cityHandle`, `showTips`, `getFieldError`, `hasFieldError`, `getOwnerInfo`
- **Responsabilità**: Gestisce il rendering condizionale delle sezioni basato sullo step corrente

### NavigationButtons

Gestisce i pulsanti di navigazione tra le sezioni.

- **Props**: `canGoToPrevious`, `canGoToNext`, `goToPrevious`, `goToNext`, `isLastStep`, `isFormValid`, `isSubmitting`, `loading`

### StepWrapper

Wrapper per mostrare una sezione alla volta con navigazione.

- **Props**: `children`, `currentStep`, `totalSteps`, `navigation`, `isFormValid`, `isSubmitting`, `loading`, `showTips`, `setShowTips`

## Principi Applicati

1. **Single Responsibility Principle**: Ogni componente ha una sola responsabilità
2. **Open/Closed Principle**: I componenti sono estensibili senza modifiche
3. **Dependency Inversion**: I componenti dipendono da astrazioni (props) non da implementazioni concrete
4. **Component Composition**: Riutilizzo di componenti esistenti
5. **Separation of Concerns**: Logica di business separata dalla presentazione
6. **Form Validation**: Validazione real-time con debounce e validazione onBlur
7. **Error Handling**: Gestione centralizzata degli errori con feedback visivo

## Vantaggi

- **Manutenibilità**: Codice più facile da mantenere e modificare
- **Testabilità**: Ogni componente può essere testato isolatamente
- **Riutilizzabilità**: I componenti possono essere riutilizzati in altri contesti
- **Leggibilità**: Codice più chiaro e comprensibile
- **Scalabilità**: Facile aggiungere nuove sezioni o modificare quelle esistenti
- **UX Migliorata**: Navigazione step-by-step con validazione progressiva
- **Accessibilità**: Navigazione tramite icone e pulsanti intuitivi
- **Validazione Intelligente**: Controlli real-time con feedback immediato
