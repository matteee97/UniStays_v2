import ReactGA from "react-ga4";

const trackingId = import.meta.env.VITE_GA_TRACKING_ID;
const PAGEVIEW_DEDUP_WINDOW_MS = 750;
const ANALYTICS_COOKIE_PREFIXES = ["_ga", "_gid", "_gat", "_ga_"];

let analyticsInitialized = false;
let lastTrackedPath = null;
let lastTrackedAt = 0;

const hasTrackingId = () => Boolean(trackingId);

const getDisableFlagKey = () =>
  trackingId ? `ga-disable-${trackingId}` : null;

const setAnalyticsDisabled = (disabled) => {
  if (typeof window === "undefined") return;

  const disableFlagKey = getDisableFlagKey();
  if (!disableFlagKey) return;

  window[disableFlagKey] = disabled;
};

const updateAnalyticsConsentMode = (enabled) => {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;

  window.gtag("consent", "update", {
    analytics_storage: enabled ? "granted" : "denied",
  });
};

const initializeAnalytics = () => {
  if (!hasTrackingId() || analyticsInitialized) return;

  ReactGA.initialize([
    {
      trackingId,
      gaOptions: {
        send_page_view: false,
      },
    },
  ]);

  analyticsInitialized = true;
};

const buildCookieDomains = (hostname) => {
  const parts = String(hostname).split(".").filter(Boolean);
  const domains = new Set();

  for (let index = 0; index < parts.length - 1; index += 1) {
    const domain = parts.slice(index).join(".");
    domains.add(domain);
    domains.add(`.${domain}`);
  }

  return Array.from(domains);
};

const expireCookie = (name, domain) => {
  const domainAttribute = domain ? ` domain=${domain};` : "";
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;${domainAttribute}`;
};

const clearAnalyticsCookies = () => {
  if (typeof document === "undefined" || typeof window === "undefined") return;

  const rawCookies = document.cookie ? document.cookie.split(";") : [];
  const cookieNames = rawCookies
    .map((cookie) => cookie.split("=")[0]?.trim())
    .filter(Boolean);
  const candidateDomains = buildCookieDomains(window.location.hostname);

  cookieNames.forEach((name) => {
    const shouldClear = ANALYTICS_COOKIE_PREFIXES.some(
      (prefix) => name === prefix || name.startsWith(prefix),
    );

    if (!shouldClear) return;

    expireCookie(name);
    candidateDomains.forEach((domain) => expireCookie(name, domain));
  });
};

export const syncAnalyticsConsent = (enabled) => {
  if (!hasTrackingId()) return;

  if (enabled) {
    setAnalyticsDisabled(false);
    initializeAnalytics();
    updateAnalyticsConsentMode(true);
    return;
  }

  setAnalyticsDisabled(true);
  updateAnalyticsConsentMode(false);
  clearAnalyticsCookies();
};

const canSendAnalytics = () => {
  if (!hasTrackingId() || !analyticsInitialized) return false;
  if (typeof window === "undefined") return false;

  const disableFlagKey = getDisableFlagKey();
  return disableFlagKey ? window[disableFlagKey] !== true : false;
};

export const sendPageView = (path) => {
  if (!path || !canSendAnalytics()) return;

  const now = Date.now();
  if (lastTrackedPath === path && now - lastTrackedAt < PAGEVIEW_DEDUP_WINDOW_MS) {
    return;
  }

  lastTrackedPath = path;
  lastTrackedAt = now;

  ReactGA.send({
    hitType: "pageview",
    page: path,
  });
};
