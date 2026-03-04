import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRotateRight,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import SearchInput from "@/ui/components/common/form/SearchInput";
import FormSelectDropdown from "@/ui/components/common/form/FormSelect";
import Alert from "@/ui/components/common/messages/PubblicaAnnuncioAlert";
import { useWindowWidth } from "@/ui/hooks";
import { MODE_OPTIONS } from "../dettagliTecniciSection/DettagliTecniciConstants";
import ActionLabel from "../../common/indicators/ActionLabel";

/**
 * Componente per i controlli di filtro e ricerca
 */
export default function AnnunciControls({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  statusFilter,
  setStatusFilter,
  filteredAppartamentiLength,
  mode = "default",
  onAnalyticsModeChange,
  analyticsMode,
  refetchApartments,
}) {
  const isMobile = useWindowWidth() < 768;

  return (
    <div className="bg-white/90 backdrop-blur-xl fixed top-2 left-2 sm:top-4 sm:left-[102px] rounded-2xl p-2 sm:p-6 border-2 border-[#d4f1ef] z-40 w-[calc(100%-16px)] sm:w-[calc(100%-142px)] 2xl:left-[calc(50%+31px)] 2xl:max-w-[2000px] transfrom 2xl:-translate-x-1/2 mx-auto">
      <div className="flex w-full flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Ricerca */}
        <div className="flex sm:flex-1 w-full justify-end sm:justify-start">
          <SearchInput
            searchTerm={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cerca nei tuoi annunci..."
            id="annunci-search"
            className="xl:min-w-[330px]"
          />
        </div>

        {/* Controlli */}
        <div className="flex w-full lg:w-1/2  lg:flex-row gap-3 items-center">
          {/* Ordinamento */}

          <button
            className="hidden lg:inline-flex group relative"
            aria-label="ricarica annunci"
            onClick={() => {
              setSearchTerm("");
              refetchApartments();
            }}
          >
            <FontAwesomeIcon
              icon={faArrowRotateRight}
              className="w-4 h-4 mr-2 text-[#228E8D] hover:rotate-45 active:rotate-90 transition-transform duration-300"
            />
            <ActionLabel
              text="Ricarica annunci"
              alwaysBottom
              className="w-32"
            />
          </button>

          {mode === "analytics" ? (
            <FormSelectDropdown
              name="mode"
              value={analyticsMode}
              onChange={(event) => onAnalyticsModeChange?.(event.target.value)}
              options={MODE_OPTIONS}
              placeholder="seleziona modalita visualizzazione"
              position={isMobile ? "bottom-left" : "bottom-right"}
              bg="white"
              minWidth="min-w-48"
            />
          ) : (
            <FormSelectDropdown
              options={[
                { label: "Più recenti", value: "recenti" },
                { label: "Più popolari", value: "popolari" },
                { label: "Prezzo crescente", value: "prezzo_crescente" },
                { label: "Prezzo decrescente", value: "prezzo_decrescente" },
              ]}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              minWidth="min-w-48"
              position={isMobile ? "bottom-left" : "bottom-right"}
              bg="white"
              blur="none"
            />
          )}

          {/* Filtro status */}
          <FormSelectDropdown
            options={[
              { label: "Tutti gli annunci", value: "tutti" },
              { label: "Solo attivi", value: "attivi" },
              { label: "Solo inattivi", value: "inattivi" },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            minWidth="min-w-48"
            position={isMobile ? "bottom-left" : "bottom-right"}
            bg="white"
            blur="none"
          />
        </div>
      </div>
      {searchTerm && (
        <Alert className="mt-4">
          <div className="flex w-full items-center gap-2">
            <FontAwesomeIcon icon={faSearch} className="text-[#228E8D]" />
            <span className="text-[#228E8D]">
              Risultati per "{searchTerm}": {filteredAppartamentiLength} annunci
              trovati
            </span>
          </div>
        </Alert>
      )}
    </div>
  );
}
