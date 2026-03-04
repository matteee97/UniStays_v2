// Route Configuration
export const ROUTES = {
  // Public Routes
  HOME: '/',
  APARTMENTS: '/alloggi/:city',
  APARTMENT_DETAIL: '/alloggi/:city/:apartmentId',
  CITIES: '/citta',
  CONTACT: '/contatti',
  ABOUT: '/chi-siamo',
  PRIVACY: '/privacy',
  COOKIE_POLICY: '/cookie-policy',
  TERMS: '/termini',
  
  // Auth Routes
  SIGN_IN: '/accedi',
  SIGN_UP: '/registrati',
  
  // Public Routes (continued)
  PRE_PUBLISH_ANNOUNCEMENT: '/pubblica-annuncio',
  
  // Protected Routes
  MY_ANNOUNCEMENTS: '/dashboard/annunci',
  FAVORITES: '/annunci-preferiti',
  PUBLISH_ANNOUNCEMENT: '/pubblica-annuncio-form',
  TECHNICAL_DETAILS: 'dettagli',
  HOST_APARTMENTS: '/host/:userParams',
  CHAT: '/chat',
  ADMIN: '/admin',

  // Debug
  DEBUG: '/debug',
  
  // Error Routes
  NOT_FOUND: '/404',
  ERROR: '/error',
};

// Route Metadata
export const ROUTE_METADATA = {
  [ROUTES.HOME]: {
    title: 'UniStays - Trova la tua casa universitaria',
    description: 'Piattaforma per affitti studenteschi in tutta Italia',
    keywords: 'affitti studenti, case universitarie, alloggi studenti',
  },
  [ROUTES.APARTMENTS]: {
    title: 'Alloggi - UniStays',
    description: 'Trova il tuo alloggio ideale per l\'università',
    keywords: 'alloggi, appartamenti, affitti studenti',
  },
  [ROUTES.APARTMENT_DETAIL]: {
    title: 'Dettagli Alloggio - UniStays',
    description: 'Scopri tutti i dettagli di questo alloggio',
    keywords: 'dettagli alloggio, informazioni appartamento',
  },
  [ROUTES.CITIES]: {
    title: 'Città Universitarie - UniStays',
    description: 'Esplora le città universitarie italiane',
    keywords: 'città universitarie, università italiane, università',
  },
  [ROUTES.CONTACT]: {
    title: 'Contatti - UniStays',
    description: 'Contattaci per qualsiasi informazione',
    keywords: 'contatti, supporto, assistenza',
  },
  [ROUTES.ABOUT]: {
    title: 'Chi Siamo - UniStays',
    description: 'Scopri la nostra storia e missione',
    keywords: 'chi siamo, storia, missione',
  },
  [ROUTES.PRIVACY]: {
    title: 'Privacy Policy - UniStays',
    description: 'Informativa sul trattamento dei dati personali su UniStays',
    keywords: 'privacy policy, gdpr, dati personali, unistays',
  },
  [ROUTES.COOKIE_POLICY]: {
    title: 'Cookie Policy - UniStays',
    description: 'Informazioni su cookie e tecnologie similari usate da UniStays',
    keywords: 'cookie policy, cookie, consenso, tracciamento, unistays',
  },
  [ROUTES.TERMS]: {
    title: 'Termini e Condizioni - UniStays',
    description: 'Termini e condizioni di utilizzo della piattaforma UniStays',
    keywords: 'termini e condizioni, condizioni d uso, unistays',
  },
  [ROUTES.SIGN_IN]: {
    title: 'Accedi - UniStays',
    description: 'Accedi al tuo account UniStays',
    keywords: 'login, accesso, account',
  },
  [ROUTES.SIGN_UP]: {
    title: 'Registrati - UniStays',
    description: 'Crea il tuo account UniStays',
    keywords: 'registrazione, nuovo account, iscrizione',
  },
  [ROUTES.PRE_PUBLISH_ANNOUNCEMENT]: {
    title: 'Pubblica il tuo annuncio | Alloggi Universitari',
    description: 'Pubblica il tuo annuncio per affitti universitari in modo facile, veloce e completamente gratuito. Raggiungi migliaia di studenti in cerca di casa.',
    keywords: 'pubblica annuncio, affitti universitari, gratuito, studenti',
  },
  [ROUTES.DASHBOARD]: {
    title: 'Dashboard - UniStays',
    description: 'Gestisci il tuo account UniStays',
    keywords: 'dashboard, pannello controllo',
  },
  [ROUTES.MY_ANNOUNCEMENTS]: {
    title: 'I Tuoi Annunci - UniStays',
    description: 'Gestisci i tuoi annunci pubblicati',
    keywords: 'i tuoi annunci, gestione annunci',
  },
  [ROUTES.FAVORITES]: {
    title: 'Preferiti - UniStays',
    description: 'I tuoi alloggi preferiti',
    keywords: 'preferiti, alloggi salvati, annunci preferiti',
  },
  [ROUTES.PUBLISH_ANNOUNCEMENT]: {
    title: 'Pubblica Annuncio - UniStays',
    description: 'Pubblica il tuo annuncio di affitto',
    keywords: 'pubblica annuncio, affitta casa',
  },
  [ROUTES.TECHNICAL_DETAILS]: {
    title: 'Dettagli Tecnici - UniStays',
    description: 'Statistiche e analisi dei tuoi annunci',
    keywords: 'statistiche, analisi, dettagli tecnici',
  },
  [ROUTES.HOST_APARTMENTS]: {
    title: 'Appartamenti Host - UniStays',
    description: 'Gestisci gli appartamenti come host',
    keywords: 'host, gestione appartamenti',
  },
  [ROUTES.CHAT]: {
    title: 'Chat - UniStays',
    description: 'Chat con gli host',
    keywords: 'chat, host, alloggi',
  },
  [ROUTES.ADMIN]: {
    title: 'Pannello Admin - UniStays',
    description: 'Pannello di amministrazione',
    keywords: 'admin, amministrazione, gestione',
  },
  [ROUTES.NOT_FOUND]: {
    title: 'Pagina Non Trovata - UniStays',
    description: 'La pagina che stai cercando non esiste',
    keywords: '404, pagina non trovata',
  },
};

// Breadcrumb Configuration
export const BREADCRUMB_CONFIG = {
  [ROUTES.APARTMENTS]: [
    { path: ROUTES.HOME, label: 'Home' },
    { path: ROUTES.APARTMENTS, label: 'Alloggi', current: true },
  ],
  [ROUTES.APARTMENT_DETAIL]: [
    { path: ROUTES.HOME, label: 'Home' },
    { path: ROUTES.APARTMENTS, label: 'Alloggi' },
    { path: ROUTES.APARTMENT_DETAIL, label: 'Dettagli', current: true },
  ],
  [ROUTES.MY_ANNOUNCEMENTS]: [
    { path: ROUTES.HOME, label: 'Home' },
    { path: ROUTES.DASHBOARD, label: 'Dashboard' },
    { path: ROUTES.MY_ANNOUNCEMENTS, label: 'I Tuoi Annunci', current: true },
  ],
  [ROUTES.TECHNICAL_DETAILS]: [
    { path: ROUTES.HOME, label: 'Home' },
    { path: ROUTES.DASHBOARD, label: 'Dashboard' },
    { path: ROUTES.MY_ANNOUNCEMENTS, label: 'I Tuoi Annunci' },
    { path: ROUTES.TECHNICAL_DETAILS, label: 'Dettagli Tecnici', current: true },
  ],
};
