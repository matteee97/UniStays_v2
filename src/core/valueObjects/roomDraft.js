import { ROOM_OCCUPANCY_STATUS } from "@/shared/types";

export const createRoomDraft = () => ({
  type: "",
  priceMonthly: 0,
  areaMq: "",
  furnishing: "",
  availability: {
    isAvailableNow: true,
    availableFrom: "",
  },
  photoFiles: [],
  photoUrls: [],
  occupancy: {
    status: ROOM_OCCUPANCY_STATUS.FREE,
    capacityTotal: 1,
    spotsOccupied: 0,
    spotsAvailable: 1,
  },
  occupantIds: [],
  notes: "",
});
