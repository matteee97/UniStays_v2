import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faRocket } from "@fortawesome/free-solid-svg-icons";
import CoolButton from "@/ui/components/common/buttons/CoolButton";
import { Link } from "react-router-dom";
import InfoCard from "@/ui/components/common/cards/InfoCard";
import { TipsSection } from "../PrePubblicaAnnuncioSection";
import { tips } from "@/ui/data/prePubblicaAnnuncioData";
import { ROUTES } from "@/app/routes";

/**
 * Componente per lo stato vuoto migliorato
 */
export default function EmptyState() {
  return (
    <div className="flex flex-col bg-white dark:bg-[#0B1220] items-center justify-center min-h-[60vh] w-full text-center px-6">
      <div className="max-w-2xl">
        <InfoCard
          icon={<FontAwesomeIcon icon={faHome} />}
          title="Nessun annuncio ancora"
          description="Inizia a pubblicare i tuoi alloggi universitari e raggiungi migliaia di studenti in cerca di una casa. È facile, veloce e completamente gratuito!"
          variant="transparent"
          size="xl"
          hoverable={false}
        />
        {/* Call to action */}
        <Link to={ROUTES.PRE_PUBLISH_ANNOUNCEMENT}>
          <CoolButton
            ariaLabel="Pubblica il tuo primo annuncio"
            className="px-4 py-2 flex gap-4 items-center justify-center"
          >
            <FontAwesomeIcon icon={faRocket} />
            <span>Pubblica il tuo primo annuncio</span>
          </CoolButton>
        </Link>
        {/* Suggerimenti */}
        <TipsSection tips={tips} className="!bg-transparent" />
      </div>
    </div>
  );
}
