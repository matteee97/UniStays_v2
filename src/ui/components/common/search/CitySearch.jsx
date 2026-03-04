import { forwardRef, useMemo, useRef } from "react";
import {
  useCitiesByLetter,
  useCityLogic,
  useClickOutside,
  useNavigateToCity,
} from "@/ui/hooks/index.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import DropdownMenu from "../buttons/buttonDropDown/DropdownMenu.jsx";
import DropdownList from "../buttons/buttonDropDown/DropdownList.jsx";
import { useDropdownPosition } from "../form/FormSelect.jsx";
import ActionLabel from "../indicators/ActionLabel.jsx";
import { APARTMENT_FILTER_DEFAULTS } from "@/application/filters/apartmentFilters.js";
import { buildSmartFiltersQuery } from "@/application/filters/smartFiltersQuery.js";
import { createGuidedSearchFilterPlan } from "@/application/useCases/createGuidedSearchFilterPlan.js";
import { PRICES, STORAGE_KEYS } from "@/shared/types/index.js";
import StarBorder from "@/ui/components/common/buttons/buttonsEffects/StarBorder.jsx";

const DEFAULT_SMART_BUDGET_EUR = PRICES.MAX_PRICE;

const normalizeSearchText = (value = "") =>
  String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const toCitySearchVariants = (cityObj) => {
  const cityName = cityObj?.city?.split?.("(")?.[0] || cityObj?.city || "";
  const university = cityObj?.university || "";

  return [cityName, university]
    .map((entry) => normalizeSearchText(entry))
    .filter((entry) => entry.length >= 3);
};

const findBestCityFromPrompt = ({
  prompt,
  allCities = [],
  fallbackCities = [],
  currentCityLabel = "",
}) => {
  const normalizedPrompt = normalizeSearchText(prompt);
  if (!normalizedPrompt) return fallbackCities[0]?.city || null;

  let bestMatch = null;
  let bestScore = 0;

  allCities.forEach((cityObj) => {
    const variants = toCitySearchVariants(cityObj);
    variants.forEach((variant) => {
      if (!variant) return;
      const hasBoundaryMatch =
        normalizedPrompt.includes(` ${variant} `) ||
        normalizedPrompt.startsWith(`${variant} `) ||
        normalizedPrompt.endsWith(` ${variant}`) ||
        normalizedPrompt === variant;

      if (hasBoundaryMatch && variant.length > bestScore) {
        bestMatch = cityObj;
        bestScore = variant.length;
      }
    });
  });

  if (bestMatch) return bestMatch;
  if (fallbackCities.length > 0) return fallbackCities[0].city;

  const normalizedCurrentLabel = normalizeSearchText(currentCityLabel);
  if (!normalizedCurrentLabel) return null;

  return (
    allCities.find(
      (cityObj) =>
        normalizeSearchText(
          cityObj?.city?.split?.("(")?.[0] || cityObj?.city,
        ) === normalizedCurrentLabel,
    ) || null
  );
};

const getStoredPreferredCity = () => {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(STORAGE_KEYS.PREFERRED_CITY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed.city === "string" ? parsed : null;
  } catch {
    return null;
  }
};

const toDefaultSmartPrompt = (cityObj) => {
  const cityName = cityObj?.city?.split?.("(")?.[0]?.trim?.() || cityObj?.city;
  if (!cityName) return "";
  return `annunci a ${cityName} sotto ${DEFAULT_SMART_BUDGET_EUR} euro`;
};

const buildSmartSearchPreview = ({
  prompt,
  allCities = [],
  fallbackCities = [],
  currentCityLabel = "",
}) => {
  const normalizedPrompt = typeof prompt === "string" ? prompt.trim() : "";
  if (!normalizedPrompt) return null;

  const plan = createGuidedSearchFilterPlan({
    prompt: normalizedPrompt,
    baseFilters: APARTMENT_FILTER_DEFAULTS,
  });
  if (!plan.hasSignals) return null;

  const detectedCity = findBestCityFromPrompt({
    prompt: normalizedPrompt,
    allCities,
    fallbackCities,
    currentCityLabel,
  });
  if (!detectedCity) return null;

  return {
    prompt: normalizedPrompt,
    detectedCity,
    filtersCount: Math.max(1, plan.criteria?.length || 0),
    mode: "typed",
  };
};

const buildDefaultSmartSearchPreview = (preferredCity) => {
  if (!preferredCity) return null;

  const prompt = toDefaultSmartPrompt(preferredCity);
  if (!prompt) return null;

  const plan = createGuidedSearchFilterPlan({
    prompt,
    baseFilters: APARTMENT_FILTER_DEFAULTS,
  });
  if (!plan.hasSignals) return null;

  return {
    prompt,
    detectedCity: preferredCity,
    filtersCount: Math.max(1, plan.criteria?.length || 0),
    mode: "default",
  };
};

const CitySearch = forwardRef(
  (
    {
      onCitySelect,
      onSearch,
      placeholder = "Cerca citta oppure richiesta smart (es: Camerino sotto 300 euro)",
      startingWord = "",
      className = "",
      syncWithRedux = true,
      rememberPreferredCity = true,
      ...props
    },
    ref,
  ) => {
    const { groups: citiesByLetter, error: citiesError } = useCitiesByLetter();
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    // Hook per la gestione della logica delle città
    const {
      city,
      searchTerm,
      activeIndex,
      isDropdownOpen,
      flatCities,
      handleCityClick,
      handleKeyDown,
      handleSearchChange,
      setActiveIndex,
      setIsDropdownOpen,
      activeRefs,
    } = useCityLogic({
      citiesByLetter: citiesByLetter || [],
      startingWord: startingWord || "",
      onCitySelect, // Ripristino onCitySelect per la navigazione
      syncWithRedux: syncWithRedux,
      rememberPreferredCity: rememberPreferredCity,
    });

    const goTo = useNavigateToCity();
    const allCities = useMemo(
      () =>
        citiesByLetter.flatMap(({ cities }) =>
          Array.isArray(cities) ? cities : [],
        ),
      [citiesByLetter],
    );
    const preferredCityFromStorage = useMemo(
      () => (rememberPreferredCity ? getStoredPreferredCity() : null),
      [rememberPreferredCity],
    );
    const typedSmartSearchPreview = useMemo(
      () =>
        buildSmartSearchPreview({
          prompt: searchTerm,
          allCities,
          fallbackCities: flatCities,
          currentCityLabel: city,
        }),
      [allCities, city, flatCities, searchTerm],
    );
    const defaultSmartSearchPreview = useMemo(
      () => buildDefaultSmartSearchPreview(preferredCityFromStorage),
      [preferredCityFromStorage],
    );
    const smartSearchPreview = useMemo(
      () =>
        searchTerm.trim().length > 0
          ? typedSmartSearchPreview
          : defaultSmartSearchPreview,
      [defaultSmartSearchPreview, searchTerm, typedSmartSearchPreview],
    );
    const smartDetectedCityLabel =
      smartSearchPreview?.detectedCity?.city?.split?.("(")?.[0]?.trim?.() ||
      smartSearchPreview?.detectedCity?.city ||
      "";
    const hasTypedQuery = searchTerm.trim().length > 0;
    const useSmartSearchIcon = Boolean(hasTypedQuery && !isDropdownOpen);

    // Gestisce la navigazione alla città selezionata
    const handleSearch = (selectedCity) => {
      if (!selectedCity) return;
      goTo(selectedCity, null);
    };

    // Gestisce il focus dell'input
    const handleInputFocus = () => {
      if (searchTerm.trim() || defaultSmartSearchPreview) {
        setIsDropdownOpen(true);
      }
    };

    // Gestisce il cambio della ricerca
    const handleInputChange = (e) => {
      const value = e.target.value;
      handleSearchChange(value);

      const nextSmartPreview = buildSmartSearchPreview({
        prompt: value,
        allCities,
        fallbackCities: flatCities,
        currentCityLabel: city,
      });

      const shouldOpen =
        value.trim().length > 0
          ? flatCities.length > 0 || Boolean(nextSmartPreview)
          : Boolean(defaultSmartSearchPreview);
      setIsDropdownOpen(shouldOpen);
    };

    // Click outside per nascondere i risultati
    useClickOutside(
      dropdownRef,
      () => {
        if (isDropdownOpen) setIsDropdownOpen(false);
      },
      undefined,
      isDropdownOpen,
    );

    // Gestisce la ricerca
    const handleSearchSubmit = (e) => {
      e.preventDefault();

      const rawSearch = (searchTerm || "").trim();
      if (rawSearch && typedSmartSearchPreview) {
        goTo(
          typedSmartSearchPreview.detectedCity,
          buildSmartFiltersQuery(rawSearch),
        );
        return;
      }

      if (onSearch) {
        onSearch(e, flatCities);
      } else if (flatCities.length > 0) {
        // Naviga alla prima città trovata
        handleSearch(flatCities[0].city);
      }
    };

    const position = useDropdownPosition({
      isOpen: isDropdownOpen,
      position: "bottom-left",
      buttonRef: inputRef,
    });

    return (
      <div ref={dropdownRef} className={`relative ${className}`} {...props}>
        {/* Search Input with search button */}
        <form onSubmit={handleSearchSubmit} className="relative h-full">
          <div
            className="relative h-full flex items-center gap-4 overflow-visible"
            ref={inputRef}
          >
            <StarBorder as="div"
                        className="w-full h-full"
                        color="cyan"
                        speed="5s">
              <input
                id={inputRef?.current?.id || "city-search-input"}
                ref={ref}
                type="text"
                placeholder={city || placeholder}
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onKeyDown={handleKeyDown}
                className="w-full h-full px-6 py-2 bg-white/90 backdrop-blur-xl border-2 border-[#d4f1ef] rounded-full text-gray-700 placeholder-gray-400 focus:outline-none"
              />
            </StarBorder>

            {/* Pulsante ricerca */}
            <button
              type="submit"
              className="group h-[calc(100%-0.5rem)] bg-[#228E8D] flex items-center justify-center text-white px-4 py-2 rounded-full hover:scale-105 transition-all duration-300 text-sm font-medium shadow-sm"
            >
              <FontAwesomeIcon
                icon={useSmartSearchIcon ? faWandMagicSparkles : faSearch}
                className="w-4 h-4"
              />
              <ActionLabel
                text={useSmartSearchIcon ? "Ricerca intelligente" : "Cerca"}
                className={useSmartSearchIcon ? "w-32" : ""}
              />
            </button>
          </div>
        </form>

        {/* Dropdown - Riutilizza i componenti esistenti */}
        <DropdownMenu
          position={position}
          isOpen={isDropdownOpen}
          setIsDropdownOpen={setIsDropdownOpen}
          className="w-full max-h-72 overflow-y-auto"
          bg="white"
          blur="none"
        >
          {smartSearchPreview && (
            <button
              type="button"
              onClick={() =>
                goTo(
                  smartSearchPreview.detectedCity,
                  buildSmartFiltersQuery(smartSearchPreview.prompt),
                )
              }
              className="w-full text-left px-4 py-2 border-b border-[#d4f1ef] bg-gradient-to-r from-[#e6faf8] dark:from-[#14202e] to-white dark:to-[#0F172A] hover:from-[#dff9f8] dark:hover:from-[#1c525167] hover:to-[#f1faf9] transition-colors duration-200"
            >
              <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#228E8D]">
                {smartSearchPreview.mode === "default"
                  ? "Ricerca smart predefinita"
                  : "Ricerca smart"}
              </p>
              <p className="text-sm text-slate-700 mt-1">
                {smartSearchPreview.mode === "default"
                  ? "Citta preferita:"
                  : "Citta rilevata:"}{" "}
                <strong className="text-slate-900 dark:text-white">
                  {smartDetectedCityLabel}
                </strong>
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Filtri che verranno applicati:{" "}
                <strong>{smartSearchPreview.filtersCount}</strong>
              </p>
            </button>
          )}

          {citiesError && (
            <p className="p-4 text-sm text-red-600">
              Errore nel caricamento delle città.
            </p>
          )}
          {!citiesError && flatCities.length > 0 && (
            <DropdownList
              flatCities={flatCities}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex} // Ripristino activeIndex on hover
              handleCityClick={handleCityClick}
              activeRefs={activeRefs}
            />
          )}
        </DropdownMenu>
      </div>
    );
  },
);

CitySearch.displayName = "CitySearch";

export default CitySearch;
