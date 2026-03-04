"use strict";

const createReviewsService = ({
  db,
  FieldValue,
  ApiError,
  analyticsService,
  getApartmentRef,
  toTrimmedString,
  toNullableString,
  clamp,
} = {}) => {
  if (
    !db ||
    !FieldValue ||
    !ApiError ||
    !analyticsService ||
    !getApartmentRef ||
    typeof toTrimmedString !== "function" ||
    typeof toNullableString !== "function" ||
    typeof clamp !== "function"
  ) {
    throw new Error("Missing reviews service dependencies.");
  }

  const createReview = async ({ userId, apartmentId, rating5, text, userName } = {}) => {
    const normalizedApartmentId = toTrimmedString(apartmentId);
    const normalizedText = toTrimmedString(text);

    if (!normalizedApartmentId) {
      throw new ApiError(400, "Apartment ID mancante");
    }

    if (!normalizedText) {
      throw new ApiError(400, "Testo recensione mancante");
    }

    const rating = clamp(Math.round(Number(rating5 || 0)), 1, 5);

    const userSnap = await db.collection("usersPublic").doc(userId).get();
    const publicUser = userSnap.exists ? userSnap.data() || {} : {};

    const displayName =
      toTrimmedString(publicUser.displayName) ||
      [toTrimmedString(publicUser.firstName), toTrimmedString(publicUser.lastName)]
        .filter(Boolean)
        .join(" ") ||
      toTrimmedString(userName) ||
      "Studente";

    const reviewPayload = {
      authorId: userId,
      authorName: displayName,
      authorPhotoUrl: toNullableString(publicUser.photoUrl),
      rating,
      text: normalizedText,
      createdAt: FieldValue.serverTimestamp(),
      helpfulCount: 0,
      likedBy: [],
      replyCount: 0,
      lastReplyAt: null,
    };

    const reviewRef = await db
      .collection("apartments")
      .doc(normalizedApartmentId)
      .collection("reviews")
      .add(reviewPayload);

    await db.runTransaction(async (tx) => {
      const apartmentRef = getApartmentRef(normalizedApartmentId);
      const apartmentSnap = await tx.get(apartmentRef);
      if (!apartmentSnap.exists) {
        return;
      }

      analyticsService.applyAnalyticsInTransaction({
        tx,
        apartmentSnap,
        apartmentRef,
        event: {
          kind: "review",
          apartmentId: normalizedApartmentId,
          added: 1,
          rating,
        },
      });
    });

    return { reviewId: reviewRef.id };
  };

  const toggleReviewLike = async ({
    userId,
    apartmentId,
    reviewId,
    isLiked,
  } = {}) => {
    const normalizedApartmentId = toTrimmedString(apartmentId);
    const normalizedReviewId = toTrimmedString(reviewId);

    if (!normalizedApartmentId || !normalizedReviewId) {
      throw new ApiError(400, "ID mancanti");
    }

    const reviewRef = db
      .collection("apartments")
      .doc(normalizedApartmentId)
      .collection("reviews")
      .doc(normalizedReviewId);

    await reviewRef.update({
      likedBy: isLiked ? FieldValue.arrayRemove(userId) : FieldValue.arrayUnion(userId),
      helpfulCount: FieldValue.increment(isLiked ? -1 : 1),
    });

    return { updated: true };
  };

  const createReviewReply = async ({
    userId,
    apartmentId,
    reviewId,
    text,
    isOwner,
  } = {}) => {
    const normalizedApartmentId = toTrimmedString(apartmentId);
    const normalizedReviewId = toTrimmedString(reviewId);
    const normalizedText = toTrimmedString(text);

    if (!normalizedApartmentId || !normalizedReviewId) {
      throw new ApiError(400, "ID mancanti");
    }

    if (!normalizedText) {
      throw new ApiError(400, "Testo risposta mancante");
    }

    const userSnap = await db.collection("usersPublic").doc(userId).get();
    const publicUser = userSnap.exists ? userSnap.data() || {} : {};

    const authorName =
      toTrimmedString(publicUser.displayName) ||
      [toTrimmedString(publicUser.firstName), toTrimmedString(publicUser.lastName)]
        .filter(Boolean)
        .join(" ") ||
      "Utente";

    const replyPayload = {
      authorId: userId,
      authorName,
      authorPhotoUrl: toNullableString(publicUser.photoUrl),
      text: normalizedText,
      isOwner: Boolean(isOwner),
      createdAt: FieldValue.serverTimestamp(),
    };

    await db
      .collection("apartments")
      .doc(normalizedApartmentId)
      .collection("reviews")
      .doc(normalizedReviewId)
      .collection("replies")
      .add(replyPayload);

    await db
      .collection("apartments")
      .doc(normalizedApartmentId)
      .collection("reviews")
      .doc(normalizedReviewId)
      .update({
        replyCount: FieldValue.increment(1),
        lastReplyAt: FieldValue.serverTimestamp(),
      });

    return { created: true };
  };

  return {
    createReview,
    toggleReviewLike,
    createReviewReply,
  };
};

module.exports = {
  createReviewsService,
};
