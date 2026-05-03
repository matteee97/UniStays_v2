import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBath,
  faBed,
  faBolt,
  faLocationDot,
  faRoute,
  faRulerCombined,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";

import CardBase from "@/ui/components/common/cards/CardBase";
import CardImageSlider from "@/ui/components/common/cards/CardImageSlider";
import { FALLBACK_IMAGE } from "@/ui/shared/constants";
import { haversineDistanceKm } from "@/core/geo/distance";
import { normalizeCoordinates } from "@/application/mappers/coordinates";
import {
  formatRoomArea,
  formatRoomAvailability,
  formatRoomFurnishing,
  formatRoomPrice,
} from "@/ui/components/sections/apartmentSection/roomPreview/roomPreviewUtils";

const getCityAreaLabel = (address = {}) =>
  [address.area, address.city].filter(Boolean).join(", ");

const getRoomImages = (room = {}, apartment = {}) => {
  const roomImages = Array.isArray(room.photoUrls)
    ? room.photoUrls.filter(Boolean)
    : [];
  if (roomImages.length) return roomImages;

  const apartmentImages = Array.isArray(apartment.apartmentPhotoUrls)
    ? apartment.apartmentPhotoUrls.filter(Boolean)
    : [];
  return apartmentImages.length ? apartmentImages : [FALLBACK_IMAGE];
};

const formatDistanceFromUniversity = (apartment, cityCoords) => {
  const apartmentCoords = normalizeCoordinates(apartment?.address?.location);
  if (!apartmentCoords || !cityCoords) return null;

  const distanceKm = haversineDistanceKm(cityCoords, apartmentCoords);
  if (!Number.isFinite(distanceKm)) return null;
  if (distanceKm < 1)
    return `${Math.round(distanceKm * 1000)} m dall'universita`;
  return `${distanceKm.toFixed(1)} km dall'universita`;
};

export default function RoomSearchCard({
  result,
  cityCoords = null,
  onHover,
  onHoverOut,
  onClick,
}) {
  const room = result?.room || {};
  const apartment = result?.apartment || {};
  const priceLabel = formatRoomPrice(room.priceMonthly);
  const areaLabel = formatRoomArea(room.areaMq);
  const furnishingLabel = formatRoomFurnishing(room.furnishing);
  const availabilityLabel = formatRoomAvailability(room.availability);
  const cityAreaLabel = getCityAreaLabel(apartment.address);
  const bathroomsCount = Number(apartment.features?.bathroomsCount) || 0;
  const roomImages = getRoomImages(room, apartment);
  const utilitiesIncluded = apartment.features?.utilitiesIncluded === true;
  const distanceLabel = formatDistanceFromUniversity(apartment, cityCoords);
  const spotsAvailable = Number(room.occupancy?.spotsAvailable);
  const shouldShowSpots =
    room.type !== "single" && Number.isFinite(spotsAvailable);

  return (
    <div className="flex h-full flex-col space-y-2">
      <CardBase
        onClick={() => onClick?.(result)}
        onMouseEnter={() => onHover?.(result.apartmentId)}
        onMouseLeave={onHoverOut}
        borderColor="border-[#d4f1ef]"
        className="group h-full cursor-pointer !rounded-[32px]"
        imageSection={
          <div className="relative h-full w-full">
            <CardImageSlider
              images={roomImages}
              alt={result.title || "Stanza disponibile"}
              dimensions="!h-48 !w-full !rounded-none"
            />
            <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
              <span className="rounded-full border border-white/15 bg-white/20 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                {availabilityLabel}
              </span>
              {room.type ? (
                <span className="rounded-full border border-white/15 bg-white/20 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                  {room.type === "single"
                    ? "Singola"
                    : room.type === "double"
                      ? "Doppia"
                      : "Intero alloggio"}
                </span>
              ) : null}
            </div>
            <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
              {shouldShowSpots ? (
                <span className="rounded-full border border-white/15 bg-white/20 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                  {spotsAvailable} post{spotsAvailable === 1 ? "o" : "i"} liber
                  {spotsAvailable === 1 ? "o" : "i"}
                </span>
              ) : null}
            </div>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#228E8D]">
              {`Stanza ${result.roomIndex + 1}`}
            </p>
            <h3 className="mt-1 line-clamp-1 text-lg font-bold text-gray-800">
              {apartment.title || "Alloggio di riferimento"}
            </h3>
            <p className="mt-2 flex items-center gap-2 line-clamp-1 text-sm text-gray-500 bg-[#228E8D]/10 px-3 py-1 w-fit rounded-full">
              <FontAwesomeIcon
                icon={faLocationDot}
                className="mr-1 text-[#228E8D]"
              />
              {cityAreaLabel || "Zona non specificata"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faBed} className="text-[#228E8D]" />
              <span>{furnishingLabel}</span>
            </div>
            <div className="flex items-center gap-2 ">
              <FontAwesomeIcon
                icon={faRulerCombined}
                className="text-[#228E8D]"
              />
              <span>{areaLabel || "Mq non indicati"}</span>
            </div>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faBath} className="text-[#228E8D]" />
              <span>
                {bathroomsCount || "-"} bagn{bathroomsCount === 1 ? "o" : "i"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faBolt} className="text-[#228E8D]" />
              <span>
                {utilitiesIncluded ? "Utenze incluse" : "Utenze escluse"}
              </span>
            </div>
            {distanceLabel ? (
              <div className="col-span-2 flex items-center gap-3 bg-[#228E8D]/10 px-3 py-1 w-fit rounded-full">
                <FontAwesomeIcon icon={faRoute} className="text-[#228E8D]" />
                <span>{distanceLabel}</span>
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="font-bold text-[#228E8D]">
              <span className="text-lg">
                {priceLabel ? `EUR ${priceLabel}` : "Su richiesta"}
              </span>
              {priceLabel ? (
                <span className="text-sm font-normal"> /mese</span>
              ) : null}
            </p>
            <span className="rounded-full bg-[#228E8D]/10 px-3 py-1 text-xs font-semibold text-[#228E8D]">
              {utilitiesIncluded ? "Utenze incluse" : "Utenze escluse"}
            </span>
          </div>
        </div>
      </CardBase>
    </div>
  );
}
