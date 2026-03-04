import { useCallback, useEffect, useState } from "react";
import { FirestoreApartmentRepository } from "@/infrastructure/firebase/repositories/FirestoreApartmentRepository";

/**
 * Hook per fetchare tutti gli annunci non ancora verificati (checked !== true)
 */
export function useFetchUncheckedAnnunci() {
  const [annunci, setAnnunci] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchUncheckedAnnunci = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const pending = await FirestoreApartmentRepository.fetchPendingReview();
      setAnnunci(pending);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Errore nel fetch degli annunci non verificati:", err);
      setError(err.message || "Errore nel caricamento degli annunci");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUncheckedAnnunci();
  }, [fetchUncheckedAnnunci]);

  return { annunci, loading, error, refresh: fetchUncheckedAnnunci, lastUpdated };
}
