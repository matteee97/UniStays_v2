import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useSuggestedCities } from "@/ui/hooks";
import HeroSection from "@/ui/components/sections/heroSection/HeroSection";
import ChiSiamoSection from "@/ui/components/sections/ChiSiamoSection/ChiSiamoSection";
import CitiesSection from "@/ui/components/sections/citiesSection/CitiesSection";
import FeaturesSection from "@/ui/components/sections/featuresSection/FeaturesSection";
import FeaturedApartmentsSection from "@/ui/components/sections/featuredApartmentsSection/FeaturedApartmentsSection";
import MetaManager from "@/ui/components/common/seo/MetaManager";

/**
 * Componente principale dell’applicazione.
 * Include tutte le sezioni che compongono la pagina iniziale del sito.
 *
 * Le sezioni incluse sono:
 * - NAVBAR: barra di navigazione principale
 * - HERO SECTION: sezione iniziale con immagine di sfondo e logo
 * - FEATURES SECTION: sezione con funzionalità del sito
 * - CHI SIAMO SECTION: sezione informativa sulla piattaforma
 * - CITIES SECTION: sezione con elenco delle città coperte
 * - Alloggi IN EVIDENZA SECTION: sezione con annunci in evidenza
 * - FOOTER SECTION: sezione con news letter, logo, contatti e social
 */
export default function App() {
  const { user } = useUser();
  const userId = user?.id || "anon";
  const [useUserPosition, setUseUserPosition] = useState(false);
  const {
    suggestedCities,
    loading: suggestedCitiesLoading,
    error: suggestedCitiesError,
  } = useSuggestedCities(userId, useUserPosition);

  return (
    <>
      <MetaManager />

      <HeroSection
        urlImage={"/img/home/hero-img.webp"}
        suggestedCities={suggestedCities}
        suggestedLoading={suggestedCitiesLoading}
      >
        <>
          Trova casa vicino alla tua università.
          <span className="block text-[#228E8D]">Senza stress.</span>
        </>
      </HeroSection>

      <FeaturesSection />

      <FeaturedApartmentsSection />

      <CitiesSection
        suggestedCities={suggestedCities}
        loading={suggestedCitiesLoading}
        error={suggestedCitiesError}
        useUserPosition={useUserPosition}
        onEnableUserPosition={() => setUseUserPosition(true)}
      />

      <ChiSiamoSection />
    </>
  );
}
