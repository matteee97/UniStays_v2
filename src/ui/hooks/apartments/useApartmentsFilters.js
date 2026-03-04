import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createApartmentFilterMatcher } from "@/application/filters/apartmentFilters";
import {
  clearApartmentFilters,
  setApartmentFilters as setApartmentFiltersAction,
} from "@/app/store/slices/apartmentFiltersSlice";

/**
 * Manage apartment filters and keep query constraints aligned with UI state.
 *
 * @param {object} params
 * @param {string} params.cityName
 * @param {{lat: number, lng: number} | null} params.cityCoords
 * @param {(cityName: string) => Array} params.defaultQueryBuilder
 * @returns {{
 *  activeFilters: any,
 *  setActiveFilters: Function,
 *  effectiveConstraints: Array,
 *  filtersActive: boolean,
 *  uiFilters: object | null,
 *  applyClientFilters: Function,
 * }}
 */
export const useApartmentsFilters = ({
  cityName,
  cityCoords,
  defaultQueryBuilder,
}) => {
  const dispatch = useDispatch();
  const activeFilters = useSelector(
    (state) => state.apartmentFilters.activeFilters,
  );

  const filtersCityName = activeFilters?.meta?.cityName || null;
  const isFilterCompatibleWithCity =
    !filtersCityName || filtersCityName === cityName;

  const filtersActive = Boolean(
    activeFilters?.meta?.hasActiveFilters && isFilterCompatibleWithCity,
  );
  const uiFilters = isFilterCompatibleWithCity ? activeFilters?.ui || null : null;

  const setActiveFilters = useCallback(
    (nextFilters) => {
      if (!nextFilters) {
        dispatch(clearApartmentFilters());
        return;
      }

      const normalizedPayload = {
        ...nextFilters,
        meta: {
          ...nextFilters.meta,
          cityName: nextFilters?.meta?.cityName || cityName || null,
        },
      };

      dispatch(setApartmentFiltersAction(normalizedPayload));
    },
    [cityName, dispatch],
  );

  const effectiveConstraints = useMemo(() => {
    if (filtersActive && activeFilters?.constraints?.length) {
      return activeFilters.constraints;
    }

    if (typeof defaultQueryBuilder === "function" && cityName) {
      return defaultQueryBuilder(cityName);
    }

    return [];
  }, [activeFilters, cityName, defaultQueryBuilder, filtersActive]);

  const clientFilterMatcher = useMemo(
    () => createApartmentFilterMatcher(uiFilters, cityCoords),
    [cityCoords, uiFilters],
  );

  const applyClientFilters = useCallback(
    (apartments) => {
      if (
        !clientFilterMatcher ||
        !Array.isArray(apartments) ||
        apartments.length === 0
      ) {
        return apartments;
      }

      const filtered = [];
      for (let index = 0; index < apartments.length; index += 1) {
        const apartment = apartments[index];
        if (clientFilterMatcher(apartment)) {
          filtered.push(apartment);
        }
      }
      return filtered;
    },
    [clientFilterMatcher],
  );

  return {
    activeFilters,
    setActiveFilters,
    effectiveConstraints,
    filtersActive,
    uiFilters,
    applyClientFilters,
  };
};
