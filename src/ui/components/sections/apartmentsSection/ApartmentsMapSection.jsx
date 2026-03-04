import GoogleMapComponent from "@/ui/components/common/mapComponents/GoogleMapComponent";
import InfoToggle from "@/ui/components/common/indicators/InfoToggle";

export default function ApartmentsMapSection({
  mapVisible = false,
  appartamenti,
  matchedCity,
  hoveredApartmentId,
  favoritesIds,
}) {
  if (!matchedCity) return null;

  return (
    <div
      className={`${
        mapVisible
          ? "fixed top-0 left-0 h-screen w-screen z-[999]"
          : "hidden lg:block sticky top-[74px] p-3 h-[calc(100vh-74px)]"
      }`}
    >
      <div className="relative w-full h-full bg-white lg:border-2 lg:border-[#d4f1ef] lg:rounded-[25px] lg:shadow-[2px_4px_18px_4px_rgba(0,0,0,0.2)] overflow-hidden ">
        <GoogleMapComponent
          appartamenti={appartamenti}
          city={matchedCity}
          hoveredApartmentId={hoveredApartmentId}
          favoritesIds={favoritesIds}
          universityMarker
        />
        <InfoToggle className="absolute left-3 top-3 max-w-xs">
          <ul className="list-disc list-inside space-y-1">
            <li>
              Le posizioni degli alloggi e delle università sono indicative e
              possono essere approssimate.
            </li>
            <li>
              Verifica sempre indirizzo, distanza e percorso di persona o con
              fonti ufficiali.
            </li>
            <li>
              La piattaforma non garantisce l'accuratezza di coordinate, tempi o
              percorsi mostrati.
            </li>
          </ul>
        </InfoToggle>
      </div>
    </div>
  );
}
