import { cloneElement, isValidElement, useMemo, useState } from "react";
import ImgSkeleton from "../shared/icons/ImgSkeleton";
import { FALLBACK_IMAGE } from "@/ui/shared/constants";
import RibbonBadge from "../badges/RibbonBadge";

export default function CardShell({
  imageSrc,
  fallbackSrc = FALLBACK_IMAGE,
  imageSlot = null,
  type = "default",
  alt = "",
  badge = null,
  topContent,
  bottomContent,
  hoverContent = null,
  floatingContent = null,
  onClick,
  onKeyDown,
  onMouseEnter,
  onMouseLeave,
  widthClass = "w-full",
  heightClass = "h-[480px]",
  className = "",
  contentClassName = "p-6",
  role = "button",
  tabIndex = 0,
  ariaLabel,
  hoverAnimation = true,
  featured = false,
  enableImageTouchPan = false,
  priceTag = null,
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const types = {
    default: "bg-gray-50 shadow-[0_15px_30px_rgba(0,0,0,0.4)] rounded-[22px]",
    primary: `bg-gray-50 shadow-[0_8px_12px_rgba(0,0,0,0.25)] rounded-2xl border-[3px] ${
      featured ? "border-[#228E8D]" : "border-[#c2e7e4] dark:border-[#1F2937]"
    }`,
    secondary: "bg-white",
  };

  const displayedImage = useMemo(() => {
    if (imageSlot) return null;
    if (imageError) return fallbackSrc;
    return imageSrc || fallbackSrc;
  }, [imageError, fallbackSrc, imageSrc, imageSlot]);

  const resolvedImageSlot = useMemo(() => {
    if (!isValidElement(imageSlot)) return imageSlot;
    if (typeof imageSlot.type === "string") return imageSlot;
    return cloneElement(imageSlot, { isHovered });
  }, [imageSlot, isHovered]);

  const handleKeyDown = (event) => {
    if (!onClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick(event);
    }
  };

  const handleMouseEnterWrapper = (event) => {
    setIsHovered(true);
    onMouseEnter?.(event);
  };

  const handleMouseLeaveWrapper = (event) => {
    setIsHovered(false);
    onMouseLeave?.(event);
  };

  return (
    <div
      className={`relative transition duration-500 ${
        hoverAnimation && "hover:-translate-y-1"
      }`}
    >
      <article
        role={role}
        tabIndex={tabIndex}
        onClick={onClick}
        onKeyDown={onKeyDown || handleKeyDown}
        onMouseEnter={handleMouseEnterWrapper}
        onMouseLeave={handleMouseLeaveWrapper}
        className={`group relative shrink-0 z-10 ${widthClass} ${heightClass} ${
          onClick ? "cursor-pointer" : ""
        }`}
        aria-label={ariaLabel}
      >
        <div
          className={`relative h-full w-full overflow-hidden ${
            types[type]
          }  ${className}`}
        >
          <div className="absolute inset-0">
            {imageSlot ? (
              resolvedImageSlot
            ) : (
              <>
                {!imageLoaded && <ImgSkeleton />}
                <img
                  src={displayedImage}
                  alt={alt}
                  loading="lazy"
                  onLoad={() => setImageLoaded(true)}
                  onError={() => {
                    setImageError(true);
                    setImageLoaded(true);
                  }}
                  className="h-full w-full object-cover transition duration-700"
                />
              </>
            )}
          </div>

          {!enableImageTouchPan ? (
            <>
              <div
                className={`absolute inset-0 propagation bg-gradient-to-t ${
                  type === "default"
                    ? "from-[#032222ce] dark:from-[#000000ad] via-black/10"
                    : "from-[#032222bb] via-black/20"
                } to-transparent pointer-events-none`}
              />
              {floatingContent && (
                <div className="absolute inset-0 z-10">{floatingContent}</div>
              )}
              <div
                className={`absolute inset-0 flex flex-col justify-between text-white ${contentClassName}`}
              >
                <div className="space-y-3">
                  {badge ?? <div className="py-2" />}
                  {topContent}
                </div>
                {bottomContent}
              </div>

              {hoverContent && (
                <div className="hidden absolute inset-0 sm:flex flex-col justify-between bg-black/0 opacity-0 transition duration-500 group-hover:bg-gradient-to-t group-hover:from-[#228E8D]/10 group-hover:to-[#1b6564] backdrop-blur-md group-hover:opacity-100">
                  {hoverContent}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="space-y-3">
                {badge ?? <div className="py-2" />}
                {topContent}
              </div>
              {bottomContent}
            </>
          )}
        </div>
      </article>
      {priceTag && (
        <RibbonBadge position="top-4 -right-2" size="sm" showIcon={false}>
          {priceTag}
        </RibbonBadge>
      )}
    </div>
  );
}
