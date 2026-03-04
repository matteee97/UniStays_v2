import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

import ActionLabel from "@/ui/components/common/indicators/ActionLabel.jsx";
import { LABELS } from "../constants";
import { ROUTES } from "@/app/routes";

export default function MobileSearchLink({ onClick }) {
  return (
    <Link
      to={ROUTES.HOME}
      onClick={onClick}
      aria-label={LABELS.SEARCH}
      className="group relative flex cursor-pointer z-10 hover:scale-105 transition-transform duration-300 sm:hidden items-center gap-2"
    >
      <FontAwesomeIcon icon={faSearch} className="h-5 w-5 text-[#228E8D]" />
      <ActionLabel text="Cerca alloggi" className="block sm:hidden w-32" />
    </Link>
  );
}
