import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { useFetchAppartamenti } from "@/ui/hooks/fetches/useFetchAppartamenti";
import useWindowWidth from "@/ui/hooks/ui/useWindowWidth";
import { useCities, useCityBySlug } from "@/ui/hooks/fetches/useCities";
import { setSelectedCity } from "@/app/store/slices/citySlice";
import { PAGINATION } from "@/shared/types";
import {
  buildApartmentsFiltersQuery,
  buildPublishedCityApartmentsQuery,
} from "@/infrastructure/firebase/queries/apartmentQueries";
import { normalizeCoordinates } from "@/application/mappers/coordinates";
import { useApartmentsFilters } from "@/ui/hooks/apartments/useApartmentsFilters";
import useFavoriteIds from "@/ui/hooks/favorites/useFavoriteIds";
import {
  APARTMENT_FILTER_DEFAULTS,
  normalizeApartmentFilters,
} from "@/application/filters/apartmentFilters";
import { extractApartmentFiltersFromSearchParams } from "@/application/filters/apartmentFiltersQuery";
import { createApartmentFilters } from "@/application/useCases/createApartmentFilters";
import { createGuidedSearchFilterPlan } from "@/application/useCases/createGuidedSearchFilterPlan";
import { getSmartFiltersPrompt } from "@/application/filters/smartFiltersQuery";
import { useDetailedCardPreference } from "@/ui/hooks/apartments/useDetailedCardPreference";
import { usePaginationSlice } from "@/ui/hooks/ui/usePaginationSlice";

const FALLBACK_CITY_IMAGE = "/img/home/hero-img(1).webp";
const TOUCH_SCROLL_TIP_MESSAGE =
  "Per scorrere le immagini in modalità dettagliata ti basta fare swipe verso sinistra o destra sulle immagini degli appartamenti.";

/**
 * Orchestrates the apartments listing page state and side effects.
 *
 * @returns {object}
 */
export const useApartmentsPage = () => {
  const width = useWindowWidth();
  const [searchParams] = useSearchParams();
  const { city } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const selectedCity = useSelector((state) => state.city.selectedCity);

  const [hoveredApartmentId, setHoveredApartmentId] = useState(null);
  const [mapVisible, setMapVisible] = useState(false);
  const [totalCount, setTotalCount] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { favorites, loading: favoritesLoading } = useFavoriteIds();
  const { detailedCard, setDetailedCard, storageKey } =
    useDetailedCardPreference({
      storageKey: "detailedCard",
      defaultValue: true,
    });

  const initialLimit = PAGINATION.DEFAULT_PAGE_SIZE;
  const fetchLimit = detailedCard ? initialLimit : initialLimit * (initialLimit/2);

  const {
    cities,
    loading: citiesLoading,
    error: citiesError,
  } = useCities({ includeCounts: true });
  const { city: cityFromSlug, loading: citySlugLoading } = useCityBySlug(city, {
    includeCounts: true,
  });

  useEffect(() => {
    if (!city) return;

    const slug = city.toLowerCase();
    const selectedSlug = selectedCity?.slug?.toLowerCase?.();
    if (selectedSlug === slug) return;

    if (!citiesLoading && cities?.length) {
      const matchedCity = cities.find((currentCity) => currentCity.slug === slug);
      if (matchedCity) {
        dispatch(setSelectedCity(matchedCity));
        return;
      }
    }

    if (!citySlugLoading && cityFromSlug) {
      dispatch(setSelectedCity(cityFromSlug));
      return;
    }

    if (!citiesLoading && !citySlugLoading && !cityFromSlug) {
      navigate("/alloggi/NotFound", { replace: true });
    }
  }, [
    city,
    cities,
    citiesLoading,
    cityFromSlug,
    citySlugLoading,
    dispatch,
    navigate,
    selectedCity,
  ]);

  const cityName = useMemo(() => {
    if (!selectedCity?.city) return "";
    return selectedCity.city.split("(")[0].trim();
  }, [selectedCity]);
  const cityTitle = useMemo(() => {
    if (!selectedCity?.city) return "";
    return `alloggi a ${cityName} - ${selectedCity.university}`;
  }, [cityName, selectedCity]);
  const cityImage = selectedCity?.imgUrl || FALLBACK_CITY_IMAGE;

  const cityCoords = useMemo(
    () => normalizeCoordinates(selectedCity?.coords),
    [selectedCity]
  );
  const canUseDistance =
    Number.isFinite(cityCoords?.lat) && Number.isFinite(cityCoords?.lng);

  const smartSearchPrompt = useMemo(
    () => getSmartFiltersPrompt(searchParams),
    [searchParams]
  );
  const parsedUrlFilters = useMemo(
    () => extractApartmentFiltersFromSearchParams(searchParams),
    [searchParams]
  );

  const {
    activeFilters,
    setActiveFilters,
    effectiveConstraints,
    filtersActive,
    uiFilters,
    applyClientFilters,
  } = useApartmentsFilters({
    cityName,
    cityCoords,
    defaultQueryBuilder: buildPublishedCityApartmentsQuery,
  });

  const buildSearchFilters = useMemo(
    () => createApartmentFilters({ queryBuilder: buildApartmentsFiltersQuery }),
    []
  );
  const appliedUrlFiltersRef = useRef("");
  const appliedSmartPromptRef = useRef("");

  const applySearchFilters = useCallback(
    (incomingUiFilters) => {
      if (!cityName) return;
      const safeUiFilters = incomingUiFilters || APARTMENT_FILTER_DEFAULTS;

      const normalizedUiFilters = normalizeApartmentFilters({
        ...safeUiFilters,
        distanceKm: canUseDistance ? safeUiFilters.distanceKm : 0,
      });
      const payload = buildSearchFilters({
        cityName,
        uiFilters: normalizedUiFilters,
      });
      setActiveFilters(payload.meta.hasActiveFilters ? payload : null);
    },
    [buildSearchFilters, canUseDistance, cityName, setActiveFilters]
  );

  useEffect(() => {
    if (!selectedCity?.city || !parsedUrlFilters.hasUrlFilters) return;

    const runKey = `${selectedCity.city}::${searchParams.toString()}`;
    if (appliedUrlFiltersRef.current === runKey) return;
    appliedUrlFiltersRef.current = runKey;

    applySearchFilters(parsedUrlFilters.uiFilters);
  }, [
    applySearchFilters,
    parsedUrlFilters.hasUrlFilters,
    parsedUrlFilters.uiFilters,
    searchParams,
    selectedCity?.city,
  ]);

  useEffect(() => {
    if (
      !selectedCity?.city ||
      !smartSearchPrompt ||
      parsedUrlFilters.hasUrlFilters
    ) {
      return;
    }

    const runKey = `${selectedCity.city}::${smartSearchPrompt}`;
    if (appliedSmartPromptRef.current === runKey) return;
    appliedSmartPromptRef.current = runKey;

    const plan = createGuidedSearchFilterPlan({
      prompt: smartSearchPrompt,
      baseFilters: APARTMENT_FILTER_DEFAULTS,
    });
    if (!plan.hasSignals) return;

    applySearchFilters(plan.uiFilters);
  }, [
    applySearchFilters,
    parsedUrlFilters.hasUrlFilters,
    selectedCity?.city,
    smartSearchPrompt,
  ]);

  const { loading, error, appartamenti, allLoaded, loadMore, getTotalCount } =
    useFetchAppartamenti(effectiveConstraints, fetchLimit, {
      queryScope: {
        screen: "apartments-page",
        citySlug: selectedCity?.slug || city || "",
        filters: uiFilters || null,
      },
      progressiveMode: true,
      progressiveBatchRange: {
        min: 40,
        max: 60,
      },
      applyClientFilters,
    });

  useEffect(() => {
    let mounted = true;

    const loadTotalCount = async () => {
      try {
        if (filtersActive) {
          if (!mounted) return;
          setTotalCount(allLoaded ? appartamenti.length : null);
          return;
        }

        const canUseLocalCount =
          selectedCity?.stats?.listingsCount != null;
        if (canUseLocalCount) {
          if (mounted) setTotalCount(selectedCity.stats.listingsCount);
          return;
        }

        const count = await getTotalCount();
        if (mounted) setTotalCount(count);
      } catch (error) {
        console.error("Errore nel conteggio degli annunci:", error);
        if (mounted) setTotalCount(null);
      }
    };

    void loadTotalCount();

    return () => {
      mounted = false;
    };
  }, [
    allLoaded,
    appartamenti.length,
    filtersActive,
    getTotalCount,
    selectedCity?.stats?.listingsCount,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [effectiveConstraints, uiFilters, fetchLimit, selectedCity?.slug]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, [activeFilters, currentPage, selectedCity?.slug]);

  const { pageItems: currentPageApartments } = usePaginationSlice({
    items: appartamenti,
    page: currentPage,
    pageSize: fetchLimit,
  });
  const filteredPageApartments = currentPageApartments;
  const hasKnownTotalCount =
    typeof totalCount === "number" && Number.isFinite(totalCount);
  const displayCount = useMemo(() => {
    const offset = (currentPage - 1) * fetchLimit;
    const base = offset + filteredPageApartments.length;
    if (!hasKnownTotalCount) return base;
    return Math.min(totalCount, base);
  }, [
    currentPage,
    fetchLimit,
    filteredPageApartments.length,
    hasKnownTotalCount,
    totalCount,
  ]);

  const toggleMap = useCallback(() => {
    setMapVisible((current) => !current);
  }, []);
  const showMapSection = width >= 1024 || mapVisible;

  const metaDescription = `Cerca alloggi universitari a ${cityName} - ${
    selectedCity?.university || ""
  } e trova l'alloggio perfetto per te.`;
  const preloadImages = useMemo(
    () => [
      cityImage,
      ...appartamenti
        .slice(0, 2)
        .map((apartment) => apartment.apartmentPhotoUrls?.[0])
        .filter(Boolean),
    ],
    [appartamenti, cityImage]
  );

  return {
    citiesError,
    cityImage,
    cityName: selectedCity?.city,
    universityName: selectedCity?.university,
    tipMessage: TOUCH_SCROLL_TIP_MESSAGE,
    listSection: {
      app: filteredPageApartments,
      city: selectedCity?.city || "",
      university: selectedCity?.university || "",
      showLoading: loading || favoritesLoading,
      error,
      setHoveredApartmentId,
      limit: fetchLimit,
      loadMore,
      paginaCorrente: currentPage,
      setPaginaCorrente: setCurrentPage,
      totalCount,
      allLoaded,
      loadedCount: appartamenti.length,
      displayCount,
      filtersActive,
      setActiveFilters,
      detailedCard,
      setDetailedCard,
      storageKey,
      favoritesIds: favorites,
      alwaysStickyNavigation: true,
    },
    mapSection: {
      mapVisible,
      appartamenti: filteredPageApartments,
      matchedCity: selectedCity,
      favoritesIds: favorites,
      hoveredApartmentId,
    },
    mapButton: {
      isOpen: mapVisible,
      onToggle: toggleMap,
    },
    showMapSection,
    meta: {
      title: cityTitle,
      description: metaDescription,
      image: cityImage,
      preloadImages,
    },
  };
};
