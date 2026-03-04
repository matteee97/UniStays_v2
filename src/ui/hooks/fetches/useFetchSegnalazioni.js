import { useCallback, useEffect, useState } from "react";
import { FirestoreReportRepository } from "@/infrastructure/firebase/repositories/FirestoreReportRepository";

/**
 * Hook per fetchare tutte le segnalazioni admin via backend API.
 * Struttura report: { target, reporterId, reason, message, status, priority, severity, moderation, resolution, createdAt, updatedAt }
 */
export function useFetchSegnalazioni() {
  const [segnalazioni, setSegnalazioni] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchSegnalazioni = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { reports, summary: summaryData } =
        await FirestoreReportRepository.fetchAdminList();
      setSegnalazioni(reports);
      setSummary(summaryData || null);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Errore nel fetch delle segnalazioni:", err);
      setError(err.message || "Errore nel caricamento delle segnalazioni");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSegnalazioni();
  }, [fetchSegnalazioni]);

  return {
    segnalazioni,
    summary,
    loading,
    error,
    refresh: fetchSegnalazioni,
    lastUpdated,
  };
}
