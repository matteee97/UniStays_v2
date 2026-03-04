import { createSlice } from "@reduxjs/toolkit";

const MAX_QUERIES_IN_MEMORY = 12;

const createQueryState = () => ({
  items: [],
  cursor: null,
  loading: false,
  error: null,
  allLoaded: false,
  totalCount: null,
  hasFetched: false,
});

const initialState = {
  byQueryKey: {},
  lru: [],
  maxQueriesInMemory: MAX_QUERIES_IN_MEMORY,
};

const EMPTY_QUERY_STATE = Object.freeze(createQueryState());

const getQueryKey = (payload) =>
  payload && typeof payload.queryKey === "string" && payload.queryKey.length > 0
    ? payload.queryKey
    : null;

const ensureQueryState = (state, queryKey) => {
  if (!queryKey) return null;
  if (!state.byQueryKey[queryKey]) {
    state.byQueryKey[queryKey] = createQueryState();
  }
  return state.byQueryKey[queryKey];
};

const touchQuery = (state, queryKey) => {
  if (!queryKey) return;

  state.lru = state.lru.filter((key) => key !== queryKey);
  state.lru.push(queryKey);

  while (state.lru.length > state.maxQueriesInMemory) {
    const staleKey = state.lru.shift();
    if (!staleKey) break;
    delete state.byQueryKey[staleKey];
  }
};

const appendUniqueItems = (currentItems = [], incomingItems = []) => {
  if (!Array.isArray(incomingItems) || incomingItems.length === 0) {
    return currentItems;
  }

  const existingIds = new Set(currentItems.map((item) => item?.id).filter(Boolean));
  const uniqueIncoming = incomingItems.filter(
    (item) => !item?.id || !existingIds.has(item.id)
  );

  return [...currentItems, ...uniqueIncoming];
};

const appartamentiSlice = createSlice({
  name: "appartamenti",
  initialState,
  reducers: {
    fetchStart: (state, action) => {
      const queryKey = getQueryKey(action.payload);
      const queryState = ensureQueryState(state, queryKey);
      if (!queryState) return;

      queryState.loading = true;
      queryState.error = null;
      touchQuery(state, queryKey);
    },
    fetchSuccess: (state, action) => {
      const queryKey = getQueryKey(action.payload);
      const queryState = ensureQueryState(state, queryKey);
      if (!queryState) return;

      const {
        nuoviAppartamenti = [],
        snapshotLength = 0,
        limitUsed = 0,
        cursor = null,
        reset = false,
        allLoaded,
      } = action.payload || {};

      const startingItems = reset ? [] : queryState.items;
      queryState.items = appendUniqueItems(startingItems, nuoviAppartamenti);
      queryState.cursor = cursor;
      queryState.allLoaded =
        typeof allLoaded === "boolean"
          ? allLoaded
          : snapshotLength === 0 || snapshotLength < limitUsed;
      queryState.loading = false;
      queryState.error = null;
      queryState.hasFetched = true;

      touchQuery(state, queryKey);
    },
    fetchError: (state, action) => {
      const queryKey = getQueryKey(action.payload);
      const queryState = ensureQueryState(state, queryKey);
      if (!queryState) return;

      queryState.loading = false;
      queryState.error = action.payload?.error || "Errore sconosciuto";
      queryState.hasFetched = true;

      touchQuery(state, queryKey);
    },
    resetQueryState: (state, action) => {
      const queryKey = getQueryKey(action.payload);
      if (!queryKey) return;

      state.byQueryKey[queryKey] = createQueryState();
      touchQuery(state, queryKey);
    },
    setTotalCount: (state, action) => {
      const queryKey = getQueryKey(action.payload);
      const queryState = ensureQueryState(state, queryKey);
      if (!queryState) return;

      const incomingCount = action.payload?.totalCount;
      queryState.totalCount =
        typeof incomingCount === "number" && Number.isFinite(incomingCount)
          ? incomingCount
          : null;
      touchQuery(state, queryKey);
    },
  },
});

export const { fetchStart, fetchSuccess, fetchError, resetQueryState, setTotalCount } =
  appartamentiSlice.actions;

export const selectAppartamentiQueryState = (state, queryKey) => {
  if (!queryKey) return EMPTY_QUERY_STATE;
  return state?.appartamenti?.byQueryKey?.[queryKey] || EMPTY_QUERY_STATE;
};

export const selectAppartamentiByQueryKey = (state, queryKey) =>
  selectAppartamentiQueryState(state, queryKey).items;

export default appartamentiSlice.reducer;
