import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchStart,
  fetchSuccess,
  fetchError,
  resetQueryState,
  selectAppartamentiQueryState,
  setTotalCount,
} from "@/app/store/slices/appartamentiSlice";
import { FirestoreApartmentRepository } from "@/infrastructure/firebase/repositories/FirestoreApartmentRepository";
import { createApartmentsQueryKey } from "@/application/useCases/createApartmentsQueryKey";

const DEFAULT_PAGE_SIZE = 5;
const PROGRESSIVE_BATCH_MIN = 40;
const PROGRESSIVE_BATCH_MAX = 60;
const MAX_PROGRESSIVE_LOOPS = 120;

const toPositiveInt = (value, fallback) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return fallback;
  return Math.floor(numeric);
};

const clampNumber = (value, min, max) => {
  if (value < min) return min;
  if (value > max) return max;
  return value;
};

const resolveBatchSize = ({
  progressiveMode,
  pageSize,
  remainingNeeded,
  minBatchSize,
  maxBatchSize,
}) => {
  if (!progressiveMode) return pageSize;

  const target = Math.max(remainingNeeded, pageSize);
  return clampNumber(target, minBatchSize, maxBatchSize);
};

/**
 * Hook per fetchare apartamenti in base a query personalizzata.
 *
 * @param {Array|Object} customQuery - Array di constraints o oggetto query Firestore
 * @param {number} [pageSize=5] - Numero di apartamenti per pagina
 * @param {Object} [options={}] - Opzioni hook
 * @param {boolean} [options.progressiveMode=true] - Abilita il fetch progressivo
 * @param {Object} [options.queryScope="default"] - Scope della query
 * @param {function} [options.applyClientFilters=null] - Funzione per applicare filtri client-side
 *
 * @returns {Object} Oggetto con propriet`:
 *   appartamenti: array di apartamenti
 *   error: stringa di errore fetch
 *   loading: booleano che indica se il fetch è in corso
 *   allLoaded: booleano che indica se il fetch è giunto alla fine
 *   loadMore: funzione per caricare altri apartamenti
 *   refetch: funzione per ripetere il fetch da capo
 *   getTotalCount: funzione per ottenere il conteggio totale degli apartamenti
 */
export function useFetchAppartamenti(
  customQuery,
  pageSize = DEFAULT_PAGE_SIZE,
  options = {}
) {
  const [showLoading, setShowLoading] = useState(false);
  const dispatch = useDispatch();
  const requestSequenceByKeyRef = useRef({});

  const constraints = useMemo(
    () => (Array.isArray(customQuery) ? customQuery : []),
    [customQuery]
  );
  const safePageSize = useMemo(
    () => toPositiveInt(pageSize, DEFAULT_PAGE_SIZE),
    [pageSize]
  );
  const queryScope = options?.queryScope || "default";
  const applyClientFilters = useMemo(
    () =>
      typeof options?.applyClientFilters === "function"
        ? options.applyClientFilters
        : null,
    [options?.applyClientFilters]
  );
  const progressiveMode = options?.progressiveMode === true;
  const rawMinBatchSize = toPositiveInt(
    options?.progressiveBatchRange?.min,
    PROGRESSIVE_BATCH_MIN
  );
  const rawMaxBatchSize = toPositiveInt(
    options?.progressiveBatchRange?.max,
    PROGRESSIVE_BATCH_MAX
  );
  const progressiveBatchMin = Math.min(rawMinBatchSize, rawMaxBatchSize);
  const progressiveBatchMax = Math.max(rawMinBatchSize, rawMaxBatchSize);

  const queryKey = useMemo(
    () =>
      createApartmentsQueryKey({
        constraints,
        pageSize: safePageSize,
        scope: queryScope,
      }),
    [constraints, queryScope, safePageSize]
  );
  const hasValidQuery = constraints.length > 0;

  const queryState = useSelector((state) =>
    selectAppartamentiQueryState(state, queryKey)
  );
  const { loading, error, allLoaded, items, cursor, totalCount, hasFetched } =
    queryState;

  const createRequestToken = useCallback((key) => {
    const current = requestSequenceByKeyRef.current[key] || 0;
    const next = current + 1;
    requestSequenceByKeyRef.current[key] = next;
    return next;
  }, []);

  const isRequestStale = useCallback((key, token) => {
    return requestSequenceByKeyRef.current[key] !== token;
  }, []);

  const fetchPage = useCallback(
    async ({ reset = false } = {}) => {
      if (!hasValidQuery) return;
      if (!reset && (loading || allLoaded)) return;

      const requestToken = createRequestToken(queryKey);
      const requestKey = queryKey;

      dispatch(fetchStart({ queryKey }));

      try {
        const baseItems = reset ? [] : items;
        const existingIds = new Set(
          baseItems.map((item) => item?.id).filter(Boolean)
        );
        const targetCount = baseItems.length + safePageSize;
        const nuoviAppartamenti = [];
        let cursorToUse = reset ? null : cursor;
        let reachedEnd = reset ? false : allLoaded;
        let loopCount = 0;

        while (
          !reachedEnd &&
          baseItems.length + nuoviAppartamenti.length < targetCount
        ) {
          loopCount += 1;
          if (loopCount > MAX_PROGRESSIVE_LOOPS) {
            reachedEnd = true;
            break;
          }

          if (isRequestStale(requestKey, requestToken)) return;

          const remainingNeeded =
            targetCount - (baseItems.length + nuoviAppartamenti.length);
          const batchSize = resolveBatchSize({
            progressiveMode,
            pageSize: safePageSize,
            remainingNeeded,
            minBatchSize: progressiveBatchMin,
            maxBatchSize: progressiveBatchMax,
          });

          const { docs, cursor: nextCursor, snapshotLength } =
            await FirestoreApartmentRepository.fetchAppartamentiPage({
              constraints,
              pageSize: batchSize,
              cursor: cursorToUse,
            });

          if (isRequestStale(requestKey, requestToken)) return;

          cursorToUse = nextCursor;
          const filteredDocs = applyClientFilters
            ? applyClientFilters(docs)
            : docs;

          if (Array.isArray(filteredDocs) && filteredDocs.length > 0) {
            for (let index = 0; index < filteredDocs.length; index += 1) {
              const apartment = filteredDocs[index];
              const apartmentId = apartment?.id;

              if (!apartmentId || !existingIds.has(apartmentId)) {
                if (apartmentId) {
                  existingIds.add(apartmentId);
                }
                nuoviAppartamenti.push(apartment);
              }
            }
          }

          reachedEnd = snapshotLength === 0 || snapshotLength < batchSize;
          if (!progressiveMode) break;
        }

        if (isRequestStale(requestKey, requestToken)) return;

        dispatch(
          fetchSuccess({
            queryKey,
            nuoviAppartamenti,
            reset,
            cursor: cursorToUse,
            allLoaded: reachedEnd,
          })
        );
      } catch (err) {
        if (isRequestStale(requestKey, requestToken)) return;
        dispatch(
          fetchError({
            queryKey,
            error: err?.message || "Errore sconosciuto",
          })
        );
      }
    },
    [
      allLoaded,
      applyClientFilters,
      constraints,
      createRequestToken,
      cursor,
      dispatch,
      hasValidQuery,
      isRequestStale,
      items,
      loading,
      progressiveBatchMax,
      progressiveBatchMin,
      progressiveMode,
      queryKey,
      safePageSize,
    ]
  );

  // Primo fetch
  useEffect(() => {
    if (!hasValidQuery) return;
    if (hasFetched || loading || items.length > 0) return;
    void fetchPage({ reset: true });
  }, [fetchPage, hasFetched, hasValidQuery, items.length, loading]);

  useEffect(() => {
    if (!hasValidQuery) {
      setShowLoading(false);
    }
  }, [hasValidQuery]);

  // Gestione loading con delay
  useEffect(() => {
    let timer;
    if (loading) {
      timer = setTimeout(() => setShowLoading(true), 300);
    } else {
      setShowLoading(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [loading, queryKey]);

  const loadMore = useCallback(() => {
    if (!hasValidQuery || loading || allLoaded) {
      return;
    }
    void fetchPage();
  }, [allLoaded, fetchPage, hasValidQuery, loading]);

  const getTotalCount = useCallback(async () => {
    if (!hasValidQuery) return 0;
    if (typeof totalCount === "number") return totalCount;

    const count = await FirestoreApartmentRepository.countByConstraints(
      constraints
    );
    dispatch(setTotalCount({ queryKey, totalCount: count }));
    return count;
  }, [constraints, dispatch, hasValidQuery, queryKey, totalCount]);

  const refetch = useCallback(() => {
    if (!hasValidQuery) return;
    createRequestToken(queryKey);
    dispatch(resetQueryState({ queryKey }));
    void fetchPage({ reset: true });
  }, [createRequestToken, dispatch, fetchPage, hasValidQuery, queryKey]);

  return {
    appartamenti: items,
    error,
    loading: showLoading,
    allLoaded,
    loadMore, // per l'infinite scroll / bottone "carica altri"
    refetch,
    getTotalCount,
  };
}
