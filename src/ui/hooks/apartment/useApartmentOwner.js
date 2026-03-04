import { useEffect, useState } from "react";
import { FirestoreUserRepository } from "@/infrastructure/firebase/repositories/FirestoreUserRepository";
import { isValidFirestoreId } from "@/ui/helpers/validation";

export function useApartmentOwner(ownerId, fallbackSnapshot) {
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    if (!ownerId || !isValidFirestoreId(ownerId)) {
      const fallback = fallbackSnapshot || null;
      setOwner(ownerId ? { ...(fallback || {}), userId: ownerId } : fallback);
      setError(null);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    setError(null);

    FirestoreUserRepository.getPublicById(ownerId, { allowMissing: true })
      .then((data) => {
        if (cancelled) return;
        const fallback = fallbackSnapshot || {};
        const merged = data
          ? { ...fallback, ...data, userId: ownerId }
          : { ...fallback, userId: ownerId };
        setOwner(merged);
      })
      .catch((err) => {
        if (cancelled) return;
        const fallback = fallbackSnapshot || {};
        setOwner({ ...fallback, userId: ownerId });
        setError(err);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [ownerId, fallbackSnapshot]);

  return { owner, loading, error };
}
