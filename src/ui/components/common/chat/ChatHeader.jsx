import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faList,
  faTimes,
  faMountainSun,
} from "@fortawesome/free-solid-svg-icons";
import PropTypes from "prop-types";
import { ImageWithSkeleton } from "..";

const ChatHeader = ({
  apartmentId,
  title,
  subtitle,
  avatar,
  onToggleList,
  onClose,
  variant = "default", // "default" | "compact" | "minimal"
  theme = "light", // "light" | "dark" | "gradient"
  actions = [], // Array di azioni personalizzate
  className = "",
  customStyles = {},
  sticky = true,
  showSubtitle = true,
  titleSize = "xl", // "sm" | "md" | "lg" | "xl" | "2xl"
  onTitleClick = () => {},
}) => {
  // Configurazione temi
  const themeConfig = {
    light: "bg-white border-b-2 border-[#d4f1ef]",
    dark: "bg-gray-900 border-b-2 border-gray-700",
    gradient:
      "bg-gradient-to-r from-[#228E8D] to-[#62C1BA] backdrop-blur-xl border-b-2 border-white/20",
  };

  // Configurazione varianti
  const variantConfig = {
    default: { padding: "pl-2 pr-6 py-4", gap: "gap-4", headerHeight: "h-20" },
    compact: { padding: "pl-2 pr-4 py-2", gap: "gap-2", headerHeight: "h-16" },
    minimal: { padding: "pl-2 pr-4 py-3", gap: "gap-3", headerHeight: "h-16" },
  };

  // Configurazione dimensioni titolo
  const titleSizeConfig = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
  };

  const config = variantConfig[variant] || variantConfig.default;
  const themeClasses = themeConfig[theme] || themeConfig.light;
  const titleClasses = titleSizeConfig[titleSize] || titleSizeConfig.xl;

  return (
    <div
      className={`${themeClasses} overflow-hidden flex-shrink-0 ${
        sticky ? "fixed sm:sticky top-0 right-0 left-0" : ""
      } z-10  ${className}`}
      style={customStyles}
    >
      <div className="hidden sm:block absolute -bottom-2 left-0 w-[318px] h-2 bg-white"></div>
      <div
        className={`absolute top-0 left-0 ${config.headerHeight} w-36 flex items-center justify-center -z-10`}
      >
        {avatar ? (
          <ImageWithSkeleton
            src={avatar}
            alt={title}
            containerClassName="w-full h-full object-cover shadow-[0px_0_8px_3px_rgba(0,0,0,0.20)] overflow-hidden"
            rounded="rounded-none"
            aspectRatio={"aspect-none"}
            skeleton={<div className="bg-[#d4f1ef]/70 animate-pulse" />}
          />
        ) : (
          <div className="w-full h-full pt-[13px] px-[3px] bg-gradient-to-r from-[#228E8D] to-[#62C1BA] flex items-end justify-center overflow-hidden">
            <FontAwesomeIcon
              icon={faMountainSun}
              className="text-white text-lg w-14 h-full translate-y-3"
            />
          </div>
        )}
        <div className="absolute bg-gradient-to-l to-transparent via-transparent from-white dark:from-[#0F1829] w-full h-full" />
      </div>
      <div
        className={config.padding + " bg-white ml-36 " + config.headerHeight}
      >
        <div className="flex items-center justify-between">
          <div className={`flex items-center ${config.gap}`}>
            <div
              className={`flex items-center gap-3 flex-1 cursor-pointer`}
              onClick={() => onTitleClick(apartmentId)}
            >
              <div className="pr-2">
                <h1
                  className={`${titleClasses} font-bold text-gray-800 line-clamp-1 sm:line-clamp-2`}
                >
                  {title}
                </h1>
                {showSubtitle && subtitle && (
                  <p className="text-sm text-gray-500 line-clamp-1 sm:line-clamp-2">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Azioni personalizzate */}
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title={action.title}
              >
                <FontAwesomeIcon
                  icon={action.icon}
                  className="text-[#228E8D]"
                />
              </button>
            ))}

            {onToggleList && (
              <button
                onClick={onToggleList}
                className="sm:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FontAwesomeIcon icon={faList} className="text-[#228E8D]" />
              </button>
            )}

            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} className="text-[#228E8D]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

ChatHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  avatar: PropTypes.node,
  onToggleList: PropTypes.func,
  onClose: PropTypes.func,
  variant: PropTypes.oneOf(["default", "compact", "minimal"]),
  theme: PropTypes.oneOf(["light", "dark", "gradient"]),
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.object.isRequired,
      onClick: PropTypes.func.isRequired,
      title: PropTypes.string,
    }),
  ),
  className: PropTypes.string,
  customStyles: PropTypes.object,
  sticky: PropTypes.bool,
  showSubtitle: PropTypes.bool,
  titleSize: PropTypes.oneOf(["sm", "md", "lg", "xl", "2xl"]),
};

export default ChatHeader;
