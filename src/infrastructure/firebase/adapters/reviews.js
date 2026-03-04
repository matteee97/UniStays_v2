import { callBackendApi } from "@/infrastructure/api/firebaseApiClient";

/**
 * Create a new review in an apartment subcollection.
 * Stored rating is on a 1-5 scale.
 */
export async function addReview(apartmentId, { userId, userName, rating5, text }) {
  if (!apartmentId) throw new Error("Apartment ID mancante");
  if (!userId) throw new Error("User non autenticato");

  const payload = {
    apartmentId,
    userName,
    rating5,
    text,
  };

  return callBackendApi("/v1/reviews", {
    method: "POST",
    body: payload,
  });
}

/**
 * Toggle like for the given review by current user.
 */
export async function toggleReviewLike(apartmentId, reviewId, userId, isLiked) {
  if (!apartmentId || !reviewId) throw new Error("ID mancanti");
  if (!userId) throw new Error("User non autenticato");

  return callBackendApi(`/v1/reviews/${reviewId}/toggle-like`, {
    method: "POST",
    body: {
      apartmentId,
      isLiked,
    },
  });
}

/**
 * Add a reply to a review. Marks if author is the owner.
 */
export async function addReviewReply(apartmentId, reviewId, { userId, text, isOwner }) {
  if (!apartmentId || !reviewId) throw new Error("ID mancanti");
  if (!userId) throw new Error("User non autenticato");

  return callBackendApi(`/v1/reviews/${reviewId}/replies`, {
    method: "POST",
    body: {
      apartmentId,
      text,
      isOwner: !!isOwner,
    },
  });
}
