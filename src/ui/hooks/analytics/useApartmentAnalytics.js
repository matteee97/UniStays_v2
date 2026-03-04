import { useEffect, useMemo, useRef, useState } from "react";
import { FirestoreAnalyticsRepository } from "@/infrastructure/firebase/repositories/FirestoreAnalyticsRepository";
import {
  buildDateKeysRange,
  clampRangeDays,
  buildSeries,
  computeKpis,
  normalizeDailyDocs,
  validateConsistency,
} from "@/core/services/analytics/ApartmentAnalyticsDomain";
import { isValidFirestoreId } from "@/ui/helpers/validation";

const buildCacheKey = (apartmentId, rangeDays) => {
  if (!apartmentId || !Number.isFinite(rangeDays)) return "";
  return `${apartmentId}:${rangeDays}`;
};

export function useApartmentAnalytics(apartmentId, rangeDays, mode = "views") {
  const [dailyDocs, setDailyDocs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [dateKeys, setDateKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const safeMode =
    mode === "likes" || mode === "reviews" || mode === "views" || mode === "score"
      ? mode
      : "views";
  const safeRange = clampRangeDays(rangeDays, { min: 1, max: 30 });

  const requestIdRef = useRef(0);
  const prevModeRef = useRef(safeMode);
  const prevRequestRef = useRef({ apartmentId: null, range: null });
  const dailyCacheRef = useRef(new Map());
  const summaryCacheRef = useRef(new Map());

  useEffect(() => {
    const prevMode = prevModeRef.current;
    const previousRequest = prevRequestRef.current;
    const isSameRequest =
      previousRequest.apartmentId === apartmentId &&
      previousRequest.range === safeRange;

    prevModeRef.current = safeMode;
    prevRequestRef.current = { apartmentId, range: safeRange };

    if (safeMode === "score") {
      setDailyDocs([]);
      setSummary(null);
      setDateKeys([]);
      setLoading(false);
      setError(null);
      return;
    }

    if (!apartmentId || !isValidFirestoreId(apartmentId)) {
      setDailyDocs([]);
      setSummary(null);
      setDateKeys([]);
      setLoading(false);
      setError(null);
      return;
    }

    const nextDateKeys = buildDateKeysRange(safeRange);
    setDateKeys(nextDateKeys);

    if (isSameRequest && prevMode && prevMode !== "score") {
      return;
    }

    const cacheKey = buildCacheKey(apartmentId, safeRange);
    const hasDailyCache = dailyCacheRef.current.has(cacheKey);
    const hasSummaryCache = summaryCacheRef.current.has(apartmentId);
    const cachedDaily = hasDailyCache ? dailyCacheRef.current.get(cacheKey) : [];
    const cachedSummary = hasSummaryCache
      ? summaryCacheRef.current.get(apartmentId)
      : null;

    if (hasDailyCache) {
      setDailyDocs(cachedDaily);
    }
    if (hasSummaryCache) {
      setSummary(cachedSummary);
    }

    if (hasDailyCache && hasSummaryCache) {
      setLoading(false);
      setError(null);
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setLoading(true);
    setError(null);

    const startDateKey = nextDateKeys[0];
    const endDateKey = nextDateKeys[nextDateKeys.length - 1];

    const dailyPromise = hasDailyCache
      ? Promise.resolve(cachedDaily)
      : FirestoreAnalyticsRepository.getDailyRange(
          apartmentId,
          startDateKey,
          endDateKey
        );
    const summaryPromise = hasSummaryCache
      ? Promise.resolve(cachedSummary)
      : FirestoreAnalyticsRepository.getSummary(apartmentId);

    Promise.all([dailyPromise, summaryPromise])
      .then(([dailyData, summaryData]) => {
        if (requestIdRef.current !== requestId) return;
        dailyCacheRef.current.set(cacheKey, dailyData || []);
        summaryCacheRef.current.set(apartmentId, summaryData || null);
        setDailyDocs(dailyData || []);
        setSummary(summaryData || null);
      })
      .catch((err) => {
        if (requestIdRef.current !== requestId) return;
        setError(err?.message || "Errore nel recupero analytics.");
      })
      .finally(() => {
        if (requestIdRef.current !== requestId) return;
        setLoading(false);
      });
  }, [apartmentId, safeRange, safeMode]);

  const normalizedMap = useMemo(
    () => normalizeDailyDocs(dailyDocs),
    [dailyDocs]
  );

  const series = useMemo(
    () => buildSeries(safeMode, dateKeys, normalizedMap),
    [safeMode, dateKeys, normalizedMap]
  );

  const kpis = useMemo(
    () => computeKpis(safeMode, series, summary, normalizedMap),
    [safeMode, series, summary, normalizedMap]
  );

  const dailyRows = useMemo(
    () =>
      dateKeys.map((dateKey) => {
        const entry = normalizedMap[dateKey] || {};
        const reviewsAdded = entry.reviewsAdded ?? 0;
        const ratingSumDelta = entry.ratingSumDelta ?? 0;
        return {
          dateKey,
          views: entry.views ?? 0,
          likesDelta: entry.likesDelta ?? 0,
          reviewsAdded,
          ratingAvg: reviewsAdded > 0 ? ratingSumDelta / reviewsAdded : 0,
        };
      }),
    [dateKeys, normalizedMap]
  );

  const debugWarnings = useMemo(() => {
    if (!import.meta.env?.DEV) return [];
    return validateConsistency(series, kpis);
  }, [series, kpis]);

  return {
    loading,
    error,
    series,
    kpis,
    summary,
    dateKeys,
    dailyRows,
    debugWarnings,
  };
}
