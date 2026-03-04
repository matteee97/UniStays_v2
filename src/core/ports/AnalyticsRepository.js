/**
 * @typedef {Object} AnalyticsRepository
 * @property {(apartmentId: string, startDateKey: string, endDateKey: string) => Promise<Array<Object>>} getDailyRange
 * @property {(apartmentId: string) => Promise<Object | null>} getSummary
 */

export {};
