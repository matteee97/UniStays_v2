"use strict";

const toFiniteNumber = (value, fallback = null) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const clamp = (value, min = 0, max = Number.POSITIVE_INFINITY) => {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
};

const parseIntInRange = (
  value,
  fallback,
  { min = 1, max = Number.MAX_SAFE_INTEGER } = {}
) => {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return clamp(parsed, min, max);
};

module.exports = {
  toFiniteNumber,
  clamp,
  parseIntInRange,
};
