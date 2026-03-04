import { useState, useEffect } from "react";
import { FirestoreReviewRepository } from "@/infrastructure/firebase/repositories/FirestoreReviewRepository";

/**
 * Hook per il fetch delle recensioni di un appartamento
 * @param {string} apartmentId - ID dell'appartamento
 * @param {boolean} isVisible - Se il componente è visibile
 * @returns {Object} { recensioni, loading, error }
 */
export const useFetchRecensioni = (apartmentId, isVisible) => {
  const [recensioni, setRecensioni] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!apartmentId || !isVisible) return;

    try {
      setLoading(true);
      setError(null);

      const unsub = FirestoreReviewRepository.subscribeApartmentReviews(
        apartmentId,
        {
          onNext: (data) => {
            setRecensioni(data);
            setLoading(false);
          },
          onError: (err) => {
            console.error("Errore fetch recensioni:", err);
            setError(err.message);
            setRecensioni([]);
            setLoading(false);
          },
        }
      );

      return () => unsub();
    } catch (error) {
      console.error("Errore fetch recensioni:", error);
      setError(error.message);
      setRecensioni([]);
      setLoading(false);
    }
  }, [apartmentId, isVisible]);

  return { recensioni, loading, error };
};
