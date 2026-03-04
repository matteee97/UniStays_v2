"use strict";

const toTrimmedString = (value, fallback = "") =>
  typeof value === "string" ? value.trim() : fallback;

const toNullableString = (value) => {
  const str = toTrimmedString(value, "");
  return str.length ? str : null;
};

const buildDisplayName = ({
  displayName,
  firstName,
  lastName,
  fallback = "Utente",
} = {}) => {
  const explicitDisplayName = toTrimmedString(displayName);
  if (explicitDisplayName) {
    return explicitDisplayName;
  }

  const composedName = [toTrimmedString(firstName), toTrimmedString(lastName)]
    .filter(Boolean)
    .join(" ");

  return composedName || fallback;
};

module.exports = {
  toTrimmedString,
  toNullableString,
  buildDisplayName,
};
