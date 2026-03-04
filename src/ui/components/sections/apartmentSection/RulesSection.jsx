import React from "react";
import { rulesConfig } from "@/ui/data/rulesConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const RulesSection = ({ regole }) => {
  if (!regole) {
    return <></>;
  }
  return (
    <div>
      <ul className="text-sm mt-3 text-gray-500 grid grid-cols-1 sm:grid-cols-2 gap-y-2">
        {rulesConfig.map((item) => {
          const value = regole?.[item.key];
          if (value === undefined || value === null) return null;
          if (item.key === "studentsOnly" && value === "tutti") return null;

          const isOnlyForMaleStudents = value === "maschi";
          const isBoolean = typeof value === "boolean";
          const label = isBoolean
            ? value
              ? item.labelTrue || item.label
              : item.labelFalse || item.label
            : item.label;

          return (
            <li key={item.key} className="flex items-center gap-3">
              <FontAwesomeIcon
                icon={item.icon}
                className="text-[#228E8D] h-4 w-4"
              />
              {item.key === "studentsOnly" ? (
                <span>
                  {isOnlyForMaleStudents ? `${label} ` : `${label} `}
                  {value}
                </span>
              ) : (
                <span>{label}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default RulesSection;
