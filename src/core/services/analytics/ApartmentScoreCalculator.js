const DEFAULT_SCORE_WEIGHTS = {
  views: 0.6,
  likes: 2.4,
  reviews: 3.2,
  rating: 6.0,
  reports: 8.0,
  featuredBoost: 12.0,
  publishedBoost: 2.0,
  unpublishedPenalty: 12.0,
};

const clamp = (value, min = 0, max = Number.POSITIVE_INFINITY) => {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
};

const toNumber = (value) =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

const log1pSafe = (value) => Math.log1p(Math.max(0, toNumber(value)));

const normalizeRatings = (metrics = {}) => {
  const ratingCount = toNumber(metrics.ratingCount ?? metrics.reviewsCount);
  const avgRating = toNumber(metrics.avgRating ?? metrics.ratingAvg);
  const ratingSum = Number.isFinite(metrics.ratingSum)
    ? metrics.ratingSum
    : avgRating * ratingCount;

  return {
    ratingCount: Math.max(0, ratingCount),
    ratingSum: Math.max(0, ratingSum),
  };
};

export const normalizeApartmentMetrics = (metrics = {}) => {
  const likesCount = toNumber(metrics.likesCount ?? metrics.totalFavorites);
  const reviewsCount = toNumber(metrics.reviewsCount ?? metrics.ratingCount);
  const rating = normalizeRatings(metrics);

  return {
    totalViews: toNumber(metrics.totalViews),
    likesCount: Math.max(0, likesCount),
    reviewsCount: Math.max(0, reviewsCount),
    ratingCount: rating.ratingCount,
    ratingSum: rating.ratingSum,
    totalReports: toNumber(metrics.totalReports),
    score: Number.isFinite(metrics.score) ? metrics.score : null,
  };
};

const ratingQuality = (ratingSum, ratingCount) => {
  if (ratingCount <= 0) return 0;
  const avg = clamp(ratingSum / ratingCount, 0, 5);
  return (avg / 5) * log1pSafe(ratingCount);
};

const baseScore = (meta = {}, weights = DEFAULT_SCORE_WEIGHTS) => {
  const featured = meta.isFeatured ? weights.featuredBoost : 0;
  const published = meta.isPublished
    ? weights.publishedBoost
    : -weights.unpublishedPenalty;
  return featured + published;
};

export const calculateApartmentScore = ({
  metrics = {},
  meta = {},
  weights = {},
} = {}) => {
  const resolvedWeights = { ...DEFAULT_SCORE_WEIGHTS, ...weights };
  const normalized = normalizeApartmentMetrics(metrics);
  const ratingScore = ratingQuality(
    normalized.ratingSum,
    normalized.ratingCount
  );

  const score =
    baseScore(meta, resolvedWeights) +
    resolvedWeights.views * log1pSafe(normalized.totalViews) +
    resolvedWeights.likes * log1pSafe(normalized.likesCount) +
    resolvedWeights.reviews * log1pSafe(normalized.reviewsCount) +
    resolvedWeights.rating * ratingScore -
    resolvedWeights.reports * normalized.totalReports;

  return clamp(score);
};

export const calculateNextScore = ({
  prevMetrics = {},
  nextMetrics = {},
  prevScore = null,
  meta = {},
  weights = {},
} = {}) => {
  const resolvedWeights = { ...DEFAULT_SCORE_WEIGHTS, ...weights };
  const prev = normalizeApartmentMetrics(prevMetrics);
  const next = normalizeApartmentMetrics(nextMetrics);

  if (!Number.isFinite(prevScore)) {
    return calculateApartmentScore({
      metrics: next,
      meta,
      weights: resolvedWeights,
    });
  }

  const ratingDelta =
    ratingQuality(next.ratingSum, next.ratingCount) -
    ratingQuality(prev.ratingSum, prev.ratingCount);

  const delta =
    resolvedWeights.views *
      (log1pSafe(next.totalViews) - log1pSafe(prev.totalViews)) +
    resolvedWeights.likes *
      (log1pSafe(next.likesCount) - log1pSafe(prev.likesCount)) +
    resolvedWeights.reviews *
      (log1pSafe(next.reviewsCount) - log1pSafe(prev.reviewsCount)) +
    resolvedWeights.rating * ratingDelta -
    resolvedWeights.reports * (next.totalReports - prev.totalReports);

  return clamp(prevScore + delta);
};
