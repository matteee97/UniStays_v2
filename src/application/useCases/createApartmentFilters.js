import {
  hasActiveApartmentFilters,
  normalizeApartmentFilters,
} from "@/application/filters/apartmentFilters";

/**
 * Factory to create apartment filter payload:
 * - base Firestore constraints (city/status only)
 * - normalized UI filters for client-side strategies
 *
 * @param {{queryBuilder: Function}} deps
 * @returns {(params: {cityName: string, uiFilters: object}) => {constraints: Array, ui: object, meta: {hasActiveFilters: boolean, cityName: string, firestoreAvailabilityNow: boolean}}}
 */
export const createApartmentFilters = ({ queryBuilder }) => {
  if (typeof queryBuilder !== "function") {
    throw new Error("queryBuilder is required to build apartment filters");
  }

  return ({ cityName, uiFilters }) => {
    const normalized = normalizeApartmentFilters(uiFilters);
    const hasActiveFilters = hasActiveApartmentFilters(normalized);
    const constraints = queryBuilder({
      cityName,
    });

    return {
      constraints,
      ui: normalized,
      meta: {
        hasActiveFilters,
        cityName,
        firestoreAvailabilityNow: normalized.availabilityNow === true,
      },
    };
  };
};
