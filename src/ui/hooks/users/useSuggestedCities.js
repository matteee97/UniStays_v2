import { useEffect, useState } from "react";
import { useCities } from "../fetches/useCities";
// : TODO : aggiornare in modo che funzioni correttemente inoltre aggiungere un paramentro per il calcolo delle città suggerite cioè il numero di annunci presenti in quella citta
const getUserPosition = () => {
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos.coords),
      () => resolve(null)
    );
  });
};

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const getClickCounts = () => {
  try {
    const raw = localStorage.getItem("clicked_cities");
    return raw ? JSON.parse(raw) : {}; // Ritorna direttamente l'oggetto
  } catch {
    return {};
  }
};

const DEFAULT_CITY_NAMES = ["Milano", "Roma", "Bologna", "Lecce"];

export default function useSuggestedCities(
  userId,
  usePosition = false,
  listingsWeight = 10
) {
  const { cities, loading, error } = useCities({ includeCounts: true });
  const [suggestedCities, setSuggestedCities] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const process = async () => {
      if (loading || !cities?.length) return;
      const coords = usePosition && (await getUserPosition());
      const clickCounts = getClickCounts();

      let scoredCities = cities.map((city) => {
        let score = 0;
        const lat = city.coords?.lat ?? 0;
        const lng = city.coords?.lng ?? 0;

        // 1. Distanza
        if (coords && Number.isFinite(lat) && Number.isFinite(lng)) {
          const dist = getDistance(coords.latitude, coords.longitude, lat, lng);
          score -= dist;
        }

        // 2. Click history con boost moltiplicativo
        const count = clickCounts[city.city] || 0;
        score += count * 1000;

        // 3. Numero di annunci in città (peso configurabile)
        const listingsCount = Number(city.stats?.listingsCount) || 0;
        score += listingsCount * listingsWeight;

        return { ...city, score };
      });

      scoredCities.sort((a, b) => b.score - a.score);

      const noSignal = scoredCities.every((c) => c.score === 0);
      const defaultList = noSignal ? getDefaultCities(cities) : [];
      const finalList =
        noSignal && defaultList.length
          ? defaultList
          : noSignal
          ? getFallbackSeededList(userId, cities)
          : scoredCities;

          if (!cancelled) setSuggestedCities(finalList.slice(0, 8));
        };

    process();
    return () => {
      cancelled = true;
    };
  }, [cities, loading, userId, usePosition, listingsWeight]);

  return { suggestedCities, loading, error };
}

function getFallbackSeededList(userId = "anon", cities = []) {
  const hash = [...userId].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return [...cities].sort((a, b) => {
    const latA = a.coords?.lat ?? 0;
    const latB = b.coords?.lat ?? 0;
    const sA = Math.sin(hash + latA);
    const sB = Math.sin(hash + latB);
    return sB - sA;
  });
}

function getDefaultCities(cities = []) {
  const byName = new Map(
    cities.map((city) => [String(city.city || "").toLowerCase(), city])
  );

  return DEFAULT_CITY_NAMES.map((name) => byName.get(name.toLowerCase())).filter(
    Boolean
  );
}
