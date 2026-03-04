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
  notes: "",
});
