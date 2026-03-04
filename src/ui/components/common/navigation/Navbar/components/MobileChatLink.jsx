import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments } from "@fortawesome/free-regular-svg-icons";

import { LABELS } from "../constants";
import { ROUTES } from "@/app/routes";

export default function MobileChatLink({ onClick, unreadCount }) {
  return (
    <Link
      to={ROUTES.CHAT}
      onClick={onClick}
      aria-label={LABELS.CHAT}
      className="cursor-pointer z-10 flex items-center justify-center relative"
    >
      <FontAwesomeIcon icon={faComments} className="text-[#228E8D] w-6 h-6" />
      {unreadCount > 0 && (
        <div className="absolute -top-1 -right-2 text-xs px-1 border-2 border-[#d4f1ef] rounded-full bg-[#228E8D] text-[#d4f1ef]">
          {unreadCount}
        </div>
      )}
    </Link>
  );
}
