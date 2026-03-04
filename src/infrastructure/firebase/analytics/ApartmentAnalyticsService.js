import { callBackendApi } from "@/infrastructure/api/firebaseApiClient";

/**
 * @typedef {Object} TrackViewEvent
 * @property {"view"} kind
 * @property {string} apartmentId
 * @property {string} [dateKey]
 */

/**
 * @typedef {Object} TrackLikeEvent
 * @property {"like"} kind
 * @property {string} apartmentId
 * @property {1 | -1} delta
 * @property {string} [dateKey]
 */

/**
 * @typedef {Object} TrackReviewEvent
 * @property {"review"} kind
 * @property {string} apartmentId
 * @property {number} added
 * @property {number} [rating]
 * @property {string} [dateKey]
 */

/**
 * @typedef {TrackViewEvent | TrackLikeEvent | TrackReviewEvent} ApartmentAnalyticsEvent
 */

const getDateKey = (date = new Date()) => date.toISOString().split("T")[0];

/** @type {{ view: boolean, like: boolean, review: boolean }} */
const REQUIRES_AUTH = {
  view: false,
  like: true,
  review: true,
};

/**
 * @typedef {Object} ApartmentAnalyticsServiceShape
 * @property {(event: ApartmentAnalyticsEvent) => Promise<void>} track
 * @property {(event: TrackViewEvent) => Promise<void>} trackView
 * @property {(event: TrackLikeEvent) => Promise<void>} trackLike
 * @property {(event: TrackReviewEvent) => Promise<void>} trackReview
 */

/** @type {ApartmentAnalyticsServiceShape} */
export const ApartmentAnalyticsService = {
  async track(event) {
    if (!event || !event.kind || !event.apartmentId) {
      throw new Error("Evento analytics non valido.");
    }

    const kind = event.kind;
    if (!["view", "like", "review"].includes(kind)) {
      throw new Error(`Evento analytics non supportato: ${kind}`);
    }

    await callBackendApi("/v1/analytics/events", {
      method: "POST",
      requireAuth: REQUIRES_AUTH[kind],
      body: {
        ...event,
        dateKey: event.dateKey || getDateKey(),
      },
    });
  },

  trackView(event) {
    return ApartmentAnalyticsService.track(event);
  },

  trackLike(event) {
    return ApartmentAnalyticsService.track(event);
  },

  trackReview(event) {
    return ApartmentAnalyticsService.track(event);
  },
};

export const trackViewEvent = (apartmentId, dateKey) =>
  ApartmentAnalyticsService.track({ kind: "view", apartmentId, dateKey });

export const trackLikeEvent = (apartmentId, delta, dateKey) =>
  ApartmentAnalyticsService.track({ kind: "like", apartmentId, delta, dateKey });

export const trackReviewAdded = (apartmentId, rating, dateKey) =>
  ApartmentAnalyticsService.track({
    kind: "review",
    apartmentId,
    added: 1,
    rating,
    dateKey,
  });

export { getDateKey };
