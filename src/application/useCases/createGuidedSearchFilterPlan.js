import {
  APARTMENT_FILTER_DEFAULTS,
  normalizeApartmentFilters,
} from "@/application/filters/apartmentFilters";
import { ROOM_TYPES } from "@/shared/types";

const AMENITY_PATTERNS = [
  { key: "wifi", label: "Wi-Fi", regex: /\b(wifi|wi-fi|internet|fibra)\b/i },
  {
    key: "parking",
    label: "Parcheggio",
    regex: /\b(parcheggio|posto auto|garage)\b/i,
  },
  {
    key: "airConditioning",
    label: "Aria condizionata",
    regex: /\b(aria condizionata|climatizzat)\b/i,
  },
  { key: "elevator", label: "Ascensore", regex: /\bascensore\b/i },
  { key: "balcony", label: "Balcone", regex: /\b(balcone|terrazzo)\b/i },
  {
    key: "dishwasher",
    label: "Lavastoviglie",
    regex: /\blavastoviglie\b/i,
  },
];

const ROOM_TYPE_PATTERNS = [
  {
    type: ROOM_TYPES.SINGLE,
    label: "Singola",
    regex: /\b(stanza singola|camera singola|singola)\b/i,
  },
  {
    type: ROOM_TYPES.DOUBLE,
    label: "Doppia",
    regex: /\b(stanza doppia|camera doppia|doppia)\b/i,
  },
  {
    type: ROOM_TYPES.ENTIRE_APARTMENT,
    label: "Intero appartamento",
    regex: /\b(intero appartamento|appartamento intero|intero alloggio)\b/i,
  },
];

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const uniqueCriteria = (criteria) => {
  const seen = new Set();
  return criteria.filter((item) => {
    const key = `${item.key}:${item.value}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const formatRange = ([min, max], suffix = "") => {
  if (min <= 0 && max <= 0) return "";
  if (min === max) return `${min}${suffix}`;
  if (min <= 0) return `fino a ${max}${suffix}`;
  if (max <= 0) return `da ${min}${suffix}`;
  return `${min}-${max}${suffix}`;
};

const parsePriceFilters = (text, baseFilters, criteria) => {
  const next = [...baseFilters.priceRange];

  const rangeWithEuro =
    text.match(
      /(?:tra|fra)?\s*(\d{2,4})\s*(?:€|euro)\s*[-ae]\s*(\d{2,4})\s*(?:€|euro|eur)?/i,
    ) ||
  text.match(/(?:tra|fra)\s*(\d{2,4})\s*e\s*(\d{2,4})\s*(?:€|euro|eur)/i);

  if (rangeWithEuro) {
    const first = toNumber(rangeWithEuro[1]);
    const second = toNumber(rangeWithEuro[2]);
    if (first != null && second != null) {
      next[0] = Math.min(first, second);
      next[1] = Math.max(first, second);
      criteria.push({
        key: "priceRange",
        label: "Budget",
        value: `${next[0]}-${next[1]} EUR`,
      });
      return next;
    }
  }

  const maxMatch =
    text.match(
      /(?:sotto|sotto a|entro|massimo|max|fino a|non oltre|meno di)\s*(\d{2,4})\s*(?:€|euro|eur)/i,
    ) || text.match(/\bbudget(?:\s*max)?\s*(\d{2,4})\b/i);

  if (maxMatch) {
    const max = toNumber(maxMatch[1]);
    if (max != null) {
      next[1] = max;
      criteria.push({
        key: "priceMax",
        label: "Budget max",
        value: `${max} EUR`,
      });
    }
  }

  const minMatch = text.match(/(?:almeno|minimo|da)\s*(\d{2,4})\s*(?:€|euro|eur)/i);
  if (minMatch) {
    const min = toNumber(minMatch[1]);
    if (min != null) {
      next[0] = min;
      criteria.push({
        key: "priceMin",
        label: "Budget min",
        value: `${min} EUR`,
      });
    }
  }

  if (next[0] > next[1]) {
    return [Math.min(next[0], next[1]), Math.max(next[0], next[1])];
  }

  return next;
};

const parseRoomsFilters = (text, baseFilters, criteria) => {
  let roomsRange = [...baseFilters.roomsRange];
  let availableRoomsMin = baseFilters.availableRoomsMin;

  if (/\bmonolocale\b/i.test(text)) {
    roomsRange = [1, 1];
    criteria.push({
      key: "monolocale",
      label: "Tipologia",
      value: "Monolocale",
    });
  }

  const roomsRangeMatch = text.match(/(\d{1,2})\s*[-a]\s*(\d{1,2})\s*(?:camere|stanze)/i);
  if (roomsRangeMatch) {
    const first = toNumber(roomsRangeMatch[1]);
    const second = toNumber(roomsRangeMatch[2]);
    if (first != null && second != null) {
      roomsRange = [Math.min(first, second), Math.max(first, second)];
      criteria.push({
        key: "roomsRange",
        label: "Camere",
        value: formatRange(roomsRange),
      });
    }
  } else {
    const roomsMinMatch = text.match(
      /(?:almeno|minimo|min|da|più di)\s*(\d{1,2})\s*(?:camere|stanze)/i,
    );
    if (roomsMinMatch) {
      const roomsMin = toNumber(roomsMinMatch[1]);
      if (roomsMin != null) {
        roomsRange = [roomsMin, APARTMENT_FILTER_DEFAULTS.roomsRange[1]];
        criteria.push({
          key: "roomsMin",
          label: "Camere minime",
          value: `${roomsMin}`,
        });
      }
    } else {
      const exactRoomsMatch = text.match(/(\d{1,2})\s*(?:camere|stanze)/i);
      if (exactRoomsMatch) {
        const exactRooms = toNumber(exactRoomsMatch[1]);
        if (exactRooms != null) {
          roomsRange = [exactRooms, exactRooms];
          criteria.push({
            key: "roomsExact",
            label: "Camere",
            value: `${exactRooms}`,
          });
        }
      }
    }
  }

  const availableRoomsMatch = text.match(
    /(\d{1,2})\s*(?:camere|stanze)\s*(?:disponibili|libere)/i,
  );
  if (availableRoomsMatch) {
    const minAvailable = toNumber(availableRoomsMatch[1]);
    if (minAvailable != null) {
      availableRoomsMin = minAvailable;
      criteria.push({
        key: "availableRooms",
        label: "Stanze disponibili",
        value: `${minAvailable}+`,
      });
    }
  }

  return { roomsRange, availableRoomsMin };
};

const parseBathroomsFilter = (text, baseFilters, criteria) => {
  const match = text.match(
    /(?:almeno|minimo|min|da|più di)?\s*(\d{1,2})\s*(?:bagni|bagno)/i,
  );
  if (!match) return baseFilters.bathroomsMin;

  const value = toNumber(match[1]);
  if (value == null) return baseFilters.bathroomsMin;

  criteria.push({
    key: "bathrooms",
    label: "Bagni minimi",
    value: `${value}`,
  });
  return value;
};

const parseAreaFilter = (text, baseFilters, criteria) => {
  const match = text.match(
    /(?:almeno|minimo|min|da|più di)?\s*(\d{2,4})\s*(?:mq|m2|metri quadrati)/i,
  );
  if (!match) return baseFilters.areaMin;

  const value = toNumber(match[1]);
  if (value == null) return baseFilters.areaMin;

  criteria.push({
    key: "area",
    label: "Superficie minima",
    value: `${value} mq`,
  });
  return value;
};

const parseDistanceFilter = (text, baseFilters, criteria) => {
  const match = text.match(
    /(?:entro|massimo|max|a meno di|meno di|nel raggio di|non più di|distante|distanza)\s*(\d{1,2})\s*km/i,
  );
  if (!match) return baseFilters.distanceKm;

  const value = toNumber(match[1]);
  if (value == null) return baseFilters.distanceKm;

  criteria.push({
    key: "distance",
    label: "Distanza max",
    value: `${value} km`,
  });
  return value;
};

const parseAvailability = (text, baseFilters, criteria) => {
  const immediatePattern =
    /\b(subito|da subito|immediat|disponibil[ei]\s*(?:ora|subito)?)\b/i;
  if (!immediatePattern.test(text)) {
    return baseFilters.availabilityNow;
  }

  criteria.push({
    key: "availabilityNow",
    label: "Disponibilita",
    value: "Subito",
  });
  return true;
};

const parseAmenities = (text, baseFilters, criteria) => {
  const amenities = { ...baseFilters.amenities };

  AMENITY_PATTERNS.forEach((pattern) => {
    if (pattern.regex.test(text)) {
      amenities[pattern.key] = true;
      criteria.push({
        key: pattern.key,
        label: "Servizio",
        value: pattern.label,
      });
    }
  });

  return amenities;
};

const parseRoomTypeFilter = (text, baseFilters, criteria) => {
  const matched = ROOM_TYPE_PATTERNS.find((pattern) =>
    pattern.regex.test(text),
  );

  if (!matched) return baseFilters.roomType;

  criteria.push({
    key: "roomType",
    label: "Tipologia stanza",
    value: matched.label,
  });

  return matched.type;
};

const buildSummary = (criteria) => {
  if (!criteria.length) {
    return "Non ho trovato criteri chiari. Prova con budget, camere, distanza o servizi richiesti.";
  }

  const short = criteria.slice(0, 6).map((entry) => `${entry.label}: ${entry.value}`);
  return `Ho applicato questi criteri: ${short.join(" · ")}`;
};

/**
 * Build a guided-search plan from natural language input.
 * The output is deterministic and maps directly to existing apartment filters.
 *
 * @param {{prompt: string, baseFilters?: object}} params
 * @returns {{uiFilters: object, criteria: Array<{key: string, label: string, value: string}>, summary: string, hasSignals: boolean}}
 */
export const createGuidedSearchFilterPlan = ({
  prompt,
  baseFilters = APARTMENT_FILTER_DEFAULTS,
}) => {
  const rawPrompt = typeof prompt === "string" ? prompt.trim() : "";
  const normalizedBase = normalizeApartmentFilters(baseFilters);

  if (!rawPrompt) {
    return {
      uiFilters: normalizedBase,
      criteria: [],
      summary:
        "Scrivi cosa cerchi, ad esempio: stanza singola sotto 500 euro con Wi-Fi e vicino all'universita.",
      hasSignals: false,
    };
  }

  const criteria = [];
  const priceRange = parsePriceFilters(rawPrompt, normalizedBase, criteria);
  const rooms = parseRoomsFilters(rawPrompt, normalizedBase, criteria);
  const roomType = parseRoomTypeFilter(rawPrompt, normalizedBase, criteria);
  const bathroomsMin = parseBathroomsFilter(rawPrompt, normalizedBase, criteria);
  const areaMin = parseAreaFilter(rawPrompt, normalizedBase, criteria);
  const distanceKm = parseDistanceFilter(rawPrompt, normalizedBase, criteria);
  const availabilityNow = parseAvailability(rawPrompt, normalizedBase, criteria);
  const amenities = parseAmenities(rawPrompt, normalizedBase, criteria);

  const uiFilters = {
    ...normalizedBase,
    priceRange,
    roomsRange: rooms.roomsRange,
    availableRoomsMin: rooms.availableRoomsMin,
    roomType,
    bathroomsMin,
    areaMin,
    distanceKm,
    availabilityNow,
    amenities,
  };

  const unique = uniqueCriteria(criteria);
  const normalized = normalizeApartmentFilters(uiFilters);

  return {
    uiFilters: normalized,
    criteria: unique,
    summary: buildSummary(unique),
    hasSignals: unique.length > 0,
  };
};
