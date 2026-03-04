import { Link } from "react-router-dom";

import { LABELS, LOGO_SRC } from "../constants";
import { ROUTES } from "@/app/routes";

export default function LogoLink() {
  return (
    <Link
      to={ROUTES.HOME}
      type="button"
      aria-label={LABELS.HOME}
      className="hidden sm:block cursor-pointer z-10"
    >
      <img
        src={LOGO_SRC}
        alt="Logo"
        className="aspect-square w-10 h-10"
        aria-label={LABELS.LOGO}
      />
    </Link>
  );
}
