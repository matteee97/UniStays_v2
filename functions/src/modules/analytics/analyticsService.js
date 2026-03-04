"use strict";

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

const clamp = (value, min = 0, max = Infinity) =>
    Math.min(Math.max(value, min), max);

const log1pSafe = (value) => Math.log1p(Math.max(0, Number(value) || 0));

const normalizeApartmentMetrics = (metrics = {}) => {
  const likesCount = Number(metrics.likesCount ?? metrics.totalFavorites ?? 0) || 0;
  const reviewsCount = Number(metrics.reviewsCount ?? metrics.ratingCount ?? 0) || 0;
  const ratingCount = Number(metrics.ratingCount ?? reviewsCount) || 0;
  const ratingAvg = Number(metrics.ratingAvg ?? metrics.avgRating ?? 0) || 0;
  const ratingSumRaw = Number(metrics.ratingSum);
  const ratingSum = Number.isFinite(ratingSumRaw)
    ? ratingSumRaw
    : ratingAvg * ratingCount;

  return {
    totalViews: Math.max(0, Number(metrics.totalViews) || 0),
    likesCount: Math.max(0, likesCount),
    reviewsCount: Math.max(0, reviewsCount),
    ratingCount: Math.max(0, ratingCount),
    ratingSum: Math.max(0, ratingSum),
    totalReports: Math.max(0, Number(metrics.totalReports) || 0),
    score: Number.isFinite(metrics.score) ? metrics.score : null,
    updatedAt: metrics.updatedAt || null,
  };
};

const ratingQuality = (ratingSum, ratingCount) => {
  if (ratingCount <= 0) return 0;
  const avg = clamp(ratingSum / ratingCount, 0, 5);
  return (avg / 5) * log1pSafe(ratingCount);
};

const calculateApartmentScore = ({ metrics = {}, meta = {}, weights = {} } = {}) => {
  const resolvedWeights = { ...DEFAULT_SCORE_WEIGHTS, ...weights };
  const normalized = normalizeApartmentMetrics(metrics);
  const ratingScore = ratingQuality(normalized.ratingSum, normalized.ratingCount);

  const featured = meta.isFeatured ? resolvedWeights.featuredBoost : 0;
  const published = meta.isPublished
    ? resolvedWeights.publishedBoost
    : -resolvedWeights.unpublishedPenalty;

  const score =
    featured +
    published +
    resolvedWeights.views * log1pSafe(normalized.totalViews) +
    resolvedWeights.likes * log1pSafe(normalized.likesCount) +
    resolvedWeights.reviews * log1pSafe(normalized.reviewsCount) +
    resolvedWeights.rating * ratingScore -
    resolvedWeights.reports * normalized.totalReports;

  return clamp(score);
};

const calculateNextScore = ({
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
    return calculateApartmentScore({ metrics: next, meta, weights: resolvedWeights });
  }

  const ratingDelta =
    ratingQuality(next.ratingSum, next.ratingCount) -
    ratingQuality(prev.ratingSum, prev.ratingCount);

  const delta =
    resolvedWeights.views * (log1pSafe(next.totalViews) - log1pSafe(prev.totalViews)) +
    resolvedWeights.likes * (log1pSafe(next.likesCount) - log1pSafe(prev.likesCount)) +
    resolvedWeights.reviews * (log1pSafe(next.reviewsCount) - log1pSafe(prev.reviewsCount)) +
    resolvedWeights.rating * ratingDelta -
    resolvedWeights.reports * (next.totalReports - prev.totalReports);

  return clamp(prevScore + delta);
};

const createAnalyticsService = ({
  FieldValue,
  APARTMENT_STATUS,
  ApiError,
  clamp,
  getAnalyticsSummaryRef,
  getAnalyticsDailyRef,
  getDateKey,
} = {}) => {
  if (
    !FieldValue ||
    !APARTMENT_STATUS ||
    !ApiError ||
    typeof clamp !== "function"
  ) {
    throw new Error("Missing analytics service dependencies.");
  }

  const applyAnalyticsInTransaction = ({ tx, apartmentSnap, apartmentRef, event }) => {
    const apartmentId = apartmentRef.id;
    const apartmentData = apartmentSnap.data() || {};
    const prevMetrics = normalizeApartmentMetrics(apartmentData.metrics || {});

    const dateKey = event.dateKey || getDateKey();
    const summaryRef = getAnalyticsSummaryRef(apartmentId);
    const dailyRef = getAnalyticsDailyRef(apartmentId, dateKey);

    const scoreMeta = {
      isFeatured: Boolean(apartmentData.isFeatured),
      isPublished: apartmentData.status === APARTMENT_STATUS.PUBLISHED,
    };

    if (event.kind === "view") {
      const nextMetrics = {
        ...prevMetrics,
        totalViews: prevMetrics.totalViews + 1,
      };
      const score = calculateNextScore({
        prevMetrics,
        nextMetrics,
        prevScore: prevMetrics.score,
        meta: scoreMeta,
      });

      tx.update(apartmentRef, {
        metrics: {
          ...(apartmentData.metrics || {}),
          totalViews: nextMetrics.totalViews,
          score,
          updatedAt: FieldValue.serverTimestamp(),
        },
      });

      tx.set(
        dailyRef,
        {
          date: dateKey,
          views: FieldValue.increment(1),
          updatedAt: FieldValue.serverTimestamp(),
          lastEventAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      tx.set(
        summaryRef,
        {
          updatedAt: FieldValue.serverTimestamp(),
          lastEventAt: FieldValue.serverTimestamp(),
          lastViewAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      return;
    }

    if (event.kind === "like") {
      const delta = event.delta;
      if (delta !== 1 && delta !== -1) {
        throw new ApiError(400, "Delta like non valido.");
      }

      const nextLikesCount = clamp(prevMetrics.likesCount + delta, 0);
      const nextMetrics = {
        ...prevMetrics,
        likesCount: nextLikesCount,
      };
      const score = calculateNextScore({
        prevMetrics,
        nextMetrics,
        prevScore: prevMetrics.score,
        meta: scoreMeta,
      });

      tx.update(apartmentRef, {
        metrics: {
          ...(apartmentData.metrics || {}),
          likesCount: nextLikesCount,
          updatedAt: FieldValue.serverTimestamp(),
          score,
        },
      });

      tx.set(
        dailyRef,
        {
          date: dateKey,
          likesDelta: FieldValue.increment(delta),
          updatedAt: FieldValue.serverTimestamp(),
          lastEventAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      tx.set(
        summaryRef,
        {
          updatedAt: FieldValue.serverTimestamp(),
          lastEventAt: FieldValue.serverTimestamp(),
          lastLikeAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      return;
    }

    if (event.kind === "review") {
      const added = Number(event.added) || 0;
      if (!added) {
        return;
      }

      const ratingValue = Number.isFinite(event.rating) ? Number(event.rating) : null;
      const nextReviewsCount = clamp(prevMetrics.reviewsCount + added, 0);

      let nextRatingSum = prevMetrics.ratingSum;
      let nextRatingCount = prevMetrics.ratingCount;

      if (ratingValue !== null) {
        nextRatingSum = clamp(prevMetrics.ratingSum + ratingValue * added, 0);
        nextRatingCount = clamp(prevMetrics.ratingCount + added, 0);
      }

      const nextMetrics = {
        ...prevMetrics,
        reviewsCount: nextReviewsCount,
        ratingSum: nextRatingSum,
        ratingCount: nextRatingCount,
      };

      const nextAvgRating = nextRatingCount > 0 ? nextRatingSum / nextRatingCount : 0;
      const score = calculateNextScore({
        prevMetrics,
        nextMetrics,
        prevScore: prevMetrics.score,
        meta: scoreMeta,
      });

      const updatedMetrics = {
        ...(apartmentData.metrics || {}),
        reviewsCount: nextReviewsCount,
        updatedAt: FieldValue.serverTimestamp(),
        score,
      };

      if (ratingValue !== null) {
        updatedMetrics.ratingSum = nextRatingSum;
        updatedMetrics.ratingCount = nextRatingCount;
        updatedMetrics.ratingAvg = Number(nextAvgRating.toFixed(2));
      }

      tx.update(apartmentRef, { metrics: updatedMetrics });

      const dailyUpdate = {
        date: dateKey,
        reviewsAdded: FieldValue.increment(added),
        updatedAt: FieldValue.serverTimestamp(),
        lastEventAt: FieldValue.serverTimestamp(),
      };

      if (ratingValue !== null) {
        dailyUpdate.ratingSumDelta = FieldValue.increment(ratingValue * added);
      }

      tx.set(dailyRef, dailyUpdate, { merge: true });

      tx.set(
        summaryRef,
        {
          updatedAt: FieldValue.serverTimestamp(),
          lastEventAt: FieldValue.serverTimestamp(),
          lastReviewAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      return;
    }

    throw new ApiError(400, `Evento analytics non supportato: ${event.kind}`);
  };

  return {
    applyAnalyticsInTransaction,
    normalizeApartmentMetrics,
    calculateApartmentScore,
    calculateNextScore,
  };
};

module.exports = {
  createAnalyticsService,
};
