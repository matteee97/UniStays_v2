import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import ApartmentBadges from "./ApartmentBadges";
import ApartmentQuickStats from "./ApartmentQuickStats";

export default function ApartmentHero({ app, averageRating = null }) {
  return (
    <div className="mb-8">
      {/* Badge e rating */}
      <ApartmentBadges app={app} averageRating={averageRating} />

      {/* Titolo e indirizzo */}
      <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 leading-tight">
        {app?.title || "Alloggio universitario"}
      </h1>

      <div className="flex items-center gap-3 text-lg text-gray-600 mb-6">
        <FontAwesomeIcon
          icon={faMapMarkerAlt}
          className="text-[#228E8D] w-5 h-5"
        />
        <span className="font-medium">
          {app?.address?.street || "Indirizzo non presente"},{" "}
          {app?.address?.city || "Città non presente"}
        </span>
        {app?.address?.postalCode && (
          <span className="text-gray-500">({app.address.postalCode})</span>
        )}
      </div>

      {/* Quick stats */}
      <ApartmentQuickStats app={app} />
    </div>
  );
}
