import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRocket,
  faArrowRight,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";
import CoolButton from "@/ui/components/common/buttons/CoolButton";
import { ROUTES } from "@/app/routes";

const HeroCTAButtons = ({ className = "" }) => {
  return (
    <div
      className={`flex flex-col sm:flex-row gap-3 justify-start items-start ${className}`}
    >
      <Link to={ROUTES.PRE_PUBLISH_ANNOUNCEMENT}>
        <CoolButton className="!w-auto hover:bg-[#1f7e7c] text-white font-semibold text-sm sm:text-base px-6 py-3 rounded-full shadow-md">
          <FontAwesomeIcon icon={faRocket} className="mr-2" />
          Pubblica Annuncio Gratis
          <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
        </CoolButton>
      </Link>

      <Link to="/contatti">
        <button className="bg-white text-[#1f7e7c] border-2 border-[#d4f1ef] hover:bg-[#f0faf9] font-semibold text-sm sm:text-base px-6 py-3 rounded-full shadow-sm transition-all duration-300 dark:bg-[#0F172A] dark:text-white dark:border-white/15 dark:hover:bg-[#101c31]">
          <FontAwesomeIcon icon={faShieldAlt} className="mr-2" />
          Contattaci
        </button>
      </Link>
    </div>
  );
};

export default HeroCTAButtons;
