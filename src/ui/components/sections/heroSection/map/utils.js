import {
  ITALY_MAP_BOUNDS,
  MAP_PADDING,
  CLUSTER_DISTANCE,
} from "./constants";

const clamp = (value, min = 0, max = 100) =>
  Math.min(max, Math.max(min, value));

export const mapCoordsToPercentage = (coords) => {
  if (!coords) return null;
  const lat = Number(coords.lat);
  const lng = Number(coords.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const x =
    ((lng - ITALY_MAP_BOUNDS.minLng) /
      (ITALY_MAP_BOUNDS.maxLng - ITALY_MAP_BOUNDS.minLng)) *
      (100 - MAP_PADDING.x * 2) +
    MAP_PADDING.x;
  const y =
    ((ITALY_MAP_BOUNDS.maxLat - lat) /
      (ITALY_MAP_BOUNDS.maxLat - ITALY_MAP_BOUNDS.minLat)) *
      (100 - MAP_PADDING.y * 2) +
    MAP_PADDING.y;

  return { x: clamp(x), y: clamp(y) };
};

const distanceBetween = (a, b) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
};

export const buildClusters = (cities) => {
  const clusters = [];

  cities.forEach((city) => {
    const position = mapCoordsToPercentage(city.coords);
    if (!position) return;

    const cityKey = city.id || city.slug || city.city;
    const target = clusters.find(
      (cluster) => distanceBetween(cluster, position) < CLUSTER_DISTANCE,
    );

    if (!target) {
      clusters.push({
        id: `cluster-${cityKey}`,
        x: position.x,
        y: position.y,
        cities: [{ city, position, key: cityKey }],
      });
      return;
    }

    target.cities.push({ city, position, key: cityKey });
    const totals = target.cities.reduce(
      (acc, item) => {
        acc.x += item.position.x;
        acc.y += item.position.y;
        return acc;
      },
      { x: 0, y: 0 },
    );
    target.x = totals.x / target.cities.length;
    target.y = totals.y / target.cities.length;
  });

  return clusters.map((cluster) => {
    const keys = cluster.cities.map((item) => item.key).sort();
    return {
      ...cluster,
      id: `cluster-${keys.join("|")}`,
    };
  });
};

export const formatListingCount = (count) => {
  if (!Number.isFinite(count)) return "Annunci";
  return `${count} ${count === 1 ? "annuncio" : "annunci"}`;
};
