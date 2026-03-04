import { useCallback } from "react";

/**
 * Hook per tracciare e aggiornare i click su una città nel localStorage.
 */
export default function useCityClickTracker() {
  const trackCityClick = useCallback((cityName) => {
    if (!cityName) return;

    const raw = localStorage.getItem("clicked_cities");
    const clicks = raw ? JSON.parse(raw) : {};

    clicks[cityName] = (clicks[cityName] || 0) + 1;

    localStorage.setItem("clicked_cities", JSON.stringify(clicks));
  }, []);

  const getMostClickedCity = useCallback(() => {
    const raw = localStorage.getItem("clicked_cities");
    const clicks = raw ? JSON.parse(raw) : {};

    const sorted = Object.entries(clicks)
      .sort((a, b) => b[1] - a[1])
      .map(([city]) => city);

    return sorted[0] || null;
  }, []);

  return { trackCityClick, getMostClickedCity };
}