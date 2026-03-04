import { useState, useEffect } from "react";
import { FirestoreReviewRepository } from "@/infrastructure/firebase/repositories/FirestoreReviewRepository";
import { USER_ROLES } from "@/shared/types";

/**
 * Hook per il fetch di tutte le recensioni degli appartamenti di un host
 * @param {string} hostId - ID dell'host
 * @param {Array} apartments - Array degli appartamenti dell'host
 * @param {boolean} isVisible - Se il componente è visibile
 * @returns {Object} { reviews, loading, error }
 */
export const useHostReviews = (hostId, apartments = [], isVisible = true) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isVisible || !hostId || apartments.length === 0) {
      setReviews([]);
      return;
    }

    const fetchHostReviews = async () => {
      try {
        setLoading(true);
        setError(null);

        const apartmentIds = apartments.map((apt) => apt.id);
        const allReviews = await FirestoreReviewRepository.fetchHostReviews(
          apartmentIds
        );
        setReviews(allReviews);
      } catch (error) {
        console.error("Errore fetch recensioni "+USER_ROLES.HOST+": ", error);
        setError(error.message);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHostReviews();
  }, [hostId, apartments, isVisible]);

  return { reviews, loading, error };
};
