import {
  APARTMENT_FILTER_DEFAULTS,
  hasActiveApartmentFilters,
  normalizeApartmentFilters,
} from "@/application/filters/apartmentFilters";

const FILTER_QUERY_KEYS = Object.freeze({
  PRICE_MIN: "f_price_min",
  PRICE_MAX: "f_price_max",
  DISTANCE_KM: "f_distance_km",
  ROOMS_MIN: "f_rooms_min",
  ROOMS_MAX: "f_rooms_max",
  AVAILABLE_ROOMS_MIN: "f_available_rooms_min",
  BATHROOMS_MIN: "f_bathrooms_min",
  AREA_MIN: "f_area_min",
  AVAILABILITY_NOW: "f_availability_now",
  AVAILABLE_FROM_START: "f_available_from",
  ROOM_TYPE: "f_room_type",
  AMENITIES: "f_amenities",
});

const AMENITY_KEYS = Object.keys(APARTMENT_FILTER_DEFAULTS.amenities);

const toFiniteNumber = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" && value.trim() === "") return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseBoolean = (value) => {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === "1" || normalized === "true") return true;
  if (normalized === "0" || normalized === "false") return false;
  return null;
};

const parseDateValue = (value) => {
  if (typeof value !== "string" || !value.trim()) return "";
  const normalized = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return normalized;
  }

  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseAmenitiesValue = (value) => {
  if (typeof value !== "string" || !value.trim()) {
    return { ...APARTMENT_FILTER_DEFAULTS.amenities };
  }

  const selected = new Set(
    value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean),
  );

  return AMENITY_KEYS.reduce(
    (acc, amenityKey) => ({
      ...acc,
      [amenityKey]: selected.has(amenityKey),
    }),
    { ...APARTMENT_FILTER_DEFAULTS.amenities },
  );
};

/**
 * Build query string for apartment filters.
 * Only active (non-default) fields are exported.
 *
 * @param {object | null | undefined} uiFilters
 * @returns {string}
 */
export const buildApartmentFiltersQuery = (uiFilters) => {
  const normalized = normalizeApartmentFilters(uiFilters);
  if (!hasActiveApartmentFilters(normalized)) return "";

  const defaults = APARTMENT_FILTER_DEFAULTS;
  const params = new URLSearchParams();

  if (normalized.priceRange[0] !== defaults.priceRange[0]) {
    params.set(FILTER_QUERY_KEYS.PRICE_MIN, String(normalized.priceRange[0]));
  }
  if (normalized.priceRange[1] !== defaults.priceRange[1]) {
    params.set(FILTER_QUERY_KEYS.PRICE_MAX, String(normalized.priceRange[1]));
  }
  if (normalized.distanceKm !== defaults.distanceKm) {
    params.set(FILTER_QUERY_KEYS.DISTANCE_KM, String(normalized.distanceKm));
  }
  if (normalized.roomsRange[0] !== defaults.roomsRange[0]) {
    params.set(FILTER_QUERY_KEYS.ROOMS_MIN, String(normalized.roomsRange[0]));
  }
  if (normalized.roomsRange[1] !== defaults.roomsRange[1]) {
    params.set(FILTER_QUERY_KEYS.ROOMS_MAX, String(normalized.roomsRange[1]));
  }
  if (normalized.availableRoomsMin !== defaults.availableRoomsMin) {
    params.set(
      FILTER_QUERY_KEYS.AVAILABLE_ROOMS_MIN,
      String(normalized.availableRoomsMin),
    );
  }
  if (normalized.bathroomsMin !== defaults.bathroomsMin) {
    params.set(FILTER_QUERY_KEYS.BATHROOMS_MIN, String(normalized.bathroomsMin));
  }
  if (normalized.areaMin !== defaults.areaMin) {
    params.set(FILTER_QUERY_KEYS.AREA_MIN, String(normalized.areaMin));
  }
  if (normalized.availabilityNow !== defaults.availabilityNow) {
    params.set(FILTER_QUERY_KEYS.AVAILABILITY_NOW, normalized.availabilityNow ? "1" : "0");
  }
  if (normalized.availableFromStart !== defaults.availableFromStart) {
    params.set(FILTER_QUERY_KEYS.AVAILABLE_FROM_START, normalized.availableFromStart);
  }
  if (normalized.roomType !== defaults.roomType) {
    params.set(FILTER_QUERY_KEYS.ROOM_TYPE, normalized.roomType);
  }

  const activeAmenities = AMENITY_KEYS.filter(
    (amenityKey) => normalized.amenities?.[amenityKey] === true,
  );
  if (activeAmenities.length > 0) {
    params.set(FILTER_QUERY_KEYS.AMENITIES, activeAmenities.join(","));
  }

  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
};

/**
 * Parse apartment filters from URL search params.
 *
 * @param {URLSearchParams | null | undefined} searchParams
 * @returns {{uiFilters: object, hasUrlFilters: boolean}}
 */
export const extractApartmentFiltersFromSearchParams = (searchParams) => {
  const getParam =
    typeof searchParams?.get === "function"
      ? (key) => searchParams.get(key)
      : () => null;
  const defaults = APARTMENT_FILTER_DEFAULTS;

  const priceMin = toFiniteNumber(getParam(FILTER_QUERY_KEYS.PRICE_MIN));
  const priceMax = toFiniteNumber(getParam(FILTER_QUERY_KEYS.PRICE_MAX));
  const distanceKm = toFiniteNumber(getParam(FILTER_QUERY_KEYS.DISTANCE_KM));
  const roomsMin = toFiniteNumber(getParam(FILTER_QUERY_KEYS.ROOMS_MIN));
  const roomsMax = toFiniteNumber(getParam(FILTER_QUERY_KEYS.ROOMS_MAX));
  const availableRoomsMin = toFiniteNumber(
    getParam(FILTER_QUERY_KEYS.AVAILABLE_ROOMS_MIN),
  );
  const bathroomsMin = toFiniteNumber(getParam(FILTER_QUERY_KEYS.BATHROOMS_MIN));
  const areaMin = toFiniteNumber(getParam(FILTER_QUERY_KEYS.AREA_MIN));
  const availabilityNow = parseBoolean(getParam(FILTER_QUERY_KEYS.AVAILABILITY_NOW));
  const availableFromStart = parseDateValue(
    getParam(FILTER_QUERY_KEYS.AVAILABLE_FROM_START),
  );
  const roomTypeValue = getParam(FILTER_QUERY_KEYS.ROOM_TYPE);
  const roomType =
    typeof roomTypeValue === "string" && roomTypeValue.trim()
      ? roomTypeValue.trim()
      : defaults.roomType;

  const parsed = {
    ...defaults,
    amenities: parseAmenitiesValue(getParam(FILTER_QUERY_KEYS.AMENITIES)),
    priceRange: [
      priceMin ?? defaults.priceRange[0],
      priceMax ?? defaults.priceRange[1],
    ],
    distanceKm: distanceKm ?? defaults.distanceKm,
    roomsRange: [
      roomsMin ?? defaults.roomsRange[0],
      roomsMax ?? defaults.roomsRange[1],
    ],
    availableRoomsMin: availableRoomsMin ?? defaults.availableRoomsMin,
    bathroomsMin: bathroomsMin ?? defaults.bathroomsMin,
    areaMin: areaMin ?? defaults.areaMin,
    availabilityNow: availabilityNow ?? defaults.availabilityNow,
    availableFromStart: availableFromStart || defaults.availableFromStart,
    roomType,
  };

  const normalized = normalizeApartmentFilters(parsed);
  return {
    uiFilters: normalized,
    hasUrlFilters: hasActiveApartmentFilters(normalized),
  };
};
