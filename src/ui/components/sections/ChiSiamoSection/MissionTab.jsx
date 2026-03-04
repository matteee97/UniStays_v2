import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLightbulb, faCheck } from "@fortawesome/free-solid-svg-icons";
import InfoCard from "@/ui/components/common/cards/InfoCard";

const MissionTab = ({ isVisible }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div className={`${isVisible ? "animate-fadeInLeft" : "opacity-0"}`}>
        <h3 className="text-3xl font-bold text-gray-800 mb-6">
          La Nostra Storia
        </h3>
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            Tutto è iniziato quando, come studenti universitari, abbiamo
            sperimentato in prima persona le{" "}
            <strong className="text-[#228E8D]">
              difficoltà legate alla ricerca di un alloggio
            </strong>
            . Ore passate a navigare tra siti web confusi, chiamate infinite e
            visite deludenti hanno caratterizzato i nostri primi mesi di
            università.
          </p>
          <p>
            Da questa esperienza frustrante è nata l'idea di creare una
            <strong className="text-[#228E8D]">
              {" "}
              piattaforma intuitiva, rapida e orientata
            </strong>
            a soddisfare le reali esigenze degli studenti.
          </p>
          <p>
            Il nostro obiettivo è{" "}
            <strong className="text-[#228E8D]">
              semplificare il processo di ricerca
            </strong>
            , rendendolo più trasparente, accessibile ed efficiente per tutti.
          </p>
        </div>

        <div className="mt-8 p-6 bg-[#d4f1ef]/60 rounded-xl border-l-4 border-[#228E8D]">
          <h4 className="font-bold text-[#228E8D] mb-2">La Nostra Promessa</h4>
          <p className="text-gray-700">
            "Trasformare la ricerca di casa da un incubo in un'esperienza
            piacevole e veloce"
          </p>
        </div>
      </div>

      <div className={`${isVisible ? "animate-fadeInRight" : "opacity-0"}`}>
        <InfoCard
          icon={<FontAwesomeIcon icon={faLightbulb} />}
          title="Innovazione Studentesca"
          description="Creato da studenti, per studenti"
          variant="info"
          size="lg"
          hoverable={false}
        >
          <div className="space-y-4 mt-8">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faCheck} className="text-[#228E8D]" />
              <span>Piattaforma intuitiva e veloce</span>
            </div>
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faCheck} className="text-[#228E8D]" />
              <span>Filtri avanzati per trovare la casa perfetta</span>
            </div>
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faCheck} className="text-[#228E8D]" />
              <span>Supporto dedicato agli studenti</span>
            </div>
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faCheck} className="text-[#228E8D]" />
              <span>Comunità di studenti verificati</span>
            </div>
          </div>
        </InfoCard>
      </div>
    </div>
  );
};

export default MissionTab;
