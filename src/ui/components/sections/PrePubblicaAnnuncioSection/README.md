# PrePubblicaAnnuncio Section Components

Questo modulo contiene i componenti modulari per la pagina pre-pubblicazione annuncio, seguendo i principi di Clean Architecture e SOLID.

## Struttura

```
PrePubblicaAnnuncioSection/
├── index.js                    # Export centralizzato
├── HeroSection.jsx             # Sezione hero con CTA principali
├── HowItWorksSection.jsx       # Sezione "Come funziona"
├── BenefitsSection.jsx         # Sezione vantaggi per proprietari
├── TipsSection.jsx             # Sezione consigli per successo
├── FinalCTASection.jsx         # Sezione CTA finale
└── README.md                   # Documentazione
```

## Componenti

### HeroSection

Sezione principale con titolo, sottotitolo e pulsanti CTA.

- **Props**: `content` (oggetto con titolo, sottotitolo, CTA)
- **Responsabilità**: Presentazione iniziale e call-to-action principali

### HowItWorksSection

Sezione che spiega il processo in 3 step semplici.

- **Props**: `steps` (array di step con icon, title, description)
- **Responsabilità**: Spiegare il processo di pubblicazione

### BenefitsSection

Sezione che mostra i vantaggi per i proprietari.

- **Props**: `benefits` (array di benefit con icon, title, description)
- **Responsabilità**: Evidenziare i vantaggi della piattaforma

### TipsSection

Sezione con consigli per un annuncio di successo.

- **Props**: `tips` (array di stringhe con consigli)
- **Responsabilità**: Fornire suggerimenti utili

### FinalCTASection

Sezione finale con CTA per la conversione.

- **Props**: `content` (oggetto con titolo, sottotitolo, CTA)
- **Responsabilità**: Call-to-action finale per la conversione

## Dati

I dati sono separati nel file `src/ui/data/prePubblicaAnnuncioData.js` e includono:

- `heroContent`: Contenuto della sezione hero
- `steps`: Array dei 3 step del processo
- `benefits`: Array dei vantaggi per proprietari
- `tips`: Array dei consigli per successo
- `finalCTAContent`: Contenuto della sezione CTA finale

## Principi Applicati

1. **Single Responsibility Principle**: Ogni componente ha una sola responsabilità
2. **Separation of Concerns**: Dati separati dalla logica di presentazione
3. **Component Composition**: Riutilizzo di componenti esistenti (InfoCard, CoolButton)
4. **Props-based Communication**: Comunicazione tramite props ben definite
5. **Reusability**: Componenti riutilizzabili in altri contesti

## Vantaggi

- **Manutenibilità**: Codice più facile da mantenere e modificare
- **Testabilità**: Ogni componente può essere testato isolatamente
- **Riutilizzabilità**: I componenti possono essere riutilizzati
- **Leggibilità**: Codice più chiaro e comprensibile
- **Scalabilità**: Facile aggiungere nuove sezioni o modificare quelle esistenti
- **SEO**: Meta tags ottimizzati per la conversione
- **UX**: Design persuasivo con CTA strategici

## Utilizzo

```jsx
import {
  HeroSection,
  HowItWorksSection,
  BenefitsSection,
  TipsSection,
  FinalCTASection,
} from "../components/sections/PrePubblicaAnnuncioSection";
import {
  heroContent,
  steps,
  benefits,
  tips,
  finalCTAContent,
} from "../data/prePubblicaAnnuncioData";

// Nel componente principale
<HeroSection content={heroContent} />
<HowItWorksSection steps={steps} />
<BenefitsSection benefits={benefits} />
<TipsSection tips={tips} />
<FinalCTASection content={finalCTAContent} />
```
