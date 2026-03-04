const isNumericKey = (key) => String(Number(key)) === key;

export const updateNestedField = (setState, name, value) => {
  if (!name) return;
  const keys = name.split(".");
  setState((prev) => {
    const updated = Array.isArray(prev) ? [...prev] : { ...prev };
    let ref = updated;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      const nextKey = keys[i + 1];
      const current = ref[key];
      const shouldBeArray = isNumericKey(nextKey);

      if (Array.isArray(current)) {
        ref[key] = [...current];
      } else if (current && typeof current === "object") {
        ref[key] = { ...current };
      } else {
        ref[key] = shouldBeArray ? [] : {};
      }

      ref = ref[key];
    }

    const lastKey = keys[keys.length - 1];
    if (Array.isArray(ref) && isNumericKey(lastKey)) {
      ref[Number(lastKey)] = value;
    } else {
      ref[lastKey] = value;
    }

    return updated;
  });
};
