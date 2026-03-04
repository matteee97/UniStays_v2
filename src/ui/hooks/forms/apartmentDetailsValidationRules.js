import { ERROR_MESSAGES, FILES, VALIDATION } from "@/shared/types";
import { validators } from "./useFormValidation";

const getApartmentPhotosCount = (formData) => {
  const urlsCount = Array.isArray(formData?.apartmentPhotoUrls)
    ? formData.apartmentPhotoUrls.length
    : 0;
  const filesCount = Array.isArray(formData?.apartmentPhotoFiles)
    ? formData.apartmentPhotoFiles.length
    : 0;
  return urlsCount + filesCount;
};

export const buildApartmentDetailsValidationRules = () => ({
  title: [
    validators.required(ERROR_MESSAGES.REQUIRED),
    validators.minLength(
      VALIDATION.MIN_TITLE_LENGTH,
      ERROR_MESSAGES.MIN_LENGTH(VALIDATION.MIN_TITLE_LENGTH)
    ),
    validators.maxLength(
      VALIDATION.MAX_TITLE_LENGTH,
      ERROR_MESSAGES.MAX_LENGTH(VALIDATION.MAX_TITLE_LENGTH)
    ),
  ],
  description: [
    validators.required(ERROR_MESSAGES.REQUIRED),
    validators.minLength(
      VALIDATION.MIN_DESCRIPTION_LENGTH,
      ERROR_MESSAGES.MIN_LENGTH(VALIDATION.MIN_DESCRIPTION_LENGTH)
    ),
    validators.maxLength(
      VALIDATION.MAX_DESCRIPTION_LENGTH,
      ERROR_MESSAGES.MAX_LENGTH(VALIDATION.MAX_DESCRIPTION_LENGTH)
    ),
  ],
  "address.street": [validators.required(ERROR_MESSAGES.REQUIRED)],
  "address.city": [validators.required(ERROR_MESSAGES.REQUIRED)],
  "address.postalCode": [
    validators.required(ERROR_MESSAGES.REQUIRED),
    validators.custom(
      (value) => VALIDATION.CAP_REGEX.test(value),
      ERROR_MESSAGES.CAP
    ),
  ],
  "features.totalAreaMq": [
    validators.required(ERROR_MESSAGES.REQUIRED),
    validators.numeric(ERROR_MESSAGES.NUMERIC),
    validators.min(1, ERROR_MESSAGES.MIN(1)),
  ],
  "features.bathroomsCount": [
    validators.required(ERROR_MESSAGES.REQUIRED),
    validators.numeric(ERROR_MESSAGES.NUMERIC),
    validators.min(1, ERROR_MESSAGES.MIN(1)),
  ],
  apartmentPhotoFiles: [
    validators.custom(
      (value, currentFormData) =>
        getApartmentPhotosCount(currentFormData) >= FILES.MIN_COUNT,
      `Almeno ${FILES.MIN_COUNT} ${
        FILES.MIN_COUNT === 1
          ? "immagine è obbligatoria"
          : "immagini sono obbligatorie"
      }`
    ),
    validators.custom(
      (value, currentFormData) =>
        getApartmentPhotosCount(currentFormData) <= FILES.MAX_COUNT,
      `Massimo ${FILES.MAX_COUNT} immagini generali`
    ),
  ],
  "features.heatingType": [
    validators.required("Seleziona il tipo di riscaldamento"),
  ],
  "features.floor": [validators.required("Seleziona il piano")],
  "amenities.kitchenType": [
    validators.required("Seleziona il tipo di cucina"),
  ],
  "features.propertyCondition": [
    validators.required("Seleziona lo stato dell'immobile"),
  ],
  "houseRules.studentsOnly": [
    validators.required("Seleziona la tipologia di studenti"),
  ],
  "features.garageType": [
    validators.required("Seleziona il tipo di garage"),
  ],
  "features.gardenType": [
    validators.required("Seleziona il tipo di giardino"),
  ],
});
