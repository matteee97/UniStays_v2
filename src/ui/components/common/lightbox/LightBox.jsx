import React from "react";
import { CloseButton } from "..";

const LightBox = ({ children, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 "
      onClick={onClose}
    >
      <div className="relative w-full h-full flex items-center justify-center py-4 sm:px-4">
        <CloseButton
          className="absolute top-4 right-4 z-50"
          onClick={onClose}
        />
        {children}
      </div>
    </div>
  );
};

export default LightBox;
