import React from "react";

const LogoutIcon = ({
  className = "w-5 h-5",
  strokeWidth = 1.8,
  title = "Logout",
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path d="M15 3H9a2 2 0 0 0-2 2v4" />
      <path d="M7 15v4a2 2 0 0 0 2 2h6" />
      <path d="M21 12H10.5" />
      <path d="m18 9 3 3-3 3" />
      <path d="M10.5 12H7" />
    </svg>
  );
};

export default LogoutIcon;
