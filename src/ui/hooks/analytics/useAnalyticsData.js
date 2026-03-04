import { useMemo } from "react";
import { buildAnalyticsOverview } from "@/core/services/analytics/ApartmentAnalyticsOverview";

export const useAnalyticsData = (apartments, config) => {
  const options = typeof config === "object" && config !== null ? config : {};
  const { rankingMetric = "totalViews", limit = 10 } = options;

  const overview = useMemo(
    () =>
      buildAnalyticsOverview(Array.isArray(apartments) ? apartments : [], {
        rankingMetric,
        limit,
      }),
    [apartments, rankingMetric, limit]
  );

  return {
    topApartment: overview.topApartment,
    totals: overview.totals,
    topApartments: overview.topApartments,
    cityStats: overview.cityStats,
    viewTrend: overview.viewTrend,
    normalizedApartments: overview.normalizedApartments,
  };
};
