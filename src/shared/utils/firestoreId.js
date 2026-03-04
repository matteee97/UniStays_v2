export const FIRESTORE_ID_REGEX = /^[a-zA-Z0-9_-]{5,120}$/;

export const isValidFirestoreId = (id) =>
  typeof id === "string" && FIRESTORE_ID_REGEX.test(id.trim());

export const normalizeFirestoreId = (id) => {
  const normalized = typeof id === "string" ? id.trim() : "";
  return isValidFirestoreId(normalized) ? normalized : null;
};
