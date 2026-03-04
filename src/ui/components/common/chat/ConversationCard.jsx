import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faTrash } from "@fortawesome/free-solid-svg-icons";
import PropTypes from "prop-types";
import LoadingIcon from "../shared/icons/LoadingIcon";
import { formatDate } from "@/ui/helpers/formatDate";
import { FALLBACK_IMAGE } from "@/ui/shared/constants";

const ConversationCard = ({
  conversation,
  isActive = false,
  participantName,
  participantAvatar,
  onClick,
  onDelete,
  className = "",
  size = "large", // "large" | "small" | "medium"
  showTime = true,
  showLastMessage = true,
  showApartmentTitle = true,
  customTimeFormat = null,
  customStyles = {},
  disabled = false,
  loading = false,
}) => {
  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return "";

    const now = new Date();
    const messageTime = timestamp.toDate
      ? timestamp.toDate()
      : new Date(timestamp);
    const diffInHours = (now - messageTime) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes < 1 ? "Ora" : `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else if (diffInHours < 168) {
      // 7 giorni
      return `${Math.floor(diffInHours / 24)}g`;
    } else {
      return formatDate(messageTime, "it-IT", {
        day: "2-digit",
        month: "2-digit",
      });
    }
  };

  // Configurazione dimensioni
  const sizeConfig = {
    small: {
      avatar: "w-12 h-12",
      padding: "p-3",
      borderRadius: "rounded-lg",
      text: "text-xs",
    },
    medium: {
      avatar: "w-14 h-14",
      padding: "p-4",
      borderRadius: "rounded-xl",
      text: "text-sm",
    },
    large: {
      avatar: "w-16 h-16",
      padding: "p-4",
      borderRadius: "rounded-2xl",
      text: "text-base",
    },
  };

  const config = sizeConfig[size] || sizeConfig.large;

  if (loading) {
    return <LoadingIcon />;
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full ${config.padding} text-left ${
        config.borderRadius
      } transition-all duration-300 shadow-[0_0_10px_3px_rgba(0,0,0,0.02)] ${className} ${
        isActive
          ? "bg-gradient-to-r from-[#228E8D] to-[#50b9b2] border-2 border-[#2f9997] text-white"
          : "bg-white hover:bg-[#d4f1ef]/10 border-2 border-[#d4f1ef]"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      style={customStyles}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          {participantAvatar ? (
            <img
              src={participantAvatar}
              alt={participantName}
              className={`${config.avatar} ${config.borderRadius} object-cover shadow-[0_0_12px_5px_rgba(0,0,0,0.23)]`}
            />
          ) : (
            <div
              className={`${config.avatar} bg-gradient-to-br from-gray-300 to-gray-400 ${config.borderRadius} flex items-center justify-center shadow-[0_0_12px_5px_rgba(0,0,0,0.23)]`}
            >
              <FontAwesomeIcon icon={faUser} className="text-white text-xl" />
            </div>
          )}
          <img
            src={conversation.apartmentImage ?? FALLBACK_IMAGE}
            alt={conversation.apartmentTitle}
            className={`${config.avatar} ${config.borderRadius} border-2 border-[#b0dbd8] object-cover absolute -bottom-2 -left-2 w-7 h-7 shadow-[-2px_0_5px_3px_rgba(0,0,0,0.10)]`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p
              className={`font-bold text-base truncate ${config.text} ${
                isActive ? "text-white" : "text-gray-900"
              }`}
            >
              {participantName}
            </p>
            <div className="flex items-center gap-2">
              {showTime && conversation.lastMessageTime && (
                <span
                  className={`text-xs ${
                    isActive ? "text-white/80" : "text-gray-400"
                  }`}
                >
                  {customTimeFormat
                    ? customTimeFormat(conversation.lastMessageTime)
                    : `${formatLastMessageTime(
                        conversation.lastMessageTime
                      )} ago`}
                </span>
              )}
              {onDelete && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className={`px-1 rounded-full hover:bg-opacity-20 transition-colors cursor-pointer ${
                    isActive
                      ? "text-white/70 hover:bg-white hover:text-white"
                      : "text-gray-400 hover:bg-red-100 hover:text-red-500"
                  }`}
                  title="Elimina conversazione"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      onDelete();
                    }
                  }}
                >
                  <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                </div>
              )}
            </div>
          </div>

          {showApartmentTitle && (
            <p
              className={`text-sm truncate ${
                isActive ? "text-white/90" : "text-gray-600"
              }`}
            >
              {conversation.apartmentTitle || "Chat"}
            </p>
          )}

          {showLastMessage && conversation.lastMessage && (
            <p
              className={`text-sm truncate ${
                isActive ? "text-white/80" : "text-gray-500"
              }`}
            >
              {conversation.lastMessage}
            </p>
          )}
        </div>
      </div>
    </button>
  );
};

ConversationCard.propTypes = {
  conversation: PropTypes.shape({
    id: PropTypes.string.isRequired,
    lastMessage: PropTypes.string,
    lastMessageTime: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.string,
      PropTypes.number,
    ]),
    apartmentTitle: PropTypes.string,
  }).isRequired,
  isActive: PropTypes.bool,
  participantName: PropTypes.string.isRequired,
  participantAvatar: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  className: PropTypes.string,
  size: PropTypes.oneOf(["small", "medium", "large"]),
  variant: PropTypes.oneOf(["compact", "default", "detailed"]),
  showTime: PropTypes.bool,
  showLastMessage: PropTypes.bool,
  showApartmentTitle: PropTypes.bool,
  customTimeFormat: PropTypes.func,
  customStyles: PropTypes.object,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
};

export default ConversationCard;
