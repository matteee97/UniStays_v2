export const COOKIE_CONSENT_STORAGE_KEY = "unistays-cookie-consent";
export const COOKIE_CONSENT_VERSION = 1;
export const COOKIE_CONSENT_MAX_AGE_DAYS = 180;

export const COOKIE_CONSENT_CATEGORIES = {
  ANALYTICS: "analytics",
  MAPS: "maps",
};

export const DEFAULT_OPTIONAL_COOKIE_CONSENT = {
  [COOKIE_CONSENT_CATEGORIES.ANALYTICS]: false,
  [COOKIE_CONSENT_CATEGORIES.MAPS]: false,
};

export const COOKIE_CONSENT_CATEGORY_DETAILS = [
  {
    key: "necessary",
    label: "Tecnici e necessari",
    description:
      "Autenticazione, sicurezza, persistenza minima del servizio e preferenze essenziali richieste dal sito.",
    required: true,
  },
  {
    key: COOKIE_CONSENT_CATEGORIES.ANALYTICS,
    label: "Analytics",
    description:
      "Misurazione del traffico e delle performance tramite Google Analytics 4.",
    required: false,
  },
  {
    key: COOKIE_CONSENT_CATEGORIES.MAPS,
    label: "Mappe e contenuti esterni",
    description:
      "Caricamento di Google Maps e di risorse collegate per visualizzare le mappe.",
    required: false,
  },
];
