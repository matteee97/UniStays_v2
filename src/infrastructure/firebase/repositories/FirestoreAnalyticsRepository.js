import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/infrastructure/firebase";

const ANALYTICS_DOC_ID = "summary";
const DAILY_COLLECTION = "daily";

const getDailyCollectionRef = (apartmentId) =>
  collection(db, "apartments", apartmentId, "analytics", ANALYTICS_DOC_ID, DAILY_COLLECTION);

/**
 * @typedef {Object} FirestoreAnalyticsRepositoryShape
 * @property {(apartmentId: string, startDateKey: string, endDateKey: string) => Promise<Array<Object>>} getDailyRange
 * @property {(apartmentId: string) => Promise<Object | null>} getSummary
 */

/** @type {FirestoreAnalyticsRepositoryShape} */
export const FirestoreAnalyticsRepository = {
  async getDailyRange(apartmentId, startDateKey, endDateKey) {
    if (!apartmentId) {
      throw new Error("Apartment ID mancante.");
    }

    if (!startDateKey || !endDateKey) return [];

    const dailyRef = getDailyCollectionRef(apartmentId);
    const q = query(
      dailyRef,
      where("date", ">=", startDateKey),
      where("date", "<=", endDateKey)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
  },
  async getSummary(apartmentId) {
    if (!apartmentId) {
      throw new Error("Apartment ID mancante.");
    }

    const ref = doc(db, "apartments", apartmentId, "analytics", ANALYTICS_DOC_ID);
    const snap = await getDoc(ref);
    console.log(snap);
    if (!snap.exists()) return null;

    return { id: snap.id, ...snap.data() };
  },
};
