# Feature: Admin

## Accesso e permessi
L'accesso e' protetto da Clerk + Firebase custom claims (`role=admin`). Le route admin sono filtrate da `AdminRoute`.
File coinvolti: `src/ui/components/common/clerk/AdminRoute.jsx`, `src/ui/hooks/users/useIsAdmin.js`, `src/ui/hooks/auth/useFirebaseBridgeAuth.js`, `functions/src/modules/auth/authService.js`, `functions/src/modules/auth/registerAuthRoutes.js`, `src/app/router.jsx`

## Verifica annunci
Gli annunci in revisione vengono caricati, filtrati e verificati con update `status` (da `pending_review` a `published`). In caso di verifica o rifiuto, viene inviato un messaggio piattaforma al proprietario.
File coinvolti: `src/ui/pages/AdminPanel.jsx`, `src/ui/hooks/fetches/useFetchUncheckedAnnunci.js`, `src/ui/components/sections/adminSection/AdminAnnunciSection.jsx`, `src/infrastructure/firebase/adapters/platformMessages.js`, `src/infrastructure/firebase/adapters/annunci.js`, `functions/src/modules/apartments/apartmentsService.js`, `functions/src/modules/apartments/registerApartmentRoutes.js`

## Segnalazioni
Le segnalazioni sono create dal form contatti tramite backend (`POST /v1/reports`) e gestite nel pannello admin solo via API backend.

Target supportati in creazione:
- `apartment`
- `review`
- `message`
- `user`

La route legacy `POST /v1/reports/apartments/:apartmentId` resta disponibile per retrocompatibilita.

Flusso moderazione:
- Lista con filtri server-side: `GET /v1/admin/reports`
- Dettaglio con contesto utente/annuncio: `GET /v1/admin/reports/:reportId`
- Aggiornamenti strutturati (status, severity, note, resolution): `PATCH /v1/admin/reports/:reportId`
- Azioni rapide (`start_review`, `resolve`, `reject`, `reopen`, `escalate`, `remove_apartment`): `POST /v1/admin/reports/:reportId/actions`
- In entrambi gli endpoint di moderazione (`PATCH` e `actions`) l'admin puo' opzionalmente passare `notifications.reporter` e/o `notifications.target` con `enabled`, `message`, `type` per inviare messaggi piattaforma personalizzati.

Le quick actions sono persistenti (niente stato locale), e la rimozione annuncio da segnalazione riusa la stessa logica backend della moderazione annunci.
Durante la moderazione, il backend riallinea anche i contatori:
- host `usersPublic.publicStats.reportsCount` (segnalazioni aperte),
- host `usersPublic.publicStats.resolvedReportsCount` (segnalazioni risolte),
- host `usersPrivate.reportsCount` (uso interno),
- appartamento `metrics.totalReports` (segnalazioni aperte sul singolo annuncio).
- reporter `usersPrivate.reportsCreatedCount` (totale segnalazioni inviate),
- reporter `usersPrivate.lastReportCreatedAt` (ultimo invio),
- reporter rate-window `usersPrivate.reportRateWindowStartedAt` + `usersPrivate.reportRateWindowCount` (anti-spam 24h).

File coinvolti: `functions/src/modules/reports/registerReportRoutes.js`, `functions/src/modules/reports/reportsService.js`, `functions/src/modules/platform/platformService.js`, `functions/utils/reportPatch.js`, `src/infrastructure/firebase/repositories/FirestoreReportRepository.js`, `src/ui/hooks/fetches/useFetchSegnalazioni.js`, `src/ui/components/sections/adminSection/AdminSegnalazioniSection.jsx`, `src/ui/hooks/forms/useContactForm.js`, `src/shared/constants/reports.js`

## Gestione citta
Gli admin possono creare/modificare/eliminare citta e ricalcolare i conteggi degli annunci associati.
File coinvolti: `src/ui/components/sections/adminSection/AdminCitiesSection.jsx`, `src/infrastructure/firebase/repositories/FirestoreCityRepository.js`, `src/ui/hooks/fetches/useCities.js`, `functions/src/modules/cities/citiesService.js`, `functions/src/modules/cities/registerAdminCityRoutes.js`

## Lookup utenti e snapshot
Ricerca utenti per ID con dati combinati (public+private) e export di snapshot JSON dal pannello.
File coinvolti: `src/ui/components/sections/adminSection/AdminUserLookupSection.jsx`, `src/ui/hooks/fetches/fetchUserData.js`, `src/ui/pages/AdminPanel.jsx`
