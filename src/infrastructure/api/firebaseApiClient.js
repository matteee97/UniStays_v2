import { auth } from "@/infrastructure/firebase";

const DEFAULT_TOKEN_ENDPOINT =
  import.meta.env.VITE_FIREBASE_TOKEN_ENDPOINT || "/api/firebase/token";

const normalizeApiBaseUrl = (rawBaseUrl) => {
  if (!rawBaseUrl || typeof rawBaseUrl !== "string") return "/api";
  const trimmed = rawBaseUrl.trim().replace(/\/$/, "");
  if (!trimmed) return "/api";

  if (trimmed.endsWith("/api")) return trimmed;
  if (trimmed.endsWith("/firebase/token")) {
    return trimmed.replace(/\/firebase\/token$/, "");
  }

  // Cloud Functions URL often arrives as ...cloudfunctions.net/<functionName>
  // while backend routes are mounted under /api.
  if (/cloudfunctions\.net\/[^/]+$/i.test(trimmed)) {
    return `${trimmed}/api`;
  }

  return trimmed;
};

const resolveApiBaseUrl = () => {
  const explicitBase = import.meta.env.VITE_BACKEND_API_BASE_URL;
  if (explicitBase && typeof explicitBase === "string") {
    return normalizeApiBaseUrl(explicitBase);
  }

  return normalizeApiBaseUrl(DEFAULT_TOKEN_ENDPOINT);
};

const API_BASE_URL = resolveApiBaseUrl();

const toErrorMessage = async (response) => {
  try {
    const payload = await response.json();
    if (payload?.error) {
      return payload.error;
    }
  } catch {
    // Ignore malformed JSON and fallback to status text.
  }

  return response.statusText || "Errore API";
};

const buildUrl = (path) => {
  if (!path) return API_BASE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/")) return `${API_BASE_URL}${path}`;
  return `${API_BASE_URL}/${path}`;
};

const resolveAuthHeader = async (requireAuth) => {
  const token = await auth.currentUser?.getIdToken?.();

  if (requireAuth && !token) {
    throw new Error("Utente non autenticato su Firebase.");
  }

  if (!token) return {};

  return {
    Authorization: `Bearer ${token}`,
  };
};

export class BackendApiError extends Error {
  constructor(message, { status = 0, path = "", url = "" } = {}) {
    super(message || "Errore API");
    this.name = "BackendApiError";
    this.status = Number(status) || 0;
    this.path = path;
    this.url = url;
  }
}

/**
 * Calls UniStays backend API mounted under Cloud Functions `/api` base.
 *
 * @param {string} path relative path (e.g. `/v1/apartments`)
 * @param {object} [options]
 * @param {string} [options.method]
 * @param {object} [options.body]
 * @param {boolean} [options.requireAuth]
 * @param {Record<string, string>} [options.headers]
 */
export async function callBackendApi(
  path,
  { method = "GET", body, requireAuth = true, headers = {} } = {}
) {
  const authHeader = await resolveAuthHeader(requireAuth);
  const url = buildUrl(path);

  const response = await fetch(url, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...authHeader,
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    throw new BackendApiError(await toErrorMessage(response), {
      status: response.status,
      path,
      url,
    });
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const backendApiConfig = {
  baseUrl: API_BASE_URL,
};
