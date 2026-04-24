import { formatDate } from "@/ui/helpers/formatDate";
import { FALLBACK_IMAGE } from "@/ui/shared/constants";

const ROOM_TYPE_LABELS = {
  single: "Singola",
  double: "Doppia",
  entire_apartment: "Intero appartamento",
};

export const formatRoomPrice = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return amount.toLocaleString("it-IT");
};

export const formatRoomArea = (value) => {
  const area = Number(value);
  if (!Number.isFinite(area) || area <= 0) return null;
  return `${area} m²`;
};

export const formatRoomFurnishing = (value) => {
  if (!value) return "Non specificato";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const formatRoomAvailability = (availability = {}) => {
  if (availability?.isAvailableNow) return "Disponibile subito";
  if (availability?.availableFrom) {
    const dateLabel = formatDate(availability.availableFrom, "it-IT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    return `Disponibile dal ${dateLabel}`;
  }
  return "Disponibilita su richiesta";
};

/**
 * Converte il payload raw delle stanze in una view model pronta per card e modal.
 */
export const buildRoomPreviewItems = (rooms = [], roommatesByRoomId = {}) => {
  if (!Array.isArray(rooms)) return [];

  return rooms
    .map((room, index) => {
      if (!room) return null;

      const roomId = room?.roomId || room?.id || `room-${index}`;
      const mappedTypeLabel = ROOM_TYPE_LABELS[room?.type] || "";
      const typeLabel = mappedTypeLabel || "Tipologia non specificata";
      const suffix = mappedTypeLabel ? ` (${mappedTypeLabel})` : "";
      const images =
        Array.isArray(room?.photoUrls) && room.photoUrls.length
          ? room.photoUrls
          : [FALLBACK_IMAGE];
      const assignedOccupantsCount = Array.isArray(room?.occupantIds)
        ? room.occupantIds.filter((value) => typeof value === "string").length
        : Number(room?.occupancy?.spotsOccupied) || 0;
      const roommates = roommatesByRoomId[roomId] || [];

      return {
        id: roomId,
        label: `Stanza ${index + 1}${suffix}`,
        typeLabel,
        images,
        image: images[0],
        room,
        roommates,
        assignedOccupantsCount,
        hasHiddenOccupants: assignedOccupantsCount > roommates.length,
      };
    })
    .filter(Boolean);
};
