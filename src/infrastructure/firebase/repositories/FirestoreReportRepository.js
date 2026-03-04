import {
  collection,
  doc,
  getDoc,
  getDocs,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/infrastructure/firebase";
import { callBackendApi } from "@/infrastructure/api/firebaseApiClient";
import { getReportReasonLabel } from "@/shared/constants/reports";
import { hasOwn, setNestedValue } from "@/shared/utils/objectPath";
import { normalizeReportTarget } from "@/shared/utils/reportTarget";

const REPORTS_COLLECTION = "reports";
const APARTMENTS_COLLECTION = "apartments";
const USERS_PUBLIC_COLLECTION = "usersPublic";
const USERS_PRIVATE_COLLECTION = "usersPrivate";

const REPORT_STATUSES = new Set(["open", "reviewing", "resolved", "rejected"]);
const REPORT_PRIORITIES = new Set(["low", "medium", "high"]);
const REPORT_SEVERITIES = new Set(["low", "medium", "high", "critical"]);
const REPORT_TARGET_TYPES = new Set(["apartment", "review", "message", "user"]);
const REPORT_QUICK_ACTIONS = new Set([
  "start_review",
  "resolve",
  "reject",
  "reopen",
  "escalate",
  "remove_apartment",
]);

const createReportMutationPayload = (action) => ({
  updatedAt: serverTimestamp(),
  moderation: {
    action,
    handledBy: auth.currentUser?.uid || null,
    handledAt: serverTimestamp(),
  },
});

const toNullableString = (value) => {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized || null;
};

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeDateValue = (value) => {
  if (!value) return null;
  if (value?.toDate) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }
  return null;
};

const normalizeReportStatus = (status, fallback = "open") => {
  const normalized = String(status || "").trim().toLowerCase();
  return REPORT_STATUSES.has(normalized) ? normalized : fallback;
};

const normalizeReportPriority = (priority, fallback = "medium") => {
  const normalized = String(priority || "").trim().toLowerCase();
  return REPORT_PRIORITIES.has(normalized) ? normalized : fallback;
};

const normalizeReportSeverity = (severity, fallback = "medium") => {
  const normalized = String(severity || "").trim().toLowerCase();
  return REPORT_SEVERITIES.has(normalized) ? normalized : fallback;
};

const isReportOpenStatus = (status) =>
  status === "open" || status === "reviewing";

const isReportResolvedStatus = (status) => status === "resolved";

const sortByDateDesc = (a, b) => {
  const dateA = a?.createdAt ? new Date(a.createdAt) : new Date(0);
  const dateB = b?.createdAt ? new Date(b.createdAt) : new Date(0);
  return dateB - dateA;
};

const normalizeCommunicationChannel = (channel = null) => {
  if (!channel || typeof channel !== "object") return null;
  return {
    requested: channel.requested === true,
    sent: channel.sent === true,
    recipientUserId: channel.recipientUserId || null,
    type: channel.type || null,
    message: channel.message || null,
    error: channel.error || null,
    sentBy: channel.sentBy || null,
    sentAt: normalizeDateValue(channel.sentAt),
  };
};

const normalizeReportPayload = (data = {}) => {
  if (!data || typeof data !== "object") {
    return null;
  }

  const reason = data.reason || "other";
  const target = data.target && typeof data.target === "object" ? data.target : null;

  return {
    ...data,
    id: data.id || null,
    target: target
      ? {
          type: target.type || null,
          id: target.id || null,
          apartmentId: target.apartmentId || null,
          conversationId: target.conversationId || null,
          reviewId: target.reviewId || null,
          messageId: target.messageId || null,
          userId: target.userId || null,
          ownerId: target.ownerId || null,
        }
      : null,
    reporterId: data.reporterId || null,
    reporterSnapshot: data.reporterSnapshot || null,
    reason,
    reasonLabel: data.reasonLabel || getReportReasonLabel(reason),
    message: data.message || null,
    status: normalizeReportStatus(data.status, "open"),
    priority: normalizeReportPriority(data.priority, "medium"),
    severity: normalizeReportSeverity(data.severity, "medium"),
    moderation:
      data.moderation && typeof data.moderation === "object"
        ? {
            action: data.moderation.action || null,
            handledBy: data.moderation.handledBy || null,
            handledAt: normalizeDateValue(data.moderation.handledAt),
            note: data.moderation.note || null,
          }
        : null,
    resolution:
      data.resolution && typeof data.resolution === "object"
        ? {
            code: data.resolution.code || null,
            note: data.resolution.note || null,
            resolvedAt: normalizeDateValue(data.resolution.resolvedAt),
          }
        : null,
    communications:
      data.communications && typeof data.communications === "object"
        ? {
            updatedAt: normalizeDateValue(data.communications.updatedAt),
            lastHandledBy: data.communications.lastHandledBy || null,
            reporter: normalizeCommunicationChannel(data.communications.reporter),
            target: normalizeCommunicationChannel(data.communications.target),
          }
        : null,
    createdAt: normalizeDateValue(data.createdAt),
    updatedAt: normalizeDateValue(data.updatedAt),
  };
};

const normalizeReportDoc = (docSnap) =>
  normalizeReportPayload({
    id: docSnap.id,
    ...(docSnap.data() || {}),
  });

const appendArrayQueryParam = (params, key, value) => {
  if (!value) return;
  if (Array.isArray(value)) {
    const normalized = value.map((item) => String(item).trim()).filter(Boolean);
    if (normalized.length) {
      params.set(key, normalized.join(","));
    }
    return;
  }

  const asString = String(value).trim();
  if (asString) {
    params.set(key, asString);
  }
};

const buildAdminReportsPath = (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set("search", String(filters.search).trim());
  }

  if (typeof filters.hideClosed === "boolean") {
    params.set("hideClosed", filters.hideClosed ? "true" : "false");
  }

  if (filters.limit) {
    params.set("limit", String(filters.limit));
  }

  appendArrayQueryParam(params, "status", filters.status);
  appendArrayQueryParam(params, "severity", filters.severity);
  appendArrayQueryParam(params, "reason", filters.reason);
  appendArrayQueryParam(params, "targetType", filters.targetType);

  const query = params.toString();
  return query ? `/v1/admin/reports?${query}` : "/v1/admin/reports";
};

const buildSummary = (reports = []) => {
  const byStatus = {
    open: 0,
    reviewing: 0,
    resolved: 0,
    rejected: 0,
  };
  const bySeverity = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };

  reports.forEach((report) => {
    if (hasOwn(byStatus, report.status)) {
      byStatus[report.status] += 1;
    }
    if (hasOwn(bySeverity, report.severity)) {
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

const isMissingEndpointError = (error) => {
  const message = String(error?.message || "")
    .trim()
    .toLowerCase();
  return (
    message === "not found" ||
    message === "404" ||
    message.includes("not found") ||
    message.includes("404")
  );
};

const normalizeReportTargetInput = (target = null) => {
  const normalized = normalizeReportTarget(target);
  if (!normalized || !REPORT_TARGET_TYPES.has(normalized.type)) {
    return null;
  }
  return normalized;
};

const buildCreateReportRequestBody = (payload = {}) => {
  if (!payload || typeof payload !== "object") {
    throw new Error("Payload segnalazione non valido.");
  }

  const target = normalizeReportTargetInput(payload.target);
  if (!target) {
    throw new Error("Target segnalazione non valido.");
  }

  return {
    target,
    reason: payload.reason,
    message: payload.message,
    priority: payload.priority,
    reporterSnapshot: payload.reporterSnapshot || null,
  };
};

const callLegacyApartmentReportEndpoint = async (payload = {}) => {
  const apartmentId = toNullableString(payload?.target?.apartmentId || payload?.target?.id);
  if (!apartmentId) {
    throw new Error("Apartment ID segnalazione mancante.");
  }

  await callBackendApi(`/v1/reports/apartments/${apartmentId}`, {
    method: "POST",
    body: {
      reason: payload.reason,
      message: payload.message,
      priority: payload.priority,
      reporterSnapshot: payload.reporterSnapshot || null,
    },
  });
};

const getApartmentIdFromReportData = (reportData = {}) => {
  const target = reportData?.target || {};
  return target.apartmentId || (target.type === "apartment" ? target.id : null);
};

const buildDisplayName = (publicData = {}) => {
  const displayName = toNullableString(publicData.displayName);
  if (displayName) return displayName;

  const composed = [toNullableString(publicData.firstName), toNullableString(publicData.lastName)]
    .filter(Boolean)
    .join(" ");
  return composed || "Utente";
};

const buildLegacyUserContext = async (userId) => {
  const normalizedUserId = toNullableString(userId);
  if (!normalizedUserId) return null;

  const publicRef = doc(db, USERS_PUBLIC_COLLECTION, normalizedUserId);
  const privateRef = doc(db, USERS_PRIVATE_COLLECTION, normalizedUserId);
  const [publicSnap, privateSnap] = await Promise.all([
    getDoc(publicRef),
    getDoc(privateRef),
  ]);

  if (!publicSnap.exists() && !privateSnap.exists()) {
    return null;
  }

  const publicData = publicSnap.exists() ? publicSnap.data() || {} : {};
  const privateData = privateSnap.exists() ? privateSnap.data() || {} : {};

  return {
    userId: normalizedUserId,
    displayName: buildDisplayName(publicData),
    email: toNullableString(privateData.email),
    phone: toNullableString(privateData.phone),
    isHost: Boolean(publicData.isHost),
    isVerifiedHost: Boolean(publicData.isVerifiedHost),
    publicStats: {
      apartmentsCount: toNumber(publicData?.publicStats?.apartmentsCount, 0),
      reportsCount: toNumber(publicData?.publicStats?.reportsCount, 0),
      resolvedReportsCount: toNumber(
        publicData?.publicStats?.resolvedReportsCount,
        0
      ),
    },
    updatedAt: normalizeDateValue(privateData.updatedAt || publicData.updatedAt),
    createdAt: normalizeDateValue(privateData.createdAt || publicData.createdAt),
  };
};

const buildLegacyApartmentContext = async (apartmentId) => {
  const normalizedApartmentId = toNullableString(apartmentId);
  if (!normalizedApartmentId) return null;

  const apartmentRef = doc(db, APARTMENTS_COLLECTION, normalizedApartmentId);
  const apartmentSnap = await getDoc(apartmentRef);
  if (!apartmentSnap.exists()) return null;

  const apartmentData = apartmentSnap.data() || {};
  const minRoomPrice = toNumber(apartmentData?.aggregates?.minRoomPrice, null);
  const maxRoomPrice = toNumber(apartmentData?.aggregates?.maxRoomPrice, null);
  const score = Number(apartmentData?.metrics?.score);

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
    totalReports: toNumber(apartmentData?.metrics?.totalReports, 0),
    score: Number.isFinite(score) ? score : null,
    createdAt: normalizeDateValue(apartmentData.createdAt),
    updatedAt: normalizeDateValue(apartmentData.updatedAt),
  };
};

const fetchLegacyReportById = async (reportId) => {
  const reportRef = doc(db, REPORTS_COLLECTION, reportId);
  const reportSnap = await getDoc(reportRef);
  if (!reportSnap.exists()) {
    throw new Error("Segnalazione non trovata.");
  }

  const normalized = normalizeReportDoc(reportSnap);
  if (!normalized?.id) {
    throw new Error("Segnalazione non valida.");
  }
  return normalized;
};

const updateHostReportStatsInTransaction = async ({
  tx,
  publicRef,
  privateRef,
  publicData = null,
  privateData = null,
  openReportsDelta = 0,
  resolvedReportsDelta = 0,
} = {}) => {
  if (publicRef && publicData) {
    const publicStats =
      publicData.publicStats && typeof publicData.publicStats === "object"
        ? publicData.publicStats
        : {};
    const currentOpenReports = Math.max(
      0,
      toNumber(publicStats.reportsCount, 0)
    );
    const currentResolvedReports = Math.max(
      0,
      toNumber(publicStats.resolvedReportsCount, 0)
    );

    const nextOpenReports = Math.max(0, currentOpenReports + openReportsDelta);
    const nextResolvedReports = Math.max(
      0,
      currentResolvedReports + resolvedReportsDelta
    );

    tx.update(publicRef, {
      publicStats: {
        ...publicStats,
        reportsCount: nextOpenReports,
        resolvedReportsCount: nextResolvedReports,
      },
      updatedAt: serverTimestamp(),
    });
  }

  if (privateRef && privateData) {
    const currentInternalReports = Math.max(0, toNumber(privateData.reportsCount, 0));
    const nextInternalReports = Math.max(
      0,
      currentInternalReports + openReportsDelta
    );

    tx.update(privateRef, {
      reportsCount: nextInternalReports,
      updatedAt: serverTimestamp(),
    });
  }
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
  const openReportsDelta = wasOpen === isNowOpen ? 0 : isNowOpen ? 1 : -1;

  const wasResolved = isReportResolvedStatus(prevStatus);
  const isNowResolved = isReportResolvedStatus(targetStatus);
  const resolvedReportsDelta =
    wasResolved === isNowResolved ? 0 : isNowResolved ? 1 : -1;

  let ownerId =
    toNullableString(ownerIdHint) ||
    toNullableString(reportData?.target?.ownerId);

  const apartmentId = getApartmentIdFromReportData(reportData);
  const shouldUpdateApartment = openReportsDelta !== 0 && Boolean(apartmentId);
  let apartmentRef = null;
  let apartmentData = null;

  // Read apartment first.
  if (shouldUpdateApartment) {
    apartmentRef = doc(db, APARTMENTS_COLLECTION, apartmentId);
    const apartmentSnap = await tx.get(apartmentRef);
    if (apartmentSnap.exists()) {
      apartmentData = apartmentSnap.data() || {};
      if (!ownerId) {
        ownerId = toNullableString(apartmentData.ownerId);
      }
    }
  }

  const shouldUpdateHost =
    Boolean(ownerId) && (openReportsDelta !== 0 || resolvedReportsDelta !== 0);
  let publicRef = null;
  let privateRef = null;
  let publicData = null;
  let privateData = null;

  // Read host docs first.
  if (shouldUpdateHost) {
    publicRef = doc(db, USERS_PUBLIC_COLLECTION, ownerId);
    privateRef = doc(db, USERS_PRIVATE_COLLECTION, ownerId);
    const [publicSnap, privateSnap] = await Promise.all([
      tx.get(publicRef),
      tx.get(privateRef),
    ]);
    publicData = publicSnap.exists() ? publicSnap.data() || {} : null;
    privateData = privateSnap.exists() ? privateSnap.data() || {} : null;
  }

  if (shouldUpdateApartment && apartmentRef && apartmentData) {
    const metrics =
      apartmentData.metrics && typeof apartmentData.metrics === "object"
        ? apartmentData.metrics
        : {};
    const currentTotalReports = Math.max(
      0,
      toNumber(metrics.totalReports, 0)
    );
    const nextTotalReports = Math.max(
      0,
      currentTotalReports + openReportsDelta
    );

    tx.update(apartmentRef, {
      metrics: {
        ...metrics,
        totalReports: nextTotalReports,
        updatedAt: serverTimestamp(),
      },
    });
  }

  if (shouldUpdateHost) {
    await updateHostReportStatsInTransaction({
      tx,
      publicRef,
      privateRef,
      publicData,
      privateData,
      openReportsDelta,
      resolvedReportsDelta,
    });
  }
};

const runLegacyReportMutation = async (reportId, buildMutation) => {
  const reportRef = doc(db, REPORTS_COLLECTION, reportId);

  await runTransaction(db, async (tx) => {
    const reportSnap = await tx.get(reportRef);
    if (!reportSnap.exists()) {
      throw new Error("Segnalazione non trovata.");
    }

    const reportData = reportSnap.data() || {};
    const previousStatus = normalizeReportStatus(reportData.status, "open");
    const mutation = buildMutation({
      reportData,
      previousStatus,
    });

    if (!mutation?.updatePayload || typeof mutation.updatePayload !== "object") {
      throw new Error("Aggiornamento segnalazione non valido.");
    }

    const nextStatus = normalizeReportStatus(
      mutation.nextStatus || mutation.updatePayload.status,
      previousStatus
    );

    await applyReportStatusSideEffectsInTransaction({
      tx,
      reportData,
      previousStatus,
      nextStatus,
      ownerIdHint: mutation.ownerIdHint || null,
    });

    if (
      mutation.ownerIdHint &&
      !toNullableString(reportData?.target?.ownerId)
    ) {
      setNestedValue(mutation.updatePayload, "target.ownerId", mutation.ownerIdHint);
    }

    tx.set(
      reportRef,
      {
        ...mutation.updatePayload,
        updatedAt: mutation.updatePayload.updatedAt || serverTimestamp(),
      },
      { merge: true }
    );
  });

  return fetchLegacyReportById(reportId);
};

const fetchLegacyAdminList = async () => {
  const snapshot = await getDocs(collection(db, REPORTS_COLLECTION));
  const reports = snapshot.docs.map(normalizeReportDoc).filter(Boolean);
  reports.sort(sortByDateDesc);
  return {
    reports,
    summary: buildSummary(reports),
  };
};

const fetchLegacyAdminDetails = async (reportId) => {
  const report = await fetchLegacyReportById(reportId);
  const apartmentId = getApartmentIdFromReportData(report);
  const targetUserId = report?.target?.type === "user" ? report?.target?.id : null;

  const [apartment, reporter, targetUser] = await Promise.all([
    apartmentId ? buildLegacyApartmentContext(apartmentId) : Promise.resolve(null),
    report.reporterId ? buildLegacyUserContext(report.reporterId) : Promise.resolve(null),
    targetUserId ? buildLegacyUserContext(targetUserId) : Promise.resolve(null),
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

const runLegacyQuickAction = async (reportId, action, payload = {}) => {
  if (!REPORT_QUICK_ACTIONS.has(action)) {
    throw new Error("Azione rapida non supportata.");
  }

  const currentReport = await fetchLegacyReportById(reportId);
  const note = toNullableString(payload.note);
  let apartmentRemoved = null;
  let ownerIdHint = toNullableString(currentReport?.target?.ownerId);

  if (action === "remove_apartment") {
    const apartmentId = getApartmentIdFromReportData(currentReport);
    if (!apartmentId) {
      throw new Error("Segnalazione senza annuncio associato.");
    }

    if (!ownerIdHint) {
      const apartmentContext = await buildLegacyApartmentContext(apartmentId);
      ownerIdHint = toNullableString(apartmentContext?.ownerId);
    }

    try {
      await callBackendApi(`/v1/admin/apartments/${apartmentId}/reject`, {
        method: "POST",
        body: {},
      });
      apartmentRemoved = true;
    } catch (error) {
      const message = String(error?.message || "").toLowerCase();
      if (message.includes("annuncio non trovato")) {
        apartmentRemoved = false;
      } else {
        throw error;
      }
    }
  }

  const updatePayload = createReportMutationPayload(action);

  if (note !== null) {
    setNestedValue(updatePayload, "moderation.note", note);
  }

  if (action === "start_review") {
    updatePayload.status = "reviewing";
  }

  if (action === "resolve") {
    updatePayload.status = "resolved";
    setNestedValue(
      updatePayload,
      "resolution.code",
      toNullableString(currentReport?.resolution?.code) || "handled"
    );
    setNestedValue(updatePayload, "resolution.resolvedAt", serverTimestamp());
  }

  if (action === "reject") {
    updatePayload.status = "rejected";
    setNestedValue(updatePayload, "resolution.code", "invalid_report");
    setNestedValue(updatePayload, "resolution.resolvedAt", serverTimestamp());
  }

  if (action === "reopen") {
    updatePayload.status = "open";
    setNestedValue(updatePayload, "resolution.code", null);
    setNestedValue(updatePayload, "resolution.note", null);
    setNestedValue(updatePayload, "resolution.resolvedAt", null);
  }

  if (action === "escalate") {
    updatePayload.priority = "high";
    updatePayload.severity = "critical";
    if (currentReport.status === "open") {
      updatePayload.status = "reviewing";
    }
  }

  if (action === "remove_apartment") {
    updatePayload.status = "resolved";
    setNestedValue(updatePayload, "resolution.code", "listing_removed");
    setNestedValue(updatePayload, "resolution.resolvedAt", serverTimestamp());
    if (apartmentRemoved === false) {
      setNestedValue(
        updatePayload,
        "resolution.note",
        note || "Annuncio già assente al momento della moderazione."
      );
    }
  }

  const report = await runLegacyReportMutation(reportId, ({ previousStatus }) => ({
    updatePayload,
    nextStatus: updatePayload.status || previousStatus,
    ownerIdHint,
  }));

  return {
    report,
    action,
    apartmentRemoved,
  };
};

const runLegacyAdminUpdate = async (reportId, payload = {}) => {
  const updatePayload = createReportMutationPayload("manual_update");
  let hasChanges = false;

  if (hasOwn(payload, "action")) {
    const action = toNullableString(payload.action);
    if (!action) {
      throw new Error("Azione moderazione non valida.");
    }
    setNestedValue(updatePayload, "moderation.action", action);
    hasChanges = true;
  }

  if (hasOwn(payload, "status")) {
    const status = normalizeReportStatus(payload.status, null);
    if (!status) {
      throw new Error("Status segnalazione non valido.");
    }
    updatePayload.status = status;
    hasChanges = true;

    if (status === "resolved" || status === "rejected") {
      setNestedValue(updatePayload, "resolution.resolvedAt", serverTimestamp());
    } else {
      setNestedValue(updatePayload, "resolution.resolvedAt", null);
    }
  }

  if (hasOwn(payload, "priority")) {
    const priority = normalizeReportPriority(payload.priority, null);
    if (!priority) {
      throw new Error("Priorità segnalazione non valida.");
    }
    updatePayload.priority = priority;
    hasChanges = true;
  }

  if (hasOwn(payload, "severity")) {
    const severity = normalizeReportSeverity(payload.severity, null);
    if (!severity) {
      throw new Error("Gravità segnalazione non valida.");
    }
    updatePayload.severity = severity;
    hasChanges = true;
  }

  if (hasOwn(payload, "note")) {
    setNestedValue(updatePayload, "moderation.note", toNullableString(payload.note));
    hasChanges = true;
  }

  if (hasOwn(payload, "resolutionCode")) {
    setNestedValue(updatePayload, "resolution.code", toNullableString(payload.resolutionCode));
    hasChanges = true;
  }

  if (hasOwn(payload, "resolutionNote")) {
    const resolutionNote = toNullableString(payload.resolutionNote);
    setNestedValue(updatePayload, "resolution.note", resolutionNote);
    hasChanges = true;
    if (resolutionNote) {
      setNestedValue(updatePayload, "resolution.resolvedAt", serverTimestamp());
    }
  }

  if (!hasChanges) {
    throw new Error("Nessun campo valido da aggiornare.");
  }

  return runLegacyReportMutation(reportId, ({ previousStatus }) => ({
    updatePayload,
    nextStatus: updatePayload.status || previousStatus,
    ownerIdHint: null,
  }));
};

export const FirestoreReportRepository = {
  async fetchAll(filters = {}) {
    const payload = await FirestoreReportRepository.fetchAdminList(filters);
    return payload.reports;
  },
  async fetchAdminList(filters = {}) {
    try {
      const response = await callBackendApi(buildAdminReportsPath(filters), {
        method: "GET",
      });

      const reportsRaw = Array.isArray(response?.reports) ? response.reports : [];
      const reports = reportsRaw
        .map((item) => normalizeReportPayload(item))
        .filter(Boolean);
      reports.sort(sortByDateDesc);

      return {
        reports,
        summary: response?.summary || buildSummary(reports),
      };
    } catch (error) {
      if (!isMissingEndpointError(error)) {
        throw error;
      }
      return fetchLegacyAdminList();
    }
  },
  async fetchAdminDetails(reportId) {
    if (!reportId) {
      throw new Error("Report ID mancante.");
    }

    let payload;
    try {
      payload = await callBackendApi(`/v1/admin/reports/${reportId}`, {
        method: "GET",
      });
    } catch (error) {
      if (!isMissingEndpointError(error)) {
        throw error;
      }
      return fetchLegacyAdminDetails(reportId);
    }

    const normalizedReport = normalizeReportPayload(payload?.report || null);
    if (!normalizedReport?.id) {
      throw new Error("Dettaglio segnalazione non valido.");
    }

    return {
      report: normalizedReport,
      context: payload?.context || null,
    };
  },
  async updateAdminReport(reportId, payload = {}) {
    if (!reportId) {
      throw new Error("Report ID mancante.");
    }

    let response;
    try {
      response = await callBackendApi(`/v1/admin/reports/${reportId}`, {
        method: "PATCH",
        body: payload,
      });
    } catch (error) {
      if (!isMissingEndpointError(error)) {
        throw error;
      }
      return runLegacyAdminUpdate(reportId, payload);
    }

    const report = normalizeReportPayload(response?.report || null);
    if (!report?.id) {
      throw new Error("Aggiornamento segnalazione non valido.");
    }
    return report;
  },
  async runAdminQuickAction(reportId, action, payload = {}) {
    if (!reportId) {
      throw new Error("Report ID mancante.");
    }
    if (!action) {
      throw new Error("Azione rapida mancante.");
    }

    let response;
    try {
      response = await callBackendApi(`/v1/admin/reports/${reportId}/actions`, {
        method: "POST",
        body: {
          action,
          note: payload.note,
          notifications:
            payload.notifications && typeof payload.notifications === "object"
              ? payload.notifications
              : undefined,
        },
      });
    } catch (error) {
      if (!isMissingEndpointError(error)) {
        throw error;
      }
      return runLegacyQuickAction(reportId, action, payload);
    }

    const report = normalizeReportPayload(response?.report || null);
    if (!report?.id) {
      throw new Error("Risposta azione rapida non valida.");
    }

    return {
      report,
      action: response?.action || action,
      apartmentRemoved:
        typeof response?.apartmentRemoved === "boolean"
          ? response.apartmentRemoved
          : null,
      notifications:
        response?.notifications && typeof response.notifications === "object"
          ? response.notifications
          : null,
    };
  },
  async createApartmentReport(payload) {
    if (!payload || typeof payload !== "object") {
      throw new Error("Payload segnalazione non valido.");
    }
    if (!payload.apartmentId) {
      throw new Error("Apartment ID segnalazione mancante.");
    }

    await FirestoreReportRepository.createReport({
      target: {
        type: "apartment",
        id: payload.apartmentId,
        apartmentId: payload.apartmentId,
      },
      reason: payload.reason,
      message: payload.message,
      priority: payload.priority,
      reporterSnapshot: payload.reporterSnapshot || null,
    });
  },
  async createReport(payload) {
    const requestBody = buildCreateReportRequestBody(payload);

    try {
      await callBackendApi("/v1/reports", {
        method: "POST",
        body: requestBody,
      });
      return;
    } catch (error) {
      if (!isMissingEndpointError(error)) {
        throw error;
      }
    }

    if (requestBody.target.type === "apartment") {
      await callLegacyApartmentReportEndpoint(requestBody);
      return;
    }

    throw new Error(
      "Tipo segnalazione non supportato dal backend legacy."
    );
  },
};
