import {
  calculateApartmentScore,
  normalizeApartmentMetrics,
} from "./ApartmentScoreCalculator";
import { APARTMENT_STATUS } from "@/shared/types";

const toNumber = (value) =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

const getApartmentCity = (apartment) => {
  const city =
    apartment?.address?.city || apartment?.address?.area || apartment?.city;
  if (typeof city !== "string") return "";
  return city.trim();
};

const stableSortByMetric = (items, getValue, direction = "desc") => {
  const multiplier = direction === "asc" ? 1 : -1;
  return items
    .map((item, index) => ({
      item,
      index,
      value: toNumber(getValue(item)),
    }))
    .sort((a, b) => {
      const delta = (a.value - b.value) * multiplier;
      if (delta !== 0) return delta;
      return a.index - b.index;
    })
    .map(({ item }) => item);
};

const resolveScore = (apartment, normalizedMetrics) => {
  if (Number.isFinite(normalizedMetrics.score)) {
    return normalizedMetrics.score;
  }

  return calculateApartmentScore({
    metrics: apartment?.metrics,
    meta: {
      isFeatured: apartment?.isFeatured,
      isPublished: apartment?.status === APARTMENT_STATUS.PUBLISHED,
    },
  });
};

export const normalizeApartmentForOverview = (apartment) => {
  const normalizedMetrics = normalizeApartmentMetrics(apartment?.metrics);
  const score = resolveScore(apartment, normalizedMetrics);

  return {
    ...apartment,
    totalViews: toNumber(normalizedMetrics.totalViews),
    likesCount: toNumber(normalizedMetrics.likesCount),
    reviewsCount: toNumber(normalizedMetrics.reviewsCount),
    score: toNumber(score),
    city: getApartmentCity(apartment),
  };
};

export const buildCityStats = (apartments = []) => {
  const bucket = new Map();

  apartments.forEach((apartment) => {
    const city = apartment?.city || getApartmentCity(apartment);
    if (!city) return;
    const key = city.toLowerCase();
    if (!bucket.has(key)) {
      bucket.set(key, { city, count: 0 });
    }
    const entry = bucket.get(key);
    entry.count += 1;
  });

  return stableSortByMetric(Array.from(bucket.values()), (entry) => entry.count);
};

export const buildTopApartments = (
  apartments = [],
  { metricKey = "totalViews", limit = 10 } = {}
) => {
  const metricResolver = (apartment) => toNumber(apartment?.[metricKey]);

  const sorted = stableSortByMetric(apartments, metricResolver);
  return Number.isFinite(limit) ? sorted.slice(0, limit) : sorted;
};

export const buildAnalyticsOverview = (
  apartments = [],
  { rankingMetric = "totalViews", limit = 10 } = {}
) => {
  const normalizedApartments = Array.isArray(apartments)
    ? apartments.map(normalizeApartmentForOverview)
    : [];

  const totals = normalizedApartments.reduce(
    (acc, apartment) => {
      acc.totalViews += toNumber(apartment?.totalViews);
      acc.likesCount += toNumber(apartment?.likesCount);
      acc.reviewsCount += toNumber(apartment?.reviewsCount);
      acc.scoreTotal += toNumber(apartment?.score);
      return acc;
    },
    {
      totalViews: 0,
      likesCount: 0,
      reviewsCount: 0,
      scoreTotal: 0,
    }
  );

  const apartmentsCount = normalizedApartments.length;
  const scoreAvg = apartmentsCount > 0 ? totals.scoreTotal / apartmentsCount : 0;

  const cityStats = buildCityStats(normalizedApartments);
  const topApartments = buildTopApartments(normalizedApartments, {
    metricKey: rankingMetric,
    limit,
  });

  return {
    totals: {
      ...totals,
      scoreAvg,
    },
    cityStats,
    topApartments,
    topApartment: topApartments[0] || null,
    viewTrend: [],
    normalizedApartments,
  };
};
