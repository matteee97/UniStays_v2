/**
 * @typedef {import("@/core/ports/ApartmentRepository").ApartmentRepository} ApartmentRepository
 * @typedef {import("@/core/ports/ReportRepository").ReportRepository} ReportRepository
 */

/**
 * @typedef {Object} SubmitApartmentReportParams
 * @property {ApartmentRepository} apartmentRepository
 * @property {ReportRepository} reportRepository
 * @property {string} apartmentId
 * @property {string} reporterId
 * @property {Object} reporterSnapshot
 * @property {string} reason
 * @property {string} message
 * @property {string} [priority]
 */

export async function submitApartmentReport({
  apartmentRepository,
  reportRepository,
  apartmentId,
  reporterId,
  reporterSnapshot,
  reason,
  message,
  priority = "medium",
}) {
  if (!apartmentRepository || !reportRepository) {
    throw new Error("Repository mancanti.");
  }
  if (!apartmentId || !reporterId) {
    throw new Error("Dati segnalazione non validi.");
  }

  if (typeof reportRepository.createApartmentReport === "function") {
    await reportRepository.createApartmentReport({
      apartmentId,
      reporterId,
      reporterSnapshot,
      reason,
      message,
      priority,
    });
    return;
  }

  await reportRepository.createReport({
    target: {
      type: "apartment",
      id: apartmentId,
      apartmentId,
    },
    reporterId,
    reporterSnapshot,
    reason,
    message,
    status: "open",
    priority,
  });

  if (typeof apartmentRepository.incrementReportCount === "function") {
    await apartmentRepository.incrementReportCount(apartmentId, 1);
  }
}
