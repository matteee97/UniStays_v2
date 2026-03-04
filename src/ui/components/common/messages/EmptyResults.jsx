import React, { useEffect, useState } from "react";
import { CoolButton } from "..";

export default function EmptyResults({
  title = "Nessun annuncio trovato",
  subtitle = "Al momento non ci sono annunci disponibili. Torna a controllare più tardi.",
  imageSrc = "/icons/SearchInProgressIcon.png",
  imageAlt = "Illustrazione 3D",
  onClearFilters,
  onResetSearch,
  tips = [],
}) {
  const [isVisible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    isVisible && (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-[#d4f1ef] py-4 px-1 sm:px-10 rounded-3xl sm:shadow-xl h-fit flex flex-col sm:flex-row gap-10 sm:gap-0 items-center justify-center sm:divide-x-2 divide-[#228E8D]/20 w-full max-w-2xl sm:mx-auto">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="w-28 sm:w-36 mr-2 my-2 animate-bumpLeft"
        />

        <div className="flex flex-col pl-4 gap-4">
          <h3 className="text-2xl sm:text-3xl text-center sm:text-left font-semibold text-gray-700 mb-2">
            {title}
          </h3>

          {subtitle && (
            <p className="text-sm sm:text-lg text-center sm:text-left font-medium text-gray-500">
              {subtitle}
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-2">
            {onClearFilters && (
              <CoolButton className="!w-40 !py-1" onClick={onClearFilters}>
                Rimuovi filtri
              </CoolButton>
            )}

            {onResetSearch && (
              <button
                onClick={onResetSearch}
                className="self-start bg-white hover:bg-[#228E8D]/10 border border-[#228E8D] text-[#228E8D] text-sm sm:text-base py-1 px-4 rounded-full transition"
              >
                Reimposta ricerca
              </button>
            )}
          </div>

          {tips.length > 0 && (
            <div className="">
              <h4 className="text-md font-semibold text-gray-600 mb-2">
                Suggerimenti:
              </h4>
              <ul className="list-disc list-inside text-sm text-gray-500">
                {tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    )
  );
}
