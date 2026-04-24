import {
  APARTMENTS,
  PRICES,
  ROOM_OCCUPANCY_STATUS,
  ROOM_TYPES,
} from "@/shared/types";
import {
  getRoomOccupancyConsistencyIssues,
  isRoomOccupancyStatusValid,
  normalizeRoomOccupancy,
} from "@/core/services/RoomOccupancyDomain";

const ROOM_TYPE_VALUES = Object.values(ROOM_TYPES);
const MIN_PUBLISH_PRICE = Math.max(PRICES.MIN_PRICE, 1);
const MIN_ROOM_AREA = APARTMENTS.MIN_ROOM_SQUARE_METERS;
const MAX_ROOM_AREA = APARTMENTS.MAX_ROOM_SQUARE_METERS;
const ROOM_OCCUPANCY_VALUES = Object.values(ROOM_OCCUPANCY_STATUS);

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const toNumber = (value) => {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim().length > 0) {
    return Number(value);
  }
  return Number.NaN;
};

const parseDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value?.toDate === "function") return value.toDate();
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
};

const startOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const getRoomPhotos = (room) => {
  const photoUrls = Array.isArray(room?.photoUrls) ? room.photoUrls : [];
  const photoFiles = Array.isArray(room?.photoFiles) ? room.photoFiles : [];
  return [...photoUrls, ...photoFiles].filter(Boolean);
};

export const RoomValidator = {
  /**
   * Valida una singola stanza nel contesto del form pubblica annuncio.
   *
   * @param {object} [room={}] - Dati della stanza.
   * @param {object} [options={}] - Opzioni di validazione.
   * @param {number|null} [options.index=null] - Indice stanza nel form (per path errore).
   * @param {Date} [options.now=new Date()] - Data di riferimento per controlli temporali.
   * @returns {{isValid: boolean, errors: Array<{field: string, message: string}>}}
   */
  validate(room = {}, { index = null, now = new Date() } = {}) {
    const errors = [];
    const fieldPrefix = index !== null ? `rooms.${index}` : "room";

    if (!ROOM_TYPE_VALUES.includes(room?.type)) {
      errors.push({
        field: `${fieldPrefix}.type`,
        message: "Tipologia stanza non valida.",
      });
    }

    const price = toNumber(room?.priceMonthly);
    if (!Number.isFinite(price) || price < MIN_PUBLISH_PRICE) {
      errors.push({
        field: `${fieldPrefix}.priceMonthly`,
        message: `Il prezzo deve essere almeno ${MIN_PUBLISH_PRICE}.`,
      });
    } else if (price > PRICES.MAX_PRICE) {
      errors.push({
        field: `${fieldPrefix}.priceMonthly`,
        message: `Il prezzo non puo superare ${PRICES.MAX_PRICE}.`,
      });
    }

    const area = toNumber(room?.areaMq);
    if (!Number.isFinite(area) || area < MIN_ROOM_AREA) {
      errors.push({
        field: `${fieldPrefix}.areaMq`,
        message: `La superficie deve essere almeno ${MIN_ROOM_AREA} mq.`,
      });
    } else if (area > MAX_ROOM_AREA) {
      errors.push({
        field: `${fieldPrefix}.areaMq`,
        message: `La superficie non puo superare ${MAX_ROOM_AREA} mq.`,
      });
    }

    if (!isNonEmptyString(room?.furnishing)) {
      errors.push({
        field: `${fieldPrefix}.furnishing`,
        message: "Seleziona l'arredamento della stanza.",
      });
    }

    const availability = room?.availability || {};
    if (typeof availability?.isAvailableNow !== "boolean") {
      errors.push({
        field: `${fieldPrefix}.availability.isAvailableNow`,
        message: "Indica la disponibilita attuale della stanza.",
      });
    }

    if (availability?.isAvailableNow === false) {
      const availableFrom = parseDate(availability?.availableFrom);
      if (!availableFrom) {
        errors.push({
          field: `${fieldPrefix}.availability.availableFrom`,
          message: "Inserisci una data di disponibilita valida.",
        });
      } else if (availableFrom < startOfDay(now)) {
        errors.push({
          field: `${fieldPrefix}.availability.availableFrom`,
          message: "La data di disponibilita non puo essere nel passato.",
        });
      }
    }

    const photos = getRoomPhotos(room);
    if (!photos.length) {
      errors.push({
        field: `${fieldPrefix}.photoFiles`,
        message: "Carica almeno una foto della stanza.",
      });
    }

    const occupancy = normalizeRoomOccupancy(
      room?.occupancy || {},
      room?.occupantIds || [],
      availability
    );
    if (!isRoomOccupancyStatusValid(occupancy.status)) {
      errors.push({
        field: `${fieldPrefix}.occupancy.status`,
        message: `Lo stato occupazione deve essere uno tra: ${ROOM_OCCUPANCY_VALUES.join(", ")}.`,
      });
    }

    if (!Number.isInteger(occupancy.capacityTotal) || occupancy.capacityTotal <= 0) {
      errors.push({
        field: `${fieldPrefix}.occupancy.capacityTotal`,
        message: "La capienza stanza deve essere almeno 1.",
      });
    }

    if (
      !Number.isInteger(occupancy.spotsOccupied) ||
      occupancy.spotsOccupied < 0 ||
      occupancy.spotsOccupied > occupancy.capacityTotal
    ) {
      errors.push({
        field: `${fieldPrefix}.occupancy.spotsOccupied`,
        message: "I posti occupati non possono superare la capienza.",
      });
    }

    const consistencyIssues = getRoomOccupancyConsistencyIssues({
      availability,
      occupancy: room?.occupancy || {},
    });
    consistencyIssues.forEach((issue) => {
      errors.push({
        field: `${fieldPrefix}.${issue.field}`,
        message: issue.message,
      });
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};
