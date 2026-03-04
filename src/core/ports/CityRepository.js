/**
 * @typedef {Object} CityRepository
 * @property {(options?: { recomputeCounts?: boolean, includeCounts?: boolean }) => Promise<Array<Object>>} fetchCities
 * @property {(slug: string, options?: { recomputeCounts?: boolean, includeCounts?: boolean }) => Promise<Object | null>} getCityBySlug
 * @property {(input: Object) => Promise<Object>} createCity
 * @property {(id: string, input: Object) => Promise<Object>} updateCity
 * @property {() => Promise<Array<Object>>} recomputeCitiesListingsCount
 * @property {(id: string) => Promise<boolean>} deleteCity
 */

export {};
