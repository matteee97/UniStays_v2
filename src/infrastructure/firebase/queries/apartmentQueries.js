import { orderBy, where } from "firebase/firestore";
import { APARTMENT_STATUS } from "@/shared/types";

/**
 * Build the base public listing query:
 * - city equality
 * - published status
 * - score desc ordering
 *
 * @param {string} cityName
 * @returns {Array<import("firebase/firestore").QueryConstraint>}
 */
export const buildPublishedCityApartmentsQuery = (cityName) => {
  if (!cityName) {
   throw new Error("City name is required");
}

  const filters = [
    where("address.city", "==", cityName),
    where("status", "==", APARTMENT_STATUS.PUBLISHED),
  ];

  // Intentionally do not constrain by aggregates.isAvailableNow here.
  // "Disponibile subito" is evaluated client-side because listings can be
  // effectively available when availableFromMin is in the past, even if the
  // aggregate boolean was not refreshed yet.

  filters.push(orderBy("metrics.score", "desc"));
  return filters;
};

/**
 * Build the base query for an owner's published apartments listings.
 * - owner equality
 * - published status
 * - score desc ordering
 *
 * @param {string} ownerId
 * @returns {Array<import("firebase/firestore").QueryConstraint>}
 */
export const buildHostPageApartmentsQuery = (ownerId) => {
  if (!ownerId) return [];
  return [
    where("ownerId", "==", ownerId),
    where("status", "==", APARTMENT_STATUS.PUBLISHED),
    orderBy("metrics.score", "desc"),
  ];
};

/**
 * Build the base query for an owner's apartment listings.
 * - owner equality
 * - createdAt desc ordering
 *
 * @param {string} ownerId
 * @returns {Array<import("firebase/firestore").QueryConstraint>}
 */
export const buildHostApartmentsQuery = (ownerId) => {
  if (!ownerId) return [];
  return [
    where("ownerId", "==", ownerId),
    orderBy("createdAt", "desc"),
  ];
};

/**
 * Build the base query for featured apartments listings.
 * - published status
 * - score desc ordering
 * @returns {Array<import("firebase/firestore").QueryConstraint>}
 */
export const buildFeaturedApartmentsQuery = () => [
  where("status", "==", APARTMENT_STATUS.PUBLISHED),
  orderBy("metrics.score", "desc"),
];

/**
 * Build Firestore constraints for public apartment search.
 * Advanced filters are intentionally evaluated client-side.
 *
 * @param {object} params
 * @param {string} params.cityName
 * @returns {Array<import("firebase/firestore").QueryConstraint>}
 */
export const buildApartmentsFiltersQuery = ({ cityName }) =>
  buildPublishedCityApartmentsQuery(cityName);
