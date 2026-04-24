import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  GeoPoint,
  orderBy,
  query,
  startAfter,
  Timestamp,
  limit as fbLimit,
} from "firebase/firestore";
import { db } from "@/infrastructure/firebase";
import { APARTMENT_STATUS } from "@/shared/types";
import { callBackendApi } from "@/infrastructure/api/firebaseApiClient";

/**
 * @typedef {Object} ApartmentRecord
 * @property {string} id
 * @property {Object} [metrics]
 */

/**
 * @typedef {Object} FirestoreApartmentRepositoryShape
 * @property {(apartmentId: string) => Promise<ApartmentRecord | null>} getById
 * @property {(apartmentId: string) => import("firebase/firestore").DocumentReference} getRef
 * @property {() => import("firebase/firestore").DocumentReference} createRef
 * @property {(params: { constraints: Array<import("firebase/firestore").QueryConstraint>, pageSize: number, cursor?: string | null }) => Promise<{ docs: Array<Object>, cursor: string | null, snapshotLength: number }>} fetchAppartamentiPage
 */

const APARTMENTS_COLLECTION = "apartments";

const convertTimestamp = (timestamp) => {
  if (!timestamp) return null;
  if (timestamp?.toDate) return timestamp.toDate().toISOString();
  if (timestamp instanceof Date) return timestamp.toISOString();
  return timestamp;
};

const normalizeMetrics = (metrics = {}) =>
  Object.fromEntries(
    Object.entries(metrics).map(([key, value]) => [
      key,
      key.endsWith("At") ? convertTimestamp(value) : value,
    ])
  );

const normalizeAggregates = (aggregates = null) => {
  if (!aggregates || typeof aggregates !== "object") return aggregates;
  return Object.fromEntries(
    Object.entries(aggregates).map(([key, value]) => {
      if (value?.toDate || value instanceof Date) {
        return [key, convertTimestamp(value)];
      }
      return [key, value];
    })
  );
};

const normalizeOwnerSnapshot = (ownerSnapshot = null) => {
  if (!ownerSnapshot || typeof ownerSnapshot !== "object") return ownerSnapshot;
  return Object.fromEntries(
    Object.entries(ownerSnapshot).map(([key, value]) => {
      if (value?.toDate || value instanceof Date) {
        return [key, convertTimestamp(value)];
      }
      return [key, value];
    })
  );
};

const getApartmentRef = (apartmentId) =>
  doc(db, APARTMENTS_COLLECTION, apartmentId);

const normalizeLocation = (location) => {
  if (!location) return null;
  const lat =
    location.lat ??
    location.latitude ??
    location._lat ??
    location._latitude ??
    null;
  const lng =
    location.lng ??
    location.longitude ??
    location._long ??
    location._longitude ??
    null;
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return new GeoPoint(lat, lng);
  }
  return location;
};

const normalizeAvailableFrom = (value) => {
  if (!value) return null;
  if (value instanceof Date) {
    return Timestamp.fromDate(value);
  }
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return Timestamp.fromDate(parsed);
    }
  }
  return value;
};
const createApartmentRef = () =>
  doc(collection(db, APARTMENTS_COLLECTION));

const resolveCursorSnapshot = async (cursor) => {
  if (!cursor) return null;
  if (typeof cursor !== "string") return cursor;

  const snapshot = await getDoc(getApartmentRef(cursor));
  return snapshot.exists() ? snapshot : null;
};

/** @type {FirestoreApartmentRepositoryShape} */
export const FirestoreApartmentRepository = {
  getRef: getApartmentRef,
  createRef: createApartmentRef,
  createId: () => createApartmentRef().id,
  async getById(apartmentId) {
    if (!apartmentId) {
      throw new Error("Apartment ID mancante.");
    }

    const snap = await getDoc(getApartmentRef(apartmentId));
    if (!snap.exists()) return null;

    const data = snap.data();

    return {
      id: snap.id,
      ...data,
      metrics: normalizeMetrics(data.metrics),
      aggregates: normalizeAggregates(data.aggregates),
      ownerSnapshot: normalizeOwnerSnapshot(data.ownerSnapshot),
      createdAt: convertTimestamp(data.createdAt),
      updatedAt: convertTimestamp(data.updatedAt),
      publishedAt: convertTimestamp(data.publishedAt),
      submittedAt: convertTimestamp(data.submittedAt),
    };
  },
  async createApartmentWithRooms({
    apartmentId,
    apartmentData,
    roomsData = [],
    ownerId,
    ownerPublicOverrides = null,
    ownerPrivateOverrides = null,
  }) {
    if (!apartmentId) {
      throw new Error("Apartment ID mancante.");
    }
    if (!apartmentData || typeof apartmentData !== "object") {
      throw new Error("Dati appartamento non validi.");
    }
    if (!ownerId) {
      throw new Error("Owner ID mancante.");
    }

    const normalizedRoomsData = (roomsData || []).map((room) => {
      if (!room?.roomId) return room;
      return {
        ...room,
        data: {
          ...(room.data || {}),
          availability: {
            ...(room.data?.availability || {}),
            availableFrom: normalizeAvailableFrom(
              room.data?.availability?.availableFrom
            ),
          },
        },
      };
    });

    await callBackendApi("/v1/apartments", {
      method: "POST",
      body: {
        apartmentId,
        apartmentData: {
          ...apartmentData,
          address: {
            ...apartmentData.address,
            location: normalizeLocation(apartmentData?.address?.location),
          },
        },
        roomsData: normalizedRoomsData,
        ownerPublicOverrides,
        ownerPrivateOverrides,
      },
    });
  },
  async fetchAppartamentiPage({ constraints, pageSize, cursor }) {
    const baseQuery = [
      collection(db, APARTMENTS_COLLECTION),
      ...(constraints || []),
    ];

    const cursorSnapshot = await resolveCursorSnapshot(cursor);
    if (cursorSnapshot) {
      baseQuery.push(startAfter(cursorSnapshot));
    }

    baseQuery.push(fbLimit(pageSize));

    const q = query(...baseQuery);
    const snapshot = await getDocs(q);

    const docs = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();

      return {
        id: docSnap.id,
        ...data,
        metrics: normalizeMetrics(data.metrics),
        aggregates: normalizeAggregates(data.aggregates),
        ownerSnapshot: normalizeOwnerSnapshot(data.ownerSnapshot),
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
        publishedAt: convertTimestamp(data.publishedAt),
        submittedAt: convertTimestamp(data.submittedAt),
        address: {
          ...data.address,
          location: {
            _lat: data.address?.location?._lat ?? null,
            _long: data.address?.location?._long ?? null,
          },
        },
      };
    });

    const newCursor = snapshot.docs.length
      ? snapshot.docs[snapshot.docs.length - 1].id
      : cursor || null;

    return {
      docs,
      cursor: newCursor,
      snapshotLength: snapshot.docs.length,
    };
  },
  async countByConstraints(constraints = []) {
    const q = query(
      collection(db, APARTMENTS_COLLECTION),
      ...(constraints || [])
    );
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count ?? 0;
  },
  async fetchPendingReview() {
    const q = query(
      collection(db, APARTMENTS_COLLECTION),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    const pending = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.status !== APARTMENT_STATUS.PENDING_REVIEW) return;

      pending.push({
        id: docSnap.id,
        ...data,
        aggregates: normalizeAggregates(data.aggregates),
        ownerSnapshot: normalizeOwnerSnapshot(data.ownerSnapshot),
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
        publishedAt: convertTimestamp(data.publishedAt),
      });
    });

    pending.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB - dateA;
    });

    return pending;
  },
  async incrementReportCount(apartmentId, delta = 1) {
    if (!apartmentId) {
      throw new Error("Apartment ID mancante.");
    }
    if (delta !== 1) {
      throw new Error("Operazione report non supportata.");
    }
    throw new Error("Usa la route report backend per incrementare i report.");
  },
  async publishApartment(apartmentId) {
    if (!apartmentId) {
      throw new Error("Apartment ID mancante.");
    }

    await callBackendApi(`/v1/admin/apartments/${apartmentId}/publish`, {
      method: "POST",
    });
  },
  async updateDescription(apartmentId, description) {
    if (!apartmentId) {
      throw new Error("Apartment ID mancante.");
    }

    return callBackendApi(`/v1/apartments/${apartmentId}/description`, {
      method: "PATCH",
      body: { description },
    });
  },
  async updateApartment(apartmentId, payload) {
    if (!apartmentId) {
      throw new Error("Apartment ID mancante.");
    }
    if (!payload || typeof payload !== "object") {
      throw new Error("Dati appartamento non validi.");
    }

    return callBackendApi(`/v1/apartments/${apartmentId}`, {
      method: "PATCH",
      body: { payload },
    });
  },
  async updateRooms(apartmentId, roomUpdates = []) {
    if (!apartmentId) {
      throw new Error("Apartment ID mancante.");
    }

    const normalizedRoomUpdates = (roomUpdates || []).map((room) => {
      if (!room?.roomId) return room;
      return {
        ...room,
        data: {
          ...(room.data || {}),
          availability: {
            ...(room.data?.availability || {}),
            availableFrom: normalizeAvailableFrom(
              room.data?.availability?.availableFrom
            ),
          },
        },
      };
    });

    return callBackendApi(`/v1/apartments/${apartmentId}/rooms`, {
      method: "PATCH",
      body: {
        roomUpdates: normalizedRoomUpdates,
      },
    });
  },
  async updateOccupants(
    apartmentId,
    { occupantUpserts = [], occupantDeletes = [] } = {}
  ) {
    if (!apartmentId) {
      throw new Error("Apartment ID mancante.");
    }

    return callBackendApi(`/v1/apartments/${apartmentId}/occupants`, {
      method: "PATCH",
      body: {
        occupantUpserts: Array.isArray(occupantUpserts) ? occupantUpserts : [],
        occupantDeletes: Array.isArray(occupantDeletes) ? occupantDeletes : [],
      },
    });
  },
};
