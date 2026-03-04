const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const { verifyToken, createClerkClient } = require("@clerk/backend");
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

const { createAuthService } = require("./src/modules/auth/authService");
const { registerAuthRoutes } = require("./src/modules/auth/registerAuthRoutes");
const { createUsersService } = require("./src/modules/users/usersService");
const { registerUserRoutes } = require("./src/modules/users/registerUserRoutes");
const {
  createApartmentsService,
} = require("./src/modules/apartments/apartmentsService");
const {
  registerApartmentRoutes,
} = require("./src/modules/apartments/registerApartmentRoutes");
const {
  createPlatformService,
} = require("./src/modules/platform/platformService");
const {
  registerPlatformRoutes,
} = require("./src/modules/platform/registerPlatformRoutes");
const {
  createReviewsService,
} = require("./src/modules/reviews/reviewsService");
const { registerReviewRoutes } = require("./src/modules/reviews/registerReviewRoutes");
const { createChatService } = require("./src/modules/chat/chatService");
const { registerChatRoutes } = require("./src/modules/chat/registerChatRoutes");
const { createCitiesService } = require("./src/modules/cities/citiesService");
const {
  registerAdminCityRoutes,
} = require("./src/modules/cities/registerAdminCityRoutes");
const {
  createAnalyticsService,
} = require("./src/modules/analytics/analyticsService");
const {
  registerAnalyticsRoutes,
} = require("./src/modules/analytics/registerAnalyticsRoutes");
const {
  createFavoritesService,
} = require("./src/modules/favorites/favoritesService");
const {
  registerFavoritesRoutes,
} = require("./src/modules/favorites/registerFavoritesRoutes");
const {
  createReportsService,
} = require("./src/modules/reports/reportsService");
const { registerReportRoutes } = require("./src/modules/reports/registerReportRoutes");
const {
  asyncHandler,
  getBearerToken,
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
} = require("./src/utils");

const CLERK_SECRET_KEY = defineSecret("CLERK_SECRET_KEY");
const ALLOWED_ORIGINS = defineSecret("ALLOWED_ORIGINS");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;
const Timestamp = admin.firestore.Timestamp;
const GeoPoint = admin.firestore.GeoPoint;

const APARTMENT_STATUS = {
  DRAFT: "draft",
  PENDING_REVIEW: "pending_review",
  PUBLISHED: "published",
  REJECTED: "rejected",
  ARCHIVED: "archived",
};

const ANALYTICS_DOC_ID = "summary";
const DAILY_COLLECTION = "daily";
const PLATFORM_USER_ID = "platform_unistays";

const DEFAULT_RECEIVED_LIKES_LIMIT = 40;
const MAX_RECEIVED_LIKES_LIMIT = 200;

const app = express();
app.disable("x-powered-by");

function getAllowedOrigins() {
  try {
    const raw = ALLOWED_ORIGINS.value() || "";
    return raw
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

const corsOptions = {
  origin: (origin, cb) => {
    const allowed = getAllowedOrigins();
    const isProduction = process.env.NODE_ENV === "production";

    if (!origin) {
      cb(null, true);
      return;
    }

    if (allowed.includes(origin)) {
      cb(null, true);
      return;
    }

    if (!isProduction && allowed.length === 0) {
      cb(null, true);
      return;
    }

    cb(new Error("CORS blocked"));
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Authorization", "Content-Type"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "1mb" }));

class ApiError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const verifyFirebaseToken = async (idToken) =>
  admin.auth().verifyIdToken(idToken, true);

const attachFirebaseUserOptional = asyncHandler(async (req, _res, next) => {
  const token = getBearerToken(req);
  if (!token) {
    req.firebaseUser = null;
    next();
    return;
  }

  try {
    req.firebaseUser = await verifyFirebaseToken(token);
    next();
  } catch (_) {
    next(new ApiError(401, "Invalid Firebase token"));
  }
});

const requireFirebaseAuth = asyncHandler(async (req, _res, next) => {
  const token = getBearerToken(req);
  if (!token) {
    next(new ApiError(401, "Missing Firebase token"));
    return;
  }

  try {
    req.firebaseUser = await verifyFirebaseToken(token);
    next();
  } catch (_) {
    next(new ApiError(401, "Invalid Firebase token"));
  }
});

const requireAdmin = (req, _res, next) => {
  const role = String(
    req.firebaseUser?.role || req.firebaseUser?.claims?.role || ""
  ).toLowerCase();
  if (role !== "admin") {
    next(new ApiError(403, "Admin privileges required"));
    return;
  }
  next();
};

const getApartmentRef = (apartmentId) => db.collection("apartments").doc(apartmentId);
const getAnalyticsSummaryRef = (apartmentId) =>
  getApartmentRef(apartmentId).collection("analytics").doc(ANALYTICS_DOC_ID);
const getAnalyticsDailyRef = (apartmentId, dateKey) =>
  getAnalyticsSummaryRef(apartmentId).collection(DAILY_COLLECTION).doc(dateKey);

const analyticsService = createAnalyticsService({
  FieldValue,
  APARTMENT_STATUS,
  ApiError,
  clamp,
  getAnalyticsSummaryRef,
  getAnalyticsDailyRef,
  getDateKey,
});

const authService = createAuthService({
  verifyToken,
  createClerkClient,
  clerkSecretProvider: () => CLERK_SECRET_KEY.value(),
  createFirebaseCustomToken: (userId, claims) =>
    admin.auth().createCustomToken(userId, claims),
  ApiError,
});

const platformService = createPlatformService({
  db,
  FieldValue,
  platformUserId: PLATFORM_USER_ID,
  toTrimmedString,
});

const usersService = createUsersService({
  db,
  FieldValue,
  toTrimmedString,
  toNullableString,
  toBoolean,
  toFiniteNumber,
});

const apartmentsService = createApartmentsService({
  db,
  FieldValue,
  Timestamp,
  GeoPoint,
  APARTMENT_STATUS,
  analyticsSummaryDocId: ANALYTICS_DOC_ID,
  ApiError,
  toTrimmedString,
  toNullableString,
  toBoolean,
  sendVerificationSuccessMessage: platformService.sendVerificationSuccessMessage,
  sendRemovalMessage: platformService.sendRemovalMessage,
  getStorageBucket: () => admin.storage().bucket(),
});

const reviewsService = createReviewsService({
  db,
  FieldValue,
  ApiError,
  analyticsService,
  getApartmentRef,
  toTrimmedString,
  toNullableString,
  clamp,
});

const chatService = createChatService({
  db,
  FieldValue,
  APARTMENT_STATUS,
  ApiError,
  toTrimmedString,
});

const citiesService = createCitiesService({
  db,
  FieldValue,
  APARTMENT_STATUS,
  ApiError,
  toTrimmedString,
  toFiniteNumber,
});

const favoritesService = createFavoritesService({
  db,
  FieldValue,
  ApiError,
  analyticsService,
  getApartmentRef,
  normalizeLikeUserSnapshot,
  buildDisplayName,
  toTrimmedString,
  toNullableString,
  toIsoDateOrNull,
});

const reportsService = createReportsService({
  db,
  FieldValue,
  Timestamp,
  ApiError,
  toTrimmedString,
  toNullableString,
  toBoolean,
  toDateOrNull,
  toIsoDateOrNull,
  parseIntInRange,
  buildDisplayName,
  getApartmentRef,
  rejectApartmentWithSideEffects: apartmentsService.rejectApartmentWithSideEffects,
  sendPlatformMessage: platformService.sendMessage,
});

// -----------------------
// Clerk -> Firebase token bridge
// -----------------------
registerAuthRoutes({
  app,
  asyncHandler,
  authService,
});

// -----------------------
// Users
// -----------------------
registerUserRoutes({
  app,
  asyncHandler,
  requireFirebaseAuth,
  usersService,
});

// -----------------------
// Apartments (owner + admin)
// -----------------------
registerApartmentRoutes({
  app,
  asyncHandler,
  requireFirebaseAuth,
  requireAdmin,
  apartmentsService,
});

// -----------------------
// Reports
// -----------------------
registerReportRoutes({
  app,
  asyncHandler,
  requireFirebaseAuth,
  requireAdmin,
  reportsService,
});

// -----------------------
// Favorites
// -----------------------
registerFavoritesRoutes({
  app,
  asyncHandler,
  requireFirebaseAuth,
  favoritesService,
  ApiError,
  toTrimmedString,
  parseIntInRange,
  getDateKey,
  defaultReceivedLikesLimit: DEFAULT_RECEIVED_LIKES_LIMIT,
  maxReceivedLikesLimit: MAX_RECEIVED_LIKES_LIMIT,
});

// -----------------------
// Platform messages
// -----------------------
registerPlatformRoutes({
  app,
  asyncHandler,
  requireFirebaseAuth,
  platformService,
});

// -----------------------
// Reviews
// -----------------------
registerReviewRoutes({
  app,
  asyncHandler,
  requireFirebaseAuth,
  reviewsService,
});

// -----------------------
// Analytics
// -----------------------
registerAnalyticsRoutes({
  app,
  db,
  ApiError,
  asyncHandler,
  attachFirebaseUserOptional,
  toTrimmedString,
  getDateKey,
  getApartmentRef,
  analyticsService,
});

// -----------------------
// Chat
// -----------------------
registerChatRoutes({
  app,
  asyncHandler,
  requireFirebaseAuth,
  chatService,
});

// -----------------------
// Cities (admin)
// -----------------------
registerAdminCityRoutes({
  app,
  asyncHandler,
  requireFirebaseAuth,
  requireAdmin,
  citiesService,
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "unistays-api" });
});

app.use((_req, res) => {
  res.status(404).json({ error: "Not Found" });
});

app.use((err, _req, res, _next) => {
  const status = Number(err?.status) || 500;
  const payload = {
    error: err?.message || "Errore interno",
  };

  if (err?.details && typeof err.details === "object") {
    payload.details = err.details;
  }

  if (status >= 500) {
    console.error("[API ERROR]", err);
  }

  res.status(status).json(payload);
});

exports.api = onRequest(
  {
    region: "europe-west1",
    secrets: [CLERK_SECRET_KEY, ALLOWED_ORIGINS],
  },
  app
);
