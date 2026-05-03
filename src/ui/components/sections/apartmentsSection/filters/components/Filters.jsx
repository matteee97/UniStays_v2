import { useCallback, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBath, faUserGroup } from "@fortawesome/free-solid-svg-icons";

import CounterBox from "@/ui/components/common/form/CounterBox";
import Checkbox from "@/ui/components/common/form/Checkbox";
import FormSelect from "@/ui/components/common/form/FormSelect";
import RangeSlider from "@/ui/components/common/form/RangeSlider";
import CoolButton from "@/ui/components/common/buttons/CoolButton";
import {
  APARTMENT_FILTER_DEFAULTS,
  APARTMENT_FILTER_LIMITS,
  normalizeApartmentFilters,
} from "@/application/filters/apartmentFilters";
import QuickFiltersInputPanel from "@/ui/components/sections/apartmentsSection/filters/components/QuickFiltersInputPanel";
import {
  FILTER_SECTION_KEYS,
  expandOpenSectionsWithChanges,
  getChangedFilterSections,
  getDefaultOpenFilterSections,
} from "@/ui/components/sections/apartmentsSection/filters/filterSectionsState";
import { ROOM_TYPE_OPTIONS } from "@/ui/components/sections/apartmentsSection/filters/roomTypeOptions";
import FiltersSection from "./FiltersSection";
import { AMENITIES_OPTIONS } from "../constants";
import FormDatePicker from "@/ui/components/common/form/FormDatePicker";
import { DISTANCES } from "@/shared/types";
import {toIsoDate} from "@/shared/utils/date.utils.js";
import { SEARCH_MODES } from "@/application/filters/searchModeQuery";

const clamp = (value, min, max) =>
  Math.min(Math.max(Number(value) || 0, min), max);

const parseSliderNumber = (eventOrValue, explicitValue) => {
  if (Number.isFinite(explicitValue)) return explicitValue;

  const eventValue = Number(eventOrValue?.target?.value);
  if (Number.isFinite(eventValue)) return eventValue;

  const directValue = Number(eventOrValue);
  return Number.isFinite(directValue) ? directValue : 0;
};

const normalizeDraftFilters = (filters, canUseDistance) =>
  normalizeApartmentFilters({
    ...filters,
    distanceKm: canUseDistance ? filters?.distanceKm : 0,
  });

export default function Filters({
  matchedCity,
  cityCoords = null,
  draftFilters,
  onDraftFiltersChange,
  onApplyFilters,
  onCloseFilters,
  onResetFilters,
  searchMode = SEARCH_MODES.APARTMENTS,
}) {
  const isRoomSearch = searchMode === SEARCH_MODES.ROOMS;
  const canUseDistance =
    Number.isFinite(cityCoords?.lat) && Number.isFinite(cityCoords?.lng);

  const resolvedDraft = useMemo(
    () => normalizeDraftFilters(draftFilters, canUseDistance),
    [canUseDistance, draftFilters],
  );

  const [openSections, setOpenSections] = useState(() => {
    const baseOpen = getDefaultOpenFilterSections();
    const changedFromDefaults = getChangedFilterSections(
      APARTMENT_FILTER_DEFAULTS,
      resolvedDraft,
    );

    return expandOpenSectionsWithChanges(baseOpen, changedFromDefaults);
  });

  const handleSectionToggle = useCallback((sectionKey, isOpen) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionKey]: isOpen,
    }));
  }, []);

  const updateDraftFilters = useCallback(
    (patchOrUpdater) => {
      if (typeof onDraftFiltersChange !== "function") return;

      onDraftFiltersChange((current) => {
        const normalizedCurrent = normalizeDraftFilters(
          current,
          canUseDistance,
        );
        const rawNext =
          typeof patchOrUpdater === "function"
            ? patchOrUpdater(normalizedCurrent)
            : {
                ...normalizedCurrent,
                ...patchOrUpdater,
              };
        const normalizedNext = normalizeDraftFilters(rawNext, canUseDistance);

        const sectionChanges = getChangedFilterSections(
          normalizedCurrent,
          normalizedNext,
        );
        setOpenSections((prev) =>
          expandOpenSectionsWithChanges(prev, sectionChanges),
        );

        return normalizedNext;
      });
    },
    [canUseDistance, onDraftFiltersChange],
  );

  const handleFiltra = useCallback(
    (event) => {
      event.preventDefault();
      onApplyFilters?.(resolvedDraft, { closeModal: true });
    },
    [onApplyFilters, resolvedDraft],
  );

  const handleQuickInputPlan = useCallback(
    (plan) => {
      if (!plan?.uiFilters) return;
      const normalizedPlan = normalizeDraftFilters(
        plan.uiFilters,
        canUseDistance,
      );
      updateDraftFilters(() => normalizedPlan);
      onApplyFilters?.(normalizedPlan, { closeModal: false });
    },
    [canUseDistance, onApplyFilters, updateDraftFilters],
  );

  const handleReset = useCallback(() => {
    if (typeof onResetFilters === "function") {
      onResetFilters();
      return;
    }

    onCloseFilters?.();
  }, [onCloseFilters, onResetFilters]);

  return (
    <div className="flex flex-col gap-5 py-4">
      <QuickFiltersInputPanel
        cityName={matchedCity?.city}
        cityCoords={cityCoords}
        currentUiFilters={resolvedDraft}
        onApplyPlan={handleQuickInputPlan}
      />

      <FiltersSection
        sectionKey={FILTER_SECTION_KEYS.PRICE}
        isOpen={openSections[FILTER_SECTION_KEYS.PRICE]}
        onToggle={handleSectionToggle}
        title="Prezzo"
        subtitle="Imposta un intervallo di prezzo mensile adatto al tuo budget."
      >
        <RangeSlider
          simbol=" €"
          value={resolvedDraft.priceRange}
          minValue={APARTMENT_FILTER_LIMITS.priceMin}
          maxValue={APARTMENT_FILTER_LIMITS.priceMax}
          onChange={(next) => updateDraftFilters({ priceRange: next })}
        />
      </FiltersSection>

      <FiltersSection
        sectionKey={FILTER_SECTION_KEYS.DISTANCE}
        isOpen={openSections[FILTER_SECTION_KEYS.DISTANCE]}
        onToggle={handleSectionToggle}
        title="Distanza massima"
        subtitle={
          canUseDistance
            ? "Quanto vuoi essere vicino all'università?"
            : "Seleziona una città per abilitare questo filtro."
        }
      >
        <RangeSlider
          className="pt-2.5"
          simbol=" km"
          minValue={DISTANCES.MIN_KM}
          maxValue={APARTMENT_FILTER_LIMITS.distanceMaxKm}
          step={APARTMENT_FILTER_LIMITS.distanceStepKm}
          value={resolvedDraft.distanceKm}
          disabled={!canUseDistance}
          onChange={(eventOrValue, value) =>
            updateDraftFilters({
              distanceKm: parseSliderNumber(eventOrValue, value),
            })
          }
        />
        <p className="text-xs text-slate-500 mt-2">
          {canUseDistance
            ? resolvedDraft.distanceKm === 0
              ? "Nessun limite di distanza applicato."
              : "La distanza è calcolata in linea d'aria."
            : "Coordinate università non disponibili: distanza disabilitata."}
        </p>
      </FiltersSection>

      <FiltersSection
        sectionKey={FILTER_SECTION_KEYS.ROOMS}
        isOpen={openSections[FILTER_SECTION_KEYS.ROOMS]}
        onToggle={handleSectionToggle}
        title={isRoomSearch ? "Stanza" : "Camere e spazi"}
        subtitle={
          isRoomSearch
            ? "Filtra le singole stanze per tipologia, prezzo e disponibilita."
            : "Trova alloggi con il giusto numero di stanze e spazi."
        }
      >
        <div className="space-y-4">
          {!isRoomSearch && (
            <RangeSlider
              label="Camere totali"
              value={resolvedDraft.roomsRange}
              minValue={APARTMENT_FILTER_DEFAULTS.roomsRange[0]}
              maxValue={APARTMENT_FILTER_LIMITS.roomsMax}
              onChange={(next) => updateDraftFilters({ roomsRange: next })}
            />
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CounterBox
              label={isRoomSearch ? "Posti disponibili" : "Stanze disponibili"}
              innerText={isRoomSearch ? "posti" : "stanze"}
              description={
                isRoomSearch
                  ? "Numero minimo di posti liberi nella stanza."
                  : "Numero minimo di stanze libere."
              }
              icon={<FontAwesomeIcon icon={faUserGroup} />}
              value={resolvedDraft.availableRoomsMin}
              setValue={(nextValue) =>
                updateDraftFilters((current) => {
                  const value =
                    typeof nextValue === "function"
                      ? nextValue(current.availableRoomsMin)
                      : nextValue;

                  return {
                    ...current,
                    availableRoomsMin: clamp(
                      value,
                      0,
                      APARTMENT_FILTER_LIMITS.roomsMax,
                    ),
                  };
                })
              }
              minValue={0}
              maxValue={APARTMENT_FILTER_LIMITS.roomsMax}
              isLowerBound
            />
            <CounterBox
              label="Bagni"
              description="Numero minimo di bagni."
              icon={<FontAwesomeIcon icon={faBath} />}
              value={resolvedDraft.bathroomsMin}
              setValue={(nextValue) =>
                updateDraftFilters((current) => {
                  const value =
                    typeof nextValue === "function"
                      ? nextValue(current.bathroomsMin)
                      : nextValue;

                  return {
                    ...current,
                    bathroomsMin: clamp(
                      value,
                      0,
                      APARTMENT_FILTER_LIMITS.bathroomsMax,
                    ),
                  };
                })
              }
              minValue={0}
              maxValue={APARTMENT_FILTER_LIMITS.bathroomsMax}
              isLowerBound
            />
          </div>
          <RangeSlider
            label={isRoomSearch ? "Superficie stanza minima" : "Superficie minima"}
            simbol=" mq"
            minValue={APARTMENT_FILTER_LIMITS.areaMinMq}
            maxValue={APARTMENT_FILTER_LIMITS.areaMaxMq}
            step={APARTMENT_FILTER_LIMITS.areaStepMq}
            value={resolvedDraft.areaMin}
            onChange={(eventOrValue, value) =>
              updateDraftFilters({
                areaMin: parseSliderNumber(eventOrValue, value),
              })
            }
          />
          <FormSelect
            id="filters-room-type"
            name="filtersRoomType"
            label="Tipologia stanza"
            options={ROOM_TYPE_OPTIONS}
            value={resolvedDraft.roomType}
            onChange={(event) =>
              updateDraftFilters({ roomType: event?.target?.value || "" })
            }
            placeholder="Qualsiasi tipologia"
            position="top-right"
            minWidth="min-w-48"
            bg="white"
            blur="none"
          />
        </div>
      </FiltersSection>

      <FiltersSection
        sectionKey={FILTER_SECTION_KEYS.AVAILABILITY}
        isOpen={openSections[FILTER_SECTION_KEYS.AVAILABILITY]}
        onToggle={handleSectionToggle}
        title="Disponibilità"
        subtitle="Preferisci solo alloggi già disponibili?"
      >
        <div className="space-y-4 max-w-[516px]">
          <Checkbox
            label="Disponibile subito"
            checked={resolvedDraft.availabilityNow}
            onChange={(event) => {
              updateDraftFilters({ availableFromStart: "" });

              updateDraftFilters({ availabilityNow: event.target.checked });
            }}
            className="max-w-44"
          />
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700 pb-2">
              Disponibile entro data
            </p>
            <FormDatePicker
              selected={
                resolvedDraft.availableFromStart
                  ? new Date(resolvedDraft.availableFromStart)
                  : null
              }
              handleDateChange={(date) =>
                updateDraftFilters({ availableFromStart: toIsoDate(date) })
              }
              inline
              dateSelectHelp
              disabled={resolvedDraft.availabilityNow}
            />
            {resolvedDraft.availableFromStart ? (
              <button
                type="button"
                onClick={() => updateDraftFilters({ availableFromStart: "" })}
                className="text-xs text-slate-600 underline"
              >
                Rimuovi data
              </button>
            ) : null}
          </div>
        </div>
      </FiltersSection>

      <FiltersSection
        sectionKey={FILTER_SECTION_KEYS.AMENITIES}
        isOpen={openSections[FILTER_SECTION_KEYS.AMENITIES]}
        onToggle={handleSectionToggle}
        title="Servizi"
        subtitle="Seleziona i comfort che non vuoi perdere."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {AMENITIES_OPTIONS.map((amenity) => (
            <Checkbox
              key={amenity.key}
              label={amenity.label}
              description={amenity.description}
              checked={Boolean(resolvedDraft.amenities?.[amenity.key])}
              onChange={(event) =>
                updateDraftFilters((current) => ({
                  ...current,
                  amenities: {
                    ...current.amenities,
                    [amenity.key]: event.target.checked,
                  },
                }))
              }
            />
          ))}
        </div>
      </FiltersSection>

      <div className="flex flex-col gap-2 pt-2">
        <CoolButton
          onClick={handleFiltra}
          ariaLabel="Applica filtri"
          shadow={false}
          className="sm:flex-1"
        >
          Applica filtri
        </CoolButton>
        <button
          type="button"
          onClick={handleReset}
          className="w-full sm:w-auto px-5 py-1 bg-white border-2 border-[#d4f1ef] rounded-full text-sm text-black"
        >
          Reset filtri
        </button>
      </div>
    </div>
  );
}
