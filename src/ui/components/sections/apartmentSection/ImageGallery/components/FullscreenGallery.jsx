import ImageWithSkeleton from "@/ui/components/common/ImageWithSkeleton";
import GalleryTabs from "./GalleryTabs";
import ThumbnailStrip from "./ThumbnailStrip";
import { CloseButton, FormSelect } from "@/ui/components/common";
import NextButton from "@/ui/components/common/buttons/NextButton";
import PrevButton from "@/ui/components/common/buttons/PrevButton";

export default function FullscreenGallery({
  open,
  onClose,
  activeTab,
  onTabChange,
  roomSections,
  roomFilterId,
  onRoomFilterChange,
  items,
  activeIndex,
  onSelectIndex,
  canPrev,
  canNext,
  onPrev,
  onNext,
  onTouchStart,
  onTouchEnd,
  fallback,
}) {
  if (!open) return null;

  const currentItem = items[activeIndex];
  const roomsAvailable = roomSections.length > 0;

  return (
    <div
      className="fixed inset-0 z-[100] bg-[#f0fafa] flex flex-col items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full h-full">
        <div className="sticky left-0 right-0 top-0 z-10 border-b border-white/10 bg-black/25 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-2">
              <CloseButton onClick={onClose} />
              <div className="hidden sm:block text-xs text-gray-500">
                {items.length
                  ? `${activeIndex + 1} / ${items.length}`
                  : "0 / 0"}
                {currentItem?.label ? ` - ${currentItem.label}` : ""}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <GalleryTabs
                activeTab={activeTab}
                onChange={onTabChange}
                roomsAvailable={roomsAvailable}
              />
              {activeTab === "rooms" && roomsAvailable && (
                <FormSelect
                  id={"stanze"}
                  value={roomFilterId}
                  onChange={onRoomFilterChange}
                  options={[
                    { value: "", label: "Tutte" },
                    ...roomSections.map((room) => {
                      return { value: room.id, label: room.label };
                    }),
                  ]}
                  placeholder="Tutte"
                  className="gap-5 w-64"
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex h-full w-full items-center justify-center sm:px-4">
          <div className="relative flex items-center justify-center mx-auto w-full h-full max-w-7xl pb-[150px]">
            <div
              className="relative flex items-center justify-center w-fit h-full bg-black/10"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              {currentItem ? (
                <ImageWithSkeleton
                  src={currentItem.url}
                  alt={currentItem.label || "Foto"}
                  fallback={fallback}
                  rounded="rounded-none"
                  aspectRatio="aspect-auto"
                  containerClassName="max-h-full max-w-full"
                  imgClassName="object-contain max-h-[85vh]"
                  animation={false}
                />
              ) : (
                <div className="flex h-full min-w-[50vh] items-center justify-center text-gray-600 rounded-xl">
                  Nessuna immagine
                </div>
              )}
            </div>
          </div>
          <div className="hidden sm:block absolute inset-0 w-screen max-w-6xl mx-auto">
            <PrevButton
              onClick={onPrev}
              disabled={!canPrev}
              ariaLabel="Precedente"
              className="left-3 py-2 px-2"
            >
              &#10094;
            </PrevButton>
            <NextButton
              onClick={onNext}
              disabled={!canNext}
              ariaLabel="Successiva"
              className="right-3 py-2 px-2"
            >
              &#10095;
            </NextButton>
          </div>
          <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/25 backdrop-blur-xl">
            <ThumbnailStrip
              items={items}
              activeIndex={activeIndex}
              onSelect={onSelectIndex}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
