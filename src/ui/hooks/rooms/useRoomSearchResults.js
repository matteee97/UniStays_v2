import { useEffect, useState } from "react";
import { FirestoreCandidateRoomSearchRepository } from "@/infrastructure/firebase/repositories/FirestoreCandidateRoomSearchRepository";

export default function useRoomSearchResults({
  enabled = false,
  candidateApartments = [],
  filters = null,
  cityCoords = null,
  repository = FirestoreCandidateRoomSearchRepository,
}) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    if (!enabled) {
      setRooms([]);
      setLoading(false);
      setError(null);
      return () => {
        cancelled = true;
      };
    }

    if (!candidateApartments.length) {
      setRooms([]);
      setLoading(false);
      setError(null);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    setError(null);

    repository
      .search({ candidateApartments, filters, cityCoords })
      .then((results) => {
        if (cancelled) return;
        setRooms(Array.isArray(results) ? results : []);
      })
      .catch((err) => {
        if (cancelled) return;
        setRooms([]);
        setError(err?.message || "Errore nella ricerca stanze.");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [candidateApartments, cityCoords, enabled, filters, repository]);

  return { rooms, loading, error };
}
