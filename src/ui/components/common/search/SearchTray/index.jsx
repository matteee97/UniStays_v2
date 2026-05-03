import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBed,
  faCalendarAlt,
  faFilter,
  faMapMarkerAlt,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";

import CounterBox from "@/ui/components/common/form/CounterBox";
import FormSelect from "@/ui/components/common/form/FormSelect";
import SearchInput from "@/ui/components/common/form/SearchInput";
import FloatingMenuPanel from "@/ui/components/common/navigation/FloatingMenuPanel";
import CoolButton from "@/ui/components/common/buttons/CoolButton";
import Modal from "@/ui/components/common/modals/Modal";
import Filters from "@/ui/components/sections/apartmentsSection/filters/components/Filters";
import DropdownList from "@/ui/components/common/buttons/buttonDropDown/DropdownList";
import {
  useApartmentsFilters,
  useCitiesByLetter,
  useCityLogic,
  useClickOutside,
} from "@/ui/hooks";
import {
  countActiveApartmentFilterGroups,
  APARTMENT_FILTER_DEFAULTS,
  normalizeApartmentFilters,
} from "@/application/filters/apartmentFilters";
import { buildApartmentFiltersQuery } from "@/application/filters/apartmentFiltersQuery";
import { withSearchModeQuery } from "@/application/filters/searchModeQuery";
import { createApartmentFilters } from "@/application/useCases/createApartmentFilters";
import { buildApartmentsFiltersQuery } from "@/infrastructure/firebase/queries/apartmentQueries";
import {
  ROOM_TYPE_LABELS,
  ROOM_TYPE_OPTIONS,
} from "@/ui/components/sections/apartmentsSection/filters/roomTypeOptions";
import useNavigateToCity from "@/ui/hooks/interactives/useNavigateToCity";

import ActiveAnchor from "./ActiveAnchor";
import SearchSegment from "./SearchSegment";
import useRelativeAnchorLayout from "./useRelativeAnchorLayout";
import { useSelector } from "react-redux";
import FormDatePicker from "../../form/FormDatePicker";
import { APARTMENTS } from "@/shared/types";
import { normalizeCoordinates } from "@/application/mappers/coordinates";
import { buildPublishedCityApartmentsQuery } from "@/infrastructure/firebase/queries/apartmentQueries";
import { toIsoDate } from "@/shared/utils/date.utils.js";

const PANEL_WIDTH = {
  destination: 880,
  dates: 455,
  room: 320,
  filters: 360,
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const formatShortDate = (value) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
  }).format(date);
};

/**
 * Shared Airbnb-style search tray:
 * - one animated anchor for active segment
 * - one shared floating panel that moves between segments
 * - compact/expanded segment behavior
 */
/**
 * @param {"apartments" | "rooms"} searchMode - Determines if searching for entire apartments or single rooms
 */
export default function SearchTray({
  onExpandedChange,
  searchMode = "apartments",
  outsideClickExceptSelector = null,
}) {
  const isRoomSearch = searchMode === "rooms";
  const selectedCity = useSelector((state) => state.city.selectedCity);
  const goTo = useNavigateToCity();
  const cityCoords = useMemo(
    () => normalizeCoordinates(selectedCity?.coords),
    [selectedCity?.coords],
  );
  const { setActiveFilters, filtersActive, uiFilters } = useApartmentsFilters({
    cityName: selectedCity?.city,
    cityCoords,
    defaultQueryBuilder: buildPublishedCityApartmentsQuery,
  });

  const normalizedInitialFilters = useMemo(
    () => normalizeApartmentFilters(uiFilters),
    [uiFilters],
  );

  const [openSegment, setOpenSegment] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [draftUiFilters, setDraftUiFilters] = useState(
    normalizedInitialFilters,
  );

  const trayRef = useRef(null);
  const segmentRefs = useRef({});
  const lastPanelLayoutRef = useRef(null);
  const lastPanelSegmentRef = useRef(null);

  const buildFilters = useMemo(
    () => createApartmentFilters({ queryBuilder: buildApartmentsFiltersQuery }),
    [],
  );

  useEffect(() => {
    setDraftUiFilters(normalizedInitialFilters);
  }, [normalizedInitialFilters]);

  const [selectedCityByDropDown, setSelectedCityByDropDown] = useState(null);
  const { groups: citiesByLetter } = useCitiesByLetter();
  const {
    city,
    searchTerm,
    activeIndex,
    flatCities,
    handleCityClick,
    handleSearchChange,
    handleKeyDown,
    setActiveIndex,
    activeRefs,
  } = useCityLogic({
    citiesByLetter: citiesByLetter || [],
    startingWord: selectedCity?.city || "",
    onCitySelect: (selected) => {
      const selectedSlug = selected?.slug || "";
      const currentSlug = selectedCity?.slug || "";
      const selectedCityName = selected?.city || "";
      const currentCityName = selectedCity?.city || "";
      const hasCityChanged = selectedSlug
        ? selectedSlug !== currentSlug
        : selectedCityName !== currentCityName;

      if (hasCityChanged) {
        setSelectedCityByDropDown(selected);
      }
      setOpenSegment(null);
    },

    rememberPreferredCity: true,
    syncWithRedux: true,
  });

  const activeFiltersCount = useMemo(
    () => countActiveApartmentFilterGroups(draftUiFilters),
    [draftUiFilters],
  );
  const filtersBadge =
    filtersActive || activeFiltersCount > 0 ? activeFiltersCount || 1 : null;

  const labels = useMemo(() => {
    const destination = city?.split?.("(")?.[0]?.trim?.() || "Dove";
    const availabilityFrom = draftUiFilters.availableFromStart || "";
    const bedrooms = draftUiFilters.availableRoomsMin ?? APARTMENTS.MIN_ROOMS;
    const roomTypeValue = draftUiFilters.roomType || "";
    const dates = availabilityFrom
      ? `Dal ${formatShortDate(availabilityFrom)}`
      : "Disponibilità";
    const roomType = ROOM_TYPE_LABELS[roomTypeValue] || "Qualsiasi";
    const room = isRoomSearch
      ? bedrooms > APARTMENTS.MIN_ROOMS
        ? `${bedrooms}+ posti • ${roomType}`
        : roomType
      : "Intero appartamento";
    const roomDescription = isRoomSearch
      ? "Camere e tipologia"
      : "Tipologia alloggio";
    const filters = filtersBadge ? `${filtersBadge} filtri` : "Filtri smart";

    return { destination, dates, room, roomDescription, filters };
  }, [city, draftUiFilters, filtersBadge, isRoomSearch]);

  const activeSegmentRef = useMemo(
    () => ({
      get current() {
        return openSegment ? segmentRefs.current[openSegment] || null : null;
      },
    }),
    [openSegment],
  );

  const activeSegmentLayout = useRelativeAnchorLayout({
    containerRef: trayRef,
    targetRef: activeSegmentRef,
    enabled: Boolean(openSegment),
  });

  const currentPanelLayout = useMemo(() => {
    const trayNode = trayRef.current;
    if (!openSegment || !trayNode || !activeSegmentLayout) return null;

    const preferredWidth = PANEL_WIDTH[openSegment] ?? 360;
    const trayRect = trayNode.getBoundingClientRect();
    const maxWidth = Math.max(280, trayRect.width - 8);
    const width = Math.min(preferredWidth, maxWidth);
    const center = activeSegmentLayout.left + activeSegmentLayout.width / 2;
    const left = clamp(
      center - width / 2,
      4,
      Math.max(4, trayRect.width - width - 4),
    );

    return {
      left,
      top: activeSegmentLayout.top + activeSegmentLayout.height + 12,
      width,
    };
  }, [activeSegmentLayout, openSegment]);

  useEffect(() => {
    if (openSegment) {
      lastPanelSegmentRef.current = openSegment;
    }
  }, [openSegment]);

  useEffect(() => {
    if (currentPanelLayout) {
      lastPanelLayoutRef.current = currentPanelLayout;
    }
  }, [currentPanelLayout]);

  useClickOutside(
    trayRef,
    () => setOpenSegment(null),
    outsideClickExceptSelector,
    Boolean(openSegment),
  );

  const panelSegment = openSegment || lastPanelSegmentRef.current;
  const resolvedPanelLayout = currentPanelLayout || lastPanelLayoutRef.current;
  const isPanelVisible = Boolean(openSegment && resolvedPanelLayout);
  const isExpanded = Boolean(openSegment);

  useEffect(() => {
    onExpandedChange?.(isExpanded);

    return () => onExpandedChange?.(false);
  }, [isExpanded, onExpandedChange]);

  const toggleSegment = useCallback((segmentKey) => {
    setOpenSegment((current) => (current === segmentKey ? null : segmentKey));
  }, []);

  const updateDraftFilters = useCallback((patchOrUpdater) => {
    setDraftUiFilters((current) => {
      const base = normalizeApartmentFilters(current);
      const patched =
        typeof patchOrUpdater === "function"
          ? patchOrUpdater(base)
          : {
              ...base,
              ...patchOrUpdater,
            };
      return normalizeApartmentFilters(patched);
    });
  }, []);

  const handleDateChange = useCallback(
    (date) => {
      updateDraftFilters({ availableFromStart: toIsoDate(date) });
    },
    [updateDraftFilters],
  );

  const handleBedroomsChange = useCallback(
    (nextValue) => {
      updateDraftFilters((current) => {
        const rawValue =
          typeof nextValue === "function"
            ? nextValue(current.availableRoomsMin)
            : nextValue;
        return {
          ...current,
          availableRoomsMin: clamp(Number(rawValue) || 0, 0, 6),
        };
      });
    },
    [updateDraftFilters],
  );

  const handleRoomTypeChange = useCallback(
    (event) => {
      const nextType = event?.target?.value || "";
      updateDraftFilters({ roomType: nextType });
    },
    [updateDraftFilters],
  );

  const applyFilters = useCallback(
    (
      uiFilters = draftUiFilters,
      {
        closeSearchPanel = false,
        closeModal = false,
        navigateToSelectedCity = false,
      } = {},
    ) => {
      const fallbackCityFromSearch =
        searchTerm?.trim?.().length > 0
          ? flatCities?.[activeIndex]?.city
          : null;
      const targetCity =
        selectedCityByDropDown ||
        selectedCity ||
        fallbackCityFromSearch ||
        null;
      const cityName = targetCity?.city;
      if (!cityName) return;

      const normalized = normalizeApartmentFilters(uiFilters);
      setDraftUiFilters(normalized);

      const payload = buildFilters({
        cityName,
        uiFilters: normalized,
        cityCoords,
      });

      setActiveFilters(payload.meta.hasActiveFilters ? payload : null);

      if (closeSearchPanel) {
        setOpenSegment(null);
      }
      if (closeModal) {
        setShowFilters(false);
      }

      if (navigateToSelectedCity) {
        const filtersQuery = withSearchModeQuery(
          buildApartmentFiltersQuery(normalized),
          searchMode,
        );
        goTo(targetCity, filtersQuery);
      }
    },
    [
      activeIndex,
      buildFilters,
      draftUiFilters,
      flatCities,
      goTo,
      searchTerm,
      searchMode,
      selectedCity,
      selectedCityByDropDown,
      cityCoords,
      setActiveFilters,
    ],
  );

  const handleResetFilters = useCallback(() => {
    setDraftUiFilters(normalizeApartmentFilters(APARTMENT_FILTER_DEFAULTS));
    setActiveFilters(null);
    setShowFilters(false);
    setOpenSegment(null);
  }, [setActiveFilters]);

  return (
    <div className="block">
      <div
        ref={trayRef}
        className={`relative flex items-center rounded-full bg-white shadow-[0_6px_30px_rgba(34,142,141,0.08)] transition-all duration-300 ease-linear border-2 border-[#d4f1ef] p-1`}
      >
        <div
          className={`relative flex flex-1 items-stretch gap-1 transition-[min-width] duration-300 ease-out ${
            isExpanded ? "lg:min-w-[750px]" : "lg:w-[655px]"
          }`}
        >
          <ActiveAnchor
            active={Boolean(openSegment)}
            containerRef={trayRef}
            targetRef={activeSegmentRef}
            className="bg-[#228E8D] shadow-[0_8px_20px_rgba(34,142,141,0.12)]"
            offsetX={-6}
            offsetY={-6}
          />

          <SearchSegment
            ref={(node) => {
              segmentRefs.current.destination = node;
            }}
            label={labels.destination}
            description={"Città/università"}
            active={openSegment === "destination"}
            expanded={isExpanded}
            icon={
              <FontAwesomeIcon
                icon={faMapMarkerAlt}
                className={isExpanded ? "h-4 w-4" : "h-3 w-3"}
              />
            }
            onClick={() => toggleSegment("destination")}
          />

          <SearchSegment
            ref={(node) => {
              segmentRefs.current.dates = node;
            }}
            label={labels.dates}
            description="A partire dal"
            active={openSegment === "dates"}
            expanded={isExpanded}
            icon={
              <FontAwesomeIcon
                icon={faCalendarAlt}
                className={isExpanded ? "h-4 w-4" : "h-3 w-3"}
              />
            }
            onClick={() => toggleSegment("dates")}
            className={`hidden ${isExpanded ? "md:block" : "md:flex"}`}
          />

          <SearchSegment
            ref={(node) => {
              segmentRefs.current.room = node;
            }}
            label={labels.room}
            description={labels.roomDescription}
            active={openSegment === "room"}
            expanded={isExpanded}
            icon={
              <FontAwesomeIcon
                icon={faBed}
                className={isExpanded ? "h-4 w-4" : "h-3 w-3"}
              />
            }
            onClick={() => toggleSegment("room")}
            className={`hidden ${isExpanded ? "lg:block" : "lg:flex"}`}
          />

          <SearchSegment
            ref={(node) => {
              segmentRefs.current.filters = node;
            }}
            label={labels.filters}
            description="Filtri avanzati"
            active={openSegment === "filters"}
            expanded={isExpanded}
            badge={filtersBadge}
            icon={
              <FontAwesomeIcon
                icon={faFilter}
                className={isExpanded ? "h-4 w-4" : "h-3 w-3"}
              />
            }
            onClick={() => toggleSegment("filters")}
          />
          <div
            className={`relative flex items-center justify-center ${isExpanded || filtersBadge || selectedCity ? "min-w-0 hover:bg-[#228E8D]/10 ml-2 " : "w-0"} rounded-full  transition-all duration-300 ease-out focus:outline-none overflow-hidden`}
          >
            <CoolButton
              type="button"
              animated
              onClick={() =>
                applyFilters(draftUiFilters, {
                  closeSearchPanel: true,
                  navigateToSelectedCity: true,
                })
              }
              className={`${isExpanded || filtersBadge || selectedCity ? "opacity-100 translate-x-0 w-full h-full blur-none" : "opacity-0 translate-x-full w-0 h-0 blur-md"} relative z-10 inline-flex items-center gap-2 ${isExpanded ? "px-6 py-3 text-xl" : "px-5 py-2 text-sm"}`}
            >
              {isExpanded ? <p className="text-base">Cerca</p> : ""}
              <FontAwesomeIcon
                icon={faSearch}
                className={isExpanded ? "h-5 w-5" : "h-4 w-4"}
              />
            </CoolButton>
          </div>
        </div>

        {resolvedPanelLayout && (
          <FloatingMenuPanel
            className={`!p-5 transition-[transform,width,opacity] duration-300 ease-out ${
              isPanelVisible ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            positionClass="absolute left-0 top-0 z-40"
            panelClassName={`bg-white rounded-3xl border-2 border-[#d4f1ef] shadow-[0_15px_30px_rgba(0,0,0,0.15)] dark:shadow-[0_15px_30px_rgba(0,0,0,0.4)] ${panelSegment === "dates" ? "overflow-x-hidden" : "overflow-visible"}`}
            style={{
              width: resolvedPanelLayout.width,
              transform: `translate3d(${resolvedPanelLayout.left}px, ${resolvedPanelLayout.top}px, 0) scale(${
                openSegment ? 1 : 0.98
              })`,
            }}
          >
            {panelSegment === "destination" && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-600">
                  Seleziona città o università
                </p>
                <SearchInput
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Cerca città o università"
                  className="w-full"
                />
                <div className="max-h-64 overflow-y-auto">
                  <DropdownList
                    flatCities={flatCities}
                    activeIndex={activeIndex}
                    setActiveIndex={setActiveIndex}
                    activeRefs={activeRefs}
                    handleCityClick={(cityItem) => {
                      handleCityClick(cityItem);
                      setOpenSegment(null);
                    }}
                    rounded
                  />
                </div>
              </div>
            )}

            {panelSegment === "dates" && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-600 pb-2">
                  Disponibile entro data
                </p>
                <FormDatePicker
                  selected={
                    draftUiFilters.availableFromStart
                      ? new Date(draftUiFilters.availableFromStart)
                      : null
                  }
                  handleDateChange={handleDateChange}
                  dispaly="horizontal"
                  inline
                  dateSelectHelp
                />
                <p className="text-xs text-slate-500">
                  Mostra alloggi disponibili entro la data selezionata.
                </p>
              </div>
            )}

            {panelSegment === "room" && (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-slate-600">
                  {labels.roomDescription}
                </p>
                {isRoomSearch ? (
                  <>
                    <CounterBox
                      label="Posti disponibili"
                      innerText="posti"
                      value={draftUiFilters.availableRoomsMin}
                      setValue={handleBedroomsChange}
                      minValue={0}
                      maxValue={6}
                      isLowerBound
                    />
                    <FormSelect
                      id="search-tray-room-type"
                      name="searchRoomType"
                      label="Tipologia stanza"
                      options={ROOM_TYPE_OPTIONS}
                      value={draftUiFilters.roomType}
                      onChange={handleRoomTypeChange}
                      placeholder="Qualsiasi tipologia"
                      position="top-right"
                      minWidth="min-w-48"
                      bg="white"
                      blur="none"
                    />
                  </>
                ) : (
                  <p className="text-xs text-slate-500">
                    Stai cercando un intero appartamento. Usa i filtri avanzati
                    per affinare la ricerca per budget, distanza e servizi.
                  </p>
                )}
              </div>
            )}

            {panelSegment === "filters" && (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-slate-600">
                  Filtri avanzati
                </p>
                <p className="text-xs text-slate-500">
                  Apri il pannello completo per impostare budget, distanza e
                  servizi in dettaglio.
                </p>
                <div className="flex flex-col gap-2">
                  <CoolButton
                    onClick={() => {
                      setOpenSegment(null);
                      setShowFilters(true);
                    }}
                    className="py-2"
                  >
                    Apri tutti i filtri
                  </CoolButton>
                  {filtersActive && (
                    <button
                      className="bg-white px-3 py-1.5 border border-[#d4f1ef] rounded-full text-xs text-gray-500 flex items-center justify-center gap-2"
                      onClick={() => setActiveFilters(null)}
                    >
                      Rimuovi filtri{" "}
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full  px-1 text-[10px] font-semibold bg-[#228E8D] text-white">
                        {filtersBadge}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </FloatingMenuPanel>
        )}
      </div>

      {showFilters && (
        <Modal
          id="modal-filters"
          onClose={() => setShowFilters(false)}
          disableEffects
          disableDistortion
          imgUrl="/icons/filter.webp"
          title="Filtri"
        >
          <div className="sm:w-[550px]">
            <Filters
              matchedCity={selectedCity || null}
              cityCoords={cityCoords}
              searchMode={searchMode}
              draftFilters={draftUiFilters}
              onDraftFiltersChange={setDraftUiFilters}
              onApplyFilters={(nextFilters, options = {}) =>
                applyFilters(nextFilters, {
                  closeSearchPanel: false,
                  closeModal: options.closeModal ?? true,
                })
              }
              onCloseFilters={() => setShowFilters(false)}
              onResetFilters={handleResetFilters}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
