import AnalyticsListener from "@/ui/components/common/AnalyticsListener";
import MetaManager from "@/ui/components/common/seo/MetaManager";
import OneTimeMessage from "@/ui/components/common/messages/OneTimeMessage";
import MapButton from "@/ui/components/common/buttons/MapButton";
import SponsorSection from "@/ui/components/common/messages/SponsorSection";
import ApartmentsHeader from "@/ui/components/sections/apartmentsSection/ApartmentsHeader";
import ApartmentsListSection from "@/ui/components/sections/apartmentsSection/ApartmentsListSection";
import ApartmentsMapSection from "@/ui/components/sections/apartmentsSection/ApartmentsMapSection";

/**
 * Pure presentational view for Apartments page.
 *
 * @param {object} props
 * @returns {JSX.Element}
 */
export default function ApartmentsPageView({
  citiesError,
  cityImage,
  cityName,
  universityName,
  tipMessage,
  listSection,
  mapSection,
  mapButton,
  showMapSection = false,
  meta,
}) {
  return (
    <>
      <AnalyticsListener />

      <MetaManager
        title={meta?.title}
        description={meta?.description}
        image={meta?.image}
        preloadImages={meta?.preloadImages}
      />

      {citiesError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
            Errore nel caricamento delle città: {citiesError}
          </div>
        </div>
      )}

      <OneTimeMessage
        localStorageKey="useTouchScroll-tip"
        title="Suggerimento"
        message={tipMessage}
        onlyOnSmallScreen
      />

      <ApartmentsHeader
        cityImage={cityImage}
        cityName={cityName}
        universityName={universityName}
      />

      <div
        className="min-h-[calc(100vh-56px)] max-w-[2250px] mx-auto mt-[270px] sm:mt-[300px] rounded-t-[33px] bg-white 2xl:shadow-[0px_30px_55px_15px_rgba(0,0,0,0.35)]  2xl:mb-[100px] 2xl:rounded-3xl"
        id="apartments"
      >
        <div className="bg-gradient-to-br rounded-t-[33px] from-[#eaf6f5] via-[#fff] to-[#d4f1ef] dark:from-[#0f1829] dark:to-[#111b2d] grid grid-cols-1 lg:grid-cols-[60%_40%] min-h-[calc(100vh-74px)] 2xl:rounded-b-3xl z-10">
          <ApartmentsListSection {...listSection} />

          {showMapSection && <ApartmentsMapSection {...mapSection} />}
        </div>

        <MapButton isOpen={mapButton?.isOpen} onToggle={mapButton?.onToggle} />
      </div>

      <div id="sponsor-container">
        <SponsorSection />
      </div>
    </>
  );
}
