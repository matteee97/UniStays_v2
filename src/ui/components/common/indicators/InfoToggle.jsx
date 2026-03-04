import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ActionLabel from "./ActionLabel";

const baseBoxClasses =
  "bg-white/90 backdrop-blur-md border-2 border-[#d4f1ef] rounded-2xl p-2 text-[11px] leading-5 text-gray-700 ";

const InfoToggle = ({
  title,
  hint = "",
  className = "",
  summaryClassName = "",
  summaryContent = null,
  useIcon = true,
  children,
  ...props
}) => {
  return (
    <details className={`${baseBoxClasses} ${className}`} {...props}>
      <summary
        className={`group cursor-pointer font-semibold text-[#228E8D] flex items-center justify-between gap-2 ${summaryClassName}`}
      >
        {summaryContent || (
          <>
            {useIcon && (
              <FontAwesomeIcon icon={faInfoCircle} className="text-[#228E8D]" />
            )}
            {hint ? (
              <span className="text-[10px] font-normal text-gray-500">
                {hint}
              </span>
            ) : null}
          </>
        )}
        {title && <ActionLabel text={title} className="w-36" alwaysBottom />}
      </summary>
      {children ? <div className="mt-2 space-y-1">{children}</div> : null}
    </details>
  );
};

export default InfoToggle;
