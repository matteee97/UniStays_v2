import { useEffect, useState } from "react";
import { FirestoreFavoritesRepository } from "@/infrastructure/firebase/repositories/FirestoreFavoritesRepository";
import { isValidFirestoreId } from "@/ui/helpers/validation";

export function useApartmentLiked(apartmentId, userId) {
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (
      !apartmentId ||
      !isValidFirestoreId(apartmentId) ||
      !userId ||
      !isValidFirestoreId(userId)
    ) {
      setLiked(false);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);

    FirestoreFavoritesRepository.isFavorite(userId, apartmentId)
      .then((isFav) => {
        if (cancelled) return;
        setLiked(isFav);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Errore nel controllo preferito:", err);
        setLiked(false);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [apartmentId, userId]);

  return { liked, setLiked, loading };
}
