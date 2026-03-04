const QUERY_KEY_VERSION = 1;
const DEFAULT_SCOPE = "global";

const normalizeForStableKey = (value, seen = new WeakSet()) => {
  if (value == null) return value;

  const valueType = typeof value;
  if (valueType === "string" || valueType === "number" || valueType === "boolean") {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((entry) => normalizeForStableKey(entry, seen));
  }

  if (valueType === "object") {
    if (seen.has(value)) {
      return "[Circular]";
    }

    seen.add(value);
    const normalizedObject = {};
    const keys = Object.keys(value).sort();

    keys.forEach((key) => {
      const normalizedEntry = normalizeForStableKey(value[key], seen);
      if (normalizedEntry !== undefined) {
        normalizedObject[key] = normalizedEntry;
      }
    });

    seen.delete(value);
    return normalizedObject;
  }

  return String(value);
};

const normalizeScope = (scope) => {
  if (!scope) return DEFAULT_SCOPE;
  if (typeof scope === "string") return scope;
  return JSON.stringify(normalizeForStableKey(scope));
};

/**
 * Creates a deterministic cache key for apartment queries.
 *
 * @param {object} params
 * @param {Array} [params.constraints]
 * @param {number} [params.pageSize]
 * @param {string|object} [params.scope]
 * @returns {string}
 */
export const createApartmentsQueryKey = ({
  constraints = [],
  pageSize = 0,
  scope = DEFAULT_SCOPE,
} = {}) => {
  const normalizedConstraints = normalizeForStableKey(
    Array.isArray(constraints) ? constraints : []
  );
  const normalizedPageSize = Number.isFinite(Number(pageSize))
    ? Number(pageSize)
    : 0;

  return JSON.stringify({
    v: QUERY_KEY_VERSION,
    pageSize: normalizedPageSize,
    scope: normalizeScope(scope),
    constraints: normalizedConstraints,
  });
};

