"use strict";

const createFavoritesService = ({
  db,
  FieldValue,
  ApiError,
  analyticsService,
  getApartmentRef,
  normalizeLikeUserSnapshot,
  buildDisplayName,
  toTrimmedString,
  toNullableString,
  toIsoDateOrNull,
} = {}) => {
  if (!db || !FieldValue || !ApiError || !analyticsService || !getApartmentRef) {
    throw new Error("Missing favorites service dependencies.");
  }

  const addFavorite = async ({ userId, apartmentId, dateKey }) => {
    if (!userId || !apartmentId) {
      throw new ApiError(400, "Dati preferito non validi.");
    }

    const userPublicRef = db.collection("usersPublic").doc(userId);
    const publicUserSnap = await userPublicRef.get();
    const likeUserSnapshot = normalizeLikeUserSnapshot(
      publicUserSnap.exists ? publicUserSnap.data() || {} : {}
    );

    const apartmentRef = getApartmentRef(apartmentId);
    const privateFavoriteRef = db
      .collection("usersPrivate")
      .doc(userId)
      .collection("favorites")
      .doc(apartmentId);

    await db.runTransaction(async (tx) => {
      const apartmentSnap = await tx.get(apartmentRef);
      if (!apartmentSnap.exists) {
        throw new ApiError(404, "Annuncio non trovato");
      }

      const apartmentData = apartmentSnap.data() || {};
      const ownerId = toTrimmedString(apartmentData.ownerId);
      if (!ownerId) {
        throw new ApiError(422, "Owner annuncio mancante");
      }
      if (ownerId === userId) {
        throw new ApiError(400, "Non puoi aggiungere ai preferiti un tuo annuncio");
      }

      const apartmentLikeRef = apartmentRef.collection("likes").doc(userId);
      const [favoriteSnap, likeSnap] = await Promise.all([
        tx.get(privateFavoriteRef),
        tx.get(apartmentLikeRef),
      ]);

      tx.set(
        privateFavoriteRef,
        {
          apartmentId,
          createdAt:
            favoriteSnap.exists && favoriteSnap.data()?.createdAt
              ? favoriteSnap.data().createdAt
              : FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      tx.set(
        apartmentLikeRef,
        {
          apartmentId,
          ownerId,
          likerId: userId,
          likerSnapshot: normalizeLikeUserSnapshot(likeUserSnapshot || {}),
          createdAt:
            likeSnap.exists && likeSnap.data()?.createdAt
              ? likeSnap.data().createdAt
              : FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      if (!likeSnap.exists) {
        analyticsService.applyAnalyticsInTransaction({
          tx,
          apartmentSnap,
          apartmentRef,
          event: {
            kind: "like",
            apartmentId,
            dateKey,
            delta: 1,
          },
        });
      }
    });

    return { favorited: true };
  };

  const removeFavorite = async ({ userId, apartmentId, dateKey }) => {
    if (!userId || !apartmentId) {
      throw new ApiError(400, "Dati preferito non validi.");
    }

    const apartmentRef = getApartmentRef(apartmentId);
    const privateFavoriteRef = db
      .collection("usersPrivate")
      .doc(userId)
      .collection("favorites")
      .doc(apartmentId);
    const apartmentLikeRef = apartmentRef.collection("likes").doc(userId);

    await db.runTransaction(async (tx) => {
      const [apartmentSnap, likeSnap] = await Promise.all([
        tx.get(apartmentRef),
        tx.get(apartmentLikeRef),
      ]);

      tx.delete(privateFavoriteRef);
      tx.delete(apartmentLikeRef);

      if (apartmentSnap.exists && likeSnap.exists) {
        analyticsService.applyAnalyticsInTransaction({
          tx,
          apartmentSnap,
          apartmentRef,
          event: {
            kind: "like",
            apartmentId,
            dateKey,
            delta: -1,
          },
        });
      }
    });

    return { favorited: false };
  };

  const listReceivedLikes = async ({ ownerId, limit, maxLimit = 200 }) => {
    const parsedLimit = Number(limit);
    const safeLimit = Number.isFinite(parsedLimit)
      ? Math.max(1, Math.min(maxLimit, Math.trunc(parsedLimit)))
      : 40;

    const apartmentsSnapshot = await db
      .collection("apartments")
      .where("ownerId", "==", ownerId)
      .get();

    if (apartmentsSnapshot.empty) {
      return {
        likes: [],
        totalLikes: 0,
        apartmentsCount: 0,
      };
    }

    const apartmentDocs = apartmentsSnapshot.docs;
    const perApartmentLimit = Math.max(
      1,
      Math.min(20, Math.ceil(safeLimit / apartmentDocs.length) + 2)
    );

    const likes = [];
    for (let i = 0; i < apartmentDocs.length; i += 1) {
      const apartmentDoc = apartmentDocs[i];
      const apartmentData = apartmentDoc.data() || {};

      // eslint-disable-next-line no-await-in-loop
      const likesSnapshot = await apartmentDoc.ref
        .collection("likes")
        .orderBy("createdAt", "desc")
        .limit(perApartmentLimit)
        .get();

      likesSnapshot.forEach((likeDoc) => {
        const likeData = likeDoc.data() || {};
        const snapshot = normalizeLikeUserSnapshot(likeData.likerSnapshot || {});

        likes.push({
          id: `${apartmentDoc.id}_${likeDoc.id}`,
          apartmentId: apartmentDoc.id,
          apartmentTitle: toTrimmedString(apartmentData.title) || "Annuncio",
          apartmentCity: toNullableString(
            apartmentData?.address?.city || apartmentData?.address?.area || apartmentData?.city
          ),
          likedByUserId: toTrimmedString(likeData.likerId) || likeDoc.id,
          likedByDisplayName: buildDisplayName({
            displayName: snapshot.displayName,
            firstName: snapshot.firstName,
            lastName: snapshot.lastName,
            fallback: "Utente",
          }),
          likedByPhotoUrl: snapshot.photoUrl,
          likedAt: toIsoDateOrNull(likeData.createdAt ?? likeData.updatedAt),
        });
      });
    }

    likes.sort((a, b) => {
      const dateA = new Date(a.likedAt || 0).getTime();
      const dateB = new Date(b.likedAt || 0).getTime();
      return dateB - dateA;
    });

    return {
      likes: likes.slice(0, safeLimit),
      totalLikes: likes.length,
      apartmentsCount: apartmentDocs.length,
    };
  };

  return {
    addFavorite,
    removeFavorite,
    listReceivedLikes,
  };
};

module.exports = {
  createFavoritesService,
};
