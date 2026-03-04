import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { FirestoreFavoritesRepository } from "@/infrastructure/firebase/repositories/FirestoreFavoritesRepository";

export default function useFavoriteIds() {
  const { user } = useUser();
  const [favorites, setFavorites] = useState(() => new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setFavorites(new Set());
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = FirestoreFavoritesRepository.subscribeFavoriteIds(
      user.id,
      {
        onNext: async (favIds) => {
          if (favIds.length === 0) {
            setFavorites(new Set());
            setLoading(false);
            return;
          }
          setFavorites(new Set(favIds));
          setLoading(false);
        },
        onError: (err) => {
          console.error("Errore nel recupero dei preferiti:", err);
          setFavorites(new Set());
          setLoading(false);
        },
      }
    );

    return () => unsubscribe();
  }, [user?.id]);

  return { favorites, loading };
}