const ROME_TIME_ZONE = "Europe/Rome";
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const toNumber = (value) =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

const getDateKeyFromParts = (parts) =>
  `${parts.year}-${parts.month}-${parts.day}`;

const getDateParts = (date) => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: ROME_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const map = {};
  parts.forEach((part) => {
    if (part.type !== "literal") {
      map[part.type] = part.value;
    }
  });

  return map;
};

export const getRomeDateKey = (date = new Date()) =>
  getDateKeyFromParts(getDateParts(date));

export const clampRangeDays = (rangeDays, { min = 1, max = 30 } = {}) => {
  if (!Number.isFinite(rangeDays)) return max;
  return Math.max(min, Math.min(max, Math.floor(rangeDays)));
};

const parseDateKey = (dateKey) => {
  if (!dateKey) return null;
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
};

const formatDateKeyUTC = (date) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatRomeDateKeyLabel = (
  dateKey,
  options = { day: "2-digit", month: "short" }
) => {
  const parsed = parseDateKey(dateKey);
  if (!parsed) return "";
  return new Intl.DateTimeFormat("it-IT", {
    timeZone: ROME_TIME_ZONE,
    ...options,
  }).format(parsed);
};

export const buildDateKeysRange = (rangeDays, endDate = new Date()) => {
  const clampedRange = clampRangeDays(rangeDays, { min: 1, max: 30 });
  const endDateKey =
    typeof endDate === "string" ? endDate : getRomeDateKey(endDate);
  const endDateUtc = parseDateKey(endDateKey);
  if (!endDateUtc) return [];

  const startDateUtc = new Date(
    endDateUtc.getTime() - (clampedRange - 1) * MS_PER_DAY
  );

  const keys = [];
  for (let i = 0; i < clampedRange; i += 1) {
    const current = new Date(startDateUtc.getTime() + i * MS_PER_DAY);
    keys.push(formatDateKeyUTC(current));
  }

  return keys;
};

export const normalizeDailyDocs = (rawDailyDocs = []) => {
  const normalized = {};

  rawDailyDocs.forEach((doc) => {
    const dateKey = doc?.date || doc?.id;
    if (!dateKey) return;

    normalized[dateKey] = {
      date: dateKey,
      views: toNumber(doc.views),
      likesDelta: toNumber(doc.likesDelta),
      reviewsAdded: toNumber(doc.reviewsAdded),
      ratingSumDelta: toNumber(doc.ratingSumDelta),
      lastEventAt: doc.lastEventAt || null,
      updatedAt: doc.updatedAt || null,
    };
  });

  return normalized;
};

export const buildSeries = (mode, dateKeys = [], normalizedMap = {}) => {
  const metricKey =
    mode === "likes"
      ? "likesDelta"
      : mode === "reviews"
      ? "reviewsAdded"
      : "views";

  return dateKeys.map((dateKey) => ({
    dateKey,
    value: toNumber(normalizedMap[dateKey]?.[metricKey]),
  }));
};

export const computeKpis = (mode, series = [], summary = null, dailyMap = {}) => {
  const total = series.reduce((sum, entry) => sum + toNumber(entry.value), 0);
  const avgPerDay = series.length ? total / series.length : 0;

  const summarySource = summary || {};
  const lastEventAt =
    mode === "views"
      ? summarySource.lastViewAt
      : mode === "likes"
      ? summarySource.lastLikeAt
      : mode === "reviews"
      ? summarySource.lastReviewAt
      : summarySource.lastEventAt;

  let avgRating = null;
  if (mode === "reviews") {
    let ratingSum = 0;
    let reviewsCount = 0;

    series.forEach(({ dateKey }) => {
      const entry = dailyMap[dateKey];
      if (!entry) return;
      ratingSum += toNumber(entry.ratingSumDelta);
      reviewsCount += toNumber(entry.reviewsAdded);
    });

    if (reviewsCount > 0) {
      avgRating = ratingSum / reviewsCount;
    }
  }

  return {
    total,
    avgPerDay,
    lastEventAt: lastEventAt || summarySource.lastEventAt || null,
    avgRating,
  };
};

export const validateConsistency = (series = [], kpis = {}) => {
  const warnings = [];
  const totalFromSeries = series.reduce(
    (sum, entry) => sum + toNumber(entry.value),
    0
  );

  if (Math.abs(totalFromSeries - toNumber(kpis.total)) > 0.01) {
    warnings.push("Total mismatch between series and KPI totals.");
  }

  if (!series.length) {
    warnings.push("Serie vuota per il range selezionato.");
  }

  return warnings;
};
