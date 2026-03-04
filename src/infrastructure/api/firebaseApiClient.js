import { auth } from "@/infrastructure/firebase";

const DEFAULT_TOKEN_ENDPOINT =
  import.meta.env.VITE_FIREBASE_TOKEN_ENDPOINT || "/api/firebase/token";

const resolveApiBaseUrl = () => {
  const explicitBase = import.meta.env.VITE_BACKEND_API_BASE_URL;
  if (explicitBase && typeof explicitBase === "string") {
    return explicitBase.replace(/\/$/, "");
  }

  return DEFAULT_TOKEN_ENDPOINT.replace(/\/firebase\/token\/?$/, "");
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

  const response = await fetch(buildUrl(path), {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...authHeader,
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    throw new Error(await toErrorMessage(response));
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
