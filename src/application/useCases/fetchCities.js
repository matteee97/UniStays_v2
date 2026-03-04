/**
 * @typedef {import("@/core/ports/CityRepository").CityRepository} CityRepository
 */

/**
 * @typedef {Object} FetchCitiesParams
 * @property {CityRepository} cityRepository
 * @property {boolean} [includeCounts]
 * @property {boolean} [recomputeCounts]
 */

/**
 * @typedef {Object} FetchCityBySlugParams
 * @property {CityRepository} cityRepository
 * @property {string} slug
 * @property {boolean} [includeCounts]
 * @property {boolean} [recomputeCounts]
 */

export async function fetchCities({
  cityRepository,
  includeCounts = false,
  recomputeCounts = false,
} = {}) {
  if (!cityRepository) {
    throw new Error("CityRepository mancante.");
  }

  return cityRepository.fetchCities({ includeCounts, recomputeCounts });
}

export async function fetchCityBySlug({
  cityRepository,
  slug,
  includeCounts = false,
  recomputeCounts = false,
} = {}) {
  if (!cityRepository) {
    throw new Error("CityRepository mancante.");
  }

  return cityRepository.getCityBySlug(slug, {
    includeCounts,
    recomputeCounts,
  });
}
