"use strict";

const ROOM_OCCUPANCY_STATUS = Object.freeze({
  FREE: "free",
  OCCUPIED: "occupied",
  PARTIALLY_OCCUPIED: "partially_occupied",
  AVAILABLE_WITH_OCCUPANTS: "available_with_occupants",
  UNKNOWN: "unknown",
});

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

const isRoomOccupancyStatusValid = (status) =>
  ROOM_OCCUPANCY_VALUES.includes(status);

const inferStatus = ({ spotsOccupied, capacityTotal, requestedStatus }) => {
  if (spotsOccupied <= 0) return ROOM_OCCUPANCY_STATUS.FREE;
  if (spotsOccupied >= capacityTotal) return ROOM_OCCUPANCY_STATUS.OCCUPIED;
  if (requestedStatus === ROOM_OCCUPANCY_STATUS.AVAILABLE_WITH_OCCUPANTS) {
    return ROOM_OCCUPANCY_STATUS.AVAILABLE_WITH_OCCUPANTS;
  }
  return ROOM_OCCUPANCY_STATUS.PARTIALLY_OCCUPIED;
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

const isRoomOccupancyStatusAllowedForAvailability = (
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

const normalizeRoomOccupancy = (
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
  const inferredStatus = inferStatus({
    spotsOccupied,
    capacityTotal,
    requestedStatus,
  });
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

module.exports = {
  ROOM_OCCUPANCY_STATUS,
  normalizeRoomOccupancy,
};
