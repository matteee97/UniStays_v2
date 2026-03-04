import { collection, doc, getDocs } from "firebase/firestore";
import { db } from "@/infrastructure/firebase";

const getRoomsCollection = (apartmentId) =>
  collection(db, "apartments", apartmentId, "rooms");

const getRoomRef = (apartmentId, roomId) =>
  doc(db, "apartments", apartmentId, "rooms", roomId);

const createRoomRef = (apartmentId) => doc(getRoomsCollection(apartmentId));

const parseDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value?.toDate === "function") return value.toDate();
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
};

const startOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const normalizeAvailability = (availability, now = new Date()) => {
  if (!availability || typeof availability !== "object") return availability;
  const availableFrom = parseDate(availability?.availableFrom);
  if (availableFrom && availableFrom < startOfDay(now)) {
    return { ...availability, isAvailableNow: true };
  }
  return availability;
};

export const FirestoreRoomRepository = {
  getRef: getRoomRef,
  createRef: createRoomRef,
  createId: (apartmentId) => createRoomRef(apartmentId).id,
  async listByApartmentId(apartmentId) {
    if (!apartmentId) {
      throw new Error("Apartment ID mancante.");
    }
    const snap = await getDocs(getRoomsCollection(apartmentId));
    return snap.docs.map((docSnap) => {
      const data = docSnap.data();
      const normalizedAvailability = normalizeAvailability(data?.availability);
      if (normalizedAvailability === data?.availability) {
        return { id: docSnap.id, ...data };
      }
      return {
        id: docSnap.id,
        ...data,
        availability: normalizedAvailability,
      };
    });
  },
};
