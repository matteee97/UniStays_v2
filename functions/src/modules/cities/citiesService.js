"use strict";

const createCitiesService = ({
  db,
  FieldValue,
  APARTMENT_STATUS,
  ApiError,
  toTrimmedString,
  toFiniteNumber,
} = {}) => {
  if (
    !db ||
    !FieldValue ||
    !APARTMENT_STATUS ||
    !ApiError ||
    typeof toTrimmedString !== "function" ||
    typeof toFiniteNumber !== "function"
  ) {
    throw new Error("Missing cities service dependencies.");
  }

  const toCitySlug = (city, provinceCode) => {
    const base = `${city || ""}${provinceCode ? `-${provinceCode}` : ""}`
      .trim()
      .toLowerCase();
    return base
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/-{2,}/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const buildCityPayload = (input = {}, { withCreatedAt = false } = {}) => {
    const city = toTrimmedString(input.city);
    if (!city) {
      throw new ApiError(400, "city is required");
    }

    const provinceCode = toTrimmedString(input.provinceCode || input.sigla || "");
    const university = toTrimmedString(input.university || "");
    const slug = toTrimmedString(input.slug) || toCitySlug(city, provinceCode);
    const lat = toFiniteNumber(input.lat ?? input?.coords?.lat, null);
    const lng = toFiniteNumber(input.lng ?? input?.coords?.lng, null);
    const imgUrl = toTrimmedString(input.imgUrl || input.imageUrl || "");

    return {
      city,
      provinceCode,
      university,
      slug,
      imgUrl,
      coords: { lat, lng },
      active: input.active !== false,
      updatedAt: FieldValue.serverTimestamp(),
      ...(withCreatedAt ? { createdAt: FieldValue.serverTimestamp() } : {}),
    };
  };

  const countPublishedListingsForCity = async (cityName) => {
    if (!cityName) return 0;
    const snapshot = await db
      .collection("apartments")
      .where("address.city", "==", cityName)
      .where("status", "==", APARTMENT_STATUS.PUBLISHED)
      .get();
    return snapshot.size || 0;
  };

  const createCity = async (payload = {}) => {
    const nextPayload = buildCityPayload(payload, { withCreatedAt: true });

    const existingSnapshot = await db
      .collection("cities")
      .where("slug", "==", nextPayload.slug)
      .limit(1)
      .get();

    if (!existingSnapshot.empty) {
      throw new ApiError(409, "Slug città già esistente, scegline uno diverso.");
    }

    const createdRef = await db.collection("cities").add(nextPayload);
    return { cityId: createdRef.id };
  };

  const updateCity = async ({ cityId, payload = {} } = {}) => {
    const normalizedCityId = toTrimmedString(cityId);
    if (!normalizedCityId) {
      throw new ApiError(400, "City ID mancante");
    }

    const nextPayload = buildCityPayload(payload, { withCreatedAt: false });

    const existingSnapshot = await db
      .collection("cities")
      .where("slug", "==", nextPayload.slug)
      .limit(5)
      .get();

    const conflicting = existingSnapshot.docs.find(
      (docSnap) => docSnap.id !== normalizedCityId
    );
    if (conflicting) {
      throw new ApiError(409, "Slug città già esistente, scegline uno diverso.");
    }

    await db.collection("cities").doc(normalizedCityId).update(nextPayload);
    return { updated: true };
  };

  const deleteCity = async (cityId) => {
    const normalizedCityId = toTrimmedString(cityId);
    if (!normalizedCityId) {
      throw new ApiError(400, "City ID mancante");
    }

    await db.collection("cities").doc(normalizedCityId).delete();
    return { deleted: true };
  };

  const recomputeListingsCount = async () => {
    const snapshot = await db.collection("cities").get();
    const updates = [];

    for (const cityDoc of snapshot.docs) {
      const cityData = cityDoc.data() || {};
      const cityName = toTrimmedString(cityData.city);
      const listingsCount = await countPublishedListingsForCity(cityName);

      await cityDoc.ref.update({
        stats: {
          ...(cityData.stats || {}),
          listingsCount,
        },
        updatedAt: FieldValue.serverTimestamp(),
      });

      updates.push({ id: cityDoc.id, city: cityName, listingsCount });
    }

    return { updates };
  };

  return {
    createCity,
    updateCity,
    deleteCity,
    recomputeListingsCount,
  };
};

module.exports = {
  createCitiesService,
};
