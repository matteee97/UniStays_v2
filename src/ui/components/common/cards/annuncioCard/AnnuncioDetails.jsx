import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBath,
  faBed,
  faUserGroup,
  faCircle,
} from "@fortawesome/free-solid-svg-icons";
import IconPosition from "@/ui/components/common/shared/icons/PositionIcon";
import { getPriceRangeLabel } from "@/ui/helpers/apartmentPricing";
import { APARTMENT_STATUS } from "@/shared/types";
export default function AnnuncioDetails({ annuncio, updateMode, views }) {
  const priceLabel = getPriceRangeLabel(annuncio?.aggregates);
  const isPublished = annuncio?.status === APARTMENT_STATUS.PUBLISHED;
  const statusLabel = isPublished
    ? "Pubblicato"
    : annuncio?.status === APARTMENT_STATUS.PENDING_REVIEW
    ? "In revisione"
    : "Bozza";

  return (
    <div
      className={`p-4 space-y-5 w-full pb-6 lg:pb-0 lg:absolute lg:top-0 lg:left-0 ${
        updateMode ? "-translate-x-full " : "translate-x-0 "
      } transition-all duration-500 ease-in-out`}
    >
      <div className="flex flex-wrap items-center justify-between w-full">
        <h2 className="text-xl lg:text-2xl pr-6 font-bold text-gray-600">
          {annuncio?.title}
        </h2>
        <p className="flex items-center text-sm text-gray-500 gap-2">
          <IconPosition className="w-4 h-4 text-[#228E8D]" />
          {annuncio.address?.city}
        </p>
      </div>

      <p className="text-sm text-gray-500">
        {annuncio.features?.totalAreaMq}mq
      </p>

      <p className="text-sm text-gray-500 flex flex-wrap items-center gap-2 lg:gap-4">
        <FontAwesomeIcon icon={faBed} className="w-4 h-4 text-[#228E8D]" />
        {annuncio.aggregates?.totalRooms} camere <span>•</span>
        <FontAwesomeIcon icon={faBath} className="w-4 h-4 text-[#228E8D]" />
        {annuncio.features?.bathroomsCount} bagni <span>•</span>
        <FontAwesomeIcon
          icon={faUserGroup}
          className="w-4 h-4 text-[#228E8D]"
        />
        {annuncio.aggregates?.totalRoomsAvailable} stanz
        {annuncio.aggregates?.totalRoomsAvailable > 1 ? "e" : "a"} disponibil
        {annuncio.aggregates?.totalRoomsAvailable > 1 ? "i" : "e"}
      </p>

      <p className="text-xl font-semibold text-[#228E8D]">
        {priceLabel ? `${priceLabel}€/mese` : "Prezzo su richiesta"}
      </p>

      <p className="text-sm text-gray-500 flex items-center gap-2 font-medium">
        Stato:
        <span
          className={`font-medium ${
            isPublished ? "text-[#2ab0ae]" : "text-red-400"
          }`}
        >
          {isPublished ? (
            <span className="gap-1 flex items-center">
              {statusLabel}{" "}
              <FontAwesomeIcon
                icon={faCircle}
                className="w-3 h-3 text-[#2ab0aeb7] animate-pulse"
              />
            </span>
          ) : (
            statusLabel
          )}
        </span>
      </p>
      <p className="text-sm text-gray-500 flex items-center gap-3 font-medium">
        Visualizzazioni: {views ? views : annuncio?.metrics?.totalViews}
      </p>
    </div>
  );
}
