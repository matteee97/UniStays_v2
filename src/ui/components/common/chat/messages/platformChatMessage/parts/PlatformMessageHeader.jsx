import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const PlatformMessageHeader = ({ config, isCompact }) => (
  <div
    className={`flex items-center ${
      isCompact ? "justify-start gap-2 mb-2" : "justify-center gap-3 mb-3"
    }`}
  >
    <div
      className={`rounded-full ${config.iconBg} ${
        config.border
      } border-2 flex items-center justify-center ${
        isCompact ? "w-6 h-6" : "w-8 h-8"
      }`}
    >
      <FontAwesomeIcon
        icon={config.icon}
        className={`${config.iconText} ${
          isCompact ? "text-[11px]" : "text-sm"
        }`}
      />
    </div>
    <span
      className={`font-bold ${config.text} ${
        isCompact ? "text-sm" : "text-base"
      }`}
    >
      {config.title}
    </span>
  </div>
);

export default PlatformMessageHeader;
