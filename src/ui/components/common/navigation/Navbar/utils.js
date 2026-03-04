/**
 * Checks if the current path is a detail page, like "/alloggi/roma/123".
 * @param {string} pathname
 * @returns {boolean}
 */
export function isApartmentDetailPath(pathname) {
  const segments = pathname.split("/").filter(Boolean);
  return segments[0] === "alloggi" && segments.length >= 3;
}

/**
 * Checks if the current path is the apartments listing page (e.g. "/alloggi/roma").
 *
 * @param {string} pathname
 * @returns {boolean}
 */
export function isApartmentsListingPath(pathname) {
  const segments = pathname.split("/").filter(Boolean);
  return segments[0] === "alloggi" && segments.length === 2;
}
