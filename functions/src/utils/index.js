"use strict";

const {
  toTrimmedString,
  toNullableString,
  buildDisplayName,
} = require("./stringUtils");
const { toFiniteNumber, clamp, parseIntInRange } = require("./numberUtils");
const { getDateKey, toDateOrNull, toIsoDateOrNull } = require("./dateUtils");
const { toBoolean, normalizeLikeUserSnapshot } = require("./userUtils");
const { asyncHandler, getBearerToken } = require("./httpUtils");

module.exports = {
  toTrimmedString,
  toNullableString,
  buildDisplayName,
  toFiniteNumber,
  clamp,
  parseIntInRange,
  getDateKey,
  toDateOrNull,
  toIsoDateOrNull,
  toBoolean,
  normalizeLikeUserSnapshot,
  asyncHandler,
  getBearerToken,
};
