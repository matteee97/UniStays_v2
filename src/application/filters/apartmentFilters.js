import { haversineDistanceKm } from "@/core/geo/distance";
import { normalizeCoordinates } from "@/application/mappers/coordinates";
import { APARTMENTS, DISTANCES, PRICES, ROOM_TYPES } from "@/shared/types";

export const APARTMENT_FILTER_LIMITS = {
  distanceMaxKm: DISTANCES.MAX_KM,
  distanceStepKm: DISTANCES.STEP_KM,
  areaStepMq: 5,
  areaMinMq: APARTMENTS.MIN_SQUARE_METERS,
  areaMaxMq: APARTMENTS.MAX_SQUARE_METERS,
  roomsMax: APARTMENTS.MAX_ROOMS,
  bathroomsMax: APARTMENTS.MAX_BATHROOMS,
  priceMin: PRICES.MIN_PRICE,
  priceMax: PRICES.MAX_PRICE,
};

export const APARTMENT_FILTER_DEFAULTS = Object.freeze({
  priceRange: [PRICES.MIN_PRICE, PRICES.MAX_PRICE],
  distanceKm: DISTANCES.MIN_KM,
  roomsRange: [APARTMENTS.MIN_ROOMS, APARTMENTS.MAX_ROOMS],
  availableRoomsMin: 0,
  bathroomsMin: APARTMENTS.MIN_BATHROOMS,
  areaMin: APARTMENTS.MIN_SQUARE_METERS,
  availabilityNow: false,
  availableFromStart: "",
  roomType: "",
  amenities: {
    wifi: false,
    parking: false,
    airConditioning: false,
    elevator: false,
    balcony: false,
    dishwasher: false,
  },
});

const clampNumber = (value, min, max) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return min;
  return Math.min(Math.max(numeric, min), max);
};

const normalizeRange = (range, min, max) => {
  const raw = Array.isArray(range) ? range : [min, max];
  const start = clampNumber(raw[0], min, max);
  const end = clampNumber(raw[1], min, max);
  return start <= end ? [start, end] : [end, start];
};

const ROOM_TYPE_VALUES = Object.values(ROOM_TYPES);

const normalizeDate = (value) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

const normalizeRoomType = (value) => {
  if (typeof value !== "string") return "";
  return ROOM_TYPE_VALUES.includes(value) ? value : "";
};

const parseDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value?.toDate === "function") return value.toDate();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toStartOfDayTimestamp = (value) => {
  const parsed = parseDate(value);
  if (!parsed) return null;

  const day = new Date(parsed);
  day.setHours(0, 0, 0, 0);
  return day.getTime();
};

/**
 * Normalize UI filters and apply defaults.
 *
 * @param {object | null | undefined} filters
 * @returns {object}
 */
export const normalizeApartmentFilters = (filters = {}) => {
  const merged = {
    ...APARTMENT_FILTER_DEFAULTS,
    ...filters,
    amenities: {
      ...APARTMENT_FILTER_DEFAULTS.amenities,
      ...(filters?.amenities || {}),
    },
  };

  return {
    ...merged,
    priceRange: normalizeRange(
      merged.priceRange,
      PRICES.MIN_PRICE,
      PRICES.MAX_PRICE
    ),
    roomsRange: normalizeRange(
      merged.roomsRange,
      APARTMENTS.MIN_ROOMS,
      APARTMENTS.MAX_ROOMS
    ),
    distanceKm: clampNumber(
      merged.distanceKm,
      DISTANCES.MIN_KM,
      APARTMENT_FILTER_LIMITS.distanceMaxKm
    ),
    availableRoomsMin: clampNumber(
      merged.availableRoomsMin,
      0,
      APARTMENTS.MAX_ROOMS
    ),
    bathroomsMin: clampNumber(
      merged.bathroomsMin,
      APARTMENTS.MIN_BATHROOMS,
      APARTMENTS.MAX_BATHROOMS
    ),
    areaMin: clampNumber(
      merged.areaMin,
      APARTMENTS.MIN_SQUARE_METERS,
      APARTMENTS.MAX_SQUARE_METERS
    ),
    availableFromStart: normalizeDate(merged.availableFromStart),
    roomType: normalizeRoomType(merged.roomType),
  };
};

/**
 * Determine if filters differ from defaults.
 *
 * @param {object} filters
 * @returns {boolean}
 */
export const hasActiveApartmentFilters = (filters) => {
  const normalized = normalizeApartmentFilters(filters);
  const defaults = APARTMENT_FILTER_DEFAULTS;

  const hasPrice =
    normalized.priceRange[0] !== defaults.priceRange[0] ||
    normalized.priceRange[1] !== defaults.priceRange[1];
  const hasDistance = normalized.distanceKm !== defaults.distanceKm;
  const hasRooms =
    normalized.roomsRange[0] !== defaults.roomsRange[0] ||
    normalized.roomsRange[1] !== defaults.roomsRange[1];
  const hasAvailableRooms =
    normalized.availableRoomsMin !== defaults.availableRoomsMin;
  const hasBathrooms = normalized.bathroomsMin !== defaults.bathroomsMin;
  const hasArea = normalized.areaMin !== defaults.areaMin;
  const hasAvailability =
    normalized.availabilityNow !== defaults.availabilityNow;
  const hasAvailabilityDate =
    normalized.availableFromStart !== defaults.availableFromStart;
  const hasRoomType = normalized.roomType !== defaults.roomType;
  const hasAmenities = Object.values(normalized.amenities || {}).some(Boolean);

  return (
    hasPrice ||
    hasDistance ||
    hasRooms ||
    hasAvailableRooms ||
    hasBathrooms ||
    hasArea ||
    hasAvailability ||
    hasAvailabilityDate ||
    hasRoomType ||
    hasAmenities
  );
};

/**
 * Count how many filter groups are actively changed from defaults.
 *
 * @param {object | null | undefined} filters
 * @returns {number}
 */
export const countActiveApartmentFilterGroups = (filters) => {
  const normalized = normalizeApartmentFilters(filters);
  const defaults = APARTMENT_FILTER_DEFAULTS;

  let count = 0;

  if (
    normalized.priceRange[0] !== defaults.priceRange[0] ||
    normalized.priceRange[1] !== defaults.priceRange[1]
  ) {
    count += 1;
  }

  if (normalized.distanceKm !== defaults.distanceKm) {
    count += 1;
  }

  if (
    normalized.roomsRange[0] !== defaults.roomsRange[0] ||
    normalized.roomsRange[1] !== defaults.roomsRange[1]
  ) {
    count += 1;
  }

  if (normalized.availableRoomsMin !== defaults.availableRoomsMin) {
    count += 1;
  }

  if (normalized.bathroomsMin !== defaults.bathroomsMin) {
    count += 1;
  }

  if (normalized.areaMin !== defaults.areaMin) {
    count += 1;
  }

  if (normalized.availabilityNow !== defaults.availabilityNow) {
    count += 1;
  }

  if (normalized.availableFromStart !== defaults.availableFromStart) {
    count += 1;
  }

  if (normalized.roomType !== defaults.roomType) {
    count += 1;
  }

  count += Object.values(normalized.amenities || {}).filter(Boolean).length;

  return count;
};

/**
 * Price filter strategy.
 *
 * @param {object} aggregates
 * @param {number} minPrice
 * @param {number} maxPrice
 * @returns {boolean}
 */
export const filterByPrice = (aggregates, minPrice, maxPrice) => {
  const minRoomPrice = Number(aggregates?.minRoomPrice);
  const maxRoomPrice = Number(aggregates?.maxRoomPrice);

  if (!Number.isFinite(minRoomPrice) && !Number.isFinite(maxRoomPrice)) {
    return false;
  }

  if (Number.isFinite(minPrice) && Number.isFinite(maxRoomPrice)) {
    if (maxRoomPrice < minPrice) return false;
  }

  if (Number.isFinite(maxPrice) && Number.isFinite(minRoomPrice)) {
    if (minRoomPrice > maxPrice) return false;
  }

  return true;
};

/**
 * Total rooms range strategy.
 *
 * @param {object} aggregates
 * @param {Array<number>} roomsRange
 * @returns {boolean}
 */
export const filterByRooms = (aggregates, roomsRange) => {
  const totalRooms = Number(aggregates?.totalRooms) || 0;
  const [minRooms, maxRooms] = roomsRange;
  if (minRooms > 0 && totalRooms < minRooms) return false;
  if (maxRooms > 0 && totalRooms > maxRooms) return false;
  return true;
};

/**
 * Available rooms lower-bound strategy.
 *
 * @param {object} aggregates
 * @param {number} minimum
 * @returns {boolean}
 */
export const filterByAvailableRooms = (aggregates, minimum) => {
  if (minimum <= 0) return true;
  const available = Number(aggregates?.totalRoomsAvailable) || 0;
  return available >= minimum;
};

/**
 * Bathrooms lower-bound strategy.
 *
 * @param {object} features
 * @param {number} minimum
 * @returns {boolean}
 */
export const filterByBathrooms = (features, minimum) => {
  if (minimum <= 0) return true;
  const bathrooms = Number(features?.bathroomsCount) || 0;
  return bathrooms >= minimum;
};

/**
 * Area lower-bound strategy.
 *
 * @param {object} features
 * @param {number} minimum
 * @returns {boolean}
 */
export const filterByArea = (features, minimum) => {
  if (minimum <= 0) return true;
  const area = Number(features?.totalAreaMq) || 0;
  return area >= minimum;
};

/**
 * Immediate availability strategy.
 *
 * @param {object} aggregates
 * @param {boolean} mustBeAvailable
 * @returns {boolean}
 */
export const filterByAvailabilityNow = (aggregates, mustBeAvailable) => {
  if (!mustBeAvailable) return true;
  return aggregates?.isAvailableNow === true;
};

const filterByAvailableFromDate = (aggregates, selectedDate) => {
  if (!selectedDate) return true;
  if (aggregates?.isAvailableNow === true) return true;

  const availableFromTs = toStartOfDayTimestamp(aggregates?.availableFromMin);
  const selectedDateTs = toStartOfDayTimestamp(selectedDate);

  if (availableFromTs == null || selectedDateTs == null) {
    return false;
  }

  return availableFromTs <= selectedDateTs;
};

/**
 * Room type strategy.
 *
 * @param {object} apartment
 * @param {string} roomType
 * @returns {boolean}
 */
export const filterByRoomType = (apartment, roomType) => {
  if (!roomType) return true;
  const rooms = Array.isArray(apartment?.rooms) ? apartment.rooms : null;

  // Listing documents might not include rooms. In that case, keep results
  // stable and let detail pages enforce room-level checks.
  if (!rooms) return true;

  return rooms.some((room) => room?.type === roomType);
};

const buildRequiredAmenitiesKeys = (required = {}) => {
  const defaults = APARTMENT_FILTER_DEFAULTS.amenities;
  return Object.keys(defaults).filter((key) => required?.[key] === true);
};

/**
 * Amenities/services strategy.
 *
 * @param {object} amenities
 * @param {Array<string>} requiredAmenityKeys
 * @returns {boolean}
 */
export const filterByServices = (amenities, requiredAmenityKeys = []) => {
  if (!Array.isArray(requiredAmenityKeys) || requiredAmenityKeys.length === 0) {
    return true;
  }

  for (let index = 0; index < requiredAmenityKeys.length; index += 1) {
    const amenityKey = requiredAmenityKeys[index];
    if (amenities?.[amenityKey] !== true) return false;
  }

  return true;
};

/**
 * Distance strategy.
 *
 * @param {object} location
 * @param {{lat:number,lng:number}|null} cityCoords
 * @param {number} maxDistance
 * @returns {boolean}
 */
export const filterByDistance = (location, cityCoords, maxDistance) => {
  if (!cityCoords || maxDistance <= 0) return true;
  const coords = normalizeCoordinates(location);
  if (!coords) return false;
  const distance = haversineDistanceKm(cityCoords, coords);
  if (!Number.isFinite(distance)) return false;
  return distance <= maxDistance;
};

/**
 * Create a pure apartment matcher for the provided filter DTO.
 * The matcher pre-computes static values so each apartment is evaluated only once.
 *
 * @param {object | null | undefined} filters
 * @param {{lat:number,lng:number}|null} cityCoords
 * @returns {((apartment: object) => boolean) | null}
 */
export const createApartmentFilterMatcher = (filters, cityCoords) => {
  if (!filters) return null;

  const normalized = normalizeApartmentFilters(filters);
  const [minPrice, maxPrice] = normalized.priceRange;
  const selectedDate = parseDate(normalized.availableFromStart);
  const requiredAmenityKeys = buildRequiredAmenitiesKeys(normalized.amenities);

  return (apartment) => {
    const aggregates = apartment?.aggregates || {};
    const features = apartment?.features || {};
    const amenities = apartment?.amenities || {};

    return (
      filterByPrice(aggregates, minPrice, maxPrice) &&
      filterByRooms(aggregates, normalized.roomsRange) &&
      filterByAvailableRooms(aggregates, normalized.availableRoomsMin) &&
      filterByBathrooms(features, normalized.bathroomsMin) &&
      filterByArea(features, normalized.areaMin) &&
      filterByAvailabilityNow(aggregates, normalized.availabilityNow) &&
      filterByAvailableFromDate(aggregates, selectedDate) &&
      filterByRoomType(apartment, normalized.roomType) &&
      filterByServices(amenities, requiredAmenityKeys) &&
      filterByDistance(apartment?.address?.location, cityCoords, normalized.distanceKm)
    );
  };
};

/**
 * Evaluate all filter strategies against one apartment.
 *
 * @param {object} apartment
 * @param {object | null | undefined} filters
 * @param {{lat:number,lng:number}|null} cityCoords
 * @returns {boolean}
 */
export const matchesApartmentFilters = (apartment, filters, cityCoords) => {
  const matcher = createApartmentFilterMatcher(filters, cityCoords);
  if (!matcher) return true;
  return matcher(apartment);
};

/**
 * Apply client-side apartment filters in a single scan.
 *
 * @param {Array<object>} apartments
 * @param {object | null} filters
 * @param {{lat: number, lng: number} | null} cityCoords
 * @returns {Array<object>}
 */
export const applyApartmentFilters = (apartments, filters, cityCoords) => {
  if (!Array.isArray(apartments) || apartments.length === 0) return apartments;
  if (!filters) return apartments;

  const matcher = createApartmentFilterMatcher(filters, cityCoords);
  if (!matcher) return apartments;

  const filtered = [];
  let excludedAtLeastOne = false;

  for (let index = 0; index < apartments.length; index += 1) {
    const apartment = apartments[index];
    if (matcher(apartment)) {
      filtered.push(apartment);
    } else {
      excludedAtLeastOne = true;
    }
  }

  return excludedAtLeastOne ? filtered : apartments;
};
