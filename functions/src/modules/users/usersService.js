"use strict";

const createUsersService = ({
  db,
  FieldValue,
  toTrimmedString,
  toNullableString,
  toBoolean,
  toFiniteNumber,
} = {}) => {
  if (
    !db ||
    !FieldValue ||
    typeof toTrimmedString !== "function" ||
    typeof toNullableString !== "function" ||
    typeof toBoolean !== "function" ||
    typeof toFiniteNumber !== "function"
  ) {
    throw new Error("Missing users service dependencies.");
  }

  const ensurePublicUser = async ({ userId, payload = {} } = {}) => {
    const normalizedUserId = toTrimmedString(userId);
    if (!normalizedUserId) {
      return { created: false };
    }

    const userRef = db.collection("usersPublic").doc(normalizedUserId);
    const snap = await userRef.get();
    if (snap.exists) {
      return { created: false };
    }

    await userRef.set({
      userId: normalizedUserId,
      displayName: toTrimmedString(payload.displayName) || "Utente",
      firstName: toNullableString(payload.firstName),
      lastName: toNullableString(payload.lastName),
      photoUrl: toNullableString(payload.photoUrl),
      bio: typeof payload.bio === "string" ? payload.bio.trim() : "",
      isHost: toBoolean(payload.isHost, false),
      isVerifiedHost: toBoolean(payload.isVerifiedHost, false),
      isAgency: toBoolean(payload.isAgency, false),
      publicStats: {
        apartmentsCount: Number(payload?.publicStats?.apartmentsCount) || 0,
        reportsCount: Number(payload?.publicStats?.reportsCount) || 0,
        resolvedReportsCount:
          Number(payload?.publicStats?.resolvedReportsCount) || 0,
      },
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { created: true };
  };

  const ensurePrivateUser = async ({ userId, payload = {} } = {}) => {
    const normalizedUserId = toTrimmedString(userId);
    if (!normalizedUserId) {
      return { created: false };
    }

    const userRef = db.collection("usersPrivate").doc(normalizedUserId);
    const snap = await userRef.get();
    if (snap.exists) {
      return { created: false };
    }

    const reportsCreatedCount = toFiniteNumber(payload?.reportsCreatedCount, 0);
    const reportRateWindowCount = toFiniteNumber(payload?.reportRateWindowCount, 0);

    await userRef.set({
      userId: normalizedUserId,
      email: toNullableString(payload.email),
      phone: toNullableString(payload.phone),
      address: payload.address || null,
      stripeCustomerId: toNullableString(payload.stripeCustomerId),
      reportsCount: Number(payload?.reportsCount) || 0,
      reportsCreatedCount: Number.isFinite(reportsCreatedCount)
        ? Math.max(0, Math.trunc(reportsCreatedCount))
        : 0,
      lastReportCreatedAt: payload?.lastReportCreatedAt || null,
      reportRateWindowStartedAt: payload?.reportRateWindowStartedAt || null,
      reportRateWindowCount: Number.isFinite(reportRateWindowCount)
        ? Math.max(0, Math.trunc(reportRateWindowCount))
        : 0,
      settings:
        payload.settings && typeof payload.settings === "object"
          ? payload.settings
          : {},
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { created: true };
  };

  return {
    ensurePublicUser,
    ensurePrivateUser,
  };
};

module.exports = {
  createUsersService,
};
