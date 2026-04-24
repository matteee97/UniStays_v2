import { ERROR_MESSAGES } from "@/shared/types";
import { validators } from "./useFormValidation";
import { ROOM_OCCUPANCY_STATUS } from "../../../shared/types";

const getRoomPhotosCount = (room) => {
  const filesCount = Array.isArray(room?.photoFiles)
    ? room.photoFiles.length
    : 0;
  const urlsCount = Array.isArray(room?.photoUrls) ? room.photoUrls.length : 0;
  return filesCount + urlsCount;
};

export const buildRoomsValidationRules = (
  formData,
  { includeRoomFields = true } = {}
) => {
  const rooms = Array.isArray(formData?.rooms) ? formData.rooms : [];
  const totalAreaMq = formData?.features?.totalAreaMq;

  const rules = {
    rooms: [
      validators.custom(
        (value, currentFormData) => {
          const currentRooms = Array.isArray(value) ? value : [];
          const totalArea = Number(currentFormData?.features?.totalAreaMq);
          if (!Number.isFinite(totalArea) || totalArea <= 0) return true;
          const roomsTotal = currentRooms.reduce((sum, room) => {
            const area = Number(room?.areaMq);
            return sum + (Number.isNaN(area) ? 0 : area);
          }, 0);
          return roomsTotal <= totalArea;
        },
        `L'area totale delle stanze non può superare la superficie totale dell'appartamento (${totalAreaMq} mq)`
      ),
    ],
  };

  if (includeRoomFields) {
    rooms.forEach((_, index) => {
      rules[`rooms.${index}.type`] = [
        validators.required("Seleziona la tipologia stanza"),
      ];
      rules[`rooms.${index}.priceMonthly`] = [
        validators.required(ERROR_MESSAGES.REQUIRED),
        validators.numeric(ERROR_MESSAGES.NUMERIC),
        validators.min(1, ERROR_MESSAGES.MIN(1)),
      ];
      rules[`rooms.${index}.areaMq`] = [
        validators.required(ERROR_MESSAGES.REQUIRED),
        validators.numeric(ERROR_MESSAGES.NUMERIC),
        validators.min(1, ERROR_MESSAGES.MIN(1)),
      ];
      rules[`rooms.${index}.furnishing`] = [
        validators.required("Seleziona l'arredamento della stanza"),
      ];
      rules[`rooms.${index}.occupancy.status`] = [
        validators.required("Seleziona lo stato occupazione della stanza"),
        validators.custom(
          (value, currentFormData) => {
            const isAvailableNow = currentFormData?.rooms?.[index].availability.isAvailableNow;
            return isAvailableNow && value !== ROOM_OCCUPANCY_STATUS.OCCUPIED || !isAvailableNow && value === ROOM_OCCUPANCY_STATUS.OCCUPIED;
          }
          ,
          "Lo stato occupazione della stanza non puo essere modificato se non corrisponde con la disponibilita."
        )
      ];
      rules[`rooms.${index}.occupancy.capacityTotal`] = [
        validators.required(ERROR_MESSAGES.REQUIRED),
        validators.numeric(ERROR_MESSAGES.NUMERIC),
        validators.min(1, ERROR_MESSAGES.MIN(1)),
      ];
      rules[`rooms.${index}.occupancy.spotsOccupied`] = [
        validators.required(ERROR_MESSAGES.REQUIRED),
        validators.numeric(ERROR_MESSAGES.NUMERIC),
        validators.min(0, ERROR_MESSAGES.MIN(0)),
        validators.custom(
          (value, currentFormData) => {
            const room = currentFormData?.rooms?.[index];
            const capacity = Number(room?.occupancy?.capacityTotal);
            const occupied = Number(value);
            if (!Number.isFinite(capacity) || !Number.isFinite(occupied)) {
              return false;
            }
            return occupied <= capacity;
          },
          "I posti occupati non possono superare la capienza."
        ),
      ];
      rules[`rooms.${index}.photoFiles`] = [
        validators.custom(
          (value, currentFormData) => {
            const room = currentFormData?.rooms?.[index];
            return getRoomPhotosCount(room) > 0;
          },
          "Carica almeno una foto della stanza"
        ),
      ];
      rules[`rooms.${index}.availability.availableFrom`] = [
        validators.custom(
          (value, currentFormData) => {
            const availability = currentFormData?.rooms?.[index]?.availability;
            if (!availability || availability.isAvailableNow === true) {
              return true;
            }
            if (!value) return false;
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return false;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return date >= today;
          },
          "Inserisci una data di disponibilita valida"
        ),
      ];
    });
  }

  return rules;
};
