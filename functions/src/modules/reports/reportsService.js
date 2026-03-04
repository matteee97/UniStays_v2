"use strict";

const {
  hasOwn,
  setNestedValue,
  buildReportMutationPatch,
} = require("../../../utils/reportPatch");

const REPORT_REASONS = new Set([
  "scam",
  "spam",
  "harassment",
  "fakeListing",
  "inappropriateContent",
  "other",
]);
const REPORT_PRIORITIES = new Set(["low", "medium", "high"]);
const REPORT_STATUSES = new Set(["open", "reviewing", "resolved", "rejected"]);
const REPORT_SEVERITIES = new Set(["low", "medium", "high", "critical"]);
const REPORT_TARGET_TYPES = new Set(["apartment", "user", "review", "message"]);
const REPORT_QUICK_ACTIONS = new Set([
  "start_review",
  "resolve",
  "reject",
  "reopen",
  "escalate",
  "remove_apartment",
]);
const REPORT_REASON_META = Object.freeze({
  scam: { label: "Truffa o annuncio sospetto", severityScore: 3 },
  spam: { label: "Spam o contenuti indesiderati", severityScore: 1 },
  harassment: { label: "Molestie o comportamento scorretto", severityScore: 3 },
  fakeListing: { label: "Annuncio falso o ingannevole", severityScore: 3 },
  inappropriateContent: { label: "Contenuti inappropriati", severityScore: 2 },
  other: { label: "Altro", severityScore: 2 },
});
const PLATFORM_MESSAGE_TYPES = new Set([
  "info",
  "success",
  "warning",
  "error",
]);

const REPORT_MIN_INTERVAL_MS = 30 * 1000;
const REPORT_WINDOW_MS = 24 * 60 * 60 * 1000;
const REPORT_MAX_IN_WINDOW = 20;

const parseCsvQuery = (value) => {
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const parseBooleanQuery = (value, fallback = false) => {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return fallback;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes"].includes(normalized)) return true;
  if (["0", "false", "no"].includes(normalized)) return false;
  return fallback;
};

const normalizeReportReason = (value, fallback = "other") => {
  const normalized = String(value || "").trim().toLowerCase();
  return REPORT_REASONS.has(normalized) ? normalized : fallback;
};

const normalizeReportPriority = (value, fallback = "medium") => {
  const normalized = String(value || "").trim().toLowerCase();
  return REPORT_PRIORITIES.has(normalized) ? normalized : fallback;
};

const normalizeReportStatus = (value, fallback = "open") => {
  const normalized = String(value || "").trim().toLowerCase();
  return REPORT_STATUSES.has(normalized) ? normalized : fallback;
};

const isReportOpenStatus = (status) =>
  status === "open" || status === "reviewing";

const isReportResolvedStatus = (status) => status === "resolved";

const normalizeReportSeverity = (value, fallback = "medium") => {
  const normalized = String(value || "").trim().toLowerCase();
  return REPORT_SEVERITIES.has(normalized) ? normalized : fallback;
};

const severityFromScore = (score) => {
  if (score >= 4) return "critical";
  if (score >= 3) return "high";
  if (score >= 2) return "medium";
  return "low";
};

const inferReportSeverity = ({ reason = "other", priority = "medium", message = "" } = {}) => {
  const reasonMeta = REPORT_REASON_META[reason] || REPORT_REASON_META.other;
  const priorityScore = priority === "high" ? 3 : priority === "medium" ? 2 : 1;
  let score = Math.max(reasonMeta.severityScore, priorityScore);

  const loweredMessage = String(message || "")
    .trim()
    .toLowerCase();
  const criticalKeywords = [
    "violenza",
    "aggressione",
    "minaccia",
    "abuso",
    "truffa",
    "scam",
    "frode",
  ];
  if (criticalKeywords.some((keyword) => loweredMessage.includes(keyword))) {
    score = 4;
  }

  return severityFromScore(score);
};

const getReportReasonLabel = (reason) =>
  (REPORT_REASON_META[reason] || REPORT_REASON_META.other).label;

const normalizePlatformMessageType = (value, fallback = "info") => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  return PLATFORM_MESSAGE_TYPES.has(normalized) ? normalized : fallback;
};

const createReportsService = ({
  db,
  FieldValue,
  Timestamp,
  ApiError,
  toTrimmedString,
  toNullableString,
  toBoolean,
  toDateOrNull,
  toIsoDateOrNull,
  parseIntInRange,
  buildDisplayName,
  getApartmentRef,
  rejectApartmentWithSideEffects,
  sendPlatformMessage,
} = {}) => {
  if (
    !db ||
    !FieldValue ||
    !Timestamp ||
    !ApiError ||
    typeof toTrimmedString !== "function" ||
    typeof toNullableString !== "function" ||
    typeof toBoolean !== "function" ||
    typeof toDateOrNull !== "function" ||
    typeof toIsoDateOrNull !== "function" ||
    typeof parseIntInRange !== "function" ||
    typeof buildDisplayName !== "function" ||
    typeof getApartmentRef !== "function" ||
    typeof rejectApartmentWithSideEffects !== "function" ||
    typeof sendPlatformMessage !== "function"
  ) {
    throw new Error("Missing reports service dependencies.");
  }

  const normalizeReportTarget = (target = null) => {
    if (!target || typeof target !== "object") return null;

    const type = toTrimmedString(target.type).toLowerCase();
    const id = toTrimmedString(
      target.id ||
        (type === "review" ? target.reviewId : null) ||
        (type === "message" ? target.messageId : null) ||
        (type === "apartment" ? target.apartmentId : null) ||
        (type === "user" ? target.userId : null)
    );
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

    if (!type || !id) return null;

    const normalized = { type, id };
    if (apartmentId) {
      normalized.apartmentId = apartmentId;
    }
    if (conversationId) {
      normalized.conversationId = conversationId;
    }
    if (reviewId) {
      normalized.reviewId = reviewId;
    }
    if (messageId) {
      normalized.messageId = messageId;
    }
    if (ownerId) {
      normalized.ownerId = ownerId;
    }
    if (userId) {
      normalized.userId = userId;
    }

    return normalized;
  };

  const normalizeReportCreateTargetInput = (target = null) => {
    const normalized = normalizeReportTarget(target);
    if (!normalized || !REPORT_TARGET_TYPES.has(normalized.type)) {
      return null;
    }
    return normalized;
  };

  const normalizeReportModeration = (moderation = null) => {
    if (!moderation || typeof moderation !== "object") return null;
    return {
      action: toNullableString(moderation.action),
      handledBy: toNullableString(moderation.handledBy),
      handledAt: toIsoDateOrNull(moderation.handledAt),
      note: toNullableString(moderation.note),
    };
  };

  const normalizeReportResolution = (resolution = null) => {
    if (!resolution || typeof resolution !== "object") return null;
    return {
      code: toNullableString(resolution.code),
      note: toNullableString(resolution.note),
      resolvedAt: toIsoDateOrNull(resolution.resolvedAt),
    };
  };

  const normalizeReportCommunicationChannel = (channel = null) => {
    if (!channel || typeof channel !== "object") return null;
    return {
      requested: channel.requested === true,
      sent: channel.sent === true,
      recipientUserId: toNullableString(channel.recipientUserId),
      type: toNullableString(channel.type),
      message: toNullableString(channel.message),
      error: toNullableString(channel.error),
      sentBy: toNullableString(channel.sentBy),
      sentAt: toIsoDateOrNull(channel.sentAt),
    };
  };

  const normalizeReportCommunications = (communications = null) => {
    if (!communications || typeof communications !== "object") return null;
    return {
      updatedAt: toIsoDateOrNull(communications.updatedAt),
      lastHandledBy: toNullableString(communications.lastHandledBy),
      reporter: normalizeReportCommunicationChannel(communications.reporter),
      target: normalizeReportCommunicationChannel(communications.target),
    };
  };

  const buildReporterAntiAbuseStats = ({ reporterPrivateData = {}, nowDate } = {}) => {
    const safeNow = nowDate instanceof Date ? nowDate : new Date();
    const nowMs = safeNow.getTime();

    const lastReportCreatedAt = toDateOrNull(reporterPrivateData.lastReportCreatedAt);
    if (
      lastReportCreatedAt &&
      nowMs - lastReportCreatedAt.getTime() < REPORT_MIN_INTERVAL_MS
    ) {
      throw new ApiError(
        429,
        "Stai inviando segnalazioni troppo velocemente. Attendi qualche secondo."
      );
    }

    const windowStartedAt = toDateOrNull(reporterPrivateData.reportRateWindowStartedAt);
    const currentWindowCount = Math.max(
      0,
      Number(reporterPrivateData.reportRateWindowCount) || 0
    );
    const currentTotalReports = Math.max(
      0,
      Number(reporterPrivateData.reportsCreatedCount) || 0
    );

    const isWindowExpired =
      !windowStartedAt || nowMs - windowStartedAt.getTime() >= REPORT_WINDOW_MS;
    const effectiveWindowStartedAt = isWindowExpired ? safeNow : windowStartedAt;
    const effectiveWindowCount = isWindowExpired ? 0 : currentWindowCount;

    if (effectiveWindowCount >= REPORT_MAX_IN_WINDOW) {
      throw new ApiError(
        429,
        "Hai superato il limite di segnalazioni consentite nelle ultime 24 ore."
      );
    }

    return {
      nextTotalReports: currentTotalReports + 1,
      nextWindowCount: effectiveWindowCount + 1,
      windowStartedAt: Timestamp.fromDate(effectiveWindowStartedAt),
      lastReportCreatedAt: Timestamp.fromDate(safeNow),
    };
  };

  const buildReportReadModel = ({ reportId, data = {} } = {}) => {
    const reason = normalizeReportReason(data.reason, "other");
    const priority = normalizeReportPriority(data.priority, "medium");
    const severity = normalizeReportSeverity(
      data.severity,
      inferReportSeverity({ reason, priority, message: data.message })
    );
    const status = normalizeReportStatus(data.status, "open");
    const target = normalizeReportTarget(data.target);
    const reporterSnapshot =
      data.reporterSnapshot && typeof data.reporterSnapshot === "object"
        ? {
            displayName: toNullableString(data.reporterSnapshot.displayName),
            photoUrl: toNullableString(data.reporterSnapshot.photoUrl),
          }
        : null;

    return {
      id: reportId || null,
      target,
      reporterId: toNullableString(data.reporterId),
      reporterSnapshot,
      reason,
      reasonLabel: getReportReasonLabel(reason),
      message: toNullableString(data.message),
      status,
      priority,
      severity,
      moderation: normalizeReportModeration(data.moderation),
      resolution: normalizeReportResolution(data.resolution),
      communications: normalizeReportCommunications(data.communications),
      createdAt: toIsoDateOrNull(data.createdAt),
      updatedAt: toIsoDateOrNull(data.updatedAt),
    };
  };

  const reportMatchesSearch = (report, searchTerm) => {
    if (!searchTerm) return true;
    const lowered = searchTerm.toLowerCase();
    const values = [
      report.id,
      report.reporterId,
      report.reason,
      report.reasonLabel,
      report.status,
      report.priority,
      report.severity,
      report.message,
      report.target?.type,
      report.target?.id,
      report.target?.apartmentId,
      report.target?.conversationId,
      report.target?.reviewId,
      report.target?.messageId,
      report.target?.userId,
      report.target?.ownerId,
    ];
    return values
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(lowered));
  };

  const buildReportSummary = (reports = []) => {
    const byStatus = Object.fromEntries(
      Array.from(REPORT_STATUSES).map((status) => [status, 0])
    );
    const bySeverity = Object.fromEntries(
      Array.from(REPORT_SEVERITIES).map((severity) => [severity, 0])
    );

    reports.forEach((report) => {
      if (report.status in byStatus) {
        byStatus[report.status] += 1;
      }
      if (report.severity in bySeverity) {
        bySeverity[report.severity] += 1;
      }
    });

    return {
      total: reports.length,
      openCount: byStatus.open + byStatus.reviewing,
      closedCount: byStatus.resolved + byStatus.rejected,
      highSeverityCount: bySeverity.high + bySeverity.critical,
      byStatus,
      bySeverity,
    };
  };

  const buildAdminUserContext = async (userId) => {
    const normalizedUserId = toTrimmedString(userId);
    if (!normalizedUserId) return null;

    const userPublicRef = db.collection("usersPublic").doc(normalizedUserId);
    const userPrivateRef = db.collection("usersPrivate").doc(normalizedUserId);
    const [publicSnap, privateSnap] = await Promise.all([
      userPublicRef.get(),
      userPrivateRef.get(),
    ]);

    if (!publicSnap.exists && !privateSnap.exists) {
      return null;
    }

    const publicData = publicSnap.exists ? publicSnap.data() || {} : {};
    const privateData = privateSnap.exists ? privateSnap.data() || {} : {};
    const displayName = buildDisplayName({
      displayName: publicData.displayName,
      firstName: publicData.firstName,
      lastName: publicData.lastName,
      fallback: "Utente",
    });

    return {
      userId: normalizedUserId,
      displayName,
      email: toNullableString(privateData.email),
      phone: toNullableString(privateData.phone),
      isHost: toBoolean(publicData.isHost, false),
      isVerifiedHost: toBoolean(publicData.isVerifiedHost, false),
      publicStats: {
        apartmentsCount: Number(publicData?.publicStats?.apartmentsCount) || 0,
        reportsCount: Number(publicData?.publicStats?.reportsCount) || 0,
        resolvedReportsCount:
          Number(publicData?.publicStats?.resolvedReportsCount) || 0,
      },
      updatedAt: toIsoDateOrNull(privateData.updatedAt || publicData.updatedAt),
      createdAt: toIsoDateOrNull(privateData.createdAt || publicData.createdAt),
    };
  };

  const buildAdminApartmentContext = async (apartmentId) => {
    const normalizedApartmentId = toTrimmedString(apartmentId);
    if (!normalizedApartmentId) return null;

    const apartmentSnap = await getApartmentRef(normalizedApartmentId).get();
    if (!apartmentSnap.exists) return null;

    const apartmentData = apartmentSnap.data() || {};
    const score = Number(apartmentData?.metrics?.score);
    const minRoomPrice = Number(apartmentData?.aggregates?.minRoomPrice);
    const maxRoomPrice = Number(apartmentData?.aggregates?.maxRoomPrice);

    return {
      id: apartmentSnap.id,
      title: toNullableString(apartmentData.title),
      status: toNullableString(apartmentData.status),
      city: toNullableString(apartmentData?.address?.city),
      ownerId: toNullableString(apartmentData.ownerId),
      aggregates: {
        minRoomPrice: Number.isFinite(minRoomPrice) ? minRoomPrice : null,
        maxRoomPrice: Number.isFinite(maxRoomPrice) ? maxRoomPrice : null,
      },
      totalReports: Number(apartmentData?.metrics?.totalReports) || 0,
      score: Number.isFinite(score) ? score : null,
      createdAt: toIsoDateOrNull(apartmentData.createdAt),
      updatedAt: toIsoDateOrNull(apartmentData.updatedAt),
    };
  };

  const applyReportStatusSideEffectsInTransaction = async ({
    tx,
    reportData = {},
    previousStatus,
    nextStatus,
    ownerIdHint = null,
  } = {}) => {
    const prevStatus = normalizeReportStatus(previousStatus, "open");
    const targetStatus = normalizeReportStatus(nextStatus, prevStatus);
    if (prevStatus === targetStatus) return;

    const wasOpen = isReportOpenStatus(prevStatus);
    const isNowOpen = isReportOpenStatus(targetStatus);
    const openReportsDelta = isNowOpen === wasOpen ? 0 : isNowOpen ? 1 : -1;

    const wasResolved = isReportResolvedStatus(prevStatus);
    const isNowResolved = isReportResolvedStatus(targetStatus);
    const resolvedReportsDelta =
      wasResolved === isNowResolved ? 0 : isNowResolved ? 1 : -1;

    const target = reportData?.target || {};
    const apartmentId = toTrimmedString(
      target.apartmentId || (target.type === "apartment" ? target.id : "")
    );
    let ownerId = toNullableString(ownerIdHint) || toNullableString(target.ownerId);

    const shouldUpdateApartment = openReportsDelta !== 0 && Boolean(apartmentId);
    let apartmentRef = null;
    let apartmentData = null;

    if (shouldUpdateApartment) {
      apartmentRef = getApartmentRef(apartmentId);
      const apartmentSnap = await tx.get(apartmentRef);
      if (apartmentSnap.exists) {
        apartmentData = apartmentSnap.data() || {};
        if (!ownerId) {
          ownerId = toNullableString(apartmentData.ownerId);
        }
      }
    }

    const shouldUpdateHost =
      Boolean(ownerId) && (openReportsDelta !== 0 || resolvedReportsDelta !== 0);
    let userPublicRef = null;
    let userPrivateRef = null;
    let publicData = null;
    let privateData = null;

    if (shouldUpdateHost) {
      userPublicRef = db.collection("usersPublic").doc(ownerId);
      userPrivateRef = db.collection("usersPrivate").doc(ownerId);
      const [publicSnap, privateSnap] = await Promise.all([
        tx.get(userPublicRef),
        tx.get(userPrivateRef),
      ]);
      publicData = publicSnap.exists ? publicSnap.data() || {} : null;
      privateData = privateSnap.exists ? privateSnap.data() || {} : null;
    }

    if (shouldUpdateApartment && apartmentRef && apartmentData) {
      const metrics =
        apartmentData.metrics && typeof apartmentData.metrics === "object"
          ? apartmentData.metrics
          : {};
      const currentTotalReports = Math.max(0, Number(metrics.totalReports) || 0);
      const nextTotalReports = Math.max(0, currentTotalReports + openReportsDelta);

      tx.update(apartmentRef, {
        metrics: {
          ...metrics,
          totalReports: nextTotalReports,
          updatedAt: FieldValue.serverTimestamp(),
        },
      });
    }

    if (shouldUpdateHost) {
      if (publicData) {
        const publicStats =
          publicData.publicStats && typeof publicData.publicStats === "object"
            ? publicData.publicStats
            : {};
        const currentOpenReports = Math.max(0, Number(publicStats.reportsCount) || 0);
        const currentResolvedReports = Math.max(
          0,
          Number(publicStats.resolvedReportsCount) || 0
        );

        tx.update(userPublicRef, {
          publicStats: {
            ...publicStats,
            reportsCount: Math.max(0, currentOpenReports + openReportsDelta),
            resolvedReportsCount: Math.max(
              0,
              currentResolvedReports + resolvedReportsDelta
            ),
          },
          updatedAt: FieldValue.serverTimestamp(),
        });
      }

      if (privateData) {
        const currentInternalReports = Math.max(0, Number(privateData.reportsCount) || 0);
        tx.update(userPrivateRef, {
          reportsCount: Math.max(0, currentInternalReports + openReportsDelta),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    }
  };

  const resolveCreateTargetContextInTransaction = async ({
    tx,
    targetInput,
    reporterId,
  } = {}) => {
    const normalizedTarget = normalizeReportCreateTargetInput(targetInput);
    if (!normalizedTarget) {
      throw new ApiError(400, "Target segnalazione non valido");
    }

    const { type, id } = normalizedTarget;
    if (type === "apartment") {
      const apartmentRef = getApartmentRef(id);
      const apartmentSnap = await tx.get(apartmentRef);
      if (!apartmentSnap.exists) {
        throw new ApiError(404, "Annuncio non trovato");
      }

      const apartmentData = apartmentSnap.data() || {};
      const ownerId = toNullableString(apartmentData.ownerId);
      const target = {
        type: "apartment",
        id,
        apartmentId: id,
      };
      if (ownerId) {
        target.ownerId = ownerId;
        target.userId = ownerId;
      }

      return {
        target,
        apartmentRef,
        apartmentData,
        ownerId,
        reporterIsOwner: Boolean(ownerId) && ownerId === reporterId,
      };
    }

    if (type === "review") {
      const apartmentId = toTrimmedString(normalizedTarget.apartmentId);
      if (!apartmentId) {
        throw new ApiError(400, "Apartment ID segnalazione mancante");
      }

      const apartmentRef = getApartmentRef(apartmentId);
      const reviewRef = apartmentRef.collection("reviews").doc(id);
      const [apartmentSnap, reviewSnap] = await Promise.all([
        tx.get(apartmentRef),
        tx.get(reviewRef),
      ]);

      if (!apartmentSnap.exists) {
        throw new ApiError(404, "Annuncio non trovato");
      }
      if (!reviewSnap.exists) {
        throw new ApiError(404, "Recensione non trovata");
      }

      const apartmentData = apartmentSnap.data() || {};
      const reviewData = reviewSnap.data() || {};
      const ownerId = toNullableString(apartmentData.ownerId);
      const targetUserId = toNullableString(reviewData.authorId);
      const target = {
        type: "review",
        id,
        reviewId: id,
        apartmentId,
      };
      if (ownerId) {
        target.ownerId = ownerId;
      }
      if (targetUserId) {
        target.userId = targetUserId;
      }

      return {
        target,
        apartmentRef,
        apartmentData,
        ownerId,
        reporterIsOwner: Boolean(ownerId) && ownerId === reporterId,
      };
    }

    if (type === "message") {
      const conversationId = toTrimmedString(normalizedTarget.conversationId);
      if (!conversationId) {
        throw new ApiError(400, "Conversation ID segnalazione mancante");
      }

      const conversationRef = db.collection("conversations").doc(conversationId);
      const messageRef = conversationRef.collection("messages").doc(id);
      const [conversationSnap, messageSnap] = await Promise.all([
        tx.get(conversationRef),
        tx.get(messageRef),
      ]);

      if (!conversationSnap.exists) {
        throw new ApiError(404, "Conversazione non trovata");
      }
      if (!messageSnap.exists) {
        throw new ApiError(404, "Messaggio non trovato");
      }

      const conversationData = conversationSnap.data() || {};
      const messageData = messageSnap.data() || {};
      const apartmentId = toNullableString(
        normalizedTarget.apartmentId || conversationData.apartmentId
      );

      let apartmentRef = null;
      let apartmentData = null;
      let ownerId = toNullableString(
        normalizedTarget.ownerId || conversationData.hostId
      );

      if (apartmentId) {
        apartmentRef = getApartmentRef(apartmentId);
        const apartmentSnap = await tx.get(apartmentRef);
        if (apartmentSnap.exists) {
          apartmentData = apartmentSnap.data() || {};
          ownerId = toNullableString(apartmentData.ownerId) || ownerId;
        }
      }

      const targetUserId = toNullableString(messageData.senderId);
      const target = {
        type: "message",
        id,
        messageId: id,
        conversationId,
      };
      if (apartmentId) {
        target.apartmentId = apartmentId;
      }
      if (ownerId) {
        target.ownerId = ownerId;
      }
      if (targetUserId) {
        target.userId = targetUserId;
      }

      return {
        target,
        apartmentRef,
        apartmentData,
        ownerId,
        reporterIsOwner: Boolean(ownerId) && ownerId === reporterId,
      };
    }

    if (type === "user") {
      const userPublicRef = db.collection("usersPublic").doc(id);
      const userPrivateRef = db.collection("usersPrivate").doc(id);
      const [userPublicSnap, userPrivateSnap] = await Promise.all([
        tx.get(userPublicRef),
        tx.get(userPrivateRef),
      ]);

      if (!userPublicSnap.exists && !userPrivateSnap.exists) {
        throw new ApiError(404, "Utente segnalato non trovato");
      }

      return {
        target: {
          type: "user",
          id,
          userId: id,
          ownerId: id,
        },
        apartmentRef: null,
        apartmentData: null,
        ownerId: id,
        reporterIsOwner: id === reporterId,
      };
    }

    throw new ApiError(400, "Target segnalazione non supportato");
  };

  const createReport = async ({
    target,
    reporterId,
    reason,
    message,
    priority,
    reporterSnapshot,
  } = {}) => {
    const normalizedReporterId = toTrimmedString(reporterId);
    const normalizedReason = normalizeReportReason(reason || "other", null);
    const normalizedMessage = toTrimmedString(message);
    const normalizedPriority = normalizeReportPriority(priority || "medium", null);
    const reporterSnapshotInput =
      reporterSnapshot && typeof reporterSnapshot === "object"
        ? reporterSnapshot
        : {};
    const nowDate = new Date();

    if (!normalizedReporterId) {
      throw new ApiError(401, "Utente non autenticato");
    }
    if (!normalizedReason) {
      throw new ApiError(400, "Motivo segnalazione non valido");
    }
    if (!normalizedPriority) {
      throw new ApiError(400, "Priorità segnalazione non valida");
    }
    if (!normalizedMessage) {
      throw new ApiError(400, "Messaggio segnalazione mancante");
    }

    const severity = inferReportSeverity({
      reason: normalizedReason,
      priority: normalizedPriority,
      message: normalizedMessage,
    });
    const reportRef = db.collection("reports").doc();
    const reporterPrivateRef = db.collection("usersPrivate").doc(normalizedReporterId);

    await db.runTransaction(async (tx) => {
      const [targetContext, reporterPrivateSnap] = await Promise.all([
        resolveCreateTargetContextInTransaction({
          tx,
          targetInput: target,
          reporterId: normalizedReporterId,
        }),
        tx.get(reporterPrivateRef),
      ]);

      const reporterPrivateData = reporterPrivateSnap.exists
        ? reporterPrivateSnap.data() || {}
        : {};
      const reporterAntiAbuseStats = buildReporterAntiAbuseStats({
        reporterPrivateData,
        nowDate,
      });

      tx.set(reportRef, {
        target: targetContext.target,
        reporterId: normalizedReporterId,
        reporterSnapshot: {
          displayName: toNullableString(reporterSnapshotInput.displayName),
          photoUrl: toNullableString(reporterSnapshotInput.photoUrl),
        },
        reason: normalizedReason,
        message: normalizedMessage,
        status: "open",
        priority: normalizedPriority,
        severity,
        moderation: {
          action: "created",
          handledBy: null,
          handledAt: null,
          note: null,
        },
        resolution: {
          code: null,
          note: null,
          resolvedAt: null,
        },
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      if (targetContext.apartmentRef && targetContext.apartmentData) {
        const metrics =
          targetContext.apartmentData.metrics &&
          typeof targetContext.apartmentData.metrics === "object"
            ? targetContext.apartmentData.metrics
            : {};
        const nextTotalReports = Math.max(
          0,
          (Number(metrics.totalReports) || 0) + 1
        );
        tx.update(targetContext.apartmentRef, {
          metrics: {
            ...metrics,
            totalReports: nextTotalReports,
            updatedAt: FieldValue.serverTimestamp(),
          },
        });
      }

      tx.set(
        reporterPrivateRef,
        {
          userId: normalizedReporterId,
          reportsCreatedCount: reporterAntiAbuseStats.nextTotalReports,
          lastReportCreatedAt: reporterAntiAbuseStats.lastReportCreatedAt,
          reportRateWindowStartedAt: reporterAntiAbuseStats.windowStartedAt,
          reportRateWindowCount: reporterAntiAbuseStats.nextWindowCount,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      if (targetContext.ownerId && !targetContext.reporterIsOwner) {
        const ownerPublicRef = db.collection("usersPublic").doc(targetContext.ownerId);
        const ownerPrivateRef = db.collection("usersPrivate").doc(targetContext.ownerId);

        tx.set(
          ownerPublicRef,
          {
            publicStats: {
              reportsCount: FieldValue.increment(1),
            },
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        tx.set(
          ownerPrivateRef,
          {
            reportsCount: FieldValue.increment(1),
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      }
    });

    return { reportId: reportRef.id };
  };

  const createApartmentReport = async ({
    apartmentId,
    reporterId,
    reason,
    message,
    priority,
    reporterSnapshot,
  } = {}) => {
    return createReport({
      target: {
        type: "apartment",
        id: apartmentId,
        apartmentId,
      },
      reporterId,
      reason,
      message,
      priority,
      reporterSnapshot,
    });
  };

  const listAdminReports = async (query = {}) => {
    const limit = parseIntInRange(query.limit, 250, { min: 1, max: 500 });
    const statusFilter = new Set(
      parseCsvQuery(query.status)
        .map((status) => normalizeReportStatus(status, null))
        .filter(Boolean)
    );
    const severityFilter = new Set(
      parseCsvQuery(query.severity)
        .map((severity) => normalizeReportSeverity(severity, null))
        .filter(Boolean)
    );
    const reasonFilter = new Set(
      parseCsvQuery(query.reason)
        .map((reason) => normalizeReportReason(reason, null))
        .filter(Boolean)
    );
    const targetTypeFilter = new Set(
      parseCsvQuery(query.targetType)
        .map((targetType) => toTrimmedString(targetType).toLowerCase())
        .filter((targetType) => REPORT_TARGET_TYPES.has(targetType))
    );
    const searchTerm = toTrimmedString(query.search).toLowerCase();
    const hideClosed = parseBooleanQuery(query.hideClosed, false);

    const snapshot = await db
      .collection("reports")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    let reports = snapshot.docs.map((docSnap) =>
      buildReportReadModel({
        reportId: docSnap.id,
        data: docSnap.data() || {},
      })
    );

    reports = reports.filter((report) => {
      if (hideClosed && ["resolved", "rejected"].includes(report.status)) {
        return false;
      }
      if (statusFilter.size && !statusFilter.has(report.status)) {
        return false;
      }
      if (severityFilter.size && !severityFilter.has(report.severity)) {
        return false;
      }
      if (reasonFilter.size && !reasonFilter.has(report.reason)) {
        return false;
      }
      if (targetTypeFilter.size && !targetTypeFilter.has(report.target?.type)) {
        return false;
      }
      return reportMatchesSearch(report, searchTerm);
    });

    return {
      reports,
      summary: buildReportSummary(reports),
    };
  };

  const getAdminReportDetails = async ({ reportId } = {}) => {
    const normalizedReportId = toTrimmedString(reportId);
    if (!normalizedReportId) {
      throw new ApiError(400, "Report ID mancante");
    }

    const reportRef = db.collection("reports").doc(normalizedReportId);
    const reportSnap = await reportRef.get();
    if (!reportSnap.exists) {
      throw new ApiError(404, "Segnalazione non trovata");
    }

    const report = buildReportReadModel({
      reportId: reportSnap.id,
      data: reportSnap.data() || {},
    });
    const target = report.target || {};
    const apartmentId =
      target.apartmentId || (target.type === "apartment" ? target.id : null);
    const targetUserId = toNullableString(
      target.userId || (target.type === "user" ? target.id : null)
    );

    const [apartment, reporter, targetUser] = await Promise.all([
      apartmentId ? buildAdminApartmentContext(apartmentId) : Promise.resolve(null),
      report.reporterId ? buildAdminUserContext(report.reporterId) : Promise.resolve(null),
      targetUserId ? buildAdminUserContext(targetUserId) : Promise.resolve(null),
    ]);

    return {
      report,
      context: {
        apartment,
        reporter,
        targetUser,
      },
    };
  };

  const normalizeNotificationRequest = (
    payload = {},
    { label = "Notifica", fallbackType = "info" } = {}
  ) => {
    if (!payload || typeof payload !== "object") return null;

    const enabled = payload.enabled === true || payload.send === true;
    if (!enabled) return null;

    const message = toTrimmedString(payload.message);
    if (!message) {
      throw new ApiError(400, `${label}: testo messaggio obbligatorio`);
    }

    return {
      message,
      type: normalizePlatformMessageType(payload.type, fallbackType),
    };
  };

  const extractNotificationsFromPayload = (payload = {}) => {
    if (!payload || typeof payload !== "object") {
      return { reporter: null, target: null };
    }

    const notificationsRoot =
      payload.notifications && typeof payload.notifications === "object"
        ? payload.notifications
        : {};

    const reporterInput = notificationsRoot.reporter || payload.notifyReporter || null;
    const targetInput = notificationsRoot.target || payload.notifyTarget || null;

    return {
      reporter: normalizeNotificationRequest(reporterInput, {
        label: "Notifica segnalatore",
        fallbackType: "info",
      }),
      target: normalizeNotificationRequest(targetInput, {
        label: "Notifica utente segnalato",
        fallbackType: "warning",
      }),
    };
  };

  const resolveTargetRecipientUserId = async ({
    report = {},
    ownerIdHint = null,
  } = {}) => {
    const target = report?.target || {};
    const explicitTargetUserId = toNullableString(
      target.userId || (target.type === "user" ? target.id : null)
    );
    if (explicitTargetUserId) {
      return explicitTargetUserId;
    }

    if (target.type === "user") {
      return toNullableString(target.id);
    }

    let ownerId = toNullableString(ownerIdHint) || toNullableString(target.ownerId);
    if (ownerId) {
      return ownerId;
    }

    const apartmentId =
      toNullableString(target.apartmentId) ||
      (target.type === "apartment" ? toNullableString(target.id) : null);

    if (!apartmentId) {
      return null;
    }

    const apartmentSnap = await getApartmentRef(apartmentId).get();
    if (!apartmentSnap.exists) {
      return null;
    }

    const apartmentData = apartmentSnap.data() || {};
    return toNullableString(apartmentData.ownerId);
  };

  const sendAdminNotifications = async ({
    reportRef,
    report,
    handledBy,
    ownerIdHint = null,
    notifications = {},
  } = {}) => {
    const reporterRequest = notifications.reporter || null;
    const targetRequest = notifications.target || null;
    const hasRequestedNotifications = Boolean(reporterRequest || targetRequest);

    if (!hasRequestedNotifications) {
      return {
        reporter: { requested: false, sent: false },
        target: { requested: false, sent: false },
      };
    }

    const apartmentId =
      report?.target?.apartmentId ||
      (report?.target?.type === "apartment" ? report?.target?.id : null);
    const result = {
      reporter: {
        requested: Boolean(reporterRequest),
        sent: false,
        recipientUserId: toNullableString(report?.reporterId),
        type: reporterRequest?.type || null,
        message: reporterRequest?.message || null,
        error: null,
      },
      target: {
        requested: Boolean(targetRequest),
        sent: false,
        recipientUserId: null,
        type: targetRequest?.type || null,
        message: targetRequest?.message || null,
        error: null,
      },
    };

    if (reporterRequest) {
      if (!result.reporter.recipientUserId) {
        result.reporter.error = "recipient_not_found";
      } else {
        try {
          await sendPlatformMessage({
            userId: result.reporter.recipientUserId,
            message: reporterRequest.message,
            type: reporterRequest.type,
            apartmentId,
          });
          result.reporter.sent = true;
        } catch (error) {
          console.error("[REPORT_NOTIFICATION] reporter", error);
          result.reporter.error = toTrimmedString(error?.message) || "send_failed";
        }
      }
    }

    if (targetRequest) {
      result.target.recipientUserId = await resolveTargetRecipientUserId({
        report,
        ownerIdHint,
      });

      if (!result.target.recipientUserId) {
        result.target.error = "recipient_not_found";
      } else {
        try {
          await sendPlatformMessage({
            userId: result.target.recipientUserId,
            message: targetRequest.message,
            type: targetRequest.type,
            apartmentId,
          });
          result.target.sent = true;
        } catch (error) {
          console.error("[REPORT_NOTIFICATION] target", error);
          result.target.error = toTrimmedString(error?.message) || "send_failed";
        }
      }
    }

    const communicationPatch = {};
    setNestedValue(
      communicationPatch,
      "communications.updatedAt",
      FieldValue.serverTimestamp()
    );
    setNestedValue(
      communicationPatch,
      "communications.lastHandledBy",
      toNullableString(handledBy)
    );

    if (result.reporter.requested) {
      setNestedValue(communicationPatch, "communications.reporter", {
        requested: true,
        sent: result.reporter.sent,
        recipientUserId: result.reporter.recipientUserId,
        type: result.reporter.type,
        message: result.reporter.message,
        error: result.reporter.error,
        sentBy: toNullableString(handledBy),
        sentAt: result.reporter.sent ? FieldValue.serverTimestamp() : null,
      });
    }

    if (result.target.requested) {
      setNestedValue(communicationPatch, "communications.target", {
        requested: true,
        sent: result.target.sent,
        recipientUserId: result.target.recipientUserId,
        type: result.target.type,
        message: result.target.message,
        error: result.target.error,
        sentBy: toNullableString(handledBy),
        sentAt: result.target.sent ? FieldValue.serverTimestamp() : null,
      });
    }

    await reportRef.set(communicationPatch, { merge: true });
    return result;
  };

  const updateAdminReport = async ({ reportId, body = {}, handledBy } = {}) => {
    const normalizedReportId = toTrimmedString(reportId);
    if (!normalizedReportId) {
      throw new ApiError(400, "Report ID mancante");
    }

    const reportRef = db.collection("reports").doc(normalizedReportId);
    const payload = body && typeof body === "object" ? body : {};
    const updatePayload = buildReportMutationPatch({
      handledBy,
      action: "manual_update",
      timestampFactory: () => FieldValue.serverTimestamp(),
    });
    const notifications = extractNotificationsFromPayload(payload);
    let hasChanges = false;

    if (hasOwn(payload, "action")) {
      const action = toTrimmedString(payload.action);
      if (!action) {
        throw new ApiError(400, "Azione moderazione non valida");
      }
      setNestedValue(updatePayload, "moderation.action", action);
      hasChanges = true;
    }

    if (hasOwn(payload, "status")) {
      const status = normalizeReportStatus(payload.status, null);
      if (!status) {
        throw new ApiError(400, "Status segnalazione non valido");
      }
      updatePayload.status = status;
      hasChanges = true;

      if (status === "resolved" || status === "rejected") {
        setNestedValue(
          updatePayload,
          "resolution.resolvedAt",
          FieldValue.serverTimestamp()
        );
      } else if (status === "open" || status === "reviewing") {
        setNestedValue(updatePayload, "resolution.resolvedAt", null);
      }
    }

    if (hasOwn(payload, "priority")) {
      const priority = normalizeReportPriority(payload.priority, null);
      if (!priority) {
        throw new ApiError(400, "Priorità segnalazione non valida");
      }
      updatePayload.priority = priority;
      hasChanges = true;
    }

    if (hasOwn(payload, "severity")) {
      const severity = normalizeReportSeverity(payload.severity, null);
      if (!severity) {
        throw new ApiError(400, "Gravità segnalazione non valida");
      }
      updatePayload.severity = severity;
      hasChanges = true;
    }

    if (hasOwn(payload, "note")) {
      setNestedValue(updatePayload, "moderation.note", toNullableString(payload.note));
      hasChanges = true;
    }

    if (hasOwn(payload, "resolutionCode")) {
      setNestedValue(
        updatePayload,
        "resolution.code",
        toNullableString(payload.resolutionCode)
      );
      hasChanges = true;
    }

    if (hasOwn(payload, "resolutionNote")) {
      const resolutionNote = toNullableString(payload.resolutionNote);
      setNestedValue(updatePayload, "resolution.note", resolutionNote);
      hasChanges = true;
      if (resolutionNote) {
        setNestedValue(
          updatePayload,
          "resolution.resolvedAt",
          FieldValue.serverTimestamp()
        );
      }
    }

    if (!hasChanges) {
      throw new ApiError(400, "Nessun campo valido da aggiornare");
    }

    await db.runTransaction(async (tx) => {
      const reportSnap = await tx.get(reportRef);
      if (!reportSnap.exists) {
        throw new ApiError(404, "Segnalazione non trovata");
      }

      const reportData = reportSnap.data() || {};
      const previousStatus = normalizeReportStatus(reportData.status, "open");
      const nextStatus = normalizeReportStatus(updatePayload.status, previousStatus);

      await applyReportStatusSideEffectsInTransaction({
        tx,
        reportData,
        previousStatus,
        nextStatus,
      });

      tx.set(reportRef, updatePayload, { merge: true });
    });

    const updatedSnap = await reportRef.get();
    const updatedReport = buildReportReadModel({
      reportId: updatedSnap.id,
      data: updatedSnap.data() || {},
    });
    const notificationResults = await sendAdminNotifications({
      reportRef,
      report: updatedReport,
      handledBy,
      notifications,
    });

    return {
      report: updatedReport,
      notifications: notificationResults,
    };
  };

  const runAdminQuickAction = async ({
    reportId,
    action,
    note,
    handledBy,
    notifications: notificationsInput = {},
  } = {}) => {
    const normalizedReportId = toTrimmedString(reportId);
    const normalizedAction = toTrimmedString(action).toLowerCase();
    const normalizedNote = toNullableString(note);

    if (!normalizedReportId) {
      throw new ApiError(400, "Report ID mancante");
    }

    if (!REPORT_QUICK_ACTIONS.has(normalizedAction)) {
      throw new ApiError(400, "Azione rapida non supportata");
    }

    const notifications = extractNotificationsFromPayload({
      notifications: notificationsInput,
    });

    const reportRef = db.collection("reports").doc(normalizedReportId);
    const reportSnap = await reportRef.get();
    if (!reportSnap.exists) {
      throw new ApiError(404, "Segnalazione non trovata");
    }

    const report = buildReportReadModel({
      reportId: reportSnap.id,
      data: reportSnap.data() || {},
    });
    const updatePayload = buildReportMutationPatch({
      handledBy,
      action: normalizedAction,
      timestampFactory: () => FieldValue.serverTimestamp(),
    });
    let ownerIdHint = toNullableString(report?.target?.ownerId);

    if (normalizedNote !== null) {
      setNestedValue(updatePayload, "moderation.note", normalizedNote);
    }

    let apartmentRemoved = null;

    if (normalizedAction === "start_review") {
      updatePayload.status = "reviewing";
    }

    if (normalizedAction === "resolve") {
      updatePayload.status = "resolved";
      setNestedValue(
        updatePayload,
        "resolution.code",
        toNullableString(report?.resolution?.code) || "handled"
      );
      setNestedValue(
        updatePayload,
        "resolution.resolvedAt",
        FieldValue.serverTimestamp()
      );
    }

    if (normalizedAction === "reject") {
      updatePayload.status = "rejected";
      setNestedValue(updatePayload, "resolution.code", "invalid_report");
      setNestedValue(
        updatePayload,
        "resolution.resolvedAt",
        FieldValue.serverTimestamp()
      );
    }

    if (normalizedAction === "reopen") {
      updatePayload.status = "open";
      setNestedValue(updatePayload, "resolution.code", null);
      setNestedValue(updatePayload, "resolution.note", null);
      setNestedValue(updatePayload, "resolution.resolvedAt", null);
    }

    if (normalizedAction === "escalate") {
      updatePayload.priority = "high";
      updatePayload.severity = "critical";
      if (report.status === "open") {
        updatePayload.status = "reviewing";
      }
    }

    if (normalizedAction === "remove_apartment") {
      const apartmentId =
        report.target?.apartmentId ||
        (report.target?.type === "apartment" ? report.target.id : null);

      if (!apartmentId) {
        throw new ApiError(422, "Segnalazione senza annuncio associato");
      }

      try {
        const removedApartment = await rejectApartmentWithSideEffects(apartmentId);
        apartmentRemoved = true;
        ownerIdHint = toNullableString(removedApartment?.ownerId) || ownerIdHint;
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          apartmentRemoved = false;
        } else {
          throw error;
        }
      }

      updatePayload.status = "resolved";
      setNestedValue(updatePayload, "resolution.code", "listing_removed");
      setNestedValue(
        updatePayload,
        "resolution.resolvedAt",
        FieldValue.serverTimestamp()
      );
      if (apartmentRemoved === false) {
        setNestedValue(
          updatePayload,
          "resolution.note",
          normalizedNote || "Annuncio già assente al momento della moderazione."
        );
      }
    }

    await db.runTransaction(async (tx) => {
      const currentReportSnap = await tx.get(reportRef);
      if (!currentReportSnap.exists) {
        throw new ApiError(404, "Segnalazione non trovata");
      }

      const reportData = currentReportSnap.data() || {};
      const previousStatus = normalizeReportStatus(reportData.status, "open");
      const nextStatus = normalizeReportStatus(updatePayload.status, previousStatus);

      await applyReportStatusSideEffectsInTransaction({
        tx,
        reportData,
        previousStatus,
        nextStatus,
        ownerIdHint,
      });

      if (ownerIdHint && !toNullableString(reportData?.target?.ownerId)) {
        setNestedValue(updatePayload, "target.ownerId", ownerIdHint);
      }

      tx.set(reportRef, updatePayload, { merge: true });
    });

    const updatedSnap = await reportRef.get();
    const updatedReport = buildReportReadModel({
      reportId: updatedSnap.id,
      data: updatedSnap.data() || {},
    });
    const notificationResults = await sendAdminNotifications({
      reportRef,
      report: updatedReport,
      handledBy,
      ownerIdHint,
      notifications,
    });

    return {
      action: normalizedAction,
      apartmentRemoved,
      report: updatedReport,
      notifications: notificationResults,
    };
  };

  return {
    createReport,
    createApartmentReport,
    listAdminReports,
    getAdminReportDetails,
    updateAdminReport,
    runAdminQuickAction,
  };
};

module.exports = {
  createReportsService,
};
