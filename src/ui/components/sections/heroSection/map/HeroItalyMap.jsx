import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { DEFAULT_HERO_CITIES } from "./defaultCities";
import { MAP_CITY_LIMIT } from "./constants";
import { buildClusters, formatListingCount } from "./utils";

export default function HeroItalyMap({
  cities = [],
  loading = false,
  onCitySelect,
  mapImageSrc = "/img/3D/common/italy-map.webp",
}) {
  const [activeClusterId, setActiveClusterId] = useState(null);

  const baseCities = cities?.length ? cities : DEFAULT_HERO_CITIES;

  const mapCities = useMemo(
    () =>
      (baseCities || [])
        .filter(
          (city) =>
            Number.isFinite(Number(city?.coords?.lat)) &&
            Number.isFinite(Number(city?.coords?.lng)),
        )
        .slice(0, MAP_CITY_LIMIT),
    [baseCities],
  );

  const clusters = useMemo(() => buildClusters(mapCities), [mapCities]);

  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0">
        <div
          className="relative w-full h-full"
          onClick={() => setActiveClusterId(null)}
        >
          <img
            src={mapImageSrc}
            alt="Mappa dell'Italia con città universitarie"
            className="absolute inset-0 w-full h-full rounded-[28px] object-contain opacity-95 dark:brightness-90 dark:opacity-85 pointer-events-none"
            loading="eager"
          />

          {!loading &&
            clusters.map((cluster) => {
              const isCluster = cluster.cities.length > 1;
              const position = { x: cluster.x, y: cluster.y };
              const cityItems = [...cluster.cities].sort((a, b) =>
                String(a.city.city || "").localeCompare(
                  String(b.city.city || ""),
                ),
              );

              if (isCluster) {
                return (
                  <div
                    key={cluster.id}
                    style={{
                      left: `${position.x}%`,
                      top: `${position.y}%`,
                    }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 ${
                      activeClusterId === cluster.id ? "z-50" : "z-10"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setActiveClusterId((prev) =>
                          prev === cluster.id ? null : cluster.id,
                        );
                      }}
                      className={
                        "flex items-center gap-2 bg-white/85 backdrop-blur-md border-2 border-[#d4f1ef] text-[#173f3e] dark:text-gray-300 px-1 py-0.5 sm:pl-1 sm:pr-2 sm:py-1 rounded-full shadow-md text-xs sm:text-sm whitespace-nowrap transition-transform duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#228E8D]/50"
                      }
                      aria-label={`Mostra ${cluster.cities.length} città`}
                    >
                      <span className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#228E8D] text-white text-[10px] font-semibold">
                        {cluster.cities.length}
                      </span>
                      <span className="font-semibold">Città</span>
                    </button>
                    {activeClusterId === cluster.id && (
                      <div
                        onClick={(event) => event.stopPropagation()}
                        className="absolute left-1/2 -translate-x-1/2 mt-2 bg-white/85 backdrop-blur-md border-2 border-[#d4f1ef] shadow-lg rounded-2xl p-1 flex flex-col min-w-[180px] max-h-52 overflow-y-auto text-xs sm:text-sm "
                      >
                        {cityItems.map((item) => {
                          const count = Number(item.city?.stats?.listingsCount);
                          const label = formatListingCount(count);
                          return (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => {
                                onCitySelect?.(item.city);
                                setActiveClusterId(null);
                              }}
                              className="flex items-center justify-between gap-2 px-2 py-1.5 first:rounded-t-[12px] last:rounded-b-[12px] hover:bg-[#b9ddd9] dark:hover:bg-[#228E8D]/20 transition-colors"
                            >
                              <span className="font-semibold text-[#173f3e] dark:text-gray-300">
                                {item.city.city}
                              </span>
                              <span className="text-[#228E8D]">{label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const single = cityItems[0]?.city;
              const count = Number(single?.stats?.listingsCount);
              const label = formatListingCount(count);

              return (
                <div
                  key={single?.id || single?.slug || single?.city}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group flex w-fit hover:scale-105 gap-1 transition-all duration-300"
                  style={{
                    left: `${position.x}%`,
                    top: `${position.y}%`,
                  }}
                >
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-[calc(100%-0.5px)] bg-white/85 text-center backdrop-blur-md px-2 pt-4 pb-1 rounded-b-2xl shadow-md text-xs text-gray-500 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-[15px] transition-transform duration-300">
                    {label}
                  </span>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onCitySelect?.(single);
                    }}
                    aria-label={`Vedi alloggi a ${single?.city}`}
                    className="z-20 flex items-center gap-1 bg-white/85 backdrop-blur-md text-[#173f3e] dark:text-gray-300 px-2 py-1 rounded-full shadow-md text-xs sm:text-sm whitespace-nowrap transition-transform duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#228E8D]/50"
                  >
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="text-[#228E8D]"
                    />
                    <span className="font-semibold">{single?.city}</span>
                  </button>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
