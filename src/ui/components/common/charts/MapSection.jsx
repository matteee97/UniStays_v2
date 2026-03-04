import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocation, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { useMemo, useState } from "react";
import GoogleMapComponent from "@/ui/components/common/mapComponents/GoogleMapComponent";

const DEFAULT_MARKER_LIMIT = 120;

export default function MapSection({
  appartamenti,
  maxMarkers = DEFAULT_MARKER_LIMIT,
}) {
  const isDarkMode = document.documentElement.classList.contains("dark");
  const mapPreview = isDarkMode ? "/img/map-dark.png" : "/img/map-light.png";
  if (!appartamenti || appartamenti.length === 0) return null;

  const [showMap, setShowMap] = useState(false);

  const apartmentsWithLocation = useMemo(
    () => (appartamenti || []).filter((app) => app?.address?.location?._lat),
    [appartamenti]
  );

  const limitedApartments = useMemo(() => {
    if (!Number.isFinite(maxMarkers)) return apartmentsWithLocation;
    return apartmentsWithLocation.slice(0, maxMarkers);
  }, [apartmentsWithLocation, maxMarkers]);

  const hasMarkers = apartmentsWithLocation.length > 0;
  const hasTruncated = limitedApartments.length < apartmentsWithLocation.length;
  const markerSubLabel = hasMarkers
    ? hasTruncated
      ? `Mostrati ${limitedApartments.length} su ${apartmentsWithLocation.length} disponibili`
      : "Tutti i marker disponibili sono pronti"
    : "Aggiungi annunci per visualizzare i marker sulla mappa.";

  return (
    <div className="bg-white border border-[#d4f1ef] w-full rounded-2xl sm:p-6 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-xl flex items-center text-gray-600 font-semibold">
          <FontAwesomeIcon icon={faLocation} className="mr-2 text-[#228E8D]" />
          Posizione annunci
        </h3>
        {showMap ? (
          <button
            type="button"
            onClick={() => setShowMap((prev) => !prev)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border border-[#d4f1ef] bg-white text-[#228E8D] hover:bg-[#e6f6f4] transition-colors"
          >
            <FontAwesomeIcon icon={faMapMarkerAlt} />
            Nascondi mappa
          </button>
        ) : (
          <p className="text-xs text-gray-500 py-[11px]">{markerSubLabel}</p>
        )}
      </div>

      {!showMap && (
        <div className="relative w-full h-[500px] mt-6 rounded-lg overflow-hidden bg-blue-100 dark:bg-transparent">
          <img
            src={mapPreview}
            alt="preview mappa"
            className="w-full h-full object-cover blur-xl"
          />
          <button
            type="button"
            onClick={() => setShowMap((prev) => !prev)}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold  bg-white text-[#228E8D] shadow-md hover:bg-[#e6f6f4] hover:scale-105 transition-all duration-300"
          >
            <FontAwesomeIcon icon={faMapMarkerAlt} />
            Mostra mappa
          </button>
        </div>
      )}

      {showMap && (
        <div className="relative w-full h-[500px] mt-6 rounded-lg overflow-hidden opacity-95">
          <GoogleMapComponent
            appartamenti={limitedApartments}
            city={limitedApartments[0]?.address?.city}
            zoom={4.9}
          />
        </div>
      )}
    </div>
  );
}
