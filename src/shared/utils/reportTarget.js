const REPORT_TARGET_TYPES = new Set(["apartment", "review", "message", "user"]);

const toNullableString = (value) => {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized || null;
};

const normalizeTargetType = (value) => {
  const normalized = toNullableString(value)?.toLowerCase() || null;
  return normalized && REPORT_TARGET_TYPES.has(normalized) ? normalized : null;
};

export const REPORT_TARGET_META = Object.freeze({
  apartment: { label: "annuncio" },
  review: { label: "recensione" },
  message: { label: "messaggio" },
  user: { label: "utente" },
});

export const getReportTargetLabel = (type) => {
  const normalized = normalizeTargetType(type);
  return REPORT_TARGET_META[normalized]?.label || "contenuto";
};

/**
 * Normalizes report target payload for backend API.
 * Keeps optional fields when present while validating required ids per target type.
 */
export const normalizeReportTarget = (target = null) => {
  if (!target || typeof target !== "object") return null;

  const type = normalizeTargetType(target.type);
  if (!type) return null;

  const id = toNullableString(
    target.id ||
      (type === "review" ? target.reviewId : null) ||
      (type === "message" ? target.messageId : null) ||
      (type === "apartment" ? target.apartmentId : null) ||
      (type === "user" ? target.userId : null)
  );
  if (!id) return null;

  const apartmentId = toNullableString(
    target.apartmentId || (type === "apartment" ? id : null)
  );
  const conversationId = toNullableString(target.conversationId);
  const reviewId = toNullableString(target.reviewId || (type === "review" ? id : null));
  const messageId = toNullableString(
    target.messageId || (type === "message" ? id : null)
  );
  const ownerId = toNullableString(target.ownerId);
  const userId = toNullableString(target.userId || (type === "user" ? id : null));

  if (type === "review" && !apartmentId) {
    return null;
  }

  if (type === "message" && !conversationId) {
    return null;
  }

  const normalized = { type, id };
  if (apartmentId) normalized.apartmentId = apartmentId;
  if (conversationId) normalized.conversationId = conversationId;
  if (reviewId) normalized.reviewId = reviewId;
  if (messageId) normalized.messageId = messageId;
  if (ownerId) normalized.ownerId = ownerId;
  if (userId) normalized.userId = userId;

  return normalized;
};
