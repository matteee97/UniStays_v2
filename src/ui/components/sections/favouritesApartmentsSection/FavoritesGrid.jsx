import React from "react";
import FavoriteApartmentCard from "./FavoriteApartmentCard";
import WhiteContainer from "@/ui/components/common/containers/WhiteContainer";
import FavoritesStats from "./FavoritesStats";
import OneTimeMessage from "@/ui/components/common/messages/OneTimeMessage";

/**
 * Componente per la griglia dei preferiti
 * @param {Object} props
 * @param {Array} props.favorites - Array dei preferiti
 * @param {Function} props.onFavoriteRemove - Callback quando un preferito viene rimosso
 * @param {string} props.gridClassName - Classi CSS per la griglia
 * @param {string} props.containerClassName - Classi CSS per il container
 * @param {Object} props.cardProps - Props aggiuntive per le card
 */
export default function FavoritesGrid({
  favorites = [],
  onFavoriteRemove,
  gridClassName = "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  containerClassName = "max-w-7xl mx-auto px-6 py-8",
  cardProps = {},
  oneTimeMessage,
}) {
  if (!favorites || favorites.length === 0) {
    return (
      <div className={containerClassName}>
        <div className="text-center py-12">
          <WhiteContainer className="p-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Nessun preferito da visualizzare
            </h3>
            <p className="text-gray-500">
              Inizia a salvare gli annunci che ti interessano!
            </p>
          </WhiteContainer>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      {/* Grid Header */}
      <div className="mb-8">
        <FavoritesStats favorites={favorites} />
      </div>

      <OneTimeMessage
        message={oneTimeMessage}
        title={"Suggerimento"}
        localStorageKey={"howToUseFavouritesPage-tip"}
      />

      {/* Favorites Grid */}
      <div className={gridClassName}>
        {favorites.map((apartment) => (
          <FavoriteApartmentCard
            key={apartment.id}
            apartment={apartment}
            {...cardProps}
          />
        ))}
      </div>
    </div>
  );
}
