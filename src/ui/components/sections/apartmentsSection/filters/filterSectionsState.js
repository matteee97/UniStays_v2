import {
  APARTMENT_FILTER_DEFAULTS,
  normalizeApartmentFilters,
} from "@/application/filters/apartmentFilters";

export const FILTER_SECTION_KEYS = Object.freeze({
  PRICE: "price",
  DISTANCE: "distance",
  ROOMS: "rooms",
  AVAILABILITY: "availability",
  AMENITIES: "amenities",
});

export const getDefaultOpenFilterSections = () => ({
  [FILTER_SECTION_KEYS.PRICE]: false,
  [FILTER_SECTION_KEYS.DISTANCE]: false,
  [FILTER_SECTION_KEYS.ROOMS]: false,
  [FILTER_SECTION_KEYS.AVAILABILITY]: false,
  [FILTER_SECTION_KEYS.AMENITIES]: false,
});

const rangesDiffer = (a = [0, 0], b = [0, 0]) => a[0] !== b[0] || a[1] !== b[1];

const amenitiesDiffer = (current = {}, next = {}) =>
  Object.keys(APARTMENT_FILTER_DEFAULTS.amenities).some(
    (key) => Boolean(current[key]) !== Boolean(next[key]),
  );

/**
 * Returns which sections changed between two filter states.
 */
export const getChangedFilterSections = (
  previousFilters = APARTMENT_FILTER_DEFAULTS,
  nextFilters = APARTMENT_FILTER_DEFAULTS,
) => {
  const prev = normalizeApartmentFilters(previousFilters);
  const next = normalizeApartmentFilters(nextFilters);

  return {
    [FILTER_SECTION_KEYS.PRICE]: rangesDiffer(prev.priceRange, next.priceRange),
    [FILTER_SECTION_KEYS.DISTANCE]: prev.distanceKm !== next.distanceKm,
    [FILTER_SECTION_KEYS.ROOMS]:
      rangesDiffer(prev.roomsRange, next.roomsRange) ||
      prev.availableRoomsMin !== next.availableRoomsMin ||
      prev.bathroomsMin !== next.bathroomsMin ||
      prev.areaMin !== next.areaMin ||
      prev.roomType !== next.roomType,
    [FILTER_SECTION_KEYS.AVAILABILITY]:
      prev.availabilityNow !== next.availabilityNow ||
      prev.availableFromStart !== next.availableFromStart,
    [FILTER_SECTION_KEYS.AMENITIES]: amenitiesDiffer(prev.amenities, next.amenities),
  };
};

/**
 * Mark changed sections as open while preserving previous open state.
 */
export const expandOpenSectionsWithChanges = (currentOpen = {}, changes = {}) => {
  const next = { ...currentOpen };

  Object.entries(changes).forEach(([sectionKey, changed]) => {
    if (changed) {
      next[sectionKey] = true;
    }
  });

  return next;
};
