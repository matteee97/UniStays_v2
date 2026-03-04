import { useMemo } from "react";

export function useIsVerifiedHost(owner) {
  return useMemo(() => {
    if (!owner) return false;

    if (owner.isVerifiedHost === true) return true;

    const rawDate = owner.inPlatformSince || owner.createdAt || null;
    const createdAt =
      rawDate?.toDate?.() ||
      (rawDate instanceof Date ? rawDate : rawDate ? new Date(rawDate) : null);
    const stats = owner.publicStats || {};
    const apartmentsCount = stats.apartmentsCount;
    const reportsCount = stats.reportsCount;

    if (!createdAt) return false;
    if (typeof apartmentsCount !== "number" || typeof reportsCount !== "number") {
      return false;
    }

    const isOldEnough =
      createdAt <= new Date(Date.now() - 1000 * 60 * 60 * 24 * 90);
    const hasEnoughApartments = apartmentsCount > 3;
    const hasLowReports = reportsCount < 2;

    return isOldEnough && hasEnoughApartments && hasLowReports;
  }, [owner]);
}
