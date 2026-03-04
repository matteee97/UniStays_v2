import React, { isValidElement } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

const SectionHeader = ({
  badgeText,
  title,
  description,
  icon = faStar,
  className = "",
  badgeClassName = "",
}) => {
  const iconElement = isValidElement(icon) ? (
    icon
  ) : (
    <FontAwesomeIcon icon={icon} className="text-[#228E8D]" />
  );

  return (
    <div className={`text-center mb-16 ${className}`}>
      <div
        className={`inline-flex items-center gap-3 bg-[#228E8D]/10 text-[#228E8D] px-6 py-2 rounded-full text-sm font-semibold mb-6 ${badgeClassName}`}
      >
        {iconElement}
        {badgeText && <span>{badgeText}</span>}
      </div>
      {title && (
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
          {title}
        </h2>
      )}
      {description && (
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
