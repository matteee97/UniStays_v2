import { useEffect, useState } from "react";
import PrevButton from "../buttons/PrevButton.jsx";
import NextButton from "../buttons/NextButton.jsx";
import { ImageWithSkeleton, LoadingIcon } from "../index.js";
import { useWindowWidth, useTouchSwipe } from "@/ui/hooks";

export default function Carousel({
  images = [],
  className,
  minHeight = "min-h-[35vh] sm:min-h-[70vh]",
  maxHeight = "max-h-[80vh]",
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState(0);
  const [direction, setDirection] = useState(null);
  const width = useWindowWidth();
  const isMobile = width < 768;

  const handlePrev = () => {
    setDirection("prev");
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? (isMobile ? images.length - 1 : 0) : prevIndex - 1
    );
  };

  const handleNext = () => {
    setDirection("next");
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1
        ? isMobile
          ? 0
          : prevIndex
        : prevIndex + 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setDirection(null);
  };

  const swipeHandlers = useTouchSwipe({
    onSwipeLeft: handleNext,
    onSwipeRight: handlePrev,
    disabled: images.length <= 1,
  });

  useEffect(() => {
    setLoadedImages(0);
    setLoading(images.length > 0);
  }, [images.length]);

  useEffect(() => {
    if (images.length === 0 || loadedImages > 0) {
      setLoading(false);
    }
  }, [loadedImages, images.length]);

  return (
    <div className={className}>
      <div
        className="relative w-full h-full"
        onTouchStart={swipeHandlers.onTouchStart}
        onTouchMove={swipeHandlers.onTouchMove}
        onTouchEnd={swipeHandlers.onTouchEnd}
      >
        {loading && <LoadingIcon />}
        <div className="relative h-full overflow-hidden">
          {images.map((img, idx) => {
            const relativeIndex = idx - currentIndex;
            const translateX = Math.min(relativeIndex * 20, 100);
            const scale = 1 - Math.min(Math.abs(relativeIndex) * 0.09, 0.6);
            const isActive = relativeIndex === 0;

            const style = !isMobile
              ? {
                  transform: `translate(-50%, -50%) translateX(${translateX}%) scale(${scale})`,
                  transition: "transform 0.7s ease-in-out",
                  zIndex: 40 - Math.abs(relativeIndex),
                }
              : {
                  transform: `translate(-50%, -50%)`,
                  zIndex: 40 - Math.abs(relativeIndex),
                };

            return (
              <div
                key={idx}
                onClick={() => goToSlide(idx)}
                className="absolute top-1/2 left-1/2 sm:px-20 w-full pointer-events-none cursor-pointer"
                style={style}
              >
                <ImageWithSkeleton
                  src={img}
                  alt={`Slide ${idx + 1}`}
                  rounded="sm:rounded-md"
                  containerClassName={`mx-auto ${minHeight} ${maxHeight} pointer-events-none`}
                  onLoad={() => {
                    setLoading(false); // sblocca subito al primo load
                  }}
                  onError={() => {
                    setLoading(false);
                  }}
                  imgStyle={{
                    boxShadow: "0 0 25px 3px rgba(0, 0, 0, 0.4)",
                  }}
                  imgClassName={`
                    mx-auto ${minHeight} ${maxHeight} object-cover  sm:rounded-md
                    ${
                      !isMobile && isActive && direction === "next"
                        ? "animate-bumpRight"
                        : ""
                    }
                    ${
                      !isMobile && isActive && direction === "prev"
                        ? "animate-bumpLeft"
                        : ""
                    }
                    ${
                      isActive
                        ? ""
                        : "opacity-0 md:opacity-100 shadow-none md:block md:blur-[1.7px] md:shadow-md"
                    }
                    pointer-events-none transition-opacity duration-500 ease-in-out
                  `}
                />
              </div>
            );
          })}
        </div>

        {/* Dots */}
        <div className="absolute z-40 flex -translate-x-1/2 bottom-5 left-1/2 space-x-3">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`w-3 h-3 rounded-full ${
                idx === currentIndex ? "bg-[#228E8D]" : "bg-[#8fd6d1]"
              }`}
              type="button"
              aria-label={`Slide ${idx + 1}`}
            ></button>
          ))}
        </div>

        {/* Prev/Next buttons */}
        <PrevButton
          onClick={handlePrev}
          className={
            "hidden sm:block left-5 opacity-85 hover:opacity-100 text-2xl z-40"
          }
        >
          &#10094;
        </PrevButton>
        <NextButton
          onClick={handleNext}
          className={
            "hidden sm:block right-5 opacity-85 hover:opacity-100 text-2xl z-40"
          }
        >
          &#10095;
        </NextButton>
      </div>
    </div>
  );
}
