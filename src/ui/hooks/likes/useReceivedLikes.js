import { useCallback, useEffect, useRef, useState } from "react";
import { FirestoreLikesRepository } from "@/infrastructure/firebase/repositories/FirestoreLikesRepository";

const DEFAULT_LIMIT = 40;
const DEFAULT_REFRESH_INTERVAL_MS = 45_000;

/**
 * Recupera i like ricevuti sugli annunci dell'host autenticato.
 */
export function useReceivedLikes({
  enabled = true,
  limit = DEFAULT_LIMIT,
  refreshIntervalMs = DEFAULT_REFRESH_INTERVAL_MS,
} = {}) {
  const isMountedRef = useRef(false);
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLikes = useCallback(
    async ({ silent = false } = {}) => {
      if (!enabled) {
        setLikes([]);
        setError(null);
        setLoading(false);
        return;
      }

      if (!silent) {
        setLoading(true);
      }

      try {
        const payload = await FirestoreLikesRepository.listReceivedLikes({
          limit,
        });
        if (!isMountedRef.current) return;
        setLikes(payload.likes || []);
        setError(null);
      } catch (err) {
        if (!isMountedRef.current) return;
        setError(err?.message || "Errore nel caricamento dei like ricevuti.");
      } finally {
        if (!silent && isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [enabled, limit]
  );

  useEffect(() => {
    isMountedRef.current = true;
    fetchLikes();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchLikes]);

  useEffect(() => {
    if (!enabled || !Number.isFinite(refreshIntervalMs) || refreshIntervalMs <= 0) {
      return () => {};
    }

    const timerId = window.setInterval(() => {
      fetchLikes({ silent: true });
    }, refreshIntervalMs);

    return () => {
      window.clearInterval(timerId);
    };
  }, [enabled, refreshIntervalMs, fetchLikes]);

  return {
    likes,
    loading,
    error,
    hasLikes: likes.length > 0,
    refreshLikes: fetchLikes,
  };
}
