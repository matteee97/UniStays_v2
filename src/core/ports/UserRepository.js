/**
 * @typedef {Object} UserRepository
 * @property {(userId: string, options?: { allowMissing?: boolean }) => Promise<Object | null>} getPublicById
 * @property {(userId: string, options?: { allowMissing?: boolean }) => Promise<Object | null>} getPrivateById
 * @property {(userId: string, payload: Object) => Promise<void>} createPublic
 * @property {(userId: string, payload: Object) => Promise<void>} createPrivate
 */

export {};
