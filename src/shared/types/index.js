// User Types
export const USER_ROLES = {
  STUDENT: 'student',
  HOST: 'pippo il cane bello',
  ADMIN: 'admin',
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  INPUT: 'YYYY-MM-DD',
  DATETIME: 'DD/MM/YYYY HH:mm',
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
};

// Currency
export const CURRENCY = {
  SYMBOL: '€',
  CODE: 'EUR',
  LOCALE: 'it-IT',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 24,
  MAX_PAGE_SIZE: 42,
  PAGE_SIZE_OPTIONS: [6, 12, 18, 24, 42],
};

// Notification Types (consolidated from constants)
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

export const NOTIFICATION_POSITIONS = {
  TOP_RIGHT: 'top-right',
  TOP_LEFT: 'top-left',
  BOTTOM_RIGHT: 'bottom-right',
  BOTTOM_LEFT: 'bottom-left',
};

export const NOTIFICATION_DURATIONS = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 8000,
};

// Storage Keys
export const STORAGE_KEYS = {
  USER_TOKEN: 'user_token',
  USER_DATA: 'user_data',
  USER_CHECKED: 'user_checked',
  THEME: 'theme',
  LANGUAGE: 'language',
  SUGGESTIONS: 'suggestions',
  FAVORITES: 'favorites',
  CART: 'cart',
  PREFERRED_CITY: 'preferredCity',
  LAST_SEARCHED_CITY: 'lastSearchedCity',
};

// Performance Constants
export const PERFORMANCE = {
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 100,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  REQUEST_TIMEOUT: 10000, // 10 seconds
  MAX_RETRIES: 3,
};

// UI Constants
export const UI = {
  ANIMATION_DURATION: 300,
  TOAST_DURATION: 5000,
  MODAL_ANIMATION: 200,
  LOADING_DELAY: 1000,
  INFINITE_SCROLL_THRESHOLD: 100,
};

// Validation Constants
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_NAME_LENGTH: 3,
  MAX_NAME_LENGTH: 20,
  MIN_TITLE_LENGTH: 5,
  MAX_TITLE_LENGTH: 50,
  MIN_DESCRIPTION_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_BIO_LENGTH: 500,
  TEXT_REGEX: /^[a-zA-ZàèéìòùÀÈÉÌÒÙ\s]+$/,
  PHONE_REGEX: /^[\+]?[1-9][\d]{0,15}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  NUMERIC_REGEX: /^[0-9]+$/,
  CAP_REGEX: /^[0-9]{5}$/,
  URL_REGEX: /^https?:\/\/.+/,
};

export const ERROR_MESSAGES = {
  REQUIRED: "Campo obbligatorio",
  MIN: (min) => `Valore minimo: ${min}`,
  MAX: (max) => `Valore massimo: ${max}`,
  MIN_LENGTH: (min) => `Minimo ${min} caratteri`,
  MAX_LENGTH: (max) => `Massimo ${max} caratteri`,
  MIN_ARRAY_LENGTH: (min) => `Minimo ${min} elementi`,
  MAX_ARRAY_LENGTH: (max) => `Massimo ${max} elementi`,
  EMAIL: "Email non valida",
  NUMERIC: "Deve contenere solo numeri",
  CAP: "Deve essere di 5 cifre",
  VALIDATION_ERROR: "Ci sono degli errori di validazione. Controlla i campi evidenziati in rosso.",
  SUBMIT_ERROR: "Si è verificato un errore durante la pubblicazione. Riprova.",
};

// File Constants
export const FILES = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  MIN_COUNT: 1,
  MAX_COUNT: 8,
  COMPRESSION_QUALITY: 0.8,
};

// Date Constants
export const DATES = {
  MIN_AGE: 18,
  MAX_AGE: 100,
  DEFAULT_TIMEZONE: 'Europe/Rome',
};

// Price Constants
export const PRICES = {
  MIN_PRICE: 0,
  MAX_PRICE: 1000,
  CURRENCY: 'EUR',
  SYMBOL: '€',
  DECIMAL_PLACES: 2,
};

// Apartments Constants
export const APARTMENTS = {
  MIN_ROOMS: 1,
  MAX_ROOMS: 30, 
  MIN_BEDS: 1,
  MAX_BEDS: 30,
  MIN_BATHROOMS: 0,
  MAX_BATHROOMS: 15,
  MIN_SQUARE_METERS: 10,
  MAX_SQUARE_METERS: 1000,
  MIN_ROOM_SQUARE_METERS: 5,
  MAX_ROOM_SQUARE_METERS: 500,
};

// distance
export const DISTANCES = {
  MIN_KM: 0,
  MAX_KM: 50,
  STEP_KM: 1,
}

// Apartment status
export const APARTMENT_STATUS = {
  DRAFT: "draft",
  PENDING_REVIEW: "pending_review",
  PUBLISHED: "published",
  REJECTED: "rejected",
  ARCHIVED: "archived",
};

// Room types
export const ROOM_TYPES = {
  SINGLE: "single",
  DOUBLE: "double",
  ENTIRE_APARTMENT: "entire_apartment",
};

// Location Constants
export const LOCATIONS = {
  DEFAULT_COUNTRY: 'IT',
  DEFAULT_LANGUAGE: 'it',
  SUPPORTED_LANGUAGES: ['it'],
  DEFAULT_COORDINATES: { lat: 41.9028, lng: 12.4964 }, // Roma
  DEFAULT_ZOOM: 8,
  MAX_ZOOM: 18,
  MIN_ZOOM: 3,
};

// Search Constants
export const SEARCH = {
  MIN_QUERY_LENGTH: 2,
  MAX_RESULTS: 50,
  SUGGESTION_LIMIT: 5,
  DEBOUNCE_DELAY: 500,
  CACHE_DURATION: 10 * 60 * 1000, // 10 minutes
};
