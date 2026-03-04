// App Configuration
export const APP_CONFIG = {
  name: 'UniStays',
  version: '1.0.0',
  description: 'Piattaforma per affitti studenteschi',
  baseUrl: process.env.VITE_BASE_URL || 'http://localhost:5173',
  apiUrl: process.env.VITE_API_URL || 'https://api.unistays.com',
};

// Firebase Configuration
export const FIREBASE_CONFIG = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Analytics Configuration
export const ANALYTICS_CONFIG = {
  trackingId: process.env.VITE_GA_TRACKING_ID,
  debugMode: process.env.NODE_ENV === 'development',
};

// Map Configuration
export const MAP_CONFIG = {
  apiKey: process.env.VITE_GOOGLE_MAPS_API_KEY,
  defaultZoom: 8,
  defaultCenter: { lat: 41.9028, lng: 12.4964 }, // Roma
};

// UI Configuration
export const UI_CONFIG = {
  colors: {
    primary: '#228E8D',
    secondary: '#62C1BA',
    accent: '#A4E0DB',
    light: '#D4F1EF',
    dark: '#1A6B6A',
  },
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
};

// Feature Flags
export const FEATURE_FLAGS = {
  enableAnalytics: true,
  enableSuggestions: true,
  enableMap: true,
  enablePdfGeneration: true,
  enableImageCompression: true,
};

// Validation Rules
export const VALIDATION_RULES = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Inserisci un indirizzo email valido',
  },
  password: {
    required: true,
    minLength: 8,
    message: 'La password deve essere di almeno 8 caratteri',
  },
  phone: {
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    message: 'Inserisci un numero di telefono valido',
  },
};

// Error Messages
export const ERROR_MESSAGES = {
  network: 'Errore di connessione. Riprova più tardi.',
  auth: 'Errore di autenticazione. Verifica le tue credenziali.',
  validation: 'Dati non validi. Controlla i campi inseriti.',
  upload: 'Errore durante il caricamento. Riprova.',
  generic: 'Si è verificato un errore. Riprova più tardi.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  saved: 'Dati salvati con successo!',
  uploaded: 'File caricato con successo!',
  deleted: 'Elemento eliminato con successo!',
  created: 'Elemento creato con successo!',
  updated: 'Elemento aggiornato con successo!',
};
