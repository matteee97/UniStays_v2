import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faHome,
  faUserGroup,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import Badge from "../../../../badges/Badge";

const BOOKING_MUTED_CLASS = "text-gray-700";

const UserBookingPreviewCard = ({
  title,
  date,
  roomsRequested,
  roomLabel,
  reason,
  isMyMessage,
}) => {
  const bookingCardClass = isMyMessage
    ? "border-white/40 dark:border-[#d4f1ee]/30 bg-[#d4f1ee]/40 dark:bg-[#1c363a]/35"
    : "border-[#d4f1ef] bg-white/80";

  return (
    <div
      className={`w-full rounded-2xl border p-3 ${bookingCardClass} ${BOOKING_MUTED_CLASS}`}
    >
      <div className="flex items-center gap-2">
        <FontAwesomeIcon
          icon={faHome}
          className="text-base text-[#228E8D] dark:text-[#21a190]"
        />
        <span className="text-base font-semibold">{title}</span>
      </div>
      <div className="hidden sm:flex flex-wrap gap-2 mt-2">
        {date && (
          <Badge icon={faCalendarDays} variant="secondary" size="xs">
            {date}
          </Badge>
        )}
        {(roomLabel || roomsRequested) && (
          <Badge icon={faUserGroup} variant="secondary" size="xs">
            {roomLabel
              ? roomLabel
              : `${roomsRequested} ${
                  roomsRequested === 1 ? "stanza" : "stanze"
                }`}
          </Badge>
        )}
      </div>
      {reason && (
        <div className="flex items-start gap-2 mt-2 text-xs">
          <FontAwesomeIcon
            icon={faInfoCircle}
            className="text-[10px] mt-[2px] text-[#228E8D] dark:text-[#21a190]"
          />
          <span>{reason}</span>
        </div>
      )}
    </div>
  );
};

export default UserBookingPreviewCard;
