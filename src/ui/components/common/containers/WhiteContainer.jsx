import React from "react";

const WhiteContainer = ({ children, className = "rounded-lg", ...props }) => {
  return (
    <div
      className={`bg-white border-2 border-[#d4f1ef] p-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default WhiteContainer;
