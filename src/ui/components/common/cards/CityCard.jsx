import { useDispatch } from "react-redux";
import { setSelectedCity } from "@/app/store/slices/citySlice";
import { useNavigateToCity, useCityClickTracker } from "@/ui/hooks";
import CardShell from "./CardShell";
import CardHighlights from "./CardHighlights";
import { UniversityBadge } from "../badges/Badge";

export default function CityCard({ city }) {
  const dispatch = useDispatch();
  const goTo = useNavigateToCity();
  const { trackCityClick } = useCityClickTracker();

  const handleCitySelect = () => {
    dispatch(setSelectedCity(city));
    trackCityClick(city.city);
    goTo(city);
  };
  return (
    <CardShell
      ariaLabel={`${city.city}, ${city.university}`}
      widthClass="w-[315px] sm:w-[375px]"
      heightClass="h-[350px]"
      imageSrc={city.imgUrl}
      alt={`Panoramica di ${city.city}, sede di ${city.university}`}
      topContent={
        <h3
          className="text-2xl font-bold leading-tight"
          style={{ textShadow: "0 1px 7px rgba(0,0,0,0.3)" }}
        >
          {city.city}
        </h3>
      }
      bottomContent={
        <CardHighlights
          itemColor="text-[#228E8D]"
          items={[
            { label: "Ateneo", value: city.university },
            {
              label: "Annunci attivi",
              value:
                city?.stats?.listingsCount !== undefined &&
                city?.stats?.listingsCount !== null
                  ? city.stats.listingsCount
                  : "-",
            },
          ]}
        />
      }
      hoverContent={
        <div className="flex flex-col justify-between h-full">
          <div className="p-6 space-y-3 text-sm text-white/80">
            <p className="uppercase text-[10px] tracking-[0.3em] text-white/60 font-semibold">
              Scopri la città
            </p>
            <p>
              Esplora gli alloggi disponibili a {city.city} e scegli quello
              perfetto per te.
            </p>
          </div>
          <div className="flex items-center justify-between border-t border-white/10 px-6 py-4 text-xs uppercase tracking-[0.4em] text-white/80">
            <span>Vedi alloggi</span>
            <span className="font-semibold text-white">Vai</span>
          </div>
        </div>
      }
      onClick={handleCitySelect}
    />
  );
}
