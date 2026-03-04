import { MODE_METRICS } from "./DettagliTecniciConstants";

export const formatNumber = (value) =>
  new Intl.NumberFormat("it-IT").format(value ?? 0);

export const resolveModeMetric = (mode) =>
  MODE_METRICS[mode] || MODE_METRICS.views;

export const resolveMetricKey = (mode) => resolveModeMetric(mode).key;
