# ContactPage Section Components

Questo modulo contiene i componenti modulari per la pagina di contatto, seguendo i principi di Clean Architecture e SOLID.

## Struttura

```
ContactPageSection/
├── index.js                    # Export centralizzato
├── ContactInfoSection.jsx      # Sezione informazioni di contatto
├── ContactFormSection.jsx      # Sezione form di contatto
└── README.md                   # Documentazione
```

## Componenti

### ContactInfoSection

Sezione sinistra con informazioni di contatto, background image e dettagli aziendali.

- **Props**: `contactInfo` (oggetto con titolo, descrizione, dettagli contatto)
- **Responsabilità**: Visualizzazione delle informazioni di contatto e branding

**Caratteristiche**:

- Background image con overlay
- Card con backdrop blur
- Link cliccabili per email, telefono e indirizzo
- Design responsive

### ContactFormSection

Sezione destra con il form di contatto e gestione submit.

- **Props**:

  - `formRef` (ref del form)
  - `handleSubmit` (funzione di submit)
  - `loading` (stato di caricamento)
  - `reason` (motivo pre-selezionato)
  - `contactReasons` (array delle opzioni)
  - `formFields` (configurazione campi)
  - `appId` e `userID` (per segnalazioni)
  - `segnalazioneValue` e `isSegnalazioneReason` (gestione segnalazioni)
  - `reportReasons` e `defaultReportReason` (motivi segnalazione)

- **Responsabilità**: Gestione del form di contatto e validazione

**Caratteristiche**:

- Form con validazione
- Honey pot anti-spam
- Gestione segnalazioni annunci
- Feedback utente
- Design responsive

## Hook Personalizzato

### useContactForm

Hook che gestisce tutta la logica del form di contatto.

**Funzionalità**:

- Parsing parametri URL per segnalazioni
- Gestione submit con EmailJS
- Controllo anti-spam
- Gestione segnalazioni annunci
- Gestione errori e feedback

**Return**:

- `formRef`: Ref del form
- `loading`: Stato di caricamento
- `reason`: Motivo pre-selezionato
- `appId`, `userID`: Parametri per segnalazioni
- `segnalazioneReasonValue`, `isSegnalazioneReason`: Stato segnalazioni
- `reportReasons`, `defaultReportReason`: Motivi segnalazione
- `handleSubmit`: Funzione di submit

## Dati

I dati sono separati nel file `src/ui/data/contactPageData.js` e includono:

- `contactInfo`: Informazioni di contatto e branding
- `contactReasons`: Opzioni per il motivo del contatto
- `formFields`: Configurazione dei campi del form

## Miglioramenti Implementati

### 🎨 **UX/UI**

- **Link cliccabili**: Email, telefono e indirizzo sono ora link funzionanti
- **Transizioni**: Hover effects e transizioni smooth
- **Feedback**: Messaggi informativi sotto i campi
- **Accessibilità**: Migliore struttura semantica

### 🔧 **Funzionalità**

- **Anti-spam**: Honey pot field per prevenire spam
- **Segnalazioni**: Gestione completa delle segnalazioni annunci
- **Validazione**: Validazione lato client migliorata
- **Error handling**: Gestione errori più robusta

### 🏗️ **Architettura**

- **Separation of Concerns**: Logica separata dalla presentazione
- **Reusability**: Componenti riutilizzabili
- **Maintainability**: Codice più facile da mantenere
- **Testability**: Componenti testabili isolatamente

### 📱 **Responsive**

- **Mobile-first**: Design ottimizzato per mobile
- **Breakpoints**: Layout adattivo per tutti i dispositivi
- **Touch-friendly**: Elementi ottimizzati per touch

## Principi Applicati

1. **Single Responsibility Principle**: Ogni componente ha una sola responsabilità
2. **Separation of Concerns**: Dati, logica e presentazione separati
3. **Component Composition**: Riutilizzo di componenti esistenti
4. **Props-based Communication**: Comunicazione tramite props ben definite
5. **Custom Hooks**: Logica di business estratta in hook personalizzati

## Vantaggi

- **Manutenibilità**: Codice più facile da mantenere e modificare
- **Testabilità**: Ogni componente può essere testato isolatamente
- **Riutilizzabilità**: I componenti possono essere riutilizzati
- **Leggibilità**: Codice più chiaro e comprensibile
- **Scalabilità**: Facile aggiungere nuove funzionalità
- **Performance**: Migliore ottimizzazione e lazy loading
- **SEO**: Meta tags ottimizzati
- **Accessibilità**: Migliore accessibilità e UX

## Utilizzo

```jsx
import {
  ContactInfoSection,
  ContactFormSection,
} from "../components/sections/ContactPageSection";
import { useContactForm } from "../hooks/forms/useContactForm";
import {
  contactInfo,
  contactReasons,
  formFields,
} from "../data/contactPageData";

// Nel componente principale
const {
  formRef,
  loading,
  reason,
  appId,
  userID,
  segnalazioneReasonValue,
  isSegnalazioneReason,
  reportReasons,
  defaultReportReason,
  handleSubmit,
} = useContactForm();

<ContactInfoSection contactInfo={contactInfo} />
<ContactFormSection
  formRef={formRef}
  handleSubmit={handleSubmit}
  loading={loading}
  reason={reason}
  contactReasons={contactReasons}
  formFields={formFields}
  appId={appId}
  userID={userID}
  segnalazioneValue={segnalazioneReasonValue}
  isSegnalazioneReason={isSegnalazioneReason}
  reportReasons={reportReasons}
  defaultReportReason={defaultReportReason}
/>
```
