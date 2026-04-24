import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  COOKIE_CONSENT_CATEGORIES,
  COOKIE_CONSENT_MAX_AGE_DAYS,
  COOKIE_CONSENT_STORAGE_KEY,
  COOKIE_CONSENT_VERSION,
  DEFAULT_OPTIONAL_COOKIE_CONSENT,
} from "@/ui/legal/cookieConsentConfig";
import { syncAnalyticsConsent } from "@/ui/helpers/analytics";

const CookieConsentContext = createContext(null);

const CONSENT_MAX_AGE_MS =
  COOKIE_CONSENT_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

const buildDefaultConsent = () => ({
  version: COOKIE_CONSENT_VERSION,
  hasInteracted: false,
  updatedAt: null,
  categories: { ...DEFAULT_OPTIONAL_COOKIE_CONSENT },
});

const isKnownOptionalCategory = (categoryKey) =>
  Object.prototype.hasOwnProperty.call(
    DEFAULT_OPTIONAL_COOKIE_CONSENT,
    categoryKey,
  );

const normalizeCategories = (categories) =>
  Object.keys(DEFAULT_OPTIONAL_COOKIE_CONSENT).reduce((acc, key) => {
    acc[key] = Boolean(categories?.[key]);
    return acc;
  }, {});

const isConsentExpired = (updatedAt) => {
  if (!updatedAt) return false;

  const timestamp = new Date(updatedAt).getTime();
  if (!Number.isFinite(timestamp)) return true;

  return Date.now() - timestamp > CONSENT_MAX_AGE_MS;
};

const normalizeStoredConsent = (storedValue) => {
  if (!storedValue || typeof storedValue !== "object") {
    return buildDefaultConsent();
  }

  if (storedValue.version !== COOKIE_CONSENT_VERSION) {
    return buildDefaultConsent();
  }

  if (isConsentExpired(storedValue.updatedAt)) {
    return buildDefaultConsent();
  }

  return {
    version: COOKIE_CONSENT_VERSION,
    hasInteracted: Boolean(storedValue.hasInteracted),
    updatedAt: storedValue.updatedAt ?? null,
    categories: normalizeCategories(storedValue.categories),
  };
};

const readStoredConsent = () => {
  if (typeof window === "undefined") {
    return buildDefaultConsent();
  }

  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!raw) return buildDefaultConsent();
    return normalizeStoredConsent(JSON.parse(raw));
  } catch {
    return buildDefaultConsent();
  }
};

const persistConsent = (consent) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      COOKIE_CONSENT_STORAGE_KEY,
      JSON.stringify(consent),
    );
  } catch {
    // Ignore storage failures and keep consent in memory for the session.
  }
};

const buildStoredConsent = (categories) => ({
  version: COOKIE_CONSENT_VERSION,
  hasInteracted: true,
  updatedAt: new Date().toISOString(),
  categories: normalizeCategories(categories),
});

export function CookieConsentProvider({ children }) {
  const [consent, setConsent] = useState(readStoredConsent);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  useEffect(() => {
    persistConsent(consent);
  }, [consent]);

  useEffect(() => {
    syncAnalyticsConsent(consent.categories.analytics);
  }, [consent.categories.analytics]);

  const acceptAll = useCallback(() => {
    setConsent(
      buildStoredConsent({
        analytics: true,
        maps: true,
      }),
    );
    setIsPreferencesOpen(false);
  }, []);

  const rejectOptional = useCallback(() => {
    setConsent(
      buildStoredConsent({
        analytics: false,
        maps: false,
      }),
    );
    setIsPreferencesOpen(false);
  }, []);

  const savePreferences = useCallback((categories) => {
    setConsent(buildStoredConsent(categories));
    setIsPreferencesOpen(false);
  }, []);

  const grantCategory = useCallback((categoryKey) => {
    if (!isKnownOptionalCategory(categoryKey)) return;

    setConsent((current) =>
      buildStoredConsent({
        ...current.categories,
        [categoryKey]: true,
      }),
    );
  }, []);

  const openPreferences = useCallback(() => setIsPreferencesOpen(true), []);
  const closePreferences = useCallback(() => setIsPreferencesOpen(false), []);

  const hasConsentFor = useCallback(
    (categoryKey) =>
      isKnownOptionalCategory(categoryKey)
        ? Boolean(consent.categories[categoryKey])
        : true,
    [consent.categories],
  );

  const value = useMemo(
    () => ({
      consent,
      hasConsentFor,
      shouldShowBanner: !consent.hasInteracted,
      isPreferencesOpen,
      acceptAll,
      rejectOptional,
      savePreferences,
      grantCategory,
      openPreferences,
      closePreferences,
      categories: COOKIE_CONSENT_CATEGORIES,
    }),
    [
      acceptAll,
      closePreferences,
      consent,
      grantCategory,
      hasConsentFor,
      isPreferencesOpen,
      openPreferences,
      rejectOptional,
      savePreferences,
    ],
  );

  return createElement(CookieConsentContext.Provider, { value }, children);
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);

  if (!context) {
    throw new Error(
      "useCookieConsent must be used within a CookieConsentProvider",
    );
  }

  return context;
}

export { useCookieConsent as default };
