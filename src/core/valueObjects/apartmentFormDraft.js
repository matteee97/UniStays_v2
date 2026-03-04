import { createRoomDraft } from "./roomDraft";

const createDefaultFormState = () => ({
  title: "",
  description: "",
  address: {
    street: "",
    city: "",
    provinceCode: "",
    postalCode: "",
    area: "",
  },
  features: {
    totalAreaMq: 50,
    bathroomsCount: 1,
    heatingType: "",
    utilitiesIncluded: false,
    floor: "",
    propertyCondition: "",
    garageType: "",
    gardenType: "",
  },
  houseRules: {
    studentsOnly: "",
    petsAllowed: false,
    smokingAllowed: false,
    partiesForbidden: true,
  },
  amenities: {
    parking: false,
    wifi: false,
    airConditioning: false,
    kitchenType: "",
    washer: false,
    elevator: false,
    balcony: false,
    kitchenBasics: false,
    kitchenware: false,
    dishwasher: false,
    oven: false,
    tv: false,
    deskInRoom: false,
    dryer: false,
    microwave: false,
  },
  additionalInfo: "",
  apartmentPhotoFiles: [],
  apartmentPhotoUrls: [],
  rooms: [createRoomDraft()],
  ownerDetails: {
    firstName: "",
    lastName: "",
    phone: "",
    isAgency: false,
    bio: "",
  },
});

export const createApartmentFormDraft = (apartment = {}) => {
  const defaults = createDefaultFormState();
  const draft = {
    ...defaults,
    ...apartment,
    address: {
      ...defaults.address,
      ...(apartment.address || {}),
    },
    features: {
      ...defaults.features,
      ...(apartment.features || {}),
    },
    houseRules: {
      ...defaults.houseRules,
      ...(apartment.houseRules || {}),
    },
    amenities: {
      ...defaults.amenities,
      ...(apartment.amenities || {}),
    },
    ownerDetails: {
      ...defaults.ownerDetails,
      ...(apartment.ownerDetails || {}),
    },
    apartmentPhotoFiles: [],
    apartmentPhotoUrls: Array.isArray(apartment.apartmentPhotoUrls)
      ? apartment.apartmentPhotoUrls
      : [],
    rooms: Array.isArray(apartment.rooms) && apartment.rooms.length
      ? apartment.rooms
      : defaults.rooms,
  };

  const totalArea = Number(draft.features?.totalAreaMq);
  if (Number.isFinite(totalArea)) {
    draft.features.totalAreaMq = totalArea;
  }

  const bathrooms = Number(draft.features?.bathroomsCount);
  if (Number.isFinite(bathrooms)) {
    draft.features.bathroomsCount = bathrooms;
  }

  const floorValue = draft.features?.floor;
  if (Number.isFinite(Number(floorValue))) {
    draft.features.floor = String(floorValue);
  }

  return draft;
};
