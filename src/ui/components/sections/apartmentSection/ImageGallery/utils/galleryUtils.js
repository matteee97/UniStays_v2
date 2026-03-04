export const ROOM_TYPE_LABELS = {
  single: "Singola",
  double: "Doppia",
  entire_apartment: "Intero appartamento",
};

export const normalizeApartmentImages = (apartmentImages, images = []) => {
  const source = Array.isArray(apartmentImages) ? apartmentImages : images;
  return source.filter(Boolean);
};

export const buildRoomSections = (rooms = [], fallback) => {
  if (!Array.isArray(rooms)) return [];
  return rooms
    .map((room, index) => {
      if (!room) return null;
      const roomImages = Array.isArray(room?.photoUrls)
        ? room.photoUrls.filter(Boolean)
        : [];
      const mappedTypeLabel = ROOM_TYPE_LABELS[room?.type] || "";
      const typeLabel = mappedTypeLabel || "Tipologia non specificata";
      const label = `Stanza ${index + 1}`;
      const displayLabel = mappedTypeLabel ? `${label} - ${mappedTypeLabel}` : label;
      return {
        id: room?.roomId || room?.id || `room-${index}`,
        label,
        displayLabel,
        typeLabel,
        images: roomImages.length ? roomImages : [fallback],
      };
    })
    .filter(Boolean);
};

export const buildRoomItems = (roomSections = []) =>
  roomSections.flatMap((room) =>
    room.images.map((url, imageIndex) => ({
      url,
      roomId: room.id,
      label: room.label,
      imageIndex,
    }))
  );

export const buildApartmentItems = (validApartmentImages = [], fallback) => {
  if (validApartmentImages.length) {
    return validApartmentImages.map((url) => ({
      url,
      label: "Alloggio",
    }));
  }

  return [{ url: fallback, label: "Alloggio" }];
};

export const buildGalleryItems = ({
  activeTab,
  apartmentItems,
  roomSections,
  roomFilterId,
}) => {
  if (activeTab === "apartment") return apartmentItems;

  const filteredRooms = roomFilterId
    ? roomSections.filter((room) => room.id === roomFilterId)
    : roomSections;

  return filteredRooms.flatMap((room) =>
    room.images.map((url, imageIndex) => ({
      url,
      roomId: room.id,
      label: room.label,
      imageIndex,
    }))
  );
};
