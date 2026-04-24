import { useMemo } from "react";
import CardShell from "./CardShell";
import CardImageSlider from "./CardImageSlider";
import { FeaturedBadge } from "../badges/Badge";
import { getPriceRangeLabel } from "@/ui/helpers/apartmentPricing";
import { HeartToggle } from "..";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBath,
  faBed,
  faMinus,
  faStar,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";

export default function ApartmentCard({
  app,
  onHover,
  onHoverOut,
  handleClick,
  userId,
  liked,
}) {
  const toInitials = (value = "") => {
    const parts = String(value)
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (!parts.length) return "U";
    return parts
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  };

  const highlights = useMemo(
    () => [
      {
        label: !(app.aggregates?.totalRooms === 1) ? "Camere" : "Camera",
        value: app.aggregates?.totalRooms,
        icon: <FontAwesomeIcon icon={faBed} />,
      },
      {
        label: !(app.aggregates?.totalRoomsAvailable === 1)
          ? "Stanze disponibili"
          : "Stanza disponibile",
        value: app.aggregates?.totalRoomsAvailable,
        icon: <FontAwesomeIcon icon={faUserGroup} />,
      },
      {
        label: !(app.features?.bathroomsCount === 1) ? "Bagni" : "Bagno",
        value: app.features?.bathroomsCount,
        icon: <FontAwesomeIcon icon={faBath} />,
      },
    ],
    [
      app.aggregates?.totalRooms,
      app.aggregates?.totalRoomsAvailable,
      app.features?.bathroomsCount,
    ],
  );

  const images = useMemo(
    () => [...(app.apartmentPhotoUrls ?? [])],
    [app.apartmentPhotoUrls],
  );

  const priceLabel = getPriceRangeLabel(app.aggregates, true);
  const roommateSnapshot = app.occupantListingSnapshot || {};
  const visibleRoommates = Number(roommateSnapshot.visibleOccupantsCount) || 0;
  const roommateItems = Array.isArray(roommateSnapshot.items)
    ? roommateSnapshot.items.slice(0, 2)
    : [];
  const topTags = Array.isArray(roommateSnapshot.topTags)
    ? roommateSnapshot.topTags.slice(0, 2)
    : [];

  return (
    <div className="space-y-2 w-full max-w-full touch-pan-y">
      <CardShell
        ariaLabel={`Apri annuncio ${app.title}`}
        widthClass="w-full max-w-full"
        heightClass="h-[280px] pb-2"
        badge={
          app.isFeatured && (
            <FeaturedBadge className="text-xs !py-1 absolute top-2 left-2" />
          )
        }
        topContent={
          <div className="absolute top-4 right-4">
            <div className=" bg-white/90 dark:bg-[#0F1829]/90 backdrop-blur-sm border-[#d4f1ee]/80 dark:border-[#394354] border-2 rounded-full py-1 px-2">
              <HeartToggle app={app} userID={userId} liked={liked} />
            </div>
          </div>
        }
        imageSlot={
          <CardImageSlider
            images={images}
            alt={app.title}
            dimensions={"w-full h-full !rounded-none"}
          />
        }
        onClick={() => handleClick(app)}
        onMouseEnter={onHover}
        onMouseLeave={onHoverOut}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleClick(app);
          }
        }}
        hoverAnimation={false}
        featured={app?.isFeatured ?? false}
        enableImageTouchPan
      />
      <div className="px-3 w-full flex flex-col gap-1 pb-4">
        <h2
          className="text-xl font-bold leading-tight line-clamp-1 text-[#228E8D] w-full"
          title={app.title}
        >
          {app.title}
        </h2>
        <p className="text-[13px] text-gray-400 line-clamp-2 w-full">
          {app.description}
        </p>
        {visibleRoommates > 0 && (
          <div className="flex items-center gap-2 pt-1 text-xs text-gray-500">
            <div className="flex -space-x-2">
              {roommateItems.length
                ? roommateItems.map((item, index) =>
                    item?.avatarUrl ? (
                      <img
                        key={`${item.avatarUrl}-${index}`}
                        src={item.avatarUrl}
                        alt={item.displayName || ""}
                        className="h-6 w-6 rounded-full border-2 border-white object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span
                        key={`${item.initials || "u"}-${index}`}
                        className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-[9px] font-bold text-white shadow-sm ${
                          index % 2 === 0
                            ? "bg-gradient-to-br from-[#1f6f7a] to-[#79d7d2]"
                            : "bg-gradient-to-br from-[#a14f6c] to-[#ffd37b]"
                        }`}
                      >
                        {item.initials || toInitials(item.displayName)}
                      </span>
                    ),
                  )
                : (roommateSnapshot.avatarUrls || []).slice(0, 2).map((avatarUrl, index) => (
                    <img
                      key={`${avatarUrl}-${index}`}
                      src={avatarUrl}
                      alt=""
                      className="h-6 w-6 rounded-full border-2 border-white object-cover"
                      loading="lazy"
                    />
                  ))}
            </div>
            <span className="line-clamp-1">
              {visibleRoommates} coinquilin{visibleRoommates === 1 ? "o" : "i"}
              {topTags.length ? ` · ${topTags.join(", ")}` : ""}
            </span>
          </div>
        )}
      </div>
      <div className="px-3 flex flex-col gap-3">
        <div className="flex text-sm w-full text-gray-400 items-center justify-between gap-2 px-1">
          {highlights.slice(0, 3).map((highlight, index) => (
            <div
              key={index}
              className={
                (index === 2 ? "hidden sm:flex " : "flex ") +
                " gap-2 items-center"
              }
            >
              <div className="text-[#228E8D]">{highlight.icon}</div>
              <p>
                {highlight.value} {highlight.label}
              </p>
            </div>
          ))}
        </div>
        <div className="w-full flex items-center justify-between">
          <p className="font-bold text-[#228E8D]">
            <span className="brightness-105 text-lg">
              {priceLabel ? `${priceLabel}` : "€—"}
            </span>{" "}
            <span className="text-sm font-norma">/mese</span>
          </p>
          <div className="flex items-center bg-[#228E8D]/10 dark:bg-[#228E8D]/20 px-2 py-1 rounded-full gap-1 text-sm">
            <FontAwesomeIcon
              icon={faStar}
              className={
                app.metrics?.ratingAvg ? "text-[#228E8D]" : "text-[#228E8D]/70"
              }
            />
            <p className=" text-gray-500">
              {app.metrics?.ratingAvg ? (
                app.metrics.ratingAvg.toFixed(1) +
                " (" +
                (app.metrics.ratingCount < 50
                  ? app.metrics.ratingCount
                  : "50+") +
                ")"
              ) : (
                <FontAwesomeIcon icon={faMinus} className="text-gray-400" />
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
