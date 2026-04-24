"use strict";

const { normalizeRoomOccupancy, ROOM_OCCUPANCY_STATUS } = require("./roomOccupancy");

const OCCUPANT_CONSENT_STATUS = Object.freeze({
  PENDING: "pending",
  GRANTED: "granted",
  REVOKED: "revoked",
});

const OCCUPANT_MODERATION_STATUS = Object.freeze({
  VISIBLE: "visible",
  PENDING_REVIEW: "pending_review",
  HIDDEN: "hidden",
});

const OCCUPANT_PRESENCE_STATUS = Object.freeze({
  PRESENT: "present",
  WEEKDAYS_ONLY: "weekdays_only",
  WEEKENDS_ONLY: "weekends_only",
  OCCASIONAL: "occasional",
  MOVING_IN: "moving_in",
  MOVING_OUT: "moving_out",
});

const DEFAULT_OCCUPANT_POLICY_VERSION = "2026-03-occupants-v1";
const MAX_ROOM_PHOTOS = 3;
const MAX_APARTMENT_PHOTOS = 8;
const MAX_PUBLIC_LIST_ITEMS = 12;
const MAX_SNAPSHOT_TAGS = 3;

const APARTMENT_MUTABLE_KEYS = new Set([
  "title",
  "description",
  "address",
  "features",
  "houseRules",
  "amenities",
  "additionalInfo",
  "apartmentPhotoUrls",
  "ownerSnapshot",
]);

const toArray = (value) => (Array.isArray(value) ? value : []);

const uniqueStrings = (values = [], maxItems = MAX_PUBLIC_LIST_ITEMS) => {
  const normalized = toArray(values)
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean)
    .slice(0, maxItems);

  return Array.from(new Set(normalized));
};

const toFiniteNumber = (value, fallback = null) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toPositiveNumber = (value, fallback = 0) => {
  const parsed = toFiniteNumber(value, fallback);
  return parsed > 0 ? parsed : fallback;
};

const startOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

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
    if (value instanceof Timestamp) return value;
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return Timestamp.fromDate(value);
    }

    if (typeof value?.toDate === "function") {
      return Timestamp.fromDate(value.toDate());
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return Timestamp.fromDate(parsed);
  };

  const timestampToDate = (value) => {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value?.toDate === "function") return value.toDate();
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const normalizeLocation = (location = null) => {
    if (!location || typeof location !== "object") return null;

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

    if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) {
      return null;
    }

    return new GeoPoint(Number(lat), Number(lng));
  };

  const normalizeStringList = (values = [], maxItems = MAX_PUBLIC_LIST_ITEMS) =>
    uniqueStrings(values, maxItems);

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

  const normalizeOwnerSnapshot = ({ ownerSnapshot = {}, ownerId }) => ({
    displayName: toTrimmedString(ownerSnapshot.displayName, "Host"),
    bio: toTrimmedString(ownerSnapshot.bio),
    isVerified: toBoolean(ownerSnapshot.isVerified, false),
    roleBadge: toNullableString(ownerSnapshot.roleBadge),
    photoUrl: toNullableString(ownerSnapshot.photoUrl),
    ownerId,
    inPlatformSince:
      parseDateToTimestamp(
        ownerSnapshot.inPlatformSince || ownerSnapshot.createdAt
      ) || FieldValue.serverTimestamp(),
  });

  const normalizeAddress = (address = {}) => ({
    street: toTrimmedString(address.street),
    city: toTrimmedString(address.city),
    provinceCode: toTrimmedString(address.provinceCode),
    postalCode: toTrimmedString(address.postalCode),
    area: toTrimmedString(address.area),
    location: normalizeLocation(address.location),
  });

  const normalizeFeatures = (features = {}) => ({
    totalAreaMq: toPositiveNumber(features.totalAreaMq),
    bathroomsCount: Math.trunc(toPositiveNumber(features.bathroomsCount)),
    heatingType: toTrimmedString(features.heatingType),
    utilitiesIncluded: Boolean(features.utilitiesIncluded),
    floor:
      Number.isFinite(Number(features.floor)) && features.floor !== ""
        ? Math.trunc(Number(features.floor))
        : toTrimmedString(features.floor),
    propertyCondition: toTrimmedString(features.propertyCondition),
    garageType: toTrimmedString(features.garageType),
    gardenType: toTrimmedString(features.gardenType),
  });

  const normalizeHouseRules = (houseRules = {}) => ({
    studentsOnly: toTrimmedString(houseRules.studentsOnly),
    petsAllowed: Boolean(houseRules.petsAllowed),
    smokingAllowed: Boolean(houseRules.smokingAllowed),
    partiesForbidden: Boolean(houseRules.partiesForbidden),
  });

  const normalizeAmenities = (amenities = {}) => ({
    parking: Boolean(amenities.parking),
    wifi: Boolean(amenities.wifi),
    airConditioning: Boolean(amenities.airConditioning),
    kitchenType: toTrimmedString(amenities.kitchenType),
    washer: Boolean(amenities.washer),
    elevator: Boolean(amenities.elevator),
    balcony: Boolean(amenities.balcony),
    kitchenBasics: Boolean(amenities.kitchenBasics),
    kitchenware: Boolean(amenities.kitchenware),
    dishwasher: Boolean(amenities.dishwasher),
    oven: Boolean(amenities.oven),
    tv: Boolean(amenities.tv),
    deskInRoom: Boolean(amenities.deskInRoom),
    dryer: Boolean(amenities.dryer),
    microwave: Boolean(amenities.microwave),
  });

  const normalizeAvailability = (availability = {}) => {
    const requestedAvailableNow = Boolean(availability.isAvailableNow);
    const availableFrom = requestedAvailableNow
      ? null
      : parseDateToTimestamp(availability.availableFrom);
    const availableFromDate = timestampToDate(availableFrom);

    if (availableFromDate && availableFromDate < startOfToday()) {
      return {
        isAvailableNow: true,
        availableFrom: null,
      };
    }

    return {
      isAvailableNow: requestedAvailableNow,
      availableFrom,
    };
  };

  const normalizeApartmentBasePayload = ({ apartmentData = {}, ownerId }) => {
    if (!ownerId) {
      throw new ApiError(401, "Owner non autenticato.");
    }

    const normalized = {
      title: toTrimmedString(apartmentData.title),
      description: toTrimmedString(apartmentData.description),
      address: normalizeAddress(apartmentData.address || {}),
      features: normalizeFeatures(apartmentData.features || {}),
      houseRules: normalizeHouseRules(apartmentData.houseRules || {}),
      amenities: normalizeAmenities(apartmentData.amenities || {}),
      additionalInfo: toTrimmedString(apartmentData.additionalInfo),
      apartmentPhotoUrls: normalizeStringList(
        apartmentData.apartmentPhotoUrls,
        MAX_APARTMENT_PHOTOS
      ),
      ownerId,
      ownerSnapshot: normalizeOwnerSnapshot({
        ownerSnapshot: apartmentData.ownerSnapshot || {},
        ownerId,
      }),
    };

    if (!normalized.title) {
      throw new ApiError(400, "Titolo annuncio mancante.");
    }
    if (!normalized.description) {
      throw new ApiError(400, "Descrizione annuncio mancante.");
    }
    if (!normalized.address.location) {
      throw new ApiError(400, "Coordinate annuncio non valide.");
    }
    if (!normalized.address.city) {
      throw new ApiError(400, "Città annuncio mancante.");
    }

    return normalized;
  };

  const normalizeRoomPayload = (room = {}) => {
    const data = room.data || room;
    const roomId = toTrimmedString(room.roomId || data.roomId);
    if (!roomId) return null;

    const availability = normalizeAvailability(data.availability || {});
    const occupantIds = normalizeStringList(data.occupantIds);
    const occupancy = normalizeRoomOccupancy(
      data.occupancy || {},
      occupantIds,
      availability
    );

    return {
      roomId,
      data: {
        roomId,
        type: toTrimmedString(data.type),
        priceMonthly: toPositiveNumber(data.priceMonthly),
        areaMq: toPositiveNumber(data.areaMq),
        furnishing: toTrimmedString(data.furnishing),
        availability,
        occupancy,
        occupantIds,
        photoUrls: normalizeStringList(data.photoUrls, MAX_ROOM_PHOTOS),
        notes: toTrimmedString(data.notes),
      },
    };
  };

  const normalizeRoomsPayload = (roomsData = []) =>
    toArray(roomsData).map(normalizeRoomPayload).filter(Boolean);

  const calculateRoomAggregates = (rooms = []) => {
    const prices = [];
    const availabilityDates = [];
    const roomTypes = new Set();
    let totalRoomsAvailable = 0;
    let roomsAreaTotalMq = 0;

    rooms.forEach((room) => {
      const data = room.data || room;
      const price = Number(data.priceMonthly);
      if (Number.isFinite(price) && price > 0) prices.push(price);

      const area = Number(data.areaMq);
      if (Number.isFinite(area) && area > 0) roomsAreaTotalMq += area;

      if (toTrimmedString(data.type)) roomTypes.add(toTrimmedString(data.type));

      const occupancy = data.occupancy || {};
      const spotsAvailable = Number(occupancy.spotsAvailable);
      if (
        data.availability?.isAvailableNow === true &&
        Number.isFinite(spotsAvailable) &&
        spotsAvailable > 0
      ) {
        totalRoomsAvailable += 1;
      }

      if (data.availability?.isAvailableNow === false) {
        const availableFrom = timestampToDate(data.availability?.availableFrom);
        if (availableFrom) availabilityDates.push(availableFrom);
      }
    });

    const availableFromMin = availabilityDates.length
      ? Timestamp.fromDate(
          new Date(Math.min(...availabilityDates.map((date) => date.getTime())))
        )
      : null;

    return {
      minRoomPrice: prices.length ? Math.min(...prices) : null,
      maxRoomPrice: prices.length ? Math.max(...prices) : null,
      totalRooms: rooms.length,
      totalRoomsAvailable,
      roomTypes: Array.from(roomTypes).sort(),
      isAvailableNow: totalRoomsAvailable > 0,
      availableFromMin,
      roomsAreaTotalMq,
      updatedAt: FieldValue.serverTimestamp(),
    };
  };

  const calculateOccupancySummary = (rooms = [], occupants = []) => {
    const counters = {
      roomsFree: 0,
      roomsOccupied: 0,
      roomsPartiallyOccupied: 0,
      roomsAvailableWithOccupants: 0,
      roomsUnknown: 0,
    };

    rooms.forEach((room) => {
      const status = (room.data || room).occupancy?.status;
      if (status === ROOM_OCCUPANCY_STATUS.FREE) counters.roomsFree += 1;
      else if (status === ROOM_OCCUPANCY_STATUS.OCCUPIED) counters.roomsOccupied += 1;
      else if (status === ROOM_OCCUPANCY_STATUS.PARTIALLY_OCCUPIED) {
        counters.roomsPartiallyOccupied += 1;
      } else if (status === ROOM_OCCUPANCY_STATUS.AVAILABLE_WITH_OCCUPANTS) {
        counters.roomsAvailableWithOccupants += 1;
      } else {
        counters.roomsUnknown += 1;
      }
    });

    return {
      totalRooms: rooms.length,
      ...counters,
      currentOccupantsCount: occupants.length,
      updatedAt: FieldValue.serverTimestamp(),
    };
  };

  const isOccupantPubliclyVisible = (occupant = {}) =>
    occupant.visibility?.isPublic === true &&
    occupant.consent?.status === OCCUPANT_CONSENT_STATUS.GRANTED &&
    occupant.moderation?.status === OCCUPANT_MODERATION_STATUS.VISIBLE;

  const buildOccupantListingSnapshot = (occupants = []) => {
    const visibleOccupants = occupants.filter(isOccupantPubliclyVisible);
    const tagCounts = new Map();

    const getInitials = (displayName = "") => {
      const parts = toTrimmedString(displayName)
        .split(/\s+/)
        .filter(Boolean);
      if (!parts.length) return "U";
      return parts
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
    };

    visibleOccupants.forEach((occupant) => {
      normalizeStringList(occupant.publicProfile?.lifestyleTags).forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    const topTags = Array.from(tagCounts.entries())
      .sort((left, right) => right[1] - left[1])
      .slice(0, MAX_SNAPSHOT_TAGS)
      .map(([tag]) => tag);

    return {
      visibleOccupantsCount: visibleOccupants.length,
      avatarUrls: visibleOccupants
        .map((occupant) => occupant.publicProfile?.avatarUrl)
        .filter(Boolean),
      items: visibleOccupants.map((occupant) => ({
        occupantId: occupant.occupantId || null,
        displayName: occupant.publicProfile?.displayName || "",
        initials: getInitials(occupant.publicProfile?.displayName),
        avatarUrl: occupant.publicProfile?.avatarUrl || null,
      })),
      topTags,
      vibeLabel: topTags.length ? `Vibe: ${topTags[0]}` : null,
      hasConsentBackedData: visibleOccupants.length > 0,
      updatedAt: FieldValue.serverTimestamp(),
    };
  };

  const normalizeConsentStatus = (value) =>
    Object.values(OCCUPANT_CONSENT_STATUS).includes(value)
      ? value
      : OCCUPANT_CONSENT_STATUS.PENDING;

  const normalizePresenceStatus = (value) =>
    Object.values(OCCUPANT_PRESENCE_STATUS).includes(value)
      ? value
      : OCCUPANT_PRESENCE_STATUS.PRESENT;

  const normalizePublicProfile = (profile = {}) => ({
    displayName: toTrimmedString(profile.displayName),
    avatarUrl: toNullableString(profile.avatarUrl),
    ageRange: toNullableString(profile.ageRange),
    university: toNullableString(profile.university),
    faculty: toNullableString(profile.faculty),
    course: toNullableString(profile.course),
    shortBio: toNullableString(profile.shortBio),
    lifestyleTags: normalizeStringList(profile.lifestyleTags),
    interests: normalizeStringList(profile.interests),
    languages: normalizeStringList(profile.languages),
    livingRhythm: toNullableString(profile.livingRhythm),
    cleanlinessLevel: toNullableString(profile.cleanlinessLevel),
    socialLevel: toNullableString(profile.socialLevel),
    weekendPresence: toNullableString(profile.weekendPresence),
  });

  const normalizeSearchFacet = (value) =>
    typeof value === "string" ? value.trim().toLowerCase() : null;

  const buildSearchableFacets = (publicProfile = {}) => ({
    lifestyleTags: normalizeStringList(publicProfile.lifestyleTags).map((tag) =>
      tag.toLowerCase()
    ),
    interests: normalizeStringList(publicProfile.interests).map((tag) =>
      tag.toLowerCase()
    ),
    languages: normalizeStringList(publicProfile.languages).map((tag) =>
      tag.toLowerCase()
    ),
    university: normalizeSearchFacet(publicProfile.university),
    faculty: normalizeSearchFacet(publicProfile.faculty),
    course: normalizeSearchFacet(publicProfile.course),
    livingRhythm: normalizeSearchFacet(publicProfile.livingRhythm),
    cleanlinessLevel: normalizeSearchFacet(publicProfile.cleanlinessLevel),
    socialLevel: normalizeSearchFacet(publicProfile.socialLevel),
    weekendPresence: normalizeSearchFacet(publicProfile.weekendPresence),
  });

  const normalizeOccupantUpsert = ({
    payload = {},
    generatedId,
    apartmentId,
    apartment,
    roomIds,
    ownerId,
    existingOccupant = null,
    existingPrivateOccupant = null,
  }) => {
    const occupantId = toTrimmedString(payload.occupantId) || generatedId;
    const roomId = toTrimmedString(payload.roomId);
    if (!roomIds.has(roomId)) {
      throw new ApiError(400, "Stanza coinquilino non valida.");
    }

    const publicProfile = normalizePublicProfile(payload.publicProfile || {});
    if (!publicProfile.displayName) {
      throw new ApiError(400, "Nome visibile coinquilino mancante.");
    }

    const consentStatus = normalizeConsentStatus(payload.consent?.status);
    const requestedPublic = payload.visibility?.isPublic === true;
    const isPublic =
      consentStatus === OCCUPANT_CONSENT_STATUS.GRANTED && requestedPublic;

    const moderation = existingOccupant?.moderation || {
      status: OCCUPANT_MODERATION_STATUS.VISIBLE,
      note: null,
      flaggedAt: null,
    };

    const publicDoc = {
      occupantId,
      apartmentId,
      roomId,
      ownerId,
      city: toTrimmedString(apartment?.address?.city),
      provinceCode: toTrimmedString(apartment?.address?.provinceCode),
      apartmentStatus: apartment?.status || APARTMENT_STATUS.PENDING_REVIEW,
      presenceStatus: normalizePresenceStatus(payload.presenceStatus),
      publicProfile,
      searchableFacets: buildSearchableFacets(publicProfile),
      consent: {
        status: consentStatus,
        grantedAt:
          consentStatus === OCCUPANT_CONSENT_STATUS.GRANTED
            ? existingOccupant?.consent?.grantedAt || FieldValue.serverTimestamp()
            : null,
        revokedAt:
          consentStatus === OCCUPANT_CONSENT_STATUS.REVOKED
            ? FieldValue.serverTimestamp()
            : null,
        policyVersion:
          toNullableString(payload.consent?.policyVersion) ||
          DEFAULT_OCCUPANT_POLICY_VERSION,
      },
      visibility: {
        isPublic,
        reason: isPublic ? null : "consent_required",
      },
      moderation,
      privateRef: `apartments/${apartmentId}/occupantsPrivate/${occupantId}`,
      updatedAt: FieldValue.serverTimestamp(),
    };

    const privateDoc = {
      occupantId,
      apartmentId,
      roomId,
      consent: {
        status: consentStatus,
        scopes:
          payload.consent?.scopes && typeof payload.consent.scopes === "object"
            ? payload.consent.scopes
            : {},
        policyVersion: publicDoc.consent.policyVersion,
        declaration: toNullableString(payload.consent?.declaration),
        evidenceNote: toNullableString(payload.consent?.evidenceNote),
        obtainedByHostId: ownerId,
        obtainedAt:
          consentStatus === OCCUPANT_CONSENT_STATUS.GRANTED
            ? existingPrivateOccupant?.consent?.obtainedAt ||
              FieldValue.serverTimestamp()
            : null,
      },
      updatedAt: FieldValue.serverTimestamp(),
    };

    return { occupantId, publicDoc, privateDoc };
  };

  const assertApartmentOwnership = async ({
    apartmentId,
    uid,
    allowAdmin = false,
    claims = {},
  } = {}) => {
    const normalizedApartmentId = toTrimmedString(apartmentId);
    if (!normalizedApartmentId) {
      throw new ApiError(400, "Apartment ID mancante");
    }

    const apartmentRef = getApartmentRef(normalizedApartmentId);
    const snap = await apartmentRef.get();
    if (!snap.exists) {
      throw new ApiError(404, "Annuncio non trovato");
    }

    const data = snap.data() || {};
    const role = String(claims.role || claims.claims?.role || "").toLowerCase();
    const isAdmin = role === "admin";
    if ((!isAdmin || !allowAdmin) && data.ownerId !== uid) {
      throw new ApiError(403, "Operazione non consentita");
    }

    return { apartmentRef, apartmentId: normalizedApartmentId, apartment: data };
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
    const normalizedApartmentBase = normalizeApartmentBasePayload({
      apartmentData,
      ownerId,
    });
    const normalizedRooms = normalizeRoomsPayload(roomsData);
    if (!normalizedRooms.length) {
      throw new ApiError(400, "Inserisci almeno una stanza.");
    }

    const publicOverrides = normalizeOwnerPublicOverrides(ownerPublicOverrides);
    const privateOverrides = normalizeOwnerPrivateOverrides(ownerPrivateOverrides);
    const aggregates = calculateRoomAggregates(normalizedRooms);
    const occupancySummary = calculateOccupancySummary(normalizedRooms, []);
    const occupantListingSnapshot = buildOccupantListingSnapshot([]);

    const apartmentRef = getApartmentRef(normalizedApartmentId);
    const summaryRef = apartmentRef
      .collection("analytics")
      .doc(analyticsSummaryDocId);
    const usersPublicRef = db.collection("usersPublic").doc(ownerId);
    const usersPrivateRef = db.collection("usersPrivate").doc(ownerId);

    const batch = db.batch();

    batch.set(apartmentRef, {
      ...normalizedApartmentBase,
      status: APARTMENT_STATUS.PENDING_REVIEW,
      isFeatured: false,
      aggregates,
      occupancySummary,
      occupantListingSnapshot,
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
      publishedAt: null,
    });

    batch.set(summaryRef, {
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    normalizedRooms.forEach((room) => {
      const roomRef = apartmentRef.collection("rooms").doc(room.roomId);
      batch.set(roomRef, {
        ...room.data,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
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

  const updateApartmentDescription = async ({
    apartmentId,
    uid,
    claims,
    description,
  } = {}) => {
    const { apartmentRef } = await assertApartmentOwnership({
      apartmentId,
      uid,
      allowAdmin: true,
      claims,
    });

    const normalizedDescription = toTrimmedString(description);
    if (!normalizedDescription) {
      throw new ApiError(400, "Descrizione annuncio mancante.");
    }

    await apartmentRef.update({
      description: normalizedDescription,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { updated: true, apartment: { description: normalizedDescription } };
  };

  const updateApartment = async ({ apartmentId, uid, claims, payload } = {}) => {
    if (!payload || typeof payload !== "object") {
      throw new ApiError(400, "Payload aggiornamento non valido");
    }

    const { apartmentRef, apartment } = await assertApartmentOwnership({
      apartmentId,
      uid,
      allowAdmin: true,
      claims,
    });

    const forbiddenKey = Object.keys(payload).find(
      (key) => !APARTMENT_MUTABLE_KEYS.has(key)
    );
    if (forbiddenKey) {
      throw new ApiError(400, `Campo appartamento non aggiornabile: ${forbiddenKey}`);
    }

    const merged = {
      ...apartment,
      ...payload,
      address: payload.address || apartment.address || {},
      features: payload.features || apartment.features || {},
      houseRules: payload.houseRules || apartment.houseRules || {},
      amenities: payload.amenities || apartment.amenities || {},
      ownerSnapshot: payload.ownerSnapshot || apartment.ownerSnapshot || {},
      apartmentPhotoUrls:
        payload.apartmentPhotoUrls || apartment.apartmentPhotoUrls || [],
    };

    const normalizedBase = normalizeApartmentBasePayload({
      apartmentData: merged,
      ownerId: apartment.ownerId,
    });

    const update = {};
    Object.keys(payload).forEach((key) => {
      update[key] = normalizedBase[key];
    });
    update.updatedAt = FieldValue.serverTimestamp();

    await apartmentRef.update(update);
    return { updated: true, apartment: update };
  };

  const updateApartmentRooms = async ({
    apartmentId,
    uid,
    claims,
    roomUpdates = [],
  } = {}) => {
    const { apartmentRef } = await assertApartmentOwnership({
      apartmentId,
      uid,
      allowAdmin: true,
      claims,
    });

    const normalizedRooms = normalizeRoomsPayload(roomUpdates);
    if (!normalizedRooms.length) {
      throw new ApiError(400, "Nessuna stanza da aggiornare");
    }

    const occupantsSnapshot = await apartmentRef.collection("occupants").get();
    const occupants = occupantsSnapshot.docs.map((docSnap) => docSnap.data() || {});
    const occupantsByRoomId = occupants.reduce((accumulator, occupant) => {
      const roomId = toTrimmedString(occupant.roomId);
      const occupantId = toTrimmedString(occupant.occupantId || occupant.id);
      if (!roomId || !occupantId) return accumulator;
      if (!accumulator[roomId]) accumulator[roomId] = [];
      accumulator[roomId].push(occupantId);
      return accumulator;
    }, {});

    const roomsWithOccupants = normalizedRooms.map((room) => {
      const occupantIds = occupantsByRoomId[room.roomId] || room.data.occupantIds || [];
      const occupancy = normalizeRoomOccupancy(
        {
          ...(room.data.occupancy || {}),
          spotsOccupied: occupantIds.length,
        },
        occupantIds,
        room.data.availability
      );

      return {
        ...room,
        data: {
          ...room.data,
          occupantIds,
          occupancy,
        },
      };
    });

    const aggregates = calculateRoomAggregates(roomsWithOccupants);
    const occupancySummary = calculateOccupancySummary(roomsWithOccupants, occupants);
    const batch = db.batch();

    roomsWithOccupants.forEach((room) => {
      const roomRef = apartmentRef.collection("rooms").doc(room.roomId);
      batch.set(
        roomRef,
        {
          ...room.data,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    });

    batch.update(apartmentRef, {
      aggregates,
      occupancySummary,
      updatedAt: FieldValue.serverTimestamp(),
    });

    await batch.commit();
    return { updated: true, aggregates, occupancySummary };
  };

  const updateApartmentOccupants = async ({
    apartmentId,
    uid,
    claims,
    occupantUpserts = [],
    occupantDeletes = [],
  } = {}) => {
    const ownership = await assertApartmentOwnership({
      apartmentId,
      uid,
      allowAdmin: true,
      claims,
    });

    const { apartmentRef, apartmentId: normalizedApartmentId, apartment } = ownership;
    const roomsSnapshot = await apartmentRef.collection("rooms").get();
    const rooms = roomsSnapshot.docs.map((docSnap) => ({
      roomId: docSnap.id,
      data: { ...(docSnap.data() || {}), roomId: docSnap.id },
    }));
    const roomIds = new Set(rooms.map((room) => room.roomId));
    if (!roomIds.size) {
      throw new ApiError(400, "Aggiungi almeno una stanza prima dei coinquilini.");
    }

    const occupantsSnapshot = await apartmentRef.collection("occupants").get();
    const existingOccupants = new Map(
      occupantsSnapshot.docs.map((docSnap) => [
        docSnap.id,
        { ...(docSnap.data() || {}), occupantId: docSnap.id },
      ])
    );
    const privateOccupantsSnapshot = await apartmentRef
      .collection("occupantsPrivate")
      .get();
    const existingPrivateOccupants = new Map(
      privateOccupantsSnapshot.docs.map((docSnap) => [
        docSnap.id,
        { ...(docSnap.data() || {}), occupantId: docSnap.id },
      ])
    );
    const deleteIds = new Set(
      normalizeStringList(occupantDeletes, 100).filter((id) =>
        existingOccupants.has(id)
      )
    );

    const normalizedUpserts = toArray(occupantUpserts).map((payload) => {
      const requestedId = toTrimmedString(payload?.occupantId);
      const generatedId = apartmentRef.collection("occupants").doc().id;
      return normalizeOccupantUpsert({
        payload,
        generatedId,
        apartmentId: normalizedApartmentId,
        apartment,
        roomIds,
        ownerId: apartment.ownerId,
        existingOccupant: requestedId ? existingOccupants.get(requestedId) : null,
        existingPrivateOccupant: requestedId
          ? existingPrivateOccupants.get(requestedId)
          : null,
      });
    });

    const nextOccupants = new Map(existingOccupants);
    deleteIds.forEach((occupantId) => nextOccupants.delete(occupantId));
    normalizedUpserts.forEach(({ occupantId, publicDoc }) => {
      nextOccupants.set(occupantId, publicDoc);
      deleteIds.delete(occupantId);
    });

    const nextOccupantsList = Array.from(nextOccupants.values());
    const occupantIdsByRoomId = nextOccupantsList.reduce(
      (accumulator, occupant) => {
        const roomId = toTrimmedString(occupant.roomId);
        const occupantId = toTrimmedString(occupant.occupantId);
        if (!roomIds.has(roomId) || !occupantId) return accumulator;
        if (!accumulator[roomId]) accumulator[roomId] = [];
        accumulator[roomId].push(occupantId);
        return accumulator;
      },
      {}
    );

    const normalizedRooms = rooms.map((room) => {
      const occupantIds = occupantIdsByRoomId[room.roomId] || [];
      const data = normalizeRoomPayload({
        roomId: room.roomId,
        data: {
          ...room.data,
          occupantIds,
          occupancy: {
            ...(room.data.occupancy || {}),
            spotsOccupied: occupantIds.length,
          },
        },
      }).data;

      return { roomId: room.roomId, data };
    });

    const aggregates = calculateRoomAggregates(normalizedRooms);
    const occupancySummary = calculateOccupancySummary(
      normalizedRooms,
      nextOccupantsList
    );
    const occupantListingSnapshot =
      buildOccupantListingSnapshot(nextOccupantsList);
    const batch = db.batch();

    deleteIds.forEach((occupantId) => {
      batch.delete(apartmentRef.collection("occupants").doc(occupantId));
      batch.delete(apartmentRef.collection("occupantsPrivate").doc(occupantId));
    });

    normalizedUpserts.forEach(({ occupantId, publicDoc, privateDoc }) => {
      const publicRef = apartmentRef.collection("occupants").doc(occupantId);
      const privateRef = apartmentRef
        .collection("occupantsPrivate")
        .doc(occupantId);
      batch.set(
        publicRef,
        {
          ...publicDoc,
          createdAt: existingOccupants.has(occupantId)
            ? existingOccupants.get(occupantId).createdAt ||
              FieldValue.serverTimestamp()
            : FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      batch.set(
        privateRef,
        {
          ...privateDoc,
          createdAt: existingPrivateOccupants.has(occupantId)
            ? existingPrivateOccupants.get(occupantId).createdAt ||
              FieldValue.serverTimestamp()
            : FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    });

    normalizedRooms.forEach((room) => {
      batch.set(
        apartmentRef.collection("rooms").doc(room.roomId),
        {
          ...room.data,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    });

    batch.update(apartmentRef, {
      aggregates,
      occupancySummary,
      occupantListingSnapshot,
      updatedAt: FieldValue.serverTimestamp(),
    });

    await batch.commit();
    return {
      updated: true,
      aggregates,
      occupancySummary,
      occupantListingSnapshot,
    };
  };

  const publishApartmentByAdmin = async (apartmentId) => {
    const normalizedApartmentId = toTrimmedString(apartmentId);
    const apartmentRef = getApartmentRef(normalizedApartmentId);
    const snap = await apartmentRef.get();
    if (!snap.exists) {
      throw new ApiError(404, "Annuncio non trovato");
    }

    const apartment = snap.data() || {};
    const batch = db.batch();

    batch.update(apartmentRef, {
      status: APARTMENT_STATUS.PUBLISHED,
      publishedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    const occupantsSnapshot = await apartmentRef.collection("occupants").get();
    occupantsSnapshot.docs.forEach((docSnap) => {
      batch.update(docSnap.ref, {
        apartmentStatus: APARTMENT_STATUS.PUBLISHED,
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();

    if (apartment.ownerId) {
      await sendVerificationSuccessMessage({
        userId: apartment.ownerId,
        apartmentId: normalizedApartmentId,
        apartmentTitle: apartment.title || "il tuo annuncio",
      });
    }

    return { published: true };
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
      } catch {
        // Storage cleanup must not make moderation state inconsistent.
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

  const rejectApartmentByAdmin = async (apartmentId) => {
    await rejectApartmentWithSideEffects(apartmentId);
    return { removed: true };
  };

  return {
    createApartment,
    updateApartmentDescription,
    updateApartment,
    updateApartmentRooms,
    updateApartmentOccupants,
    publishApartmentByAdmin,
    rejectApartmentByAdmin,
    rejectApartmentWithSideEffects,
  };
};

module.exports = {
  createApartmentsService,
};
