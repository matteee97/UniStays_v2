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

export const ApartmentAggregateCalculator = {
  calculate(rooms = []) {
    const safeRooms = Array.isArray(rooms) ? rooms : [];
    const prices = [];
    const availabilityDates = [];
    const roomTypes = new Set();
    let totalRoomsAvailable = 0;
    let roomsAreaTotalMq = 0;

    safeRooms.forEach((room) => {
      if (typeof room?.type === "string" && room.type.trim().length > 0) {
        roomTypes.add(room.type.trim());
      }

      const price = toNumber(room?.priceMonthly);
      if (Number.isFinite(price) && price > 0) {
        prices.push(price);
      }

      const area = toNumber(room?.areaMq);
      if (Number.isFinite(area) && area > 0) {
        roomsAreaTotalMq += area;
      }

      if (room?.availability?.isAvailableNow === true) {
        totalRoomsAvailable += 1;
      }

      if (room?.availability?.isAvailableNow === false) {
        const availableFrom = parseDate(room?.availability?.availableFrom);
        if (availableFrom) {
          availabilityDates.push(availableFrom);
        }
      }
    });

    const totalRooms = safeRooms.length;
    const minRoomPrice = prices.length ? Math.min(...prices) : null;
    const maxRoomPrice = prices.length ? Math.max(...prices) : null;
    const availableFromMin = availabilityDates.length
      ? new Date(Math.min(...availabilityDates.map((date) => date.getTime())))
      : null;

    return {
      minRoomPrice,
      maxRoomPrice,
      totalRooms,
      totalRoomsAvailable,
      roomTypes: Array.from(roomTypes).sort(),
      isAvailableNow: totalRoomsAvailable > 0,
      availableFromMin,
      roomsAreaTotalMq,
    };
  },
};
