import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchCities as fetchCitiesUseCase,
  fetchCityBySlug as fetchCityBySlugUseCase,
} from "@/application/useCases/fetchCities";
import { FirestoreCityRepository } from "@/infrastructure/firebase/repositories/FirestoreCityRepository";

let cachedCities = null;
let cacheHasCounts = false;
let cachePromise = null;
let cacheError = null;
let cachePromiseIncludesCounts = false;

const shouldUseCache = (includeCounts) =>
  cachedCities && (!includeCounts || cacheHasCounts);

const loadCities = async (includeCounts) => {
  if (shouldUseCache(includeCounts)) return cachedCities;
  if (cachePromise) {
    if (
      cachePromiseIncludesCounts === includeCounts ||
      (cachePromiseIncludesCounts && includeCounts)
    ) {
      return cachePromise;
    }
  }

  cachePromiseIncludesCounts = includeCounts;
  cachePromise = fetchCitiesUseCase({
    cityRepository: FirestoreCityRepository,
    includeCounts,
  })
    .then((cities) => {
      cachedCities = cities;
      cacheHasCounts = includeCounts;
      cacheError = null;
      cachePromiseIncludesCounts = false;
      return cities;
    })
    .catch((error) => {
      cacheError = error;
      cachePromiseIncludesCounts = false;
      throw error;
    });

  return cachePromise;
};

export function useCities({ includeCounts = false } = {}) {
  const [cities, setCities] = useState(() =>
    shouldUseCache(includeCounts) ? cachedCities : []
  );
  const [loading, setLoading] = useState(!shouldUseCache(includeCounts));
  const [error, setError] = useState(cacheError);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCitiesUseCase({
        cityRepository: FirestoreCityRepository,
        includeCounts,
      });
      cachedCities = data;
      cacheHasCounts = includeCounts || cacheHasCounts;
      setCities(data);
      setError(null);
    } catch (err) {
      setError(err.message || "Errore nel caricamento delle città");
    } finally {
      setLoading(false);
    }
  }, [includeCounts]);

  useEffect(() => {
    let mounted = true;
    if (shouldUseCache(includeCounts)) {
      setLoading(false);
      setCities(cachedCities);
      setError(cacheError);
      return undefined;
    }

    loadCities(includeCounts)
      .then((data) => {
        if (!mounted) return;
        setCities(data);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || "Errore nel caricamento delle città");
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [includeCounts]);

  const hasData = useMemo(() => Array.isArray(cities) && cities.length > 0, [cities]);

  return {
    cities,
    loading,
    error,
    hasData,
    refresh,
  };
}

export function useCityBySlug(slug, { includeCounts = false } = {}) {
  const preloadedCity =
    slug && cachedCities
      ? cachedCities.find((c) => c.slug === slug.toLowerCase())
      : null;
  const hasCountsReady =
    preloadedCity?.stats?.listingsCount !== undefined &&
    preloadedCity?.stats?.listingsCount !== null;

  const [city, setCity] = useState(preloadedCity || null);
  const [loading, setLoading] = useState(
    Boolean(slug) && !(preloadedCity && (!includeCounts || hasCountsReady))
  );
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    if (!slug) {
      setCity(null);
      setLoading(false);
      return undefined;
    }

    if (preloadedCity && (!includeCounts || hasCountsReady)) {
      setCity(preloadedCity);
      setLoading(false);
      return undefined;
    }

    const fetchCity = async () => {
      setLoading(true);
      try {
        const result = await fetchCityBySlugUseCase({
          cityRepository: FirestoreCityRepository,
          slug,
          includeCounts,
        });
        if (!mounted) return;
        setCity(result);
        setError(null);
      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Errore nel caricamento della città");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCity();
    return () => {
      mounted = false;
    };
  }, [includeCounts, slug, preloadedCity, hasCountsReady]);

  return { city, loading, error };
}
