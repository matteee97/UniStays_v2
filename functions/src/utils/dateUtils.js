"use strict";

const getDateKey = (date = new Date()) => date.toISOString().split("T")[0];

const toDateOrNull = (value) => {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }
  if (typeof value?.toDate === "function") {
    const date = value.toDate();
    return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
  }

  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
};

const toIsoDateOrNull = (value) => {
  const date = toDateOrNull(value);
  return date ? date.toISOString() : null;
};

module.exports = {
  getDateKey,
  toDateOrNull,
  toIsoDateOrNull,
};
