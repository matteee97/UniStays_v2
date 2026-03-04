import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEuroSign,
  faUsers,
  faCalendarAlt,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { APARTMENT_STATUS } from "@/shared/types";
import { getPriceRangeLabel } from "@/ui/helpers/apartmentPricing";
import { formatDate } from "@/ui/helpers/formatDate";

export default function ApartmentQuickStats({ app }) {
  const priceLabel = getPriceRangeLabel(app?.aggregates);
  const isPublished = app?.status === APARTMENT_STATUS.PUBLISHED;
  const availabilityLabel = app?.aggregates?.isAvailableNow
    ? "Subito"
    : app?.aggregates?.availableFromMin
    ? formatDate(app.aggregates.availableFromMin, "it-IT")
    : "Su richiesta";

  return (
    <div
      className={`sm:grid hidden sm:grid-cols-2 ${
        !isPublished ? "md:grid-cols-4" : "md:grid-cols-3"
      } gap-4 mb-8`}
    >
      <div className="bg-white/60 dark:bg-[#0F1829] backdrop-blur-sm rounded-xl p-4 border border-[#d4f1ef]/50">
        <div className="flex items-center gap-3">
          <div className="bg-[#228E8D]/10 p-2 rounded-lg">
            <FontAwesomeIcon
              icon={faEuroSign}
              className="text-[#228E8D] w-4 h-4"
            />
          </div>
          <div>
            <p className="text-sm text-gray-500">Prezzo mensile</p>
            <p className="text-xl font-bold text-gray-800">
              {priceLabel ? `${priceLabel}€` : "€—"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white/60 dark:bg-[#0F1829] backdrop-blur-sm rounded-xl p-4 border border-[#d4f1ef]/50">
        <div className="flex items-center gap-3">
          <div className="bg-[#228E8D]/10 p-2 rounded-lg">
            <FontAwesomeIcon
              icon={faUsers}
              className="text-[#228E8D] w-4 h-4"
            />
          </div>
          <div>
            <p className="text-sm text-gray-500">Stanze disponibili</p>
            <p className="text-xl font-bold text-gray-800">
              {app?.aggregates?.totalRoomsAvailable ?? "N/A"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white/60 dark:bg-[#0F1829] backdrop-blur-sm rounded-xl p-4 border border-[#d4f1ef]/50">
        <div className="flex items-center gap-3">
          <div className="bg-[#228E8D]/10 p-2 rounded-lg">
            <FontAwesomeIcon
              icon={faCalendarAlt}
              className="text-[#228E8D] w-4 h-4"
            />
          </div>
          <div>
            <p className="text-sm text-gray-500">Disponibile da</p>
            <p className="text-xl font-bold text-gray-800">
              {availabilityLabel}
            </p>
          </div>
        </div>
      </div>

      {!isPublished && (
        <div className="bg-white/60 dark:bg-[#0F1829] backdrop-blur-sm rounded-xl p-4 border border-[#d4f1ef]/50">
          <div className="flex items-center gap-3">
            <div className="bg-[#228E8D]/10 p-2 rounded-lg">
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="text-[#228E8D] w-4 h-4"
              />
            </div>
            <div>
              <p className="text-sm text-gray-500">Stato</p>
              <p className="text-xl font-bold text-gray-800">
                {app?.status || "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
