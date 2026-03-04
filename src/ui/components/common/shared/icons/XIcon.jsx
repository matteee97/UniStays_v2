import React from "react";

const XIcon = ({
  className = "w-5 h-5",
  title = "X",
  strokeWidth = 0,
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      strokeWidth={strokeWidth}
      className={className}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path d="M4.35 3.75h3.24l4.02 5.59L15.77 3.8h3.08l-5.47 6.93 5.78 8.52h-3.24l-4.18-6.02-4.02 6.02H4.11l5.52-7.28z" />
    </svg>
  );
};

export default XIcon;
