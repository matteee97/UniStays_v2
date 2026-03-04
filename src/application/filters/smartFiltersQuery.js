export const SMART_FILTER_QUERY_PARAM = "smart";

/**
 * Build query string used to transport smart filter prompts across pages.
 *
 * @param {string} prompt
 * @returns {string}
 */
export const buildSmartFiltersQuery = (prompt) => {
  const normalizedPrompt =
    typeof prompt === "string" ? prompt.trim() : "";
  if (!normalizedPrompt) return "";

  const params = new URLSearchParams();
  params.set(SMART_FILTER_QUERY_PARAM, normalizedPrompt);
  return `?${params.toString()}`;
};

/**
 * Extract the smart filter prompt from URL search params.
 *
 * @param {URLSearchParams | null | undefined} searchParams
 * @returns {string}
 */
export const getSmartFiltersPrompt = (searchParams) => {
  const raw =
    typeof searchParams?.get === "function"
      ? searchParams.get(SMART_FILTER_QUERY_PARAM)
      : "";

  return typeof raw === "string" ? raw.trim() : "";
};
