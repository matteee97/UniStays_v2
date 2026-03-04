import React from "react";
import CardBase from "./CardBase";
import ImageWithSkeleton from "../ImageWithSkeleton";
import PositionIcon from "@/ui/components/common/shared/icons/PositionIcon";
import { getPriceRangeLabel } from "@/ui/helpers/apartmentPricing";
import { APARTMENT_STATUS } from "@/shared/types";

const SmallCard = ({
  imageChildren,
  children,
  app,
  handleClick,
  hovered,
  onHover,
  onHoverOut,
  showCity,
}) => {
  const { title, apartmentPhotoUrls, aggregates, address, status, isFeatured } =
    app ?? {
      title: "non presente",
      apartmentPhotoUrls: ["/img/sky.webp"],
      aggregates: null,
      address: { city: "non presente" },
      status: null,
      isFeatured: false,
    };

  const imageSource = apartmentPhotoUrls?.[0] || "/img/sky.webp";
  const isPublished = status === APARTMENT_STATUS.PUBLISHED;
  const priceLabel = getPriceRangeLabel(aggregates, true);
  return (
    <CardBase
      onClick={() => handleClick(app)}
      onMouseEnter={onHover}
      onMouseLeave={onHoverOut}
      isHighlighted={isPublished && isFeatured}
      badgeText={isPublished && isFeatured ? "In evidenza" : null}
      borderColor={isPublished ? "#D4F1EF" : "#d9a098"}
      imageSection={
        <div className="relative">
          <ImageWithSkeleton
            src={imageSource}
            alt={title}
            rounded="rounded-none"
            containerClassName="!h-40"
            imgClassName={`${hovered ? "scale-105" : ""} ${
              isPublished ? "" : "opacity-70"
            }`}
          />
          {imageChildren}
        </div>
      }
    >
      <div className="flex justify-between items-start">
        <h3
          className={`text-base font-semibold ${
            !isPublished && "text-gray-500"
          } mb-1 truncate`}
        >
          {title}
        </h3>
        {showCity && (
          <span className="flex items-center gap-1 text-sm text-gray-600">
            <PositionIcon className="w-4 h-4 text-[#228E8D]" />
            {address?.city ?? "Non specificata"}
          </span>
        )}
      </div>

      {isPublished && priceLabel && (
        <p className={`text-[#228E8D] font-bold text-md mt-2`}>
          {priceLabel} <span className="text-sm">/mese</span>
        </p>
      )}

      {children}
    </CardBase>
  );
};

export default SmallCard;
