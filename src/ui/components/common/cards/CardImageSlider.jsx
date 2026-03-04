import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import PrevButton from "../buttons/PrevButton.jsx";
import NextButton from "../buttons/NextButton.jsx";
import ImageWithSkeleton from "../ImageWithSkeleton";
import { useTouchSwipe } from "@/ui/hooks";

export default function CardImageSlider({
  images = [],
  dimensions = "",
  alt = "Immagine annuncio",
  onHoverIn,
  onHoverOut,
  isHovered,
}) {
  const [imgIndex, setImgIndex] = useState(0);
  const [hover, setHover] = useState(false);
  const [loaded, setLoaded] = useState(new Set());
  const [onStart, setOnStart] = useState(true);
  const hasSyncedHover = useRef(false);

  const currentImage = useMemo(() => images[imgIndex], [images, imgIndex]);

  // gestisce preload avanti e indietro
  useEffect(() => {
    if (!images.length) return;

    const indicesToPreload = [
      (imgIndex + 1) % images.length,
      (imgIndex - 1 + images.length) % images.length,
    ];

    indicesToPreload.forEach((i) => {
      if (!loaded.has(i)) {
        const preloadImg = new Image();
        preloadImg.src = images[i];
        preloadImg.onload = () => {
          setLoaded((prev) => {
            const updated = new Set(prev);
            updated.add(i);
            return updated;
          });
        };
      }
    });
  }, [imgIndex, images, loaded]);

  // chiamata quando l'immagine è caricata
  const handleLoad = useCallback(() => {
    setLoaded((prev) => {
      const updated = new Set(prev);
      updated.add(imgIndex);
      return updated;
    });
  }, [imgIndex]);

  useEffect(() => {
    const img = new Image();
    img.src = currentImage;
    if (img.complete) {
      handleLoad();
    }
  }, [currentImage, handleLoad]);

  const nextImg = useCallback(() => {
    onStart && setOnStart(false);
    setImgIndex((prev) => (prev + 1) % images.length);
  }, [images.length, onStart]);

  const prevImg = useCallback(() => {
    setImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const swipeHandlers = useTouchSwipe({
    onSwipeLeft: nextImg,
    onSwipeRight: prevImg,
    disabled: images.length <= 1,
  });

  useEffect(() => {
    if (typeof isHovered !== "boolean") return;
    setHover(isHovered);
    if (isHovered) {
      onHoverIn?.();
      hasSyncedHover.current = true;
    } else {
      if (hasSyncedHover.current) {
        onHoverOut?.();
      }
    }
  }, [isHovered, onHoverIn, onHoverOut]);

  return (
    <div
      className={`relative w-full rounded-md overflow-hidden ${dimensions}`}
      onMouseEnter={() => {
        if (typeof isHovered !== "boolean") {
          setHover(true);
          onHoverIn?.();
        }
      }}
      onMouseLeave={() => {
        if (typeof isHovered !== "boolean") {
          setHover(false);
          onHoverOut?.();
        }
      }}
      onTouchStart={swipeHandlers.onTouchStart}
      onTouchMove={swipeHandlers.onTouchMove}
      onTouchEnd={swipeHandlers.onTouchEnd}
    >
      <ImageWithSkeleton
        src={currentImage}
        alt={alt}
        rounded="rounded-none"
        containerClassName="w-full h-full"
        onLoad={handleLoad}
        animation={false}
        onClick={() => {}}
      />

      {images.length > 1 && (
        <>
          <PrevButton
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              prevImg();
            }}
            className={`hidden sm:block ${
              !onStart ? (hover ? "opacity-90" : "opacity-0") : "opacity-0"
            } left-2 py-1 h-9 w-6 hover:opacity-100 z-30`}
          >
            &#10094;
          </PrevButton>

          <NextButton
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              nextImg();
            }}
            className={`hidden sm:block ${
              hover ? "opacity-90" : "opacity-0"
            } right-2 py-1 h-9 w-6 hover:opacity-100 z-30`}
          >
            &#10095;
          </NextButton>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/30 backdrop-blur-md rounded-full px-2 py-1 flex gap-1 z-10">
            {images.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-1.5 rounded-full transition-all ${
                  i === imgIndex
                    ? "bg-[#115756] brightness-110 shadow-xl"
                    : "bg-white/50"
                }`}
              ></div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
