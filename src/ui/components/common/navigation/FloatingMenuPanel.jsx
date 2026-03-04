import { forwardRef } from "react";

const DEFAULT_POSITION_CLASS =
  "fixed top-0 sm:top-4 left-0 sm:left-auto right-0 sm:right-6 h-full sm:h-fit w-[100%] sm:w-[250px]";
const DEFAULT_PANEL_CLASS =
  "bg-white border-2 border-[#d4f1ef] shadow-[0_0_15px_5px_rgba(0,0,0,0.05)] sm:mt-16 z-50 sm:rounded-2xl";

const FloatingMenuPanel = forwardRef(
  (
    {
      children,
      className = "",
      positionClass = DEFAULT_POSITION_CLASS,
      panelClassName = DEFAULT_PANEL_CLASS,
      overlayPattern,
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      className={`${positionClass} ${panelClassName} ${className}`}
      {...props}
    >
      {/* overlay pattern: holes */}
      {overlayPattern && (
        <div className="pointer-events-none overflow-hidden rounded-2xl absolute inset-0 bg-white dot-hole-mask" />
      )}
      {children}
    </div>
  ),
);

export default FloatingMenuPanel;
