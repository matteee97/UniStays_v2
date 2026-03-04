import { useState } from "react";
import { useWindowWidth } from "@/ui/hooks";

const CoolButton = ({
  children,
  className = "",
  type = "submit",
  ariaLabel = "Invia",
  animated = true,
  halo = false,
  shadow = true,
  ...props
}) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const width = useWindowWidth();
  const isMobile = width < 768;
  const showHalo = halo && !isMobile;

  const handleMouseMove = (e) => {
    if (isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const haloBackdropStyle = {
    pointerEvents: "none",
    background: "rgba(34, 142, 141, 0.65)",
    WebkitBackdropFilter: "blur(5px)",
    backdropFilter: "blur(3px)",
  };

  return (
    <button
      type={type}
      className={`
        group relative w-full p-[10px] bg-[#228E8D] rounded-full text-white text-center ${
          shadow ?? "shadow-md hover:shadow-lg"
        }transition-all duration-500 overflow-hidden 
         ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
      aria-label={ariaLabel}
      {...props}
    >
      {showHalo && (
        <>
          <div className="absolute inset-0 z-10" style={haloBackdropStyle} />
          <span className="cool-button-ring z-0">
            <span className="cool-button-spark" />
          </span>
        </>
      )}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
      {/* light spot */}
      {!isMobile && animated && (
        <span
          className="opacity-0 group-hover:opacity-100"
          style={{
            position: "absolute",
            top: mousePos.y,
            left: mousePos.x,
            width: 50,
            height: 50,
            pointerEvents: "none",
            borderRadius: "50%",
            background: "#2ef975",
            transform: "translate(-50%, -50%)",
            filter: "blur(55px)",
            transition: "all 0.35s ease",
            mixBlendMode: "screen",
            zIndex: 20,
          }}
        />
      )}
    </button>
  );
};

export default CoolButton;
