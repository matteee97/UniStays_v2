import React from "react";
import InfoCard from "@/ui/components/common/cards/InfoCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faRulerCombined,
  faCheck,
  faImage,
  faLightbulb,
  faInfoCircle,
  faRuler,
  faLocationDot,
  faUniversity,
  faListAlt,
} from "@fortawesome/free-solid-svg-icons";

/**
 * Componente per mostrare suggerimenti durante la compilazione del form
 * @param {Object} props
 * @param {string} props.currentSection - Sezione corrente del form
 * @param {string} props.className - Classi CSS aggiuntive
 */
export default function FormTips({
  currentSection = "general",
  className = "",
}) {
  const tips = {
    general: [
      {
        icon: <FontAwesomeIcon icon={faInfoCircle} />,
        title: "Titolo accattivante",
        description:
          "Usa un titolo chiaro e descrittivo che attiri l'attenzione",
      },
      {
        icon: <FontAwesomeIcon icon={faBook} />,
        title: "Descrizione dettagliata",
        description:
          "Descrivi bene l'alloggio, le caratteristiche e i vantaggi",
      },
    ],
    characteristics: [
      {
        icon: <FontAwesomeIcon icon={faRulerCombined} />,
        title: "Caratteristiche precise",
        description: "Indica accuratamente il numero di camere e bagni",
      },
      {
        icon: <FontAwesomeIcon icon={faRuler} />,
        title: "Superficie corretta",
        description: "Misura accuratamente la superficie dell'alloggio",
      },
      {
        icon: <FontAwesomeIcon icon={faCheck} />,
        title: "Caratteristiche reali",
        description: "Inserisci solo le caratteristiche realmente presenti",
      },
      {
        icon: <FontAwesomeIcon icon={faListAlt} />,
        title: "Includi tutto",
        description:
          "I dettagli riportati devono essere esaustivi, in quanto non saranno modificabili in seguito",
      },
    ],
    address: [
      {
        icon: <FontAwesomeIcon icon={faLocationDot} />,
        title: "Indirizzo completo",
        description: "Inserisci l'indirizzo completo per facilitare la ricerca",
      },
      {
        icon: <FontAwesomeIcon icon={faUniversity} />,
        title: "Vicino all'università",
        description: "Evidenzia la vicinanza alle università e ai servizi",
      },
    ],
    details: [],
    images: [
      {
        icon: <FontAwesomeIcon icon={faImage} />,
        title: "Foto di qualità",
        description: "Scatta foto ben illuminate e da angoli diversi",
      },
      {
        icon: <FontAwesomeIcon icon={faImage} />,
        title: "Mostra tutto",
        description:
          "Carica foto degli spazi comuni come cucina, soggiorno, bagno, ingressi, esterni o garage.",
      },
    ],
  };

  const currentTips =
    tips[currentSection]?.length > 0 ? tips[currentSection] : tips.general;

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-600 mb-4">
        <FontAwesomeIcon icon={faLightbulb} className="text-[#228e8cbd] mr-2" />{" "}
        Suggerimenti per questa sezione
      </h3>

      <div className="grid md:grid-cols-2 gap-4">
        {currentTips.map((tip, index) => (
          <InfoCard
            key={index}
            icon={tip.icon}
            title={tip.title}
            description={tip.description}
            variant="info"
            size="sm"
            hoverable
          />
        ))}
      </div>
    </div>
  );
}
