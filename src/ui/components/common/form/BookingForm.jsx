import DatePicker from "react-datepicker";
import { useEffect, useMemo, useState, forwardRef } from "react";
import Modal from "../modals/Modal";
import CustomDateInput from "../form/CustomDateInput";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CoolButton from "../buttons/CoolButton";
import { faFlag } from "@fortawesome/free-solid-svg-icons";
import FormSelectDropdown from "./FormSelect";
import ReportModal from "@/ui/components/common/reports/ReportModal";

const ROOM_TYPE_LABELS = {
  single: "Singola",
  double: "Doppia",
  entire_apartment: "Intero appartamento",
};

const formatRoomPrice = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return amount.toLocaleString("it-IT");
};

const toDateValue = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value?.toDate === "function") return value.toDate();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const BookingForm = forwardRef(
  (
    {
      handleSubmit,
      rooms = [],
      selectedRoomId,
      onRoomSelect,
      startDate,
      setStartDate,
      isAgency,
      apartmentId,
      ownerId,
      version = "form",
      containerClassName = "",
      navigationLinks = [],
      onNavigate = null,
    },
    ref
    ) => {
    const [modal, setModal] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const reportTarget = apartmentId
      ? {
          type: "apartment",
          id: apartmentId,
          apartmentId,
          ownerId,
          userId: ownerId,
        }
      : null;
    const canReport = Boolean(reportTarget?.apartmentId);
    const normalizedRooms = useMemo(() => {
      if (!Array.isArray(rooms)) return [];
      return rooms.map((room, index) => ({
        key: room?.roomId || room?.id || `room-${index}`,
        index,
        typeLabel: ROOM_TYPE_LABELS[room?.type] || "Tipologia non specificata",
        priceMonthly: room?.priceMonthly ?? null,
        availability: room?.availability || {},
        room,
      }));
    }, [rooms]);

    const roomOptions = useMemo(
      () =>
        normalizedRooms.map((room) => {
          const priceLabel = formatRoomPrice(room.priceMonthly);
          const parts = [
            `Stanza ${room.index + 1}`,
            room.typeLabel,
            priceLabel ? `€${priceLabel}/mese` : "Prezzo su richiesta",
          ].filter(Boolean);
          return {
            value: room.key,
            label: parts.join(" · "),
          };
        }),
      [normalizedRooms]
    );

    const selectedRoom =
      normalizedRooms.find((room) => room.key === selectedRoomId) ||
      (normalizedRooms.length === 1 ? normalizedRooms[0] : null);

    const activeRoomPrice = formatRoomPrice(selectedRoom?.priceMonthly);
    const hasMultipleRooms = normalizedRooms.length > 1;
    const hasSelectedRoom = Boolean(selectedRoom);
    const priceDisplay = activeRoomPrice
      ? `€${activeRoomPrice}`
      : hasMultipleRooms && !hasSelectedRoom
      ? "Seleziona una stanza"
      : "Prezzo su richiesta";
    const formPriceDisplay = activeRoomPrice ? `€${activeRoomPrice}` : "€—";
    const showPriceSuffix = !(hasMultipleRooms && !hasSelectedRoom);

    const minDate = useMemo(() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (!selectedRoom) return today;
      const availability = selectedRoom.availability || {};
      if (availability?.isAvailableNow) return today;
      const availableFrom = toDateValue(availability?.availableFrom);
      if (!availableFrom) return today;
      return availableFrom < today ? today : availableFrom;
    }, [selectedRoom]);

    useEffect(() => {
      if (!startDate || !minDate) return;
      if (startDate < minDate) {
        setStartDate(minDate);
      }
    }, [startDate, minDate, setStartDate]);

    const renderFormContent = (currentVersion) => (
      <form
        className={`mt-4 space-y-5 ${
          currentVersion === "button"
            ? "max-w-96 sm:w-96 mx-auto pb-10 sm:pb-4"
            : "w-full"
        }`}
        onSubmit={handleSubmit}
      >
        {normalizedRooms.length > 1 ? (
          <FormSelectDropdown
            name="selectedRoom"
            label="Seleziona la stanza"
            placeholder="Scegli una stanza"
            options={roomOptions}
            value={selectedRoomId || ""}
            onChange={(event) => onRoomSelect?.(event.target.value)}
            required
          />
        ) : (
          normalizedRooms.length === 1 && (
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">Stanza selezionata:</p>
              <p className="text-sm text-gray-600">
                {roomOptions[0]?.label || "Stanza disponibile"}
              </p>
            </div>
          )
        )}
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">A partire dal:</p>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="dd/MM/yyyy"
            placeholderText="Seleziona una data"
            popperPlacement="bottom-center"
            customInput={<CustomDateInput />}
            minDate={minDate}
          />
        </div>
        <CoolButton
          ariaLabel="Invia richiesta di prenotazione"
          disabled={normalizedRooms.length > 1 && !selectedRoomId}
        >
          Contatta {isAgency ? "l'agenzia" : "il proprietario"}
        </CoolButton>
      </form>
    );

    return (
      <>
        {version === "button" ? (
          <>
            {/* BUTTON VERSION */}
            <div
              className={`fixed bottom-0 left-0 w-full z-30 ${containerClassName}`}
            >
              <div className="mx-auto max-w-7xl px-8 pb-3">
                <div className="block md:flex md:items-center md:justify-between md:gap-12 rounded-full border-2 border-[#228E8D]/50 bg-[#d4f1ef]/90 shadow-xl shadow-[#0f5b5a1c] backdrop-blur-lg p-1 md:px-3 md:py-2">
                  <div className="hidden md:block">
                    {navigationLinks?.length ? (
                      <nav className="flex items-center gap-2 overflow-x-auto">
                        {navigationLinks.map((link) => (
                          <button
                            key={link.id ?? "section-dotazioni"}
                            type="button"
                            onClick={() => {
                              if (onNavigate) {
                                onNavigate(link.id);
                                return;
                              }
                              const target = document.getElementById(link.id);
                              if (target) {
                                const top =
                                  target.getBoundingClientRect().top +
                                  window.scrollY -
                                  72;
                                window.scrollTo({
                                  top,
                                  behavior: "smooth",
                                });
                              }
                            }}
                            className="px-3 py-2 text-sm font-semibold text-gray-600 rounded-xl hover:text-[#228E8D] hover:bg-[#228E8D]/10 transition-colors whitespace-nowrap"
                          >
                            {link.label}
                          </button>
                        ))}
                      </nav>
                    ) : (
                      <span className="text-sm text-gray-500">
                        Navigazione non disponibile
                      </span>
                    )}
                  </div>

                  <div className="flex items-center md:gap-2">
                    <span className="hidden lg:block text-sm text-gray-500">
                      {priceDisplay}
                      {showPriceSuffix ? " /mese" : ""}
                    </span>

                    <CoolButton
                      type="button"
                      onClick={() => setModal(true)}
                      ariaLabel={`Apri il modulo per contattare ${
                        isAgency ? "l'agenzia" : "il proprietario"
                      }`}
                      aria-expanded={modal}
                      aria-haspopup="modal"
                      className="w-full md:w-[270px]  md:active:scale-95 transition-all duration-300"
                      halo
                    >
                      Contatta {isAgency ? "l'agenzia" : "il proprietario"}
                    </CoolButton>
                  </div>
                </div>
              </div>
              {modal && (
                <Modal
                  onClose={() => setModal(false)}
                  title={`Contatta ${
                    isAgency ? "l'agenzia" : "il proprietario"
                  }`}
                >
                  {renderFormContent(version)}
                </Modal>
              )}
            </div>
          </>
        ) : (
          <>
            {/* FORM VERSION */}
            <div
              className={`flex flex-col sticky top-20 h-fit ${containerClassName}`}
            >
              <div className="relative p-5 h-fit bg-white border-2 border-[#d4f1ef] rounded-xl shadow-zinc-100 shadow-2xl">
                <div className="flex justify-between items-baseline text-[#228E8D]">
                  <span className="text-2xl font-semibold">
                    {formPriceDisplay}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    / mese per stanza
                  </span>
                </div>
                {renderFormContent(version)}
                <span ref={ref} />
              </div>
              {canReport && (
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(true)}
                  className="flex items-center gap-3 text-sm underline text-[#228e8cc6] hover:text-[#228e8c] transition-all duration-300 absolute -bottom-8 left-1/2 transform -translate-x-1/2"
                  aria-label="Segnala annuncio"
                >
                  <FontAwesomeIcon icon={faFlag} className="w-3 h-3" />
                  Segnala annuncio
                </button>
              )}
            </div>
          </>
        )}
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          target={reportTarget}
          targetLabel="annuncio"
          title="Segnala annuncio"
        />
      </>
    );
  }
);

export default BookingForm;
