import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { formatDate } from "@/ui/helpers/formatDate";
import { getPriceRangeLabel } from "@/ui/helpers/apartmentPricing";
import { FirestoreReportRepository } from "@/infrastructure/firebase/repositories/FirestoreReportRepository";
import {
  getReportPriorityMeta,
  getReportReasonLabel,
  getReportSeverityMeta,
  getReportStatusMeta,
  REPORT_PRIORITY_VALUES,
  REPORT_QUICK_ACTIONS,
  REPORT_REASON_OPTIONS,
  REPORT_SEVERITY_VALUES,
  REPORT_STATUS_VALUES,
} from "@/shared/constants/reports";
import { GreenContainer, WhiteContainer } from "../../common";
import TextAreaEditor from "../../common/form/TextAreaEditor";
import { buildPlatformMessage, buildReportHeader } from "./utils";

const CLOSED_STATUSES = new Set(["resolved", "rejected"]);
const TARGET_TYPE_OPTIONS = [
  { value: "all", label: "Tutti i target" },
  { value: "apartment", label: "Annunci" },
  { value: "user", label: "Utenti" },
  { value: "review", label: "Recensioni" },
  { value: "message", label: "Messaggi" },
];

const TARGET_TYPE_LABELS = {
  apartment: "Annuncio",
  user: "Utente",
  review: "Recensione",
  message: "Messaggio",
};

const sortByDateDesc = (a, b) => {
  const dateA = a?.createdAt ? new Date(a.createdAt) : new Date(0);
  const dateB = b?.createdAt ? new Date(b.createdAt) : new Date(0);
  return dateB - dateA;
};

const getApartmentIdFromReport = (report) =>
  report?.target?.apartmentId ||
  (report?.target?.type === "apartment" ? report?.target?.id : null);

const getTargetTypeLabel = (targetType) =>
  TARGET_TYPE_LABELS[targetType] || targetType || "N/D";

const toSearchableString = (value) =>
  String(value || "")
    .toLowerCase()
    .trim();

const toReportWithDefaults = (report) => {
  const safeReason = report?.reason || "other";
  const safeStatus = REPORT_STATUS_VALUES.includes(report?.status)
    ? report.status
    : "open";
  const safePriority = REPORT_PRIORITY_VALUES.includes(report?.priority)
    ? report.priority
    : "medium";
  const safeSeverity = REPORT_SEVERITY_VALUES.includes(report?.severity)
    ? report.severity
    : "medium";

  return {
    ...report,
    reason: safeReason,
    reasonLabel: report?.reasonLabel || getReportReasonLabel(safeReason),
    status: safeStatus,
    priority: safePriority,
    severity: safeSeverity,
  };
};

export default function AdminSegnalazioniSection({
  segnalazioni,
  onRefresh,
  updatedAt,
}) {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [detailsById, setDetailsById] = useState({});
  const [loadingDetailsById, setLoadingDetailsById] = useState({});
  const [actionLoadingById, setActionLoadingById] = useState({});
  const [moderationNotes, setModerationNotes] = useState({});
  const [reportNotifications, setReportNotifications] = useState({});
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    severity: "all",
    reason: "all",
    targetType: "all",
    hideClosed: true,
  });

  useEffect(() => {
    const normalized = (segnalazioni || []).map((item) =>
      toReportWithDefaults(item),
    );
    normalized.sort(sortByDateDesc);
    setReports(normalized);
  }, [segnalazioni]);

  const upsertReport = useCallback((nextReport) => {
    if (!nextReport?.id) return;
    const normalized = toReportWithDefaults(nextReport);
    setReports((prev) => {
      const next = [...prev];
      const index = next.findIndex((item) => item.id === normalized.id);
      if (index === -1) {
        next.unshift(normalized);
      } else {
        next[index] = {
          ...next[index],
          ...normalized,
        };
      }
      next.sort(sortByDateDesc);
      return next;
    });
  }, []);

  const runWithRowLoading = useCallback(async (reportId, task) => {
    setActionLoadingById((prev) => ({ ...prev, [reportId]: true }));
    try {
      await task();
    } finally {
      setActionLoadingById((prev) => ({ ...prev, [reportId]: false }));
    }
  }, []);

  const handleSaveModerationNote = useCallback(
    async (reportId) => {
      const report = reports.find((item) => item.id === reportId);
      const hasDraftNote = Object.prototype.hasOwnProperty.call(
        moderationNotes,
        reportId,
      );
      const note = hasDraftNote
        ? moderationNotes[reportId]
        : report?.moderation?.note || "";
      try {
        await runWithRowLoading(reportId, async () => {
          const updatedReport =
            await FirestoreReportRepository.updateAdminReport(reportId, {
              note,
            });
          upsertReport(updatedReport);
          toast.success("Nota moderazione salvata.");
        });
      } catch (error) {
        console.error("Errore salvataggio nota moderazione:", error);
        toast.error("Impossibile salvare la nota moderazione.");
      }
    },
    [moderationNotes, reports, runWithRowLoading, upsertReport],
  );

  const handleQuickAction = useCallback(
    async (report, action) => {
      if (!report?.id) return;
      const note = moderationNotes[report.id] || "";
      const notificationDraft = reportNotifications[report.id] || {};
      const reporterEnabled = notificationDraft.notifyReporter === true;
      const reporterRawMessage = String(
        notificationDraft.reporterMessage || "",
      ).trim();
      const reporterMessage = buildPlatformMessage(
        buildReportHeader(report, false),
        reporterRawMessage,
        true,
        true,
      );
      const targetEnabled = notificationDraft.notifyTarget === true;
      const targetRawMessage = String(
        notificationDraft.targetMessage || "",
      ).trim();
      const targetMessage = buildPlatformMessage(
        buildReportHeader(report, true),
        targetRawMessage,
        true,
        true,
      );

      if (reporterEnabled && !reporterRawMessage) {
        toast.error(
          "Inserisci un messaggio per il segnalatore o disattiva la notifica.",
        );
        return;
      }

      if (targetEnabled && !targetRawMessage) {
        toast.error(
          "Inserisci un messaggio per l'utente segnalato o disattiva la notifica.",
        );
        return;
      }

      const notifications = {};
      if (reporterEnabled) {
        notifications.reporter = {
          enabled: true,
          message: reporterMessage,
          type: "info",
        };
      }
      if (targetEnabled) {
        notifications.target = {
          enabled: true,
          message: targetMessage,
          type:
            action === REPORT_QUICK_ACTIONS.REMOVE_APARTMENT
              ? "warning"
              : "info",
        };
      }

      try {
        await runWithRowLoading(report.id, async () => {
          const result = await FirestoreReportRepository.runAdminQuickAction(
            report.id,
            action,
            {
              note,
              notifications:
                Object.keys(notifications).length > 0
                  ? notifications
                  : undefined,
            },
          );

          upsertReport(result.report);

          const sentCount = [
            result?.notifications?.reporter?.sent,
            result?.notifications?.target?.sent,
          ].filter(Boolean).length;
          const failedCount = [
            result?.notifications?.reporter,
            result?.notifications?.target,
          ].filter((item) => item?.requested && item?.sent !== true).length;

          if (sentCount || failedCount) {
            toast.info(
              `Notifiche piattaforma: ${sentCount} inviate, ${failedCount} non inviate.`,
            );
          }

          if (action === REPORT_QUICK_ACTIONS.REMOVE_APARTMENT) {
            if (result.apartmentRemoved === true) {
              toast.success("Annuncio rimosso e segnalazione risolta.");
            } else if (result.apartmentRemoved === false) {
              toast.info("Annuncio già assente. Segnalazione aggiornata.");
            } else {
              toast.success("Azione rapida eseguita.");
            }
            return;
          }

          if (action === REPORT_QUICK_ACTIONS.ESCALATE) {
            toast.success("Segnalazione escalata a gravità critica.");
            return;
          }

          toast.success("Azione rapida completata.");
        });
      } catch (error) {
        console.error("Errore azione rapida segnalazione:", error);
        toast.error("Azione rapida non completata.");
      }
    },
    [moderationNotes, reportNotifications, runWithRowLoading, upsertReport],
  );

  const loadReportDetails = useCallback(
    async (reportId) => {
      if (!reportId || detailsById[reportId]) return;

      setLoadingDetailsById((prev) => ({ ...prev, [reportId]: true }));
      try {
        const payload =
          await FirestoreReportRepository.fetchAdminDetails(reportId);
        upsertReport(payload.report);
        setDetailsById((prev) => ({
          ...prev,
          [reportId]: payload.context || {},
        }));
      } catch (error) {
        console.error("Errore caricamento dettagli segnalazione:", error);
        toast.error("Errore nel caricamento dettagli.");
      } finally {
        setLoadingDetailsById((prev) => ({ ...prev, [reportId]: false }));
      }
    },
    [detailsById, upsertReport],
  );

  const handleViewApartment = useCallback(
    (report) => {
      const apartmentId = getApartmentIdFromReport(report);
      if (!apartmentId) return;

      const details = detailsById[report.id];
      const city = details?.apartment?.city || "";
      if (city) {
        navigate(`/alloggi/${city}/${apartmentId}`);
      } else {
        navigate(`/alloggi/${apartmentId}`);
      }
    },
    [detailsById, navigate],
  );

  const filteredReports = useMemo(() => {
    const searchTerm = toSearchableString(filters.search);

    return reports.filter((report) => {
      if (filters.hideClosed && CLOSED_STATUSES.has(report.status)) {
        return false;
      }

      if (filters.status !== "all" && report.status !== filters.status) {
        return false;
      }

      if (filters.severity !== "all" && report.severity !== filters.severity) {
        return false;
      }

      if (filters.reason !== "all" && report.reason !== filters.reason) {
        return false;
      }

      const targetType = report?.target?.type || "";
      if (filters.targetType !== "all" && targetType !== filters.targetType) {
        return false;
      }

      if (!searchTerm) return true;

      const searchValues = [
        report.id,
        report.reasonLabel,
        report.message,
        report.reporterId,
        report.target?.id,
        report.target?.apartmentId,
      ];
      return searchValues
        .filter(Boolean)
        .some((value) => toSearchableString(value).includes(searchTerm));
    });
  }, [filters, reports]);

  const counters = useMemo(() => {
    const total = reports.length;
    const openCount = reports.filter(
      (report) => !CLOSED_STATUSES.has(report.status),
    ).length;
    const highSeverityCount = reports.filter((report) =>
      ["high", "critical"].includes(report.severity),
    ).length;

    return {
      total,
      openCount,
      highSeverityCount,
    };
  }, [reports]);

  const handleExport = useCallback(() => {
    const payload = filteredReports.map((report) => ({
      id: report.id,
      status: report.status,
      severity: report.severity,
      priority: report.priority,
      reason: report.reason,
      reasonLabel: report.reasonLabel || getReportReasonLabel(report.reason),
      reporterId: report.reporterId,
      target: report.target || null,
      message: report.message || null,
      moderation: report.moderation || null,
      resolution: report.resolution || null,
      createdAt: report.createdAt || null,
      updatedAt: report.updatedAt || null,
    }));

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `segnalazioni-admin-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [filteredReports]);

  if (!reports.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <p className="text-gray-500 text-lg">Nessuna segnalazione presente</p>
        <p className="text-gray-400 text-sm mt-2">
          Non ci sono segnalazioni da gestire
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <span
            className={
              "px-3 py-1 rounded-full text-xs font-semibold" +
              getReportStatusMeta("open").tone
            }
          >
            Aperte: {counters.openCount}
          </span>
          <span
            className={
              "px-3 py-1 rounded-full text-xs font-semibold" +
              getReportSeverityMeta("critical").tone
            }
          >
            Alta/Critica: {counters.highSeverityCount}
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
            Totali: {counters.total}
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
            Aggiornato:{" "}
            {formatDate(updatedAt, "it-IT", {
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div className="flex gap-2">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="px-3 py-2 text-sm rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Aggiorna elenco
            </button>
          )}
          <button
            type="button"
            onClick={handleExport}
            className="px-3 py-2 text-sm rounded-lg bg-slate-900 text-white hover:bg-slate-800"
          >
            Esporta JSON
          </button>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Cerca per ID, utente, target o testo
            </label>
            <input
              value={filters.search}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, search: event.target.value }))
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Esempio: scam, apt_123, user_456"
            />
          </div>
          <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 px-3 py-2">
            <input
              id="hide-closed-reports"
              type="checkbox"
              checked={filters.hideClosed}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  hideClosed: event.target.checked,
                }))
              }
              className="h-4 w-4 text-emerald-600 rounded border-slate-300"
            />
            <label
              htmlFor="hide-closed-reports"
              className="text-sm text-slate-700"
            >
              Nascondi segnalazioni chiuse (risolte/respinte)
            </label>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <label className="text-xs font-semibold text-slate-600">
            Stato
            <select
              value={filters.status}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, status: event.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
            >
              <option value="all">Tutti</option>
              {REPORT_STATUS_VALUES.map((status) => (
                <option key={status} value={status}>
                  {getReportStatusMeta(status).label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-semibold text-slate-600">
            Gravità
            <select
              value={filters.severity}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  severity: event.target.value,
                }))
              }
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
            >
              <option value="all">Tutte</option>
              {REPORT_SEVERITY_VALUES.map((severity) => (
                <option key={severity} value={severity}>
                  {getReportSeverityMeta(severity).label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-semibold text-slate-600">
            Motivo
            <select
              value={filters.reason}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, reason: event.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
            >
              <option value="all">Tutti</option>
              {REPORT_REASON_OPTIONS.map((reason) => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-semibold text-slate-600">
            Target
            <select
              value={filters.targetType}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  targetType: event.target.value,
                }))
              }
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
            >
              {TARGET_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {!filteredReports.length && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-600 text-base">
            Nessuna segnalazione corrisponde ai filtri correnti.
          </p>
          <button
            type="button"
            onClick={() =>
              setFilters({
                search: "",
                status: "all",
                severity: "all",
                reason: "all",
                targetType: "all",
                hideClosed: true,
              })
            }
            className="mt-3 text-sm text-[#228E8D] underline"
          >
            Azzera filtri
          </button>
        </div>
      )}

      {!!filteredReports.length && (
        <div className="space-y-4">
          {filteredReports.map((report) => {
            const reportId = report.id;
            const details = detailsById[reportId];
            const isDetailsLoading = loadingDetailsById[reportId];
            const isActionLoading = actionLoadingById[reportId];
            const statusMeta = getReportStatusMeta(report.status);
            const severityMeta = getReportSeverityMeta(report.severity);
            const priorityMeta = getReportPriorityMeta(report.priority);
            const apartmentId = getApartmentIdFromReport(report);
            const hasApartmentTarget = Boolean(apartmentId);
            const moderationInfo = report.moderation || {};
            const resolutionInfo = report.resolution || {};
            const communicationInfo = report.communications || {};
            const reporterCommunication = communicationInfo.reporter || {};
            const targetCommunication = communicationInfo.target || {};
            const notificationDraft = reportNotifications[reportId] || {};
            const notifyReporter = notificationDraft.notifyReporter === true;
            const reporterMessage = notificationDraft.reporterMessage || "";
            const notifyTarget = notificationDraft.notifyTarget === true;
            const targetMessage = notificationDraft.targetMessage || "";

            return (
              <article
                key={reportId}
                className={
                  statusMeta.tone + " rounded-lg border  shadow-sm p-1 sm:p-2"
                }
              >
                <WhiteContainer className="rounded-lg space-y-4">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        Segnalazione #{reportId}
                      </h3>
                    </div>

                    <div className="text-sm text-slate-500">
                      {formatDate(report.createdAt, "it-IT", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <WhiteContainer className="rounded-full !p-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-2 py-1 rounded-full border text-xs font-semibold ${severityMeta.tone}`}
                      >
                        Gravità: {severityMeta.label}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full border text-xs font-semibold ${priorityMeta.tone}`}
                      >
                        Priorità: {priorityMeta.label}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full border text-xs font-semibold ${statusMeta.tone}`}
                      >
                        Stato: {statusMeta.label}
                      </span>
                    </div>
                  </WhiteContainer>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-700">
                    <div>
                      <span className="text-slate-500">Motivo:</span>{" "}
                      <span className="font-medium">
                        {report.reasonLabel ||
                          getReportReasonLabel(report.reason)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Target:</span>{" "}
                      <span className="font-medium">
                        {getTargetTypeLabel(report?.target?.type)}
                      </span>
                      {report?.target?.id && (
                        <span className="ml-1 font-mono text-xs text-slate-500">
                          ({report.target.id})
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-slate-500">Segnalato da:</span>{" "}
                      <span className="font-mono text-xs text-slate-700">
                        {report.reporterId || "N/D"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Ultimo update:</span>{" "}
                      <span>{formatDate(report.updatedAt, "it-IT")}</span>
                    </div>
                  </div>

                  {report.message && (
                    <GreenContainer className="rounded-md">
                      <p className="text-xs uppercase tracking-wide font-semibold text-cyan-800 mb-1">
                        Dettaglio segnalazione
                      </p>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">
                        {report.message}
                      </p>
                    </GreenContainer>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    <WhiteContainer className="space-y-2 rounded-md">
                      <p className="text-xs pb-2 uppercase tracking-wide font-semibold text-slate-600">
                        Azioni rapide
                      </p>
                      <div className="flex flex-col gap-2 sm:gap-4">
                        <button
                          type="button"
                          onClick={() =>
                            handleQuickAction(
                              report,
                              REPORT_QUICK_ACTIONS.START_REVIEW,
                            )
                          }
                          disabled={isActionLoading}
                          className={`px-3 py-1.5 sm:py-2 text-xs sm:text-normal font-semibold sm:font-bold rounded-full border disabled:opacity-60 ${getReportStatusMeta("reviewing").tone}`}
                        >
                          In revisione
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleQuickAction(
                              report,
                              REPORT_QUICK_ACTIONS.RESOLVE,
                            )
                          }
                          disabled={isActionLoading}
                          className={`px-3 py-1.5 sm:py-2 text-xs sm:text-normal font-semibold sm:font-bold rounded-full border ${getReportStatusMeta("resolved").tone}`}
                        >
                          Risolvi
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleQuickAction(
                              report,
                              REPORT_QUICK_ACTIONS.REJECT,
                            )
                          }
                          disabled={isActionLoading}
                          className={`px-3 py-1.5 sm:py-2 text-xs sm:text-normal font-semibold sm:font-bold rounded-full border ${getReportStatusMeta("rejected").tone}`}
                        >
                          Respingi
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleQuickAction(
                              report,
                              REPORT_QUICK_ACTIONS.REOPEN,
                            )
                          }
                          disabled={isActionLoading}
                          className={`px-3 py-1.5 sm:py-2 text-xs sm:text-normal font-semibold sm:font-bold rounded-full border ${getReportStatusMeta("open").tone}`}
                        >
                          Riapri
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleQuickAction(
                              report,
                              REPORT_QUICK_ACTIONS.ESCALATE,
                            )
                          }
                          disabled={isActionLoading}
                          className={`px-3 py-1.5 sm:py-2 text-xs sm:text-normal font-semibold sm:font-bold rounded-full border ${getReportPriorityMeta("high").tone}`}
                        >
                          Escala critica
                        </button>
                        {hasApartmentTarget && (
                          <button
                            type="button"
                            onClick={() =>
                              handleQuickAction(
                                report,
                                REPORT_QUICK_ACTIONS.REMOVE_APARTMENT,
                              )
                            }
                            disabled={isActionLoading}
                            className="px-3 py-1.5 sm:py-2 text-xs sm:text-normal font-semibold sm:font-bold rounded-full border border-red-200 text-red-700 dark:text-red-100 bg-red-50 dark:bg-red-600/60 hover:bg-red-100 disabled:opacity-60"
                          >
                            Rimuovi annuncio
                          </button>
                        )}
                      </div>
                    </WhiteContainer>

                    <WhiteContainer className="space-y-2 rounded-md lg:col-span-2">
                      <p className="text-xs uppercase tracking-wide font-semibold text-slate-600">
                        Nota moderazione
                      </p>
                      <TextAreaEditor
                        rows={1}
                        value={
                          Object.prototype.hasOwnProperty.call(
                            moderationNotes,
                            reportId,
                          )
                            ? moderationNotes[reportId]
                            : report?.moderation?.note || ""
                        }
                        onChange={(event) =>
                          setModerationNotes((prev) => ({
                            ...prev,
                            [reportId]: event.target.value,
                          }))
                        }
                        placeholder="Aggiungi una nota interna per il team moderazione..."
                        showPreview={false}
                        toggleExpandLabel="espandi"
                      />
                      <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Messaggi piattaforma (opzionale)
                        </p>
                        <p className="text-xs text-gray-700 opacity-80">
                          inserisci solo il corpo del messaggio in quanto il
                          template verr&agrave; aggiunto automaticamente.
                        </p>

                        <label className="flex items-center gap-2 text-xs text-slate-700">
                          <input
                            type="checkbox"
                            checked={notifyReporter}
                            onChange={(event) =>
                              setReportNotifications((prev) => ({
                                ...prev,
                                [reportId]: {
                                  ...(prev[reportId] || {}),
                                  notifyReporter: event.target.checked,
                                },
                              }))
                            }
                            className="h-4 w-4 text-emerald-600 rounded border-slate-300"
                          />
                          Invia esito al segnalatore
                        </label>
                        <TextAreaEditor
                          rows={2}
                          value={reporterMessage}
                          onChange={(event) =>
                            setReportNotifications((prev) => ({
                              ...prev,
                              [reportId]: {
                                ...(prev[reportId] || {}),
                                reporterMessage: event.target.value,
                              },
                            }))
                          }
                          disabled={!notifyReporter}
                          placeholder="Messaggio da inviare al segnalatore..."
                          showPreview={false}
                          toggleExpandLabel="espandi"
                        />

                        <label className="flex items-center gap-2 text-xs text-slate-700">
                          <input
                            type="checkbox"
                            checked={notifyTarget}
                            onChange={(event) =>
                              setReportNotifications((prev) => ({
                                ...prev,
                                [reportId]: {
                                  ...(prev[reportId] || {}),
                                  notifyTarget: event.target.checked,
                                },
                              }))
                            }
                            className="h-4 w-4 text-emerald-600 rounded border-slate-300"
                          />
                          Invia messaggio all'utente segnalato
                        </label>
                        <TextAreaEditor
                          rows={2}
                          value={targetMessage}
                          onChange={(event) =>
                            setReportNotifications((prev) => ({
                              ...prev,
                              [reportId]: {
                                ...(prev[reportId] || {}),
                                targetMessage: event.target.value,
                              },
                            }))
                          }
                          disabled={!notifyTarget}
                          placeholder="Messaggio da inviare all'utente segnalato..."
                          showPreview={false}
                          toggleExpandLabel="espandi"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleSaveModerationNote(reportId)}
                          disabled={isActionLoading}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                        >
                          Salva nota
                        </button>
                        <button
                          type="button"
                          onClick={() => loadReportDetails(reportId)}
                          disabled={isDetailsLoading || isActionLoading}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#228E8D] text-white hover:bg-[#1a6d6c] disabled:opacity-60"
                        >
                          {isDetailsLoading
                            ? "Caricamento..."
                            : "Carica dettagli"}
                        </button>
                        {hasApartmentTarget && (
                          <button
                            type="button"
                            onClick={() => handleViewApartment(report)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#228E8D] text-[#228E8D] hover:bg-[#D4F1EF]"
                          >
                            Apri annuncio
                          </button>
                        )}
                      </div>
                    </WhiteContainer>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <WhiteContainer className="space-y-2 rounded-md !bg-slate-50">
                      <p className="font-semibold text-slate-700 mb-1">
                        Moderazione
                      </p>
                      <p className="text-slate-600">
                        Azione: {moderationInfo.action || "N/D"}
                      </p>
                      <p className="text-slate-600">
                        Gestita da: {moderationInfo.handledBy || "N/D"}
                      </p>
                      <p className="text-slate-600">
                        Data: {formatDate(moderationInfo.handledAt, "it-IT")}
                      </p>
                      <p className="text-slate-600">
                        Nota: {moderationInfo.note || "Nessuna"}
                      </p>
                    </WhiteContainer>

                    <WhiteContainer className="space-y-2 rounded-md !bg-slate-50">
                      <p className="font-semibold text-slate-700 mb-1">Esito</p>
                      <p className="text-slate-600">
                        Codice: {resolutionInfo.code || "N/D"}
                      </p>
                      <p className="text-slate-600">
                        Data risoluzione:{" "}
                        {formatDate(resolutionInfo.resolvedAt, "it-IT")}
                      </p>
                      <p className="text-slate-600">
                        Nota: {resolutionInfo.note || "Nessuna"}
                      </p>
                    </WhiteContainer>

                    <WhiteContainer className="space-y-2 rounded-md !bg-slate-50">
                      <p className="font-semibold text-slate-700 mb-1">
                        Comunicazioni
                      </p>
                      <p className="text-slate-600">
                        Segnalatore:{" "}
                        {reporterCommunication.requested
                          ? reporterCommunication.sent
                            ? "Inviata"
                            : "Non inviata"
                          : "Nessuna"}
                      </p>
                      <p className="text-slate-600">
                        Utente segnalato:{" "}
                        {targetCommunication.requested
                          ? targetCommunication.sent
                            ? "Inviata"
                            : "Non inviata"
                          : "Nessuna"}
                      </p>
                      <p className="text-slate-600">
                        Ultimo invio:{" "}
                        {formatDate(communicationInfo.updatedAt, "it-IT")}
                      </p>
                    </WhiteContainer>
                  </div>

                  {details && (
                    <WhiteContainer className="space-y-3 rounded-md">
                      <p className="text-xs uppercase tracking-wide font-semibold text-slate-600">
                        Contesto backend
                      </p>

                      {details.apartment && (
                        <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
                          <p className="font-semibold text-slate-900 dark:text-gray-300 mb-1">
                            Annuncio collegato
                          </p>
                          <p>
                            <span className="text-slate-500">Titolo:</span>{" "}
                            {details.apartment.title || "N/D"}
                          </p>
                          <p>
                            <span className="text-slate-500">Stato:</span>{" "}
                            {details.apartment.status || "N/D"}
                          </p>
                          <p>
                            <span className="text-slate-500">Città:</span>{" "}
                            {details.apartment.city || "N/D"}
                          </p>
                          <p>
                            <span className="text-slate-500">Owner:</span>{" "}
                            <span className="font-mono text-xs">
                              {details.apartment.ownerId || "N/D"}
                            </span>
                          </p>
                          {typeof details.apartment.totalReports ===
                            "number" && (
                            <p>
                              <span className="text-slate-500">
                                Totale report:
                              </span>{" "}
                              {details.apartment.totalReports}
                            </p>
                          )}
                          {details.apartment.id && hasApartmentTarget && (
                            <p>
                              <span className="text-slate-500">Prezzo:</span>{" "}
                              {getPriceRangeLabel(details.apartment.aggregates)
                                ? `${getPriceRangeLabel(
                                    details.apartment.aggregates,
                                  )}/mese`
                                : "N/D"}
                            </p>
                          )}
                        </div>
                      )}

                      {details.reporter && (
                        <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
                          <p className="font-semibold text-slate-900 dark:text-gray-300 mb-1">
                            Utente segnalatore
                          </p>
                          <p>
                            <span className="text-slate-500">Nome:</span>{" "}
                            {details.reporter.displayName || "N/D"}
                          </p>
                          <p>
                            <span className="text-slate-500">Email:</span>{" "}
                            {details.reporter.email || "N/D"}
                          </p>
                          <p>
                            <span className="text-slate-500">
                              Report storici:
                            </span>{" "}
                            {details.reporter.publicStats?.reportsCount ??
                              "N/D"}
                          </p>
                        </div>
                      )}

                      {details.targetUser && (
                        <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
                          <p className="font-semibold text-slate-900 dark:text-gray-300 mb-1">
                            Utente segnalato
                          </p>
                          <p>
                            <span className="text-slate-500">Nome:</span>{" "}
                            {details.targetUser.displayName || "N/D"}
                          </p>
                          <p>
                            <span className="text-slate-500">Email:</span>{" "}
                            {details.targetUser.email || "N/D"}
                          </p>
                          <p>
                            <span className="text-slate-500">
                              Host verificato:
                            </span>{" "}
                            {details.targetUser.isVerifiedHost ? "Sì" : "No"}
                          </p>
                        </div>
                      )}
                    </WhiteContainer>
                  )}
                </WhiteContainer>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
