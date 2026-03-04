import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { FirestoreApartmentRepository } from "@/infrastructure/firebase/repositories/FirestoreApartmentRepository";
import { FirestoreFavoritesRepository } from "@/infrastructure/firebase/repositories/FirestoreFavoritesRepository";

export default function useFavoriteApartments() {
  const { user } = useUser();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const prevFavIdsRef = useRef([]);

  useEffect(() => {
    if (!user?.id) {
      setFavorites([]);
      setLoading(false);
      prevFavIdsRef.current = [];
      return;
    }

    setLoading(true);

    const unsubscribe = FirestoreFavoritesRepository.subscribeFavoriteIds(
      user.id,
      {
        onNext: async (favIds) => {
          if (favIds.length === 0) {
            setFavorites([]);
            prevFavIdsRef.current = [];
            setLoading(false);
            return;
          }

          const favIdsStr = JSON.stringify(favIds);
          const prevFavIdsStr = JSON.stringify(prevFavIdsRef.current);
          if (favIdsStr === prevFavIdsStr) {
            setLoading(false);
            return;
          }

          const results = await Promise.all(
            favIds.map(async (id) => {
              try {
                const apartment =
                  await FirestoreApartmentRepository.getById(id);
                if (!apartment) return null;

                return {
                  id: apartment.id,
                  title: apartment?.title || "Senza titolo",
                  apartmentPhotoUrls: apartment?.apartmentPhotoUrls || [],
                  aggregates: apartment?.aggregates || null,
                  address: apartment?.address || {},
                  status: apartment?.status ?? null,
                  isFeatured: apartment?.isFeatured ?? false,
                };
              } catch (err) {
                console.error("Errore recupero annuncio:", err);
                return null;
              }
            })
          );

          const filtered = results.filter(Boolean);
          prevFavIdsRef.current = favIds;
          setFavorites(filtered);
          setLoading(false);
        },
        onError: (err) => {
          console.error("Errore nel recupero dei preferiti:", err);
          setFavorites([]);
          prevFavIdsRef.current = [];
          setLoading(false);
        },
      }
    );

    return () => unsubscribe();
  }, [user?.id]);

  return { favorites, loading };
}
