import { collection, doc, getDocs } from "firebase/firestore";
import { db } from "@/infrastructure/firebase";
import { normalizeRoomOccupancy } from "@/core/services/RoomOccupancyDomain";

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
      const data = docSnap.data() || {};
      const normalizedAvailability = normalizeAvailability(data?.availability);
      const occupantIds = Array.isArray(data?.occupantIds)
        ? data.occupantIds.filter((value) => typeof value === "string")
        : [];
      const occupancy = normalizeRoomOccupancy(
        data?.occupancy || {},
        occupantIds,
        normalizedAvailability || data?.availability || null
      );
      const normalizedRoomId =
        typeof data?.roomId === "string" && data.roomId.trim()
          ? data.roomId.trim()
          : docSnap.id;
      const baseRoom = {
        ...data,
        id: docSnap.id,
        roomId: normalizedRoomId,
        occupantIds,
        occupancy,
      };

      if (normalizedAvailability === data?.availability) {
        return baseRoom;
      }
      return {
        ...baseRoom,
        availability: normalizedAvailability,
      };
    });
  },
};
