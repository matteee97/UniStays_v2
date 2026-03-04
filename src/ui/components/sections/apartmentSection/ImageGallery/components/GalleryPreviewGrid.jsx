import ImageWithSkeleton from "@/ui/components/common/ImageWithSkeleton";
import ImgSkeleton from "@/ui/components/common/shared/icons/ImgSkeleton";

function getGalleryImageClasses(index) {
  const isMain = index === 0;
  return `${index === 2 ? " md:rounded-tr-3xl " : ""}${
    index === 3 ? " rounded-bl-3xl md:rounded-none " : ""
  }${index === 4 ? "rounded-br-3xl" : ""}
              object-cover w-full cursor-pointer border-4 border-[#d4f1ef] overflow-hidden ${
                isMain
                  ? "col-span-2 md:col-span-3 row-span-2 h-[300px] sm:h-[500px] rounded-t-3xl md:rounded-tr-none md:rounded-l-3xl"
                  : "h-[180px] sm:h-[246px]"
              }`;
}

export default function GalleryPreviewGrid({
  ready,
  previewImages,
  fallback,
  onImageClick,
  onOpenGallery,
  hiddenImagesCount,
}) {
  const containerGalleryClasses =
    "grid grid-cols-2 md:grid-cols-5 gap-2 h-auto sm:h-[500px] mt-4";

  return (
    <div className="relative">
      {!ready ? (
        <div className={containerGalleryClasses}>
          {Array.from({ length: 5 }).map((_, index) => {
            const imageClasses = getGalleryImageClasses(index);
            return (
              <div key={index} className={imageClasses}>
                <ImgSkeleton />
              </div>
            );
          })}
        </div>
      ) : (
        <div className={containerGalleryClasses}>
          {Array.from({ length: 5 }).map((_, index) => {
            const imageClasses = getGalleryImageClasses(index);
            const canOpenGallery = Boolean(previewImages[index]);

            return (
              <div key={index} className={imageClasses}>
                <ImageWithSkeleton
                  src={previewImages[index]}
                  alt={`img-${index}`}
                  fallback={fallback}
                  rounded="rounded-none"
                  containerClassName="h-full"
                  className={canOpenGallery ? "" : "cursor-default"}
                  onClick={
                    canOpenGallery ? () => onImageClick(index) : undefined
                  }
                />
              </div>
            );
          })}
        </div>
      )}

      {hiddenImagesCount > 0 && (
        <button
          type="button"
          onClick={() => onOpenGallery()}
          className="absolute bottom-3 right-3 px-4 py-2 text-sm font-semibold text-white/80 bg-[#000]/50 border-2 border-white/80 hover:border-[#228E8D] rounded-2xl shadow-lg transition-colors duration-300"
        >
          Mostra tutte +{hiddenImagesCount}
        </button>
      )}
    </div>
  );
}
