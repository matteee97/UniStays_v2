import { useCallback, useState } from "react";
import { usePreloadImages } from "@/ui/hooks/ui/usePreloadImages";
import { FALLBACK_IMAGE } from "@/ui/shared/constants";
import GalleryPreviewGrid from "./components/GalleryPreviewGrid";
import FullscreenGallery from "./components/FullscreenGallery";
import useGalleryData from "./hooks/useGalleryData";
import useGalleryNavigation from "./hooks/useGalleryNavigation";

/**
 * Mostra una galleria di immagini dell'appartamento.
 * La galleria contiene al massimo 5 immagini, che vengono
 * mostrate in una griglia di 2 colonne per immagine.
 * Se ci sono piu di 5 immagini, viene mostrato un bottone
 * che consente di aprire una vista completa con tutte le immagini
 * organizzate per appartamento e stanze.
 * La vista completa viene chiusa quando si preme il bottone di chiusura.
 *
 * @param {Array<string>} images - Lista di indirizzi delle immagini
 * da mostrare nella griglia principale.
 * @param {Array<string>} apartmentImages - Lista di indirizzi delle immagini
 * dell'appartamento da mostrare in sezione dedicata.
 * @param {Array<object>} rooms - Lista delle stanze con le relative immagini.
 * @returns {JSX.Element} - La galleria di immagini.
 */
export default function ImageGallery({
  images = [],
  apartmentImages,
  rooms = [],
}) {
  const [showCarousel, setShowCarousel] = useState(false);
  const [activeTab, setActiveTab] = useState("apartment");
  const [roomFilterId, setRoomFilterId] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const {
    validImages,
    validApartmentImages,
    previewImages,
    roomSections,
    roomItemsFlat,
    galleryItems,
    hasGalleryImages,
  } = useGalleryData({
    images,
    apartmentImages,
    rooms,
    activeTab,
    roomFilterId,
    fallback: FALLBACK_IMAGE,
  });

  const { ready } = usePreloadImages(previewImages, FALLBACK_IMAGE);

  const openGallery = useCallback(
    ({ tab, index = 0, roomId = "" } = {}) => {
      if (!hasGalleryImages) return;
      const nextTab =
        tab || (validApartmentImages.length ? "apartment" : "rooms");
      setActiveTab(nextTab);
      setRoomFilterId(roomId);
      setActiveIndex(index);
      setShowCarousel(true);
    },
    [hasGalleryImages, validApartmentImages.length]
  );

  const closeGallery = useCallback(() => {
    setShowCarousel(false);
  }, []);

  const handleImageClick = useCallback(
    (index) => {
      if (!validImages[index]) return;
      const apartmentCount = validApartmentImages.length;
      if (index < apartmentCount || !roomItemsFlat.length) {
        openGallery({ tab: "apartment", index });
        return;
      }
      const roomIndex = index - apartmentCount;
      const roomItem = roomItemsFlat[roomIndex];
      if (!roomItem) {
        openGallery({ tab: "rooms", index: 0 });
        return;
      }
      openGallery({
        tab: "rooms",
        index: roomItem.imageIndex,
        roomId: roomItem.roomId,
      });
    },
    [validImages, validApartmentImages.length, roomItemsFlat, openGallery]
  );

  const handleTabChange = useCallback((nextTab) => {
    setActiveTab(nextTab);
    setActiveIndex(0);
    if (nextTab === "apartment") setRoomFilterId("");
  }, []);

  const handleRoomFilterChange = useCallback((event) => {
    setRoomFilterId(event.target.value);
    setActiveIndex(0);
  }, []);

  const { canPrev, canNext, goPrev, goNext, handleTouchStart, handleTouchEnd } =
    useGalleryNavigation({
      open: showCarousel,
      itemsLength: galleryItems.length,
      activeIndex,
      setActiveIndex,
      onClose: closeGallery,
    });

  const hiddenImagesCount = Math.max(
    validImages.length - previewImages.length,
    0
  );

  return (
    <>
      <GalleryPreviewGrid
        ready={ready}
        previewImages={previewImages}
        fallback={FALLBACK_IMAGE}
        onImageClick={handleImageClick}
        onOpenGallery={openGallery}
        hiddenImagesCount={hiddenImagesCount}
      />

      <FullscreenGallery
        open={showCarousel}
        onClose={closeGallery}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        roomSections={roomSections}
        roomFilterId={roomFilterId}
        onRoomFilterChange={handleRoomFilterChange}
        items={galleryItems}
        activeIndex={activeIndex}
        onSelectIndex={setActiveIndex}
        canPrev={canPrev}
        canNext={canNext}
        onPrev={goPrev}
        onNext={goNext}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        fallback={FALLBACK_IMAGE}
      />
    </>
  );
}
