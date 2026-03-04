# Feature: Apartment score (ranking annunci)

## Scopo

Lo score e' un indice numerico usato per ordinare gli annunci (ranking) e per mostrare una metrica sintetica nella dashboard host.
Lo score e' salvato in `apartments/{id}.metrics.score`.
File coinvolti: `functions/index.js`, `src/core/services/analytics/ApartmentScoreCalculator.js`, `src/infrastructure/firebase/queries/apartmentQueries.js`

## Formula dello score

Formula completa (con pesi default):

```txt
score = clamp(
  base(meta) +
  0.6 * ln(1 + totalViews) +
  2.4 * ln(1 + likesCount) +
  3.2 * ln(1 + reviewsCount) +
  6.0 * ratingQuality(ratingSum, ratingCount) -
  8.0 * totalReports
)

base(meta) =
  (isFeatured ? 12.0 : 0) +
  (isPublished ? 2.0 : -12.0)

ratingQuality(ratingSum, ratingCount) =
  ratingCount <= 0
    ? 0
    : (clamp(ratingSum / ratingCount, 0, 5) / 5) * ln(1 + ratingCount)
```

`clamp` forza un minimo pari a `0`, quindi lo score non va mai in negativo.
File coinvolti: `functions/index.js`, `src/core/services/analytics/ApartmentScoreCalculator.js`

## Pesi default

- `views`: `0.6`
- `likes`: `2.4`
- `reviews`: `3.2`
- `rating`: `6.0`
- `reports`: `8.0`
- `featuredBoost`: `12.0`
- `publishedBoost`: `2.0`
- `unpublishedPenalty`: `12.0`

File coinvolti: `functions/index.js`, `src/core/services/analytics/ApartmentScoreCalculator.js`

## Normalizzazione delle metriche

Prima del calcolo, i dati vengono normalizzati:

- `likesCount` usa `metrics.likesCount`, fallback `metrics.totalFavorites`.
- `reviewsCount` usa `metrics.reviewsCount`, fallback `metrics.ratingCount`.
- `ratingCount` usa `metrics.ratingCount`, fallback `reviewsCount`.
- `ratingSum` usa `metrics.ratingSum`; se assente, fallback `ratingAvg * ratingCount`.
- I contatori vengono forzati a `>= 0`.

Questo evita errori su documenti legacy o incompleti.
File coinvolti: `functions/index.js`, `src/core/services/analytics/ApartmentScoreCalculator.js`

## Quando viene aggiornato lo score

### Inizializzazione annuncio

Alla creazione annuncio, `metrics.score` parte da `null` e gli altri contatori da `0`.
File coinvolti: `functions/index.js`

### Eventi analytics

L'endpoint `POST /v1/analytics/events` gestisce eventi:

- `view`
- `like` (`delta` `+1` o `-1`)
- `review` (`added` e opzionale `rating`)

Ogni evento viene applicato in transazione e aggiorna anche `metrics.score` tramite `calculateNextScore`.
File coinvolti: `functions/index.js`, `src/infrastructure/firebase/analytics/ApartmentAnalyticsService.js`

### Calcolo incrementale

`calculateNextScore` usa due strategie:

- Se `prevScore` non e' valido: ricalcolo completo con `calculateApartmentScore`.
- Se `prevScore` e' valido: calcolo delta solo sulle metriche cambiate e somma a `prevScore`.

Questo riduce il lavoro per aggiornamenti frequenti (view/like/review).
File coinvolti: `functions/index.js`, `src/core/services/analytics/ApartmentScoreCalculator.js`

## Dove viene usato

- Ordinamento annunci nelle query Firestore: `orderBy("metrics.score", "desc")`.
- Ranking e overview analytics host.
- Fallback client: se `metrics.score` e' assente, viene ricalcolato lato client con la stessa formula.

File coinvolti: `src/infrastructure/firebase/queries/apartmentQueries.js`, `src/core/services/analytics/ApartmentAnalyticsOverview.js`, `src/core/services/analytics/ApartmentScoreCalculator.js`

## Nota implementativa (stato attuale)

L'endpoint `POST /v1/reports` (target `apartment/review/message` con apartment associato) incrementa `metrics.totalReports`, ma non ricalcola `metrics.score` nella stessa transazione.
La penalita' report entra quindi nel valore di score al successivo ricalcolo (es. evento analytics successivo o fallback di calcolo lato client).
File coinvolti: `functions/index.js`
