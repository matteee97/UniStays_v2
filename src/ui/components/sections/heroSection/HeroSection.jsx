import { useDispatch, useSelector } from "react-redux";
import { useNavigateToCity, useCityClickTracker } from "@/ui/hooks";
import { useEffect, useState } from "react";
import { setSelectedCity } from "@/app/store/slices/citySlice";
import {
  HeroHeading,
  HeroSearchSection,
  HeroCTAButtons,
  HeroTrustElements,
  HeroBackground,
} from "./index";
import HeroItalyMap from "./map/HeroItalyMap";

/**
 * HeroSection component renders a modern, hero section with
 * enhanced visual hierarchy, trust indicators, and impactful CTAs.
 */

export default function HeroSection({
  urlImage,
  children,
  suggestedCities = [],
  suggestedLoading = false,
}) {
  const dispatch = useDispatch();
  const goTo = useNavigateToCity();
  const selectedCity = useSelector((state) => state.city.selectedCity);
  const { trackCityClick } = useCityClickTracker();

  const handleSearch = () => {
    if (!selectedCity) return;
    goTo(selectedCity);
  };

  const [startingWord, setStartingWord] = useState(undefined);

  useEffect(() => {
    const clicked = JSON.parse(localStorage.getItem("clicked_cities")) || {};
    const cities = Object.keys(clicked);
    if (cities.length > 0) {
      const topCity = cities.reduce((a, b) =>
        clicked[a] > clicked[b] ? a : b,
      );
      setStartingWord(topCity);
    }
  }, []);

  const handleCitySelect = (city) => {
    if (!city) return;
    dispatch(setSelectedCity(city));
    trackCityClick(city.city);
    goTo(city);
  };

  return (
    <>
      <section className="relative w-full min-h-screen lg:h-screen flex items-center overflow-hidden border-b-2 border-[#D4F1EF] dark:border-[#1F2937]">
        <HeroBackground
          urlImage={urlImage}
          showImage={false}
          className="bg-gradient-to-bl from-[#eff9f8] via-white to-[#c9e4e1] dark:from-[#0B1220] dark:via-[#0F172A] dark:to-[#0B1220]"
          overlayClassName="opacity-0"
        />

        <div className="absolute top-4 left-4 right-4 flex justify-center lg:justify-between items-start z-20">
          <img
            src="/img/ExtendedLogo.svg"
            alt="Hero logo"
            loading="eager"
            className="w-fit h-12"
          />

          <div className="hidden lg:block">
            <HeroCTAButtons />
          </div>
        </div>

        {/* Main content */}
        <div className="relative z-10 w-full max-w-[1480px] mx-auto mt-16 lg:mt-6 px-6 py-16 lg:py-24">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
            <div className="flex flex-col gap-8">
              <HeroHeading
                title={children}
                subtitle={
                  <p className="opacity-90">
                    Annunci controllati, risposte rapide e alloggi per studenti
                    in tutta{" "}
                    <span className="border-b-[2.5px] border-green-600">
                      It
                    </span>
                    <span className="border-b-[2.5px] border-[#fdfbfb]">
                      al
                    </span>
                    <span className="border-b-[2.5px] border-red-600">ia</span>.
                  </p>
                }
                className="text-center sm:text-left max-w-2xl mb-8"
              />

              <HeroSearchSection
                startingWord={startingWord}
                onSearch={handleSearch}
                title={null}
                subtitle={null}
                className="w-full mb-8"
                placeholder="Citta o richiesta smart (es: annunci a Camerino sotto 300 euro)"
              />

              <HeroTrustElements className="justify-center sm:justify-start" />
            </div>

            <div className="relative w-full h-full flex items-center justify-center lg:justify-end">
              <div className="relative w-full h-fit max-w-md sm:max-w-lg lg:max-w-2xl aspect-[5/4] ">
                <HeroItalyMap
                  cities={suggestedCities}
                  loading={suggestedLoading}
                  onCitySelect={handleCitySelect}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
