import { doc, getDoc } from "firebase/firestore";
import { db } from "@/infrastructure/firebase";
import { callBackendApi } from "@/infrastructure/api/firebaseApiClient";

const USERS_PUBLIC_COLLECTION = "usersPublic";
const USERS_PRIVATE_COLLECTION = "usersPrivate";

/**
 * @typedef {Object} UserRepositoryOptions
 * @property {boolean} [allowMissing]
 */

/**
 * @typedef {Object} FirestoreUserRepositoryShape
 * @property {(userId: string, options?: UserRepositoryOptions) => Promise<Object | null>} getPublicById
 * @property {(userId: string, options?: UserRepositoryOptions) => Promise<Object | null>} getPrivateById
 */

const fetchUserDoc = async (collectionName, userId, options = {}) => {
  const { allowMissing = false } = options;
  if (!userId) throw new Error("ID utente non fornito.");

  const docRef = doc(db, collectionName, userId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) {
    if (allowMissing) return null;
    throw new Error("Utente non trovato.");
  }

  return { userId, ...snap.data() };
};

/** @type {FirestoreUserRepositoryShape} */
export const FirestoreUserRepository = {
  async getPublicById(userId, options) {
    return fetchUserDoc(USERS_PUBLIC_COLLECTION, userId, options);
  },
  async getPrivateById(userId, options) {
    return fetchUserDoc(USERS_PRIVATE_COLLECTION, userId, options);
  },
  async createPublic(userId, payload) {
    if (!userId) throw new Error("ID utente non fornito.");
    if (!payload || typeof payload !== "object") {
      throw new Error("Dati utente non validi.");
    }

    await callBackendApi("/v1/users/public", {
      method: "POST",
      body: { payload },
    });
  },
  async createPrivate(userId, payload) {
    if (!userId) throw new Error("ID utente non fornito.");
    if (!payload || typeof payload !== "object") {
      throw new Error("Dati utente non validi.");
    }

    await callBackendApi("/v1/users/private", {
      method: "POST",
      body: { payload },
    });
  },
};
