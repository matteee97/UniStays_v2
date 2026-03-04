import { useEffect, useMemo, useRef, useState } from "react";
import ImgSkeleton from "@/ui/components/common/shared/icons/ImgSkeleton";
import { FALLBACK_IMAGE } from "@/ui/shared/constants";

export default function ImageWithSkeleton({
  src,
  alt = "",
  fallback = FALLBACK_IMAGE,
  skeleton,
  aspectRatio,
  rounded = "rounded-xl",
  containerClassName = "",
  className = "",
  imgClassName = "",
  imgStyle,
  animation = true,
  loading = "lazy",
  decoding = "async",
  retryDelayMs = 6000,
  retryLabel = "Riprova",
  onLoad,
  onClick,
  onError,
  onRetry,
  ...containerProps
}) {
  const [currentSrc, setCurrentSrc] = useState(src || fallback);
  const [loaded, setLoaded] = useState(false);
  const [hadError, setHadError] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const imgRef = useRef(null);
  const originalSrcRef = useRef(src);

  useEffect(() => {
    originalSrcRef.current = src;
    setCurrentSrc(src || fallback);
    setLoaded(false);
    setHadError(false);
    setShowRetry(false);
    setRetryCount(0);
  }, [src, fallback]);

  useEffect(() => {
    const imgEl = imgRef.current;
    if (!imgEl) return;
    if (imgEl.complete && imgEl.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [currentSrc]);

  useEffect(() => {
    if (loaded) {
      setShowRetry(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowRetry(true);
    }, retryDelayMs);

    return () => clearTimeout(timer);
  }, [loaded, currentSrc, retryDelayMs]);

  const isFallback = currentSrc === fallback;

  const handleLoad = (event) => {
    setLoaded(true);
    onLoad?.(event);
  };

  const handleError = (event) => {
    if (!hadError && currentSrc !== fallback) {
      setHadError(true);
      setCurrentSrc(fallback);
      setLoaded(false);
      onError?.(event);
      return;
    }
    setLoaded(true);
    onError?.(event);
  };

  const getRetrySrc = (baseSrc, count) => {
    if (!baseSrc) return fallback;
    const separator = baseSrc.includes("?") ? "&" : "?";
    return `${baseSrc}${separator}retry=${count}`;
  };

  const handleRetry = () => {
    onRetry?.();
    const baseSrc = originalSrcRef.current;
    if (!baseSrc) return;
    setRetryCount((prev) => {
      const next = prev + 1;
      setCurrentSrc(getRetrySrc(baseSrc, next));
      return next;
    });
    setHadError(false);
    setLoaded(false);
    setShowRetry(false);
  };

  const containerClasses = useMemo(
    () =>
      ["relative", aspectRatio || "w-full h-full", rounded, containerClassName]
        .filter(Boolean)
        .join(" "),
    [aspectRatio, rounded, containerClassName],
  );

  const imageClasses = useMemo(() => {
    const visibilityClasses = animation
      ? loaded
        ? "opacity-100 scale-100 blur-0"
        : "opacity-0 scale-105 blur-[1px]"
      : loaded
        ? "opacity-100"
        : "opacity-0";

    const cursorClass = onClick
      ? isFallback
        ? "cursor-not-allowed"
        : "cursor-pointer"
      : "cursor-default";

    return [
      "w-full h-full object-cover transition ease-in-out",
      animation ? "duration-700" : "duration-300",
      visibilityClasses,
      cursorClass,
      loaded ? "" : "pointer-events-none",
      className,
      imgClassName,
    ]
      .filter(Boolean)
      .join(" ");
  }, [animation, loaded, onClick, isFallback, className, imgClassName]);

  return (
    <div className={containerClasses} {...containerProps}>
      {(showRetry || !loaded) && (
        <div className="absolute inset-0 pointer-events-none">
          {skeleton ? (
            skeleton
          ) : (
            <div className="bg-gray-200 w-full h-full">
              <ImgSkeleton />
            </div>
          )}
        </div>
      )}

      {showRetry && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            type="button"
            onClick={handleRetry}
            className="px-3 py-1.5 text-xs font-semibold rounded-md bg-white/90 text-gray-800 shadow-sm backdrop-blur hover:bg-white"
          >
            {retryLabel}
          </button>
        </div>
      )}

      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        loading={loading}
        decoding={decoding}
        onLoad={handleLoad}
        onError={handleError}
        onClick={!isFallback && onClick ? onClick : undefined}
        className={`${imageClasses}${
          isFallback ? " filter dark:grayscale opacity-75 dark:opacity-30" : ""
        }`}
        style={imgStyle}
      />
    </div>
  );
}
