import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import Alert from "@/ui/components/common/messages/PubblicaAnnuncioAlert";
import { ROUTES } from "@/app/routes";

const HeroAlert = ({ className = "" }) => {
  return (
    <div className={`bg-[#f0faf9] py-6 ${className}`}>
      <div className="max-w-7xl mx-auto px-6">
        <Alert className="bg-white border border-[#228E8D]/40">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon
                icon={faStar}
                className="text-[#228E8D] text-xl"
              />
              <p className="text-gray-700 font-medium">
                <strong>Fatti trovare!</strong> Pubblica il tuo annuncio
                gratuitamente e raggiungi migliaia di studenti.
              </p>
            </div>
            <Link
              to={ROUTES.PRE_PUBLISH_ANNOUNCEMENT}
              className="bg-white text-[#228E8D] px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors duration-300 flex items-center gap-2"
            >
              Pubblica Ora
              <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
            </Link>
          </div>
        </Alert>
      </div>
    </div>
  );
};

export default HeroAlert;
