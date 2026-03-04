export const hasOwn = (obj, key) =>
  Object.prototype.hasOwnProperty.call(obj, key);

const isPlainObject = (value) =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

/**
 * Safely writes a nested value into an object using a dotted path.
 * Example: setNestedValue(target, "moderation.note", "text")
 */
export const setNestedValue = (target, path, value) => {
  if (!isPlainObject(target)) {
    throw new Error("Target patch must be a plain object.");
  }
  if (typeof path !== "string" || !path.trim()) {
    throw new Error("Path must be a non-empty string.");
  }

  const segments = path.split(".").filter(Boolean);
  let cursor = target;

  for (let index = 0; index < segments.length - 1; index += 1) {
    const segment = segments[index];
    if (!isPlainObject(cursor[segment])) {
      cursor[segment] = {};
    }
    cursor = cursor[segment];
  }

  cursor[segments[segments.length - 1]] = value;
  return target;
};

