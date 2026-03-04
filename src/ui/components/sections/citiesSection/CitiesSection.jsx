import SectionTitle from "@/ui/components/common/texts/SectionTitle";
import CityCard from "@/ui/components/common/cards/CityCard";
import Alert from "@/ui/components/common/messages/Alert";
import CityWithUniversitySearchButton from "@/ui/features/locationSearch/components/CityWithUniversitySearchButton";

export default function CitiesSection({
  suggestedCities = [],
  loading = false,
  error = null,
  useUserPosition = false,
  onEnableUserPosition,
}) {
  const citiesLoading = loading;
  const citiesError = error;

  return (
    <section className=" pt-16">
      <div className="flex flex-col  mb-4 sm:mb-0 w-full">
        <div className="max-w-7xl mx-auto w-full px-6">
          <SectionTitle>Cerca alloggio in:</SectionTitle>
          {/* Mostra bottone SOLO se il permesso non è ancora deciso e non ci sono già città consigliate */}
          <CityWithUniversitySearchButton
            isUserPositionEnabled={useUserPosition}
            onEnableUserPosition={onEnableUserPosition}
          />
        </div>
      </div>

      <div className="flex w-screen max-w-[1800px] mx-auto overflow-x-auto gap-3 py-10 lg:pl-28 px-4">
        {citiesLoading && <p className="text-gray-500">Caricamento città...</p>}
        {citiesError && (
          <Alert
            title={"Errore nel caricamento delle città"}
            message={citiesError}
          />
        )}
        {!citiesLoading &&
          !citiesError &&
          (suggestedCities || []).map((city, index) => (
            <CityCard key={city.id || index} city={city} />
          ))}
      </div>
    </section>
  );
}
