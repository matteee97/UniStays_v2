import { ROOM_OCCUPANCY_STATUS } from "@/shared/types";

const ROOM_OCCUPANCY_VALUES = Object.values(ROOM_OCCUPANCY_STATUS);
const MAX_CAPACITY = 16;

const toInt = (value, fallback) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.trunc(parsed);
};

const clampInt = (value, min, max, fallback = min) => {
  const parsed = toInt(value, fallback);
  if (parsed < min) return min;
  if (parsed > max) return max;
  return parsed;
};

const inferStatus = ({ spotsOccupied, capacityTotal, requestedStatus }) => {
  if (spotsOccupied <= 0) return ROOM_OCCUPANCY_STATUS.FREE;
  if (spotsOccupied >= capacityTotal) return ROOM_OCCUPANCY_STATUS.OCCUPIED;
  if (requestedStatus === ROOM_OCCUPANCY_STATUS.AVAILABLE_WITH_OCCUPANTS) {
    return ROOM_OCCUPANCY_STATUS.AVAILABLE_WITH_OCCUPANTS;
  }
  return ROOM_OCCUPANCY_STATUS.PARTIALLY_OCCUPIED;
};

export const isRoomOccupancyStatusValid = (status) =>
  ROOM_OCCUPANCY_VALUES.includes(status);

export const isRoomOccupancyStatusAllowedForAvailability = (
  status,
  isAvailableNow
) => {
  if (!isRoomOccupancyStatusValid(status)) return false;
  if (isAvailableNow === true && status === ROOM_OCCUPANCY_STATUS.OCCUPIED) {
    return false;
  }
  if (
    isAvailableNow === false &&
    status === ROOM_OCCUPANCY_STATUS.AVAILABLE_WITH_OCCUPANTS
  ) {
    return false;
  }
  return true;
};

const isStatusCoherentWithSpots = ({ status, spotsOccupied, capacityTotal }) => {
  if (!isRoomOccupancyStatusValid(status)) return true;

  if (status === ROOM_OCCUPANCY_STATUS.FREE) {
    return spotsOccupied === 0;
  }
  if (status === ROOM_OCCUPANCY_STATUS.OCCUPIED) {
    return spotsOccupied === capacityTotal;
  }
  if (
    status === ROOM_OCCUPANCY_STATUS.PARTIALLY_OCCUPIED ||
    status === ROOM_OCCUPANCY_STATUS.AVAILABLE_WITH_OCCUPANTS
  ) {
    return spotsOccupied > 0 && spotsOccupied < capacityTotal;
  }
  return true;
};

export const getRoomOccupancyConsistencyIssues = ({
  availability = {},
  occupancy = {},
} = {}) => {
  const issues = [];
  const status =
    typeof occupancy?.status === "string" ? occupancy.status.trim() : "";
  const capacityTotal = toInt(occupancy?.capacityTotal, Number.NaN);
  const spotsOccupied = toInt(occupancy?.spotsOccupied, Number.NaN);
  const isAvailableNow = availability?.isAvailableNow;

  if (
    isRoomOccupancyStatusValid(status) &&
    typeof isAvailableNow === "boolean" &&
    !isRoomOccupancyStatusAllowedForAvailability(status, isAvailableNow)
  ) {
    issues.push({
      field: "occupancy.status",
      message:
        isAvailableNow === true
          ? "Se la stanza e disponibile subito non puo essere occupata."
          : "Se la stanza non e disponibile subito non puo essere 'disponibile con coinquilini presenti'.",
    });
  }

  if (
    isRoomOccupancyStatusValid(status) &&
    Number.isInteger(capacityTotal) &&
    capacityTotal > 0 &&
    Number.isInteger(spotsOccupied) &&
    spotsOccupied >= 0 &&
    !isStatusCoherentWithSpots({ status, spotsOccupied, capacityTotal })
  ) {
    issues.push({
      field: "occupancy.spotsOccupied",
      message:
        "Posti occupati incoerenti con lo stato stanza (libera=0, occupata=posti pieni, parziale=valore intermedio).",
    });
  }

  return issues;
};

export const normalizeRoomOccupancy = (
  occupancy = {},
  occupantIds = [],
  availability = null
) => {
  const occupantsCount = Array.isArray(occupantIds) ? occupantIds.length : 0;
  const minCapacity = Math.max(1, occupantsCount);
  const maxCapacity = Math.max(MAX_CAPACITY, minCapacity);
  const capacityTotal = clampInt(
    occupancy?.capacityTotal,
    minCapacity,
    maxCapacity,
    minCapacity
  );
  const spotsOccupied = clampInt(
    occupancy?.spotsOccupied,
    0,
    capacityTotal,
    Math.min(capacityTotal, occupantsCount)
  );
  const spotsAvailable = Math.max(capacityTotal - spotsOccupied, 0);
  const requestedStatus =
    typeof occupancy?.status === "string" ? occupancy.status : "";
  const inferredStatus = inferStatus({ spotsOccupied, capacityTotal, requestedStatus });
  let status = isRoomOccupancyStatusValid(requestedStatus)
    ? requestedStatus
    : inferredStatus;

  if (!isStatusCoherentWithSpots({ status, spotsOccupied, capacityTotal })) {
    status = inferredStatus;
  }

  const isAvailableNow = availability?.isAvailableNow;
  if (
    typeof isAvailableNow === "boolean" &&
    !isRoomOccupancyStatusAllowedForAvailability(status, isAvailableNow)
  ) {
    if (isAvailableNow === true && status === ROOM_OCCUPANCY_STATUS.OCCUPIED) {
      status =
        spotsOccupied > 0 && spotsOccupied < capacityTotal
          ? ROOM_OCCUPANCY_STATUS.AVAILABLE_WITH_OCCUPANTS
          : ROOM_OCCUPANCY_STATUS.FREE;
    } else if (
      isAvailableNow === false &&
      status === ROOM_OCCUPANCY_STATUS.AVAILABLE_WITH_OCCUPANTS
    ) {
      status =
        spotsOccupied > 0 && spotsOccupied < capacityTotal
          ? ROOM_OCCUPANCY_STATUS.PARTIALLY_OCCUPIED
          : inferredStatus;
    }
  }

  return {
    status,
    capacityTotal,
    spotsOccupied,
    spotsAvailable,
  };
};
