import DropdownItem from "./DropdownItem";

export default function DropdownList({
  flatCities,
  activeIndex,
  setActiveIndex,
  handleCityClick,
  activeRefs,
  showCount = true,
  rounded,
}) {
  const refs = activeRefs?.current ?? [];
  const activeOptionId =
    flatCities?.[activeIndex]?.city &&
    `city-option-${
      flatCities[activeIndex].city.id ||
      flatCities[activeIndex].city.slug ||
      `${flatCities[activeIndex].city.city}-${activeIndex}`
    }`;

  return (
    <div className="relative w-full">
      {/* Conteggio risultati - fuori dalla lista per evitare nesting di li */}
      {showCount && flatCities.length > 0 && (
        <div className="sticky top-2 w-full flex pt-1 pr-3 justify-end text-xs font-semibold text-[#228E8D]">
          {flatCities.length} risultat
          {flatCities.length > 1 ? "i" : "o"} trovat
          {flatCities.length > 1 ? "i" : "o"}
        </div>
      )}

      <ul
        id="dropdown-menu"
        role="listbox"
        aria-activedescendant={activeOptionId || undefined}
        aria-labelledby="dropdown-button"
        className="flex flex-col font-medium my-2 max-h-full overflow-y-auto relative gap-1 scroll-smooth"
      >
        {flatCities.length > 0 ? (
          flatCities.map((entry, i) => {
            const isNewLetter = entry.letter !== flatCities[i - 1]?.letter;
            const isActive = i === activeIndex;
            const optionId = `city-option-${
              entry.city.id || entry.city.slug || `${entry.city.city}-${i}`
            }`;
            return (
              <li
                key={
                  entry.city.id || entry.city.slug || `${entry.city.city}-${i}`
                }
                role="option"
                aria-selected={i === activeIndex}
                id={optionId}
              >
                {isNewLetter && (
                  <p className="text-[#228E8D] text-left px-3 text-[11px] font-semibold tracking-[0.25em] uppercase">
                    {entry.letter}
                  </p>
                )}
                <DropdownItem
                  isActive={isActive}
                  onClick={() => handleCityClick(entry.city)}
                  onHover={() => setActiveIndex(i)}
                  refCallback={(el) => {
                    refs[i] = el;
                  }}
                  rounded={rounded}
                >
                  {entry.city.city}
                  <span className="text-[#228e8c8d] text-sm">
                    <br />
                    {entry.city.university}
                  </span>
                </DropdownItem>
              </li>
            );
          })
        ) : (
          <li className="px-4 py-4 text-gray-500 text-center bg-white/75 dark:bg-[#0F1829] rounded-2xl border border-white/60 dark:border-[#1F2937] shadow-inner">
            Nessun risultato trovato
          </li>
        )}
      </ul>
    </div>
  );
}
