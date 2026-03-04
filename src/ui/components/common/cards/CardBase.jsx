import Badge, { FeaturedBadge } from "../badges/Badge";

export default function CardBase({
  onClick,
  onMouseEnter,
  onMouseLeave,
  isHighlighted = false,
  borderColor,
  badgeText,
  imageSection,
  className,
  children,
}) {
  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`relative bg-white w-full h-fit max-w-full rounded-lg cursor-pointer overflow-hidden border-2 duration-200 ${
        isHighlighted
          ? "border-[#228E8D] shadow-md"
          : `border-[2.5px] ${borderColor} dark:border-[#1F2937]`
      } ${className}`}
    >
      {badgeText && (
        <div className="absolute top-2 left-2 z-10 ">
          <FeaturedBadge />
        </div>
      )}

      <div
        className={
          borderColor ? "overflow-hidden" : "absolute h-52 w-full -z-10"
        }
      >
        {imageSection}
      </div>

      <div
        className={`p-4 h-full ${
          borderColor ? `border-t-2 ${borderColor}` : `mt-44`
        } bg-gradient-to-tr from-[#e7f2f2] via-white to-[#e7f2f2] dark:from-[#0F172A] dark:via-[#0F172A] dark:to-[#0F172A] dark:border-[#1F2937] z-50`}
      >
        {children}
      </div>
    </div>
  );
}
