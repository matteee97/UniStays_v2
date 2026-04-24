# Cookie and Tracking Audit

Data audit: 6 marzo 2026

## Ambito

Analisi del frontend `src/` e delle integrazioni lato client che possono
scrivere cookie, usare storage locale o caricare script di terze parti.

## Esito sintetico

- Banner/consenso richiesto: `Google Analytics 4`, `Google Maps`
- Banner non richiesto per funzionamento base: `Clerk`, `Firebase`,
  storage first-party di preferenze e supporto tecnico del prodotto
- Cookie marketing/profilazione: non rilevati nel repository alla data audit

## Dettaglio per strumento

| Strumento | Evidenza tecnica | Classificazione operativa | Richiede banner |
| --- | --- | --- | --- |
| Clerk | `src/app/providers/AppProviders.jsx` | Tecnico/necessario per autenticazione e sessione | No |
| Firebase Auth / Firestore cache | `src/infrastructure/firebase/index.js` | Tecnico/necessario per backend e persistenza locale del servizio | No |
| localStorage preferenze UI | `src/ui/hooks/ui/useTheme.js`, `src/ui/hooks/apartments/useDetailedCardPreference.js`, `src/ui/components/common/messages/OneTimeMessage.jsx` | First-party funzionale, legata a scelte esplicite dell'utente | No, se limitata a preferenze richieste |
| sessionStorage deduplica view annuncio | `src/ui/hooks/apartment/useTrackApartmentView.js` | First-party tecnico per evitare doppio conteggio nello stesso giorno/sessione | No, classificato come supporto tecnico del servizio |
| Google Analytics 4 | `src/ui/helpers/analytics.js`, `src/ui/components/common/AnalyticsListener.jsx` | Analytics opzionale di terza parte | Sì |
| Google Maps | `src/ui/components/common/mapComponents/GoogleMapComponent.jsx` | Contenuto esterno / mappe opzionali | Sì |
| EmailJS | presente tra dipendenze ma non rilevato come tracker automatico lato bootstrap | Nessun banner blocker rilevato dall'audit | No, salvo future integrazioni di tracking |

## Note operative

1. Il requisito di consenso non dipende dall'uso marketing: anche analytics e
   contenuti esterni possono richiederlo.
2. La conformità richiede coerenza tra codice, banner, policy e possibilità di
   revoca.
3. Se UniStays in futuro introduce advertising, pixel social, heatmaps o A/B
   testing di terza parte, questo audit va aggiornato.
