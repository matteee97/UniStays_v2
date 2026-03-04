# Favorites Section Components

Questa sezione contiene tutti i componenti modulari e riutilizzabili per la gestione dei preferiti.

## Componenti Principali

### `FavoritesLayout`

Layout principale che gestisce SEO e struttura della pagina.

**Props:**

- `children`: Contenuto della pagina
- `title`: Titolo per SEO
- `description`: Descrizione per SEO
- `url`: URL della pagina

### `FavoritesEmptyState`

Componente per lo stato vuoto quando non ci sono preferiti.

**Props:**

- `onSearch`: Callback per la ricerca
- `selectedCity`: Città selezionata
- `title`: Titolo personalizzabile
- `description`: Descrizione personalizzabile
- `homeButtonText`: Testo del bottone home
- `searchButtonText`: Testo del bottone ricerca
- `className`: Classi CSS aggiuntive

### `FavoritesGrid`

Griglia per visualizzare i preferiti.

**Props:**

- `favorites`: Array dei preferiti
- `onFavoriteRemove`: Callback per rimozione preferito
- `gridClassName`: Classi CSS per la griglia
- `containerClassName`: Classi CSS per il container
- `cardProps`: Props aggiuntive per le card

### `FavoritesInfoSection`

Sezione informativa con suggerimenti.

**Props:**

- `title`: Titolo della sezione
- `description`: Descrizione
- `icon`: Icona emoji
- `className`: Classi CSS aggiuntive
- `children`: Contenuto aggiuntivo

### `FavoritesLoadingState`

Stato di caricamento.

**Props:**

- `message`: Messaggio di caricamento
- `className`: Classi CSS aggiuntive

## Hook Personalizzato

### `useFavoritesPage`

Hook che gestisce tutta la logica della pagina preferiti.

**Returns:**

- `favorites`: Array dei preferiti
- `loading`: Stato di caricamento
- `stats`: Statistiche calcolate
- `handleSearch`: Funzione per la ricerca
- `hasFavorites`: Boolean se ci sono preferiti
- `isEmpty`: Boolean se è vuoto

## Principi di Design

1. **Modularità**: Ogni componente ha una responsabilità specifica
2. **Riutilizzabilità**: Componenti flessibili con props personalizzabili
3. **Separazione delle responsabilità**: Logica separata dalla UI
4. **Type Safety**: Props ben documentate con JSDoc
5. **Accessibilità**: Aria-labels e struttura semantica
6. **Responsive Design**: Ottimizzato per tutti i dispositivi

## Esempio di Utilizzo

```jsx
import { useFavoritesPage } from "../hooks";
import {
  FavoritesLayout,
  FavoritesEmptyState,
  FavoritesGrid,
  FavoritesInfoSection,
} from "../components/sections/favouritesApartmentsSection";

export default function FavoritesPage() {
  const { favorites, loading, handleSearch, isEmpty } = useFavoritesPage();

  if (loading) return <Loading />;
  if (isEmpty) return <FavoritesEmptyState onSearch={handleSearch} />;

  return (
    <FavoritesLayout>
      <FavoritesGrid favorites={favorites} />
      <FavoritesInfoSection />
    </FavoritesLayout>
  );
}
```
