"use strict";

const { toNullableString } = require("./stringUtils");

const toBoolean = (value, fallback = false) =>
  typeof value === "boolean" ? value : fallback;

const normalizeLikeUserSnapshot = (payload = {}) => ({
  displayName: toNullableString(payload.displayName),
  firstName: toNullableString(payload.firstName),
  lastName: toNullableString(payload.lastName),
  photoUrl: toNullableString(payload.photoUrl),
});

module.exports = {
  toBoolean,
  normalizeLikeUserSnapshot,
};
