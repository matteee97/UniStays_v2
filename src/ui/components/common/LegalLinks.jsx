import { Link } from "react-router-dom";
import { ROUTES } from "@/app/routes";

export default function LegalLinks() {
  return (
    <ul className="flex flex-col gap-4 text-gray-400 font-medium">
      <li>
        <Link to={ROUTES.PRIVACY} className="hover:underline" title="Privacy Policy">
          Privacy Policy
        </Link>
      </li>
      <li>
        <Link
          to={ROUTES.COOKIE_POLICY}
          className="hover:underline"
          title="Cookie Policy"
        >
          Cookie Policy
        </Link>
      </li>
      <li>
        <Link to={ROUTES.TERMS} className="hover:underline" title="Termini e Condizioni">
          Termini e Condizioni
        </Link>
      </li>
    </ul>
  );
}
