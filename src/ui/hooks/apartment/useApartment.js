import { useEffect, useState } from "react";
import { FirestoreApartmentRepository } from "@/infrastructure/firebase/repositories/FirestoreApartmentRepository";
import { isValidFirestoreId } from "@/ui/helpers/validation";

export function useApartment(apartmentId) {
  const [apartment, setApartment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    if (!apartmentId || !isValidFirestoreId(apartmentId)) {
      setApartment(null);
      setError(null);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    setError(null);

    FirestoreApartmentRepository.getById(apartmentId)
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setApartment(null);
          setError({ code: "not-found" });
          return;
        }
        setApartment(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setApartment(null);
        setError(err);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [apartmentId]);

  return { apartment, loading, error };
}
