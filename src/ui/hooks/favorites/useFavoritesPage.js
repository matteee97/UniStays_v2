import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useFavoriteApartments, useNavigateToCity } from "../index";

/**
 * Hook personalizzato per gestire la logica della pagina preferiti
 * @returns {Object} Oggetto con tutti i dati e metodi necessari
 */
export default function useFavoritesPage() {
  const { favorites, loading } = useFavoriteApartments();
  const selectedCity = useSelector((state) => state.city.selectedCity);
  const goTo = useNavigateToCity();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handle search navigation
  const handleSearch = () => {
    if (!selectedCity) return;
    goTo(selectedCity);
  };

  // Calculate statistics
  const stats = {
    averagePrice: favorites.length > 0
      ? Math.round(
          favorites.reduce(
            (sum, apt) => sum + (Number(apt.aggregates?.minRoomPrice) || 0),
            0
          ) /
            favorites.length
        )
      : 0,
    uniqueCities: new Set(
      favorites
        .map((apt) => apt.address?.city)
        .filter(Boolean)
    ).size
  };

  return {
    // Data
    favorites,
    loading,
    selectedCity,
    stats,
    
    // Methods
    handleSearch,
    
    // Computed
    hasFavorites: favorites.length > 0,
    isEmpty: !loading && favorites.length === 0
  };
}
