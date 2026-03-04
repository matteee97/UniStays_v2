import { callBackendApi } from "@/infrastructure/api/firebaseApiClient";

const DEFAULT_LIMIT = 40;

const toTrimmedString = (value) =>
  typeof value === "string" ? value.trim() : "";

const normalizeLikeItem = (item = {}) => ({
  id: toTrimmedString(item.id) || null,
  apartmentId: toTrimmedString(item.apartmentId) || null,
  apartmentTitle: toTrimmedString(item.apartmentTitle) || "Annuncio",
  apartmentCity: toTrimmedString(item.apartmentCity) || null,
  likedByUserId: toTrimmedString(item.likedByUserId) || null,
  likedByDisplayName: toTrimmedString(item.likedByDisplayName) || "Utente",
  likedByPhotoUrl: toTrimmedString(item.likedByPhotoUrl) || null,
  likedAt: item?.likedAt || null,
});

const normalizeLikesResponse = (payload = {}) => ({
  likes: Array.isArray(payload?.likes)
    ? payload.likes.map((item) => normalizeLikeItem(item))
    : [],
  totalLikes: Number(payload?.totalLikes) || 0,
  apartmentsCount: Number(payload?.apartmentsCount) || 0,
});

/**
 * Repository per i like ricevuti sugli annunci dell'host.
 */
export const FirestoreLikesRepository = {
  async listReceivedLikes({ limit = DEFAULT_LIMIT } = {}) {
    const safeLimit =
      Number.isFinite(limit) && Number(limit) > 0
        ? Math.min(Math.floor(Number(limit)), 200)
        : DEFAULT_LIMIT;

    const response = await callBackendApi(
      `/v1/favorites/received?limit=${safeLimit}`,
      {
        method: "GET",
      }
    );

    return normalizeLikesResponse(response || {});
  },
};

