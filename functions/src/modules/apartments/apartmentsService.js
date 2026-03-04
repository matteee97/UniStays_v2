"use strict";

const createApartmentsService = ({
  db,
  FieldValue,
  Timestamp,
  GeoPoint,
  APARTMENT_STATUS,
  analyticsSummaryDocId = "summary",
  ApiError,
  toTrimmedString,
  toNullableString,
  toBoolean,
  sendVerificationSuccessMessage,
  sendRemovalMessage,
  getStorageBucket,
} = {}) => {
  if (
    !db ||
    !FieldValue ||
    !Timestamp ||
    !GeoPoint ||
    !APARTMENT_STATUS ||
    !ApiError ||
    typeof toTrimmedString !== "function" ||
    typeof toNullableString !== "function" ||
    typeof toBoolean !== "function" ||
    typeof sendVerificationSuccessMessage !== "function" ||
    typeof sendRemovalMessage !== "function"
  ) {
    throw new Error("Missing apartments service dependencies.");
  }

  const getApartmentRef = (apartmentId) =>
    db.collection("apartments").doc(apartmentId);

  const parseDateToTimestamp = (value) => {
    if (!value) return null;
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return Timestamp.fromDate(value);
    }
    if (value instanceof Timestamp) {
      return value;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return Timestamp.fromDate(parsed);
  };

  const normalizeLocation = (location = null) => {
    if (!location || typeof location !== "object") {
      return null;
    }

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

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return null;
    }

    return new GeoPoint(Number(lat), Number(lng));
  };

  const normalizeOwnerPublicOverrides = (payload = null) => {
    if (!payload || typeof payload !== "object") return {};
    return {
      ...(toTrimmedString(payload.displayName).length
        ? { displayName: toTrimmedString(payload.displayName) }
        : {}),
      ...(toTrimmedString(payload.firstName).length
        ? { firstName: toTrimmedString(payload.firstName) }
        : {}),
      ...(toTrimmedString(payload.lastName).length
        ? { lastName: toTrimmedString(payload.lastName) }
        : {}),
      ...(typeof payload.isAgency === "boolean"
        ? { isAgency: payload.isAgency }
        : {}),
      ...(typeof payload.bio === "string" ? { bio: payload.bio.trim() } : {}),
      ...(typeof payload.photoUrl === "string"
        ? { photoUrl: payload.photoUrl.trim() }
        : {}),
    };
  };

  const normalizeOwnerPrivateOverrides = (payload = null) => {
    if (!payload || typeof payload !== "object") return {};
    return {
      ...(typeof payload.phone === "string" ? { phone: payload.phone.trim() } : {}),
      ...(typeof payload.email === "string" ? { email: payload.email.trim() } : {}),
    };
  };

  const normalizeApartmentCreatePayload = ({ apartmentData = {}, ownerId }) => {
    if (!ownerId) {
      throw new ApiError(401, "Owner non autenticato.");
    }

    const ownerSnapshot = apartmentData.ownerSnapshot || {};

    const normalized = {
      ...apartmentData,
      title: toTrimmedString(apartmentData.title),
      description: toTrimmedString(apartmentData.description),
      additionalInfo: toTrimmedString(apartmentData.additionalInfo),
      ownerId,
      status: APARTMENT_STATUS.PENDING_REVIEW,
      isFeatured: false,
      apartmentPhotoUrls: Array.isArray(apartmentData.apartmentPhotoUrls)
        ? apartmentData.apartmentPhotoUrls.filter((url) => typeof url === "string")
        : [],
      address: {
        ...(apartmentData.address || {}),
        location: normalizeLocation(apartmentData?.address?.location),
      },
      ownerSnapshot: {
        ...ownerSnapshot,
        displayName: toTrimmedString(ownerSnapshot.displayName),
        bio: typeof ownerSnapshot.bio === "string" ? ownerSnapshot.bio.trim() : "",
        roleBadge: toNullableString(ownerSnapshot.roleBadge),
        photoUrl: toNullableString(ownerSnapshot.photoUrl),
        ownerId,
        inPlatformSince:
          parseDateToTimestamp(ownerSnapshot.inPlatformSince) ||
          FieldValue.serverTimestamp(),
      },
      metrics: {
        totalViews: 0,
        likesCount: 0,
        totalReports: 0,
        reviewsCount: 0,
        ratingSum: 0,
        ratingAvg: 0,
        ratingCount: 0,
        score: null,
        updatedAt: FieldValue.serverTimestamp(),
      },
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      submittedAt: FieldValue.serverTimestamp(),
    };

    if (!normalized.title) {
      throw new ApiError(400, "Titolo annuncio mancante.");
    }

    if (!normalized.description) {
      throw new ApiError(400, "Descrizione annuncio mancante.");
    }

    if (!normalized.address?.location) {
      throw new ApiError(400, "Coordinate annuncio non valide.");
    }

    return normalized;
  };

  const normalizeRoomsPayload = (roomsData = []) => {
    if (!Array.isArray(roomsData)) return [];

    return roomsData
      .filter((room) => room && typeof room === "object" && room.roomId)
      .map((room) => {
        const data = room.data || {};
        const availability = data.availability || {};
        return {
          roomId: String(room.roomId),
          data: {
            ...data,
            roomId: String(room.roomId),
            type: toTrimmedString(data.type),
            priceMonthly: Number(data.priceMonthly) || 0,
            areaMq: Number(data.areaMq) || 0,
            furnishing: toTrimmedString(data.furnishing),
            notes: toTrimmedString(data.notes),
            photoUrls: Array.isArray(data.photoUrls)
              ? data.photoUrls.filter((url) => typeof url === "string")
              : [],
            availability: {
              isAvailableNow: Boolean(availability.isAvailableNow),
              availableFrom: availability.isAvailableNow
                ? null
                : parseDateToTimestamp(availability.availableFrom),
            },
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          },
        };
      });
  };

  const assertApartmentOwnership = async ({
    apartmentId,
    uid,
    allowAdmin = false,
    claims = {},
  } = {}) => {
    const normalizedApartmentId = toTrimmedString(apartmentId);
    const apartmentRef = getApartmentRef(normalizedApartmentId);
    const snap = await apartmentRef.get();
    if (!snap.exists) {
      throw new ApiError(404, "Annuncio non trovato");
    }

    const data = snap.data() || {};
    const role = String(claims.role || claims.claims?.role || "").toLowerCase();
    const isAdmin = role === "admin";
    if (!isAdmin || !allowAdmin) {
      if (data.ownerId !== uid) {
        throw new ApiError(403, "Operazione non consentita");
      }
    }

    return { apartmentRef, apartment: data };
  };

  const rejectApartmentWithSideEffects = async (apartmentId) => {
    const normalizedApartmentId = toTrimmedString(apartmentId);
    if (!normalizedApartmentId) {
      throw new ApiError(400, "Apartment ID mancante");
    }

    const apartmentRef = getApartmentRef(normalizedApartmentId);
    const apartmentSnap = await apartmentRef.get();
    if (!apartmentSnap.exists) {
      throw new ApiError(404, "Annuncio non trovato");
    }

    const apartment = apartmentSnap.data() || {};
    const ownerId = toNullableString(apartment.ownerId);

    if (ownerId) {
      const ownerRef = db.collection("usersPublic").doc(ownerId);
      const ownerSnap = await ownerRef.get();
      const currentCount = Number(ownerSnap.data()?.publicStats?.apartmentsCount || 0);
      if (ownerSnap.exists && currentCount > 0) {
        await ownerRef.set(
          {
            publicStats: {
              apartmentsCount: FieldValue.increment(-1),
            },
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      }
    }

    await db.recursiveDelete(apartmentRef);

    if (typeof getStorageBucket === "function") {
      try {
        const bucket = getStorageBucket();
        const [files] = await bucket.getFiles({
          prefix: `immagini/apt_${normalizedApartmentId}/`,
        });
        await Promise.allSettled(
          files.map((file) => file.delete({ ignoreNotFound: true }))
        );
      } catch (_) {
        // Ignore storage cleanup failures to keep moderation flow deterministic.
      }
    }

    if (ownerId) {
      await sendRemovalMessage({
        userId: ownerId,
        apartmentId: normalizedApartmentId,
        apartmentTitle: apartment.title || "il tuo annuncio",
      });
    }

    return {
      apartmentId: normalizedApartmentId,
      ownerId,
      apartmentTitle: apartment.title || "il tuo annuncio",
    };
  };

  const createApartment = async ({
    ownerId,
    apartmentId,
    apartmentData = {},
    roomsData = [],
    ownerPublicOverrides = null,
    ownerPrivateOverrides = null,
  } = {}) => {
    if (apartmentData?.ownerId && apartmentData.ownerId !== ownerId) {
      throw new ApiError(403, "Owner mismatch");
    }

    const normalizedApartmentId =
      toTrimmedString(apartmentId) || db.collection("apartments").doc().id;
    const normalizedApartment = normalizeApartmentCreatePayload({ apartmentData, ownerId });
    const normalizedRooms = normalizeRoomsPayload(roomsData);
    const publicOverrides = normalizeOwnerPublicOverrides(ownerPublicOverrides);
    const privateOverrides = normalizeOwnerPrivateOverrides(ownerPrivateOverrides);

    const apartmentRef = getApartmentRef(normalizedApartmentId);
    const summaryRef = apartmentRef
      .collection("analytics")
      .doc(analyticsSummaryDocId);
    const usersPublicRef = db.collection("usersPublic").doc(ownerId);
    const usersPrivateRef = db.collection("usersPrivate").doc(ownerId);

    const batch = db.batch();

    batch.set(apartmentRef, normalizedApartment);
    batch.set(summaryRef, {
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    normalizedRooms.forEach((room) => {
      const roomRef = apartmentRef.collection("rooms").doc(room.roomId);
      batch.set(roomRef, room.data);
    });

    batch.set(
      usersPublicRef,
      {
        userId: ownerId,
        isHost: true,
        updatedAt: FieldValue.serverTimestamp(),
        ...publicOverrides,
      },
      { merge: true }
    );

    batch.set(
      usersPublicRef,
      {
        publicStats: {
          apartmentsCount: FieldValue.increment(1),
        },
      },
      { merge: true }
    );

    batch.set(
      usersPrivateRef,
      {
        userId: ownerId,
        updatedAt: FieldValue.serverTimestamp(),
        ...privateOverrides,
      },
      { merge: true }
    );

    await batch.commit();

    return { apartmentId: normalizedApartmentId };
  };

  const updateApartmentDescription = async ({ apartmentId, uid, claims, description } = {}) => {
    const { apartmentRef } = await assertApartmentOwnership({
      apartmentId,
      uid,
      allowAdmin: true,
      claims,
    });

    await apartmentRef.update({
      description: toTrimmedString(description),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { updated: true };
  };

  const updateApartment = async ({ apartmentId, uid, claims, payload } = {}) => {
    if (!payload || typeof payload !== "object") {
      throw new ApiError(400, "Payload aggiornamento non valido");
    }

    const { apartmentRef } = await assertApartmentOwnership({
      apartmentId,
      uid,
      allowAdmin: true,
      claims,
    });

    const nextPayload = {
      ...payload,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (payload?.address?.location) {
      nextPayload.address = {
        ...payload.address,
        location: normalizeLocation(payload.address.location),
      };
    }

    await apartmentRef.update(nextPayload);
    return { updated: true };
  };

  const updateApartmentRooms = async ({
    apartmentId,
    uid,
    claims,
    roomUpdates = [],
    aggregates = null,
  } = {}) => {
    const { apartmentRef } = await assertApartmentOwnership({
      apartmentId,
      uid,
      allowAdmin: true,
      claims,
    });

    const normalizedRoomUpdates = normalizeRoomsPayload(roomUpdates);
    const normalizedAggregates =
      aggregates && typeof aggregates === "object" ? aggregates : null;

    if (!normalizedRoomUpdates.length) {
      throw new ApiError(400, "Nessuna stanza da aggiornare");
    }

    const batch = db.batch();

    normalizedRoomUpdates.forEach((room) => {
      const roomRef = apartmentRef.collection("rooms").doc(room.roomId);
      const roomData = {
        ...room.data,
        updatedAt: FieldValue.serverTimestamp(),
      };
      batch.update(roomRef, roomData);
    });

    const apartmentUpdate = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (normalizedAggregates) {
      apartmentUpdate.aggregates = normalizedAggregates;
    }

    batch.update(apartmentRef, apartmentUpdate);

    await batch.commit();
    return { updated: true };
  };

  const publishApartmentByAdmin = async (apartmentId) => {
    const normalizedApartmentId = toTrimmedString(apartmentId);
    const apartmentRef = getApartmentRef(normalizedApartmentId);
    const snap = await apartmentRef.get();
    if (!snap.exists) {
      throw new ApiError(404, "Annuncio non trovato");
    }

    const apartment = snap.data() || {};

    await apartmentRef.update({
      status: APARTMENT_STATUS.PUBLISHED,
      publishedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    if (apartment.ownerId) {
      await sendVerificationSuccessMessage({
        userId: apartment.ownerId,
        apartmentId: normalizedApartmentId,
        apartmentTitle: apartment.title || "il tuo annuncio",
      });
    }

    return { published: true };
  };

  const rejectApartmentByAdmin = async (apartmentId) => {
    await rejectApartmentWithSideEffects(apartmentId);
    return { removed: true };
  };

  return {
    createApartment,
    updateApartmentDescription,
    updateApartment,
    updateApartmentRooms,
    publishApartmentByAdmin,
    rejectApartmentByAdmin,
    rejectApartmentWithSideEffects,
  };
};

module.exports = {
  createApartmentsService,
};
