import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

/**
 * Componente per organizzare le sezioni del form
 * @param {Object} props
 * @param {string} props.title - Titolo della sezione
 * @param {string} props.description - Descrizione della sezione
 * @param {React.ReactNode} props.children - Contenuto della sezione
 * @param {string} props.icon - Icona della sezione
 * @param {boolean} props.required - Se la sezione è obbligatoria
 * @param {string} props.className - Classi CSS aggiuntive
 */
export default function FormSection({
  title,
  description,
  children,
  icon = <FontAwesomeIcon icon={faInfoCircle} />,
  required = false,
  className = "",
  shadow = true,
}) {
  return (
    <div
      className={`bg-white rounded-2xl p-6 border-2 border-[#d4f1ef] ${
        shadow ? "shadow-lg" : ""
      } ${className}`}
    >
      {/* Section Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl text-[#228E8D]">{icon}</span>
          <h2 className="text-xl font-bold text-gray-700">
            {title}
            {required && <span className="text-red-400 ml-1">*</span>}
          </h2>
        </div>

        {description && (
          <p className="text-gray-600 text-sm ml-9">{description}</p>
        )}
      </div>

      {/* Section Content */}
      <div className="space-y-4">{children}</div>
    </div>
  );
}
