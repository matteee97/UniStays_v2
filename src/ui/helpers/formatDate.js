const DEFAULT_DATE_FORMAT_OPTIONS = {
  year: "numeric",
  month: "long",
  day: "numeric",
};

const hasTimeOptions = (options) => {
  if (!options) return false;
  return ["hour", "minute", "second", "hour12", "timeZoneName"].some((key) =>
    Object.prototype.hasOwnProperty.call(options, key)
  );
};

/**
 * Formatta una data Firestore in formato italiano
 * @param {Object} firestoreTimestamp - Timestamp di Firestore
 * @param {string} locale - Locale per la formattazione (default: it-IT)
 * @param {Intl.DateTimeFormatOptions} options - Opzioni per formattazione data/ora
 * @returns {string} Data formattata
 */
export const formatDate = (
  firestoreTimestamp,
  locale = "it-IT",
  options = DEFAULT_DATE_FORMAT_OPTIONS
) => {
  if (!firestoreTimestamp) return "Data non disponibile";

  try {
    const date = firestoreTimestamp?.toDate
      ? firestoreTimestamp.toDate()
      : firestoreTimestamp instanceof Date
      ? firestoreTimestamp
      : new Date(firestoreTimestamp);
    if (Number.isNaN(date.getTime())) {
      return "Data non disponibile";
    }
    const resolvedLocale =
      typeof locale === "string" && locale.trim() ? locale : "it-IT";
    const formatOptions = options || DEFAULT_DATE_FORMAT_OPTIONS;
    if (hasTimeOptions(formatOptions)) {
      return date.toLocaleString(resolvedLocale, formatOptions);
    }
    return date.toLocaleDateString(resolvedLocale, formatOptions);
  } catch (error) {
    console.error("Errore nella formattazione della data:", error);
    return "Data non disponibile";
  }
};
