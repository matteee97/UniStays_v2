import { useEffect, useState } from "react";
import { isValidFirestoreId } from "@/ui/helpers/validation";
import { FirestoreOccupantRepository } from "@/infrastructure/firebase/repositories/FirestoreOccupantRepository";

export function useFetchApartmentOccupants(apartmentId, enabled = true) {
  const validApartmentId = isValidFirestoreId(apartmentId)
    ? apartmentId
    : null;
  const [occupants, setOccupants] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!validApartmentId || !enabled) {
      setOccupants([]);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);

    FirestoreOccupantRepository.listPublicByApartmentId(validApartmentId)
      .then((occupantRows) => {
        if (cancelled) return;
        setOccupants(Array.isArray(occupantRows) ? occupantRows : []);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Errore nel fetch dei coinquilini:", error);
        setOccupants([]);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [validApartmentId, enabled]);

  return { occupants, loading };
}
