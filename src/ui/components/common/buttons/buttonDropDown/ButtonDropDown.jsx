import { useCitiesByLetter, useCityLogic } from "@/ui/hooks";
import DropdownToggleButton from "./DropdownToggleButton";
import SearchInput from "../../form/SearchInput";
import DropdownMenu from "./DropdownMenu";
import DropdownList from "./DropdownList";
import { useDropdownPosition } from "../../form/FormSelect";
import { useRef } from "react";
//todo aggiusta la logica di rememberPreferredCity in quanto attualmente non funziona perché se la metto a false comunque mi inizializza la città slezionata o almeno me la visualizza sul togglebutton per il resto funziona tutto e non lo toccare
export default function ButtonDropDown({
  citiesByLetter = [],
  onCitySelect,
  className,
  startingWord = "Seleziona città",
  extended = false,
  bg = "semiTransparent",
  blur = "xl",
  isOpen,
  rememberPreferredCity = true,
  syncWithRedux = true,
  disabled = false,
}) {
  const {
    groups: fetchedCities,
    loading: citiesLoading,
    error: citiesError,
  } = useCitiesByLetter();

  const resolvedCities =
    citiesByLetter && citiesByLetter.length > 0
      ? citiesByLetter
      : fetchedCities || [];

  const isDisabled = disabled || citiesLoading || !!citiesError;

  // Hook per la gestione della logica
  const {
    city,
    searchTerm,
    activeIndex,
    isDropdownOpen,
    flatCities,
    handleCityClick,
    handleKeyDown,
    toggleDropdown,
    handleSearchChange,
    activeRefs,
    setActiveIndex,
  } = useCityLogic({
    citiesByLetter: resolvedCities,
    startingWord,
    onCitySelect,
    rememberPreferredCity,
    preferredCityKey: "buttonDropdownPreferredCity",
    syncWithRedux: syncWithRedux,
  });

  const buttonRef = useRef(null);
  const dropdownPosition = useDropdownPosition({
    isOpen: isDropdownOpen,
    position: "bottom-left",
    buttonRef,
    dropdownHeight: 300,
  });

  return (
    <div className="relative">
      <span ref={buttonRef}>
        <DropdownToggleButton
          city={city}
          isOpen={isDropdownOpen}
          onClick={(e) => {
            if (isDisabled) return;
            toggleDropdown();
            e.preventDefault();
          }}
          onKeyDown={handleKeyDown}
          className={className ?? ""}
          extended={extended}
          disabled={isDisabled}
        />
      </span>

      <DropdownMenu
        position={dropdownPosition}
        isOpen={isOpen || isDropdownOpen}
        setIsDropdownOpen={toggleDropdown}
        className="w-full max-h-72 overflow-y-auto"
        bg={bg}
        blur={blur}
      >
        <div className="sticky top-0 z-20 w-full flex items-center justify-end p-4 bg-gradient-to-b from-white/95 via-white/90 to-white/70 dark:from-[#0F172A] dark:via-[#0F172A] dark:to-[#0F172A] backdrop-blur-xl border-b border-white/60 dark:border-[#1F2937] shadow-sm">
          <SearchInput
            className="w-full"
            onChange={handleSearchChange}
            searchTerm={searchTerm}
          />
        </div>
        <DropdownList
          flatCities={flatCities}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          handleCityClick={handleCityClick}
          activeRefs={activeRefs}
          showCount={false}
        />
        {citiesError && (
          <p className="p-4 text-sm text-red-600">
            Errore nel caricamento città.
          </p>
        )}
      </DropdownMenu>
    </div>
  );
}
