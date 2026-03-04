import { useState } from "react";

const parseStoredBoolean = (rawValue, fallbackValue) => {
  if (rawValue == null) return fallbackValue;

  try {
    const parsed = JSON.parse(rawValue);
    return typeof parsed === "boolean" ? parsed : fallbackValue;
  } catch {
    return fallbackValue;
  }
};

/**
 * Manage persistent card layout preference shared across listings pages.
 *
 * @param {object} params
 * @param {string} [params.storageKey="detailedCard"]
 * @param {boolean} [params.defaultValue=true]
 * @returns {{detailedCard: boolean, setDetailedCard: Function, storageKey: string}}
 */
export const useDetailedCardPreference = ({
  storageKey = "detailedCard",
  defaultValue = true,
} = {}) => {
  const [detailedCard, setDetailedCard] = useState(() => {
    if (typeof window === "undefined" || !storageKey) return defaultValue;
    return parseStoredBoolean(
      window.localStorage.getItem(storageKey),
      defaultValue
    );
  });

  return {
    detailedCard,
    setDetailedCard,
    storageKey,
  };
};
