import React from "react";
import {
  FavoritesEmptyState,
  FavoritesGrid,
  FavoritesLayout,
} from "@/ui/components/sections/favouritesApartmentsSection";
import { useFavoritesPage } from "@/ui/hooks";
import { LoadingIcon } from "@/ui/components/common";

/**
 * Pagina principale dei preferiti
 * Utilizza componenti modulari e riutilizzabili per una migliore manutenibilità
 */
export default function FavoritesPage() {
  const { favorites, loading, handleSearch, isEmpty } = useFavoritesPage();

  // Loading state
  if (loading) {
    return (
      <FavoritesLayout
        title="Caricando preferiti | Alloggi Universitari"
        description="Caricando i tuoi preferiti..."
      >
        <LoadingIcon />
      </FavoritesLayout>
    );
  }

  // Empty state
  if (isEmpty) {
    return (
      <FavoritesLayout>
        <FavoritesEmptyState
          onSearch={handleSearch}
          oneTimeMessage={
            "I tuoi appartamenti preferiti appariranno qui. Salva gli annunci che ti interessano cliccando sul cuore per tenerli sempre a portata di mano!"
          }
        />
      </FavoritesLayout>
    );
  }

  // Main content with favorites
  return (
    <FavoritesLayout>
      {/* Favorites Grid */}
      <FavoritesGrid
        favorites={favorites}
        oneTimeMessage={
          "I tuoi appartamenti preferiti sono qui. Salva o rimuovi gli annunci che ti interessano cliccando sul cuore."
        }
      />
    </FavoritesLayout>
  );
}
