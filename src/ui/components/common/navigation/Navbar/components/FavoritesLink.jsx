import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-regular-svg-icons";

import ActionLabel from "@/ui/components/common/indicators/ActionLabel.jsx";
import { LABELS } from "../constants";
import { ROUTES } from "@/app/routes";

export default function FavoritesLink({ onClick }) {
  return (
    <Link
      to={ROUTES.FAVORITES}
      onClick={onClick}
      aria-label={LABELS.FAVORITES}
      className="group relative hidden cursor-pointer z-10 hover:scale-105 transition-transform duration-300 sm:flex items-center gap-2"
    >
      <FontAwesomeIcon icon={faHeart} className="h-5 w-5 text-[#228E8D]" />
      <ActionLabel text="Preferiti" />
    </Link>
  );
}
