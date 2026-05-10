export const SEARCH_MODES = Object.freeze({
  APARTMENTS: "apartments",
  ROOMS: "rooms",
});

const SEARCH_MODE_QUERY_KEY = "mode";

export const normalizeSearchMode = (value) =>
  value === SEARCH_MODES.ROOMS ? SEARCH_MODES.ROOMS : SEARCH_MODES.APARTMENTS;

/**
 * Reads the listing mode from URLSearchParams.
 *
 * @param {URLSearchParams | null | undefined} searchParams
 * @returns {"apartments" | "rooms"}
 */
export const getSearchModeFromSearchParams = (searchParams) => {
  const value =
    typeof searchParams?.get === "function"
      ? searchParams.get(SEARCH_MODE_QUERY_KEY)
      : null;
  return normalizeSearchMode(value);
};

/**
 * Reads the listing mode only when the URL explicitly carries the query key.
 *
 * This lets UI controls keep their local mode while navigating through routes
 * that intentionally omit the default apartments query parameter.
 *
 * @param {URLSearchParams | null | undefined} searchParams
 * @returns {"apartments" | "rooms" | null}
 */
export const getExplicitSearchModeFromSearchParams = (searchParams) => {
  if (
    typeof searchParams?.has !== "function" ||
    !searchParams.has(SEARCH_MODE_QUERY_KEY)
  ) {
    return null;
  }

  return normalizeSearchMode(searchParams.get(SEARCH_MODE_QUERY_KEY));
};

/**
 * Adds the search mode to an existing query string. The default apartments mode
 * is omitted so existing alloggi URLs stay clean and backwards compatible.
 *
 * @param {string} queryString
 * @param {"apartments" | "rooms"} mode
 * @returns {string}
 */
export const withSearchModeQuery = (queryString = "", mode) => {
  const normalizedMode = normalizeSearchMode(mode);
  const params = new URLSearchParams(
    queryString.startsWith("?") ? queryString.slice(1) : queryString,
  );

  if (normalizedMode === SEARCH_MODES.ROOMS) {
    params.set(SEARCH_MODE_QUERY_KEY, SEARCH_MODES.ROOMS);
  } else {
    params.delete(SEARCH_MODE_QUERY_KEY);
  }

  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
};
