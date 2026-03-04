/**
 * Compute distance between two coordinates using the Haversine formula.
 *
 * @param {{lat: number, lng: number}} origin
 * @param {{lat: number, lng: number}} destination
 * @returns {number | null} Distance in kilometers, or null if inputs are invalid.
 */
export const haversineDistanceKm = (origin, destination) => {
  if (!origin || !destination) return null;
  if (!Number.isFinite(origin.lat) || !Number.isFinite(origin.lng)) return null;
  if (!Number.isFinite(destination.lat) || !Number.isFinite(destination.lng)) {
    return null;
  }

  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRad(destination.lat - origin.lat);
  const dLng = toRad(destination.lng - origin.lng);
  const lat1 = toRad(origin.lat);
  const lat2 = toRad(destination.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) *
      Math.sin(dLng / 2) *
      Math.cos(lat1) *
      Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};
