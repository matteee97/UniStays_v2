import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

const Avatar = ({ className = "" }) => {
  return (
    <div
      className={`w-8 h-8 bg-gradient-to-r from-[#228E8D]/10 to-[#62C1BA]/20 pt-[8px] px-[2px] rounded-full flex items-center overflow-hidden ${className}`}
    >
      <FontAwesomeIcon
        icon={faUser}
        className="text-[#228E8D] text-sm w-full h-full"
      />
    </div>
  );
};

export default Avatar;
