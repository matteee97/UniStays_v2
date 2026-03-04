import { useMemo } from "react";
import {
  buildApartmentItems,
  buildGalleryItems,
  buildRoomItems,
  buildRoomSections,
  normalizeApartmentImages,
} from "../utils/galleryUtils";


/**
 * Hook che restituisce i dati per la galleria delle immagini
 * dell'appartamento.
 *
 * @param {Array<string>} images - Lista delle immagini dell'appartamento.
 * @param {Array<string>} apartmentImages - Lista delle immagini dell'appartamento.
 * @param {Array<object>} rooms - Lista delle stanze con le relative immagini.
 * @param {string} activeTab - Tab attivo corrente.
 * @param {string} roomFilterId - Id della stanza selezionata corrente.
 * @param {string} fallback - Url dell'immagine di fallback.
 *
 * @returns {Object} Oggetto contenente i dati per la galleria.
 */
export default function useGalleryData({
  images = [],
  apartmentImages,
  rooms = [],
  activeTab,
  roomFilterId,
  fallback,
}) {
  const validImages = useMemo(() => images.filter(Boolean), [images]);
  const validApartmentImages = useMemo(
    () => normalizeApartmentImages(apartmentImages, images),
    [apartmentImages, images]
  );
  const previewImages = useMemo(() => validImages.slice(0, 5), [validImages]);

  const roomSections = useMemo(
    () => buildRoomSections(rooms, fallback),
    [rooms, fallback]
  );
  const roomItemsFlat = useMemo(() => buildRoomItems(roomSections), [roomSections]);
  const apartmentItems = useMemo(
    () => buildApartmentItems(validApartmentImages, fallback),
    [validApartmentImages, fallback]
  );
  const galleryItems = useMemo(
    () =>
      buildGalleryItems({
        activeTab,
        apartmentItems,
        roomSections,
        roomFilterId,
      }),
    [activeTab, apartmentItems, roomSections, roomFilterId]
  );
  const hasGalleryImages =
    validApartmentImages.length > 0 || roomItemsFlat.length > 0;

  return {
    validImages,
    validApartmentImages,
    previewImages,
    roomSections,
    roomItemsFlat,
    apartmentItems,
    galleryItems,
    hasGalleryImages,
  };
}
