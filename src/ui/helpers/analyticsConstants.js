export const SUGGESTION_KEYS = {
  NO_ANNUNCI: "no_annunci_suggestion",
  LOW_VIEWS: "low_views_suggestion",
  HIGH_VIEWS: "high_views_suggestion",
  SINGLE_CITY: "single_city_suggestion",
  MULTIPLE_CITIES: "multiple_cities_suggestion",
  DECLINING_TREND: "declining_trend_suggestion",
  IMPROVING_TREND: "improving_trend_suggestion",
  SEASONAL_PATTERN: "seasonal_pattern_suggestion",
};

export const CHART_COLORS = ["#228E8D", "#62C1BA", "#A4E0DB", "#D2F1eF"];

export const RANGE_STEPS = {
  SHORT: 1,    // 2-10 giorni
  MEDIUM: 5,   // 11-30 giorni
  LONG: 10,    // 31-90 giorni
  EXTENDED: 30, // 91-365 giorni
};

export const VIEWS_THRESHOLDS = {
  LOW: 10,
  HIGH: 50,
  TREND_DECLINE: 0.7,
  TREND_IMPROVE: 1.3,
};
