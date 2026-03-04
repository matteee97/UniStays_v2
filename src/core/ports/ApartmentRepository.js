/**
 * @typedef {Object} ApartmentRepository
 * @property {(apartmentId: string) => Promise<Object | null>} getById
 * @property {(apartmentId: string, payload: Object) => Promise<void>} create
 * @property {(apartmentId: string, delta?: number) => Promise<void>} incrementReportCount
 */

export {};
