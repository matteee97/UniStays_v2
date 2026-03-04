import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faClock,
  faCheckDouble,
} from "@fortawesome/free-solid-svg-icons";
import { formatDate } from "@/ui/helpers/formatDate";

const formatMessageTime = (timestamp) => {
  if (!timestamp) return "";

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  if (diff < 60000) return "Ora";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m fa`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h fa`;
  return formatDate(date, "it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const UserMessageMeta = ({
  message,
  isMyMessage,
  showReadStatus,
  showDate,
}) => {
  if (!showReadStatus && !showDate) return null;

  return (
    <div
      className={`flex items-center gap-3 ${
        isMyMessage ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {isMyMessage && showReadStatus && (
        <>
          {message.isRead ? (
            <FontAwesomeIcon
              icon={faCheckDouble}
              className="text-[#24b3b0] text-xs"
            />
          ) : (
            <FontAwesomeIcon icon={faCheck} className="text-gray-400 text-xs" />
          )}
        </>
      )}
      {showDate && (
        <span className="text-xs text-gray-500 mt-1 flex items-center gap-1">
          <FontAwesomeIcon icon={faClock} className="text-xs" />
          {formatMessageTime(message.timestamp)}
        </span>
      )}
    </div>
  );
};

export default UserMessageMeta;
