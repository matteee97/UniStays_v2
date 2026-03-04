import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";

const ActionButton = ({ icon, label, onClick, className = "" }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-2 py-1 hover:bg-gray-100 rounded-full text-gray-600 transition-colors ${className}`}
    title={label}
    aria-label={label}
  >
    <FontAwesomeIcon icon={icon} className="text-xs" />
  </button>
);

const UserMessageActions = ({
  actions,
  isVisible,
  align,
  onToggle,
  showToggle = false,
}) => {
  if (actions.length === 0) return null;
  const horizontalClass = align === "left" ? "-left-1" : "-right-1";
  const menuClassName = `absolute ${horizontalClass} top-1 ${align === "left" ? "-translate-x-[104%]" : "translate-x-[104%]"} -translate-y-[50%] bg-white/90 border-2 border-[#d4f1ef] text-xs rounded-full shadow-lg p-0.5 flex gap-1 z-10`;
  const toggleClassName = `absolute ${horizontalClass} top-1 -translate-y-1/2 bg-white border border-[#228e8c]/80 flex items-center rounded-full shadow-sm px-1.5 py-0.5 text-gray-600 hover:text-[#228E8D] transition-colors z-10`;

  return (
    <>
      {showToggle && (
        <button
          type="button"
          onClick={onToggle}
          className={toggleClassName}
          title="Azioni"
          aria-label="Azioni messaggio"
        >
          <FontAwesomeIcon icon={faEllipsisVertical} className="text-xs" />
        </button>
      )}
      {isVisible && (
        <div className={menuClassName}>
          {actions.map((action) => (
            <ActionButton
              key={action.key}
              icon={action.icon}
              label={action.label}
              onClick={action.onClick}
              className={action.className || ""}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default UserMessageActions;
