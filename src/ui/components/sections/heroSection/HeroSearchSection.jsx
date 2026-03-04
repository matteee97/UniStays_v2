import React from "react";
import CitySearch from "@/ui/components/common/search/CitySearch.jsx";

const HeroSearchSection = ({
  onSearch,
  className = "",
  title = "Dove vuoi studiare?",
  subtitle = "Seleziona la tua città universitaria e trova subito la casa perfetta",
  placeholder = "Citta o richiesta smart (es: annunci a Camerino sotto 300 euro)",
  startingWord,
}) => {
  return (
    <div className={className}>
      {(title || subtitle) && (
        <div className="text-left mb-6">
          {title && (
            <h2 className="text-xl md:text-2xl font-semibold text-[#0f3b3a] dark:text-white mb-2">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-slate-600/80 dark:text-slate-200">{subtitle}</p>
          )}
        </div>
      )}

      <div className="relative flex gap-4 items-center justify-start">
        <CitySearch
          placeholder={placeholder}
          className="w-full h-14"
          onSearch={onSearch}
          startingWord={startingWord}
        />
      </div>
    </div>
  );
};

export default HeroSearchSection;
