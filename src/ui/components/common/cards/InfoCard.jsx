import React from "react";

/**
 * Componente InfoCard riutilizzabile per mostrare informazioni
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Icona (componente React o emoji)
 * @param {string} props.title - Titolo della card
 * @param {string} props.description - Descrizione
 * @param {React.ReactNode} props.children - Contenuto aggiuntivo
 * @param {string} props.variant - Variante di stile (default, primary, secondary, success, warning, info)
 * @param {string} props.size - Dimensione (sm, md, lg)
 * @param {boolean} props.hoverable - Se la card deve avere effetti hover
 * @param {boolean} props.clickable - Se la card è cliccabile
 * @param {Function} props.onClick - Callback per il click
 * @param {string} props.className - Classi CSS aggiuntive
 * @param {string} props.iconClassName - Classi CSS per l'icona
 * @param {string} props.titleClassName - Classi CSS per il titolo
 * @param {string} props.descriptionClassName - Classi CSS per la descrizione
 */
export default function InfoCard({
  icon,
  title,
  description,
  children,
  variant = "default",
  size = "md",
  hoverable = true,
  clickable = false,
  onClick,
  className = "",
  iconClassName = "",
  titleClassName = "",
  descriptionClassName = "",
}) {
  // Varianti di stile
  const variants = {
    default: {
      container: `bg-white border-2 border-[#d4f1ef] ${
        hoverable ? "hover:border-[#228E8D]" : ""
      }`,
      icon: "bg-[#228E8D]/10 text-[#228E8D]",
      title: "text-gray-800",
      description: "text-gray-600",
    },
    primary: {
      container: `bg-[#228E8D] border-2 border-[#228E8D] text-white ${
        hoverable ? "hover:border-[#228E8D]" : ""
      }`,
      icon: `bg-white/20 text-white ${hoverable ? "hover:bg-white/10" : ""}`,
      title: "text-white",
      description: "text-white/90",
    },
    secondary: {
      container: `bg-white/80 backdrop-blur-lg border border-gray-300 ${
        hoverable ? "hover:border-gray-500" : ""
      }`,
      icon: `bg-gray-100 text-[#228E8D] ${
        hoverable ? "hover:bg-gray-200/70" : ""
      }`,
      title: "text-gray-700",
      description: "text-[#228E8D88]",
    },
    transparent: {
      container: `bg-transparent`,
      icon: `bg-[#228E8D] text-white`,
      title: "text-gray-700",
      description: "text-gray-500",
    },
    success: {
      container: `bg-green-50 border-2 border-green-200 ${
        hoverable ? "hover:border-green-300" : ""
      }`,
      icon: `bg-green-100 text-green-600 ${
        hoverable ? "hover:bg-green-100/10" : ""
      }`,
      title: "text-green-800",
      description: "text-green-600",
    },
    warning: {
      container: `bg-yellow-50 border-2 border-yellow-200 ${
        hoverable ? "hover:border-yellow-300" : ""
      }`,
      icon: `bg-yellow-100 text-yellow-600 ${
        hoverable ? "hover:bg-yellow-100/10" : ""
      }`,
      title: "text-yellow-800",
      description: "text-yellow-600",
    },
    info: {
      container: `bg-[#d4f1ef]/80 border-2 border-[#228E8D88] ${
        hoverable ? "hover:border-[#228E8D]" : ""
      }`,
      icon: `bg-[#fff] border-2 border-[#228E8D88] text-[#228E8D] ${
        hoverable ? "hover:bg-[#fff]/10" : ""
      }`,
      title: "text-gray-700 font-semibold",
      description: "text-gray-600",
    },
  };

  // Dimensioni
  const sizes = {
    sm: {
      container: "p-4",
      icon: "w-8 h-8 text-sm",
      title: "text-sm font-medium",
      description: "text-xs",
    },
    md: {
      container: "p-6",
      icon: "w-12 h-12 text-base",
      title: "text-base font-semibold",
      description: "text-sm",
    },
    lg: {
      container: "p-8",
      icon: "w-16 h-16 text-lg",
      title: "text-lg font-bold",
      description: "text-base",
    },
    xl: {
      container: "p-10",
      icon: "w-20 h-20 text-2xl font-extrabold",
      title: "text-xl font-bold",
      description: "text-lg",
    },
  };

  const selectedVariant = variants[variant];
  const selectedSize = sizes[size];

  const baseClasses = `rounded-2xl transition-all duration-300 ${selectedVariant.container} ${selectedSize.container}`;
  const hoverClasses = hoverable ? "hover:shadow-lg" : "";
  const clickableClasses = clickable ? "cursor-pointer active:scale-95" : "";
  const containerClasses = `${baseClasses} ${hoverClasses} ${clickableClasses} ${className}`;

  return (
    <div
      className={containerClasses}
      onClick={clickable ? onClick : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      {/* Icon Container */}
      {icon && (
        <div className="flex items-center justify-center mb-4">
          <div
            className={`${selectedVariant.icon} ${selectedSize.icon} rounded-full flex items-center justify-center ${iconClassName}`}
          >
            {typeof icon === "string" ? (
              <span className="text-lg">{icon}</span>
            ) : (
              icon
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="text-center">
        {title && (
          <h3
            className={`${selectedVariant.title} ${selectedSize.title} mb-2 ${titleClassName}`}
          >
            {title}
          </h3>
        )}

        {description && (
          <p
            className={`${selectedVariant.description} ${selectedSize.description} ${descriptionClassName}`}
          >
            {description}
          </p>
        )}

        {/* Additional Content */}
        {children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  );
}
