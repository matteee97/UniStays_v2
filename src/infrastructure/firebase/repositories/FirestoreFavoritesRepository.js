import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/infrastructure/firebase";
import { callBackendApi } from "@/infrastructure/api/firebaseApiClient";

/**
 * @typedef {Object} FirestoreFavoritesRepositoryShape
 * @property {(userId: string, apartmentId: string) => Promise<boolean>} isFavorite
 */

/** @type {FirestoreFavoritesRepositoryShape} */
export const FirestoreFavoritesRepository = {
  async isFavorite(userId, apartmentId) {
    if (!userId || !apartmentId) return false;

    const ref = doc(db, "usersPrivate", userId, "favorites", apartmentId);
    const snap = await getDoc(ref);
    return snap.exists();
  },

  async addFavorite(userId, apartmentId) {
    if (!userId || !apartmentId) {
      throw new Error("Dati preferito non validi.");
    }

    await callBackendApi("/v1/favorites", {
      method: "POST",
      body: {
        apartmentId,
      },
    });
  },

  async removeFavorite(userId, apartmentId) {
    if (!userId || !apartmentId) {
      throw new Error("Dati preferito non validi.");
    }

    await callBackendApi(`/v1/favorites/${apartmentId}`, {
      method: "DELETE",
    });
  },

  subscribeFavoriteIds(userId, { onNext, onError } = {}) {
    if (!userId) {
      onNext?.([]);
      return () => {};
    }

    const favoritesRef = collection(db, "usersPrivate", userId, "favorites");
    const favoritesQuery = query(favoritesRef, orderBy("createdAt", "desc"));

    return onSnapshot(
      favoritesQuery,
      (snapshot) => {
        const ids = snapshot.docs.map((docSnap) => docSnap.id);
        onNext?.(ids);
      },
      (error) => {
        onError?.(error);
      }
    );
  },
};
