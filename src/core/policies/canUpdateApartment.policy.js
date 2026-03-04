function normalizeToDate(value) {
  if (!value) throw new Error("Missing date");
  if (typeof value.toDate === "function") return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === "number" || typeof value === "string") return new Date(value);
  throw new Error("Invalid date format");
}


/**
 * Minimum number of days required between apartment updates.
 * @type {number}
 */
export const MIN_DAYS_BETWEEN_UPDATES = 0; // : TODO : Change to 30 when ready



/**
 * Calculate the number of days between now and the last update of an apartment.
 * @param {Object} params - An object containing the createdAt and updatedAt timestamps of the apartment.
 * @param {Date} [params.now] - The current date. Defaults to the current date if not provided.
 * @returns {number} The number of days since the last update.
 */

export function getApartmentUpdateDiffDays({ createdAt, updatedAt, now = new Date() }) {
  const referenceDate = normalizeToDate(updatedAt ?? createdAt);
  const diffTime = now.getTime() - referenceDate.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if an apartment can be updated based on the minimum number of days
 * that have to pass since the last update.
 * @param {Object} params - An object containing the createdAt and updatedAt timestamps of the apartment.
 * @returns {boolean} Whether the apartment can be updated or not.
 */
export function canUpdateApartment(params) {
  return getApartmentUpdateDiffDays(params) >= MIN_DAYS_BETWEEN_UPDATES;
}


/**
 * Calculate the number of days left until the apartment can be updated again.
 * The value will be 0 if the apartment can be updated immediately.
 * @param {Object} params - An object containing the createdAt and updatedAt timestamps of the apartment.
 * @returns {number} The number of days left until the apartment can be updated again.
 */
export function getRemainingDaysToUpdate(params) {
  const diffDays = getApartmentUpdateDiffDays(params);
  return Math.max(0, MIN_DAYS_BETWEEN_UPDATES - diffDays);
}
