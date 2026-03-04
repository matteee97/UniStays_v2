/**
 * Normalize different coordinate shapes into a {lat, lng} object.
 * Supports common keys from API payloads and Firestore GeoPoint serialization.
 *
 * @param {object | null | undefined} input
 * @returns {{lat: number, lng: number} | null}
 */
export const normalizeCoordinates = (input) => {
  if (!input || typeof input !== "object") return null;

  const lat = Number(
    input.lat ??
      input.latitude ??
      input._lat ??
      input._latitude ??
      NaN
  );
  const lng = Number(
    input.lng ??
      input.longitude ??
      input._long ??
      input._longitude ??
      NaN
  );

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
};
