import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/infrastructure/firebase";

const getOccupantsCollection = (apartmentId) =>
  collection(db, "apartments", apartmentId, "occupants");

const getOccupantsPrivateCollection = (apartmentId) =>
  collection(db, "apartments", apartmentId, "occupantsPrivate");

const convertTimestamp = (value) => {
  if (!value) return null;
  if (typeof value?.toDate === "function") return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return value;
};

const normalizeNestedDates = (payload = {}) => {
  if (!payload || typeof payload !== "object") return payload;
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        return [key, normalizeNestedDates(value)];
      }
      if (Array.isArray(value)) return [key, value];
      if (key.endsWith("At")) return [key, convertTimestamp(value)];
      return [key, value];
    })
  );
};

export const FirestoreOccupantRepository = {
  async listByApartmentId(apartmentId) {
    if (!apartmentId) {
      throw new Error("Apartment ID mancante.");
    }
    const snapshot = await getDocs(getOccupantsCollection(apartmentId));
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data() || {};
      return {
        id: docSnap.id,
        occupantId: data.occupantId || docSnap.id,
        ...normalizeNestedDates(data),
      };
    });
  },
  async listPublicByApartmentId(apartmentId) {
    if (!apartmentId) {
      throw new Error("Apartment ID mancante.");
    }
    const publicQuery = query(
      getOccupantsCollection(apartmentId),
      where("visibility.isPublic", "==", true),
      where("consent.status", "==", "granted"),
      where("moderation.status", "==", "visible")
    );
    const snapshot = await getDocs(publicQuery);
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data() || {};
      return {
        id: docSnap.id,
        occupantId: data.occupantId || docSnap.id,
        ...normalizeNestedDates(data),
      };
    });
  },
  async listPrivateByApartmentId(apartmentId) {
    if (!apartmentId) {
      throw new Error("Apartment ID mancante.");
    }
    const snapshot = await getDocs(getOccupantsPrivateCollection(apartmentId));
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data() || {};
      return {
        id: docSnap.id,
        occupantId: data.occupantId || docSnap.id,
        ...normalizeNestedDates(data),
      };
    });
  },
};
