import { useMemo } from "react";

const normalizePositiveInt = (value, fallbackValue) => {
  if (!Number.isFinite(value)) return fallbackValue;
  const rounded = Math.floor(value);
  return rounded > 0 ? rounded : fallbackValue;
};

/**
 * Compute paginated slices in a reusable and deterministic way.
 *
 * @param {object} params
 * @param {Array} [params.items=[]]
 * @param {number} [params.page=1]
 * @param {number} [params.pageSize=1]
 * @returns {{startIndex: number, endIndex: number, pageItems: Array}}
 */
export const usePaginationSlice = ({ items = [], page = 1, pageSize = 1 }) => {
  const safePage = normalizePositiveInt(page, 1);
  const safePageSize = normalizePositiveInt(pageSize, 1);

  const startIndex = useMemo(
    () => (safePage - 1) * safePageSize,
    [safePage, safePageSize]
  );
  const endIndex = useMemo(
    () => startIndex + safePageSize,
    [startIndex, safePageSize]
  );
  const pageItems = useMemo(
    () => items.slice(startIndex, endIndex),
    [items, startIndex, endIndex]
  );

  return {
    startIndex,
    endIndex,
    pageItems,
  };
};
