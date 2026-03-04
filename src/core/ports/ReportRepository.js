/**
 * @typedef {Object} ReportRepository
 * @property {(payload: Object) => Promise<void>} createReport
 * @property {() => Promise<Array<Object>>} fetchAll
 * @property {(filters?: Object) => Promise<{ reports: Array<Object>, summary: Object | null }>} [fetchAdminList]
 * @property {(reportId: string) => Promise<{ report: Object, context: Object | null }>} [fetchAdminDetails]
 * @property {(reportId: string, payload?: Object) => Promise<Object>} [updateAdminReport]
 * @property {(reportId: string, action: string, payload?: Object) => Promise<{ report: Object, action: string, notifications?: Object | null }>} [runAdminQuickAction]
 */

export {};
