import { haversineDistanceKm } from "@/core/geo/distance";
import { normalizeCoordinates } from "@/application/mappers/coordinates";
import {
  APARTMENT_FILTER_DEFAULTS,
  normalizeApartmentFilters,
} from "@/application/filters/apartmentFilters";

const parseDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value?.toDate === "function") return value.toDate();

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const startOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const toFiniteNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const buildRequiredAmenitiesKeys = (required = {}) =>
  Object.keys(APARTMENT_FILTER_DEFAULTS.amenities).filter(
    (key) => required?.[key] === true,
  );

const roomHasOpenCapacity = (room) => {
  const spotsAvailable = toFiniteNumber(room?.occupancy?.spotsAvailable);
  if (spotsAvailable === null) return true;
  return spotsAvailable > 0;
};

const roomIsAvailableNow = (room) =>
  room?.availability?.isAvailableNow === true && roomHasOpenCapacity(room);

const roomHasRentableAvailability = (room) =>
  roomIsAvailableNow(room) || Boolean(parseDate(room?.availability?.availableFrom));

const roomIsAvailableByDate = (room, selectedDate) => {
  if (!selectedDate) return true;
  if (roomIsAvailableNow(room)) return true;

  const availableFrom = parseDate(room?.availability?.availableFrom);
  if (!availableFrom) return false;
  return startOfDay(availableFrom).getTime() <= startOfDay(selectedDate).getTime();
};

const apartmentIsAvailableByDate = (apartment, selectedDate) => {
  if (!selectedDate) return true;
  const aggregates = apartment?.aggregates || {};
  if (aggregates?.isAvailableNow === true) return true;

  const availableFrom = parseDate(aggregates?.availableFromMin);
  if (!availableFrom) return false;
  return startOfDay(availableFrom).getTime() <= startOfDay(selectedDate).getTime();
};

const matchesApartmentPriceRange = (apartment, minPrice, maxPrice) => {
  const aggregates = apartment?.aggregates || {};
  const minRoomPrice = toFiniteNumber(aggregates?.minRoomPrice);
  const maxRoomPrice = toFiniteNumber(aggregates?.maxRoomPrice);

  if (minRoomPrice === null && maxRoomPrice === null) return false;
  if (maxRoomPrice !== null && maxRoomPrice < minPrice) return false;
  if (minRoomPrice !== null && minRoomPrice > maxPrice) return false;
  return true;
};

const matchesRoomPriceRange = (room, minPrice, maxPrice) => {
  const price = toFiniteNumber(room?.priceMonthly);
  if (price === null || price <= 0) return false;
  return price >= minPrice && price <= maxPrice;
};

const matchesDistance = (apartment, cityCoords, maxDistanceKm) => {
  if (!cityCoords || maxDistanceKm <= 0) return true;

  const coords = normalizeCoordinates(apartment?.address?.location);
  if (!coords) return false;

  const distance = haversineDistanceKm(cityCoords, coords);
  return Number.isFinite(distance) && distance <= maxDistanceKm;
};

const matchesAmenities = (apartment, requiredAmenityKeys) => {
  if (!requiredAmenityKeys.length) return true;

  for (let index = 0; index < requiredAmenityKeys.length; index += 1) {
    if (apartment?.amenities?.[requiredAmenityKeys[index]] !== true) {
      return false;
    }
  }

  return true;
};

const matchesBathrooms = (apartment, bathroomsMin) => {
  if (bathroomsMin <= 0) return true;
  const bathroomsCount = toFiniteNumber(apartment?.features?.bathroomsCount) || 0;
  return bathroomsCount >= bathroomsMin;
};

const matchesRoomTypeAggregate = (apartment, roomType) => {
  if (!roomType) return true;
  const roomTypes = Array.isArray(apartment?.aggregates?.roomTypes)
    ? apartment.aggregates.roomTypes
    : [];
  return roomTypes.includes(roomType);
};

/**
 * Coarse matcher used before fetching rooms subcollections. It only uses fields
 * already available on apartment documents, so it can reduce reads without
 * changing the room-level source of truth.
 */
export const createRoomCandidateApartmentMatcher = (filters, cityCoords) => {
  if (!filters) return null;

  const normalized = normalizeApartmentFilters(filters);
  const [minPrice, maxPrice] = normalized.priceRange;
  const selectedDate = parseDate(normalized.availableFromStart);
  const requiredAmenityKeys = buildRequiredAmenitiesKeys(normalized.amenities);

  return (apartment) => {
    if (!apartment) return false;

    const hasAnyMatchingAvailability =
      normalized.availabilityNow === true
        ? apartment?.aggregates?.isAvailableNow === true
        : apartmentIsAvailableByDate(apartment, selectedDate);

    return (
      matchesApartmentPriceRange(apartment, minPrice, maxPrice) &&
      hasAnyMatchingAvailability &&
      matchesRoomTypeAggregate(apartment, normalized.roomType) &&
      matchesBathrooms(apartment, normalized.bathroomsMin) &&
      matchesAmenities(apartment, requiredAmenityKeys) &&
      matchesDistance(apartment, cityCoords, normalized.distanceKm)
    );
  };
};

/**
 * Exact matcher for one room inside an apartment.
 */
export const createRoomFilterMatcher = (filters, cityCoords) => {
  const normalized = normalizeApartmentFilters(filters);
  const [minPrice, maxPrice] = normalized.priceRange;
  const selectedDate = parseDate(normalized.availableFromStart);
  const requiredAmenityKeys = buildRequiredAmenitiesKeys(normalized.amenities);

  return ({ room, apartment }) => {
    if (!room || !apartment) return false;
    if (!roomHasRentableAvailability(room)) return false;

    const minimumOpenSpots = Math.max(0, normalized.availableRoomsMin);
    const spotsAvailable = toFiniteNumber(room?.occupancy?.spotsAvailable);
    const hasRequestedOpenSpots =
      minimumOpenSpots <= 0 ||
      spotsAvailable === null ||
      spotsAvailable >= minimumOpenSpots;

    if (!hasRequestedOpenSpots) return false;
    if (!matchesRoomPriceRange(room, minPrice, maxPrice)) return false;
    if (normalized.roomType && room?.type !== normalized.roomType) return false;
    if (normalized.areaMin !== APARTMENT_FILTER_DEFAULTS.areaMin) {
      const areaMq = toFiniteNumber(room?.areaMq) || 0;
      if (areaMq < normalized.areaMin) return false;
    }
    if (normalized.availabilityNow === true && !roomIsAvailableNow(room)) {
      return false;
    }
    if (!roomIsAvailableByDate(room, selectedDate)) return false;

    return (
      matchesBathrooms(apartment, normalized.bathroomsMin) &&
      matchesAmenities(apartment, requiredAmenityKeys) &&
      matchesDistance(apartment, cityCoords, normalized.distanceKm)
    );
  };
};
