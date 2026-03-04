import { useMemo, useState } from "react";
import CardBase from "@/ui/components/common/cards/CardBase";
import ImageWithSkeleton from "@/ui/components/common/ImageWithSkeleton";
import Modal from "@/ui/components/common/modals/Modal";
import Carousel from "@/ui/components/common/form/Carousel";
import { formatDate } from "@/ui/helpers/formatDate";
import { InfoSectionCard, InfoSectionHeader } from "./InfoSection";
import { faInfo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FALLBACK_IMAGE } from "@/ui/shared/constants";
import { USER_ROLES } from "@/shared/types";

const ROOM_TYPE_LABELS = {
  single: "Singola",
  double: "Doppia",
  entire_apartment: "Intero appartamento",
};

export default function RoomPreviewSection({
  rooms = [],
  utilitiesIncluded = false,
}) {
  const [activeRoomIndex, setActiveRoomIndex] = useState(null);

  const normalizedRooms = useMemo(() => {
    if (!Array.isArray(rooms)) return [];
    return rooms
      .map((room, idx) => {
        if (!room) return null;
        const mappedTypeLabel = ROOM_TYPE_LABELS[room?.type] || "";
        const typeLabel = mappedTypeLabel || "Tipologia non specificata";
        const suffix = mappedTypeLabel ? ` (${mappedTypeLabel})` : "";
        const images =
          Array.isArray(room?.photoUrls) && room.photoUrls.length
            ? room.photoUrls
            : [FALLBACK_IMAGE];
        return {
          id: room?.roomId || `room-${idx}`,
          label: `Stanza ${idx + 1}${suffix}`,
          typeLabel,
          images,
          image: images[0],
          room,
        };
      })
      .filter(Boolean);
  }, [rooms]);

  if (!normalizedRooms.length) return null;

  const handlePreviewClick = (roomIndex) => {
    setActiveRoomIndex(roomIndex);
  };

  const handleCloseModal = () => {
    setActiveRoomIndex(null);
  };

  const formatPrice = (value) => {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount <= 0) return null;
    return amount.toLocaleString("it-IT");
  };

  const formatArea = (value) => {
    const area = Number(value);
    if (!Number.isFinite(area) || area <= 0) return null;
    return `${area} m²`;
  };

  const formatFurnishing = (value) => {
    if (!value) return "Non specificato";
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const formatAvailability = (availability = {}) => {
    if (availability?.isAvailableNow) return "Disponibile subito";
    if (availability?.availableFrom) {
      const dateLabel = formatDate(availability.availableFrom, "it-IT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      return `Disponibile dal ${dateLabel}`;
    }
    return "Disponibilità su richiesta";
  };

  const activeRoom =
    activeRoomIndex !== null ? normalizedRooms[activeRoomIndex] : null;
  const activeRoomDetails = activeRoom?.room || {};
  const activeRoomPrice = formatPrice(activeRoomDetails?.priceMonthly);
  const activeRoomArea = formatArea(activeRoomDetails?.areaMq);

  return (
    <>
      <InfoSectionCard id="section-stanze" className="space-y-4">
        <InfoSectionHeader
          title="Dove dormirai"
          badge={`${normalizedRooms.length} stanz${
            normalizedRooms.length > 1 ? "e" : "a"
          }`}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-4">
          {normalizedRooms.map((room, roomIndex) => {
            const roomDetails = room.room || {};
            const priceLabel = formatPrice(roomDetails?.priceMonthly);
            const areaLabel = formatArea(roomDetails?.areaMq);
            const furnishingLabel = formatFurnishing(roomDetails?.furnishing);
            const availabilityLabel = formatAvailability(
              roomDetails?.availability,
            );

            return (
              <div key={room.id} className="space-y-1 flex flex-col">
                <CardBase
                  onClick={() => handlePreviewClick(roomIndex)}
                  borderColor="border-[#d4f1ef]"
                  className="group h-full cursor-pointer"
                  imageSection={
                    <ImageWithSkeleton
                      src={room.image}
                      alt={room.label}
                      fallback={FALLBACK_IMAGE}
                      rounded="rounded-none"
                      containerClassName="!h-44"
                    />
                  }
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#228E8D]">
                      {`Stanza ${roomIndex + 1}`}
                    </p>{" "}
                    <span className="text-[11px] font-semibold text-gray-600 opacity-65 text-center">
                      {availabilityLabel}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-gray-800">
                        {room.typeLabel}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        Arredamento
                      </p>
                      <p className="font-semibold text-gray-700">
                        {furnishingLabel}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        Superficie
                      </p>
                      <p className="font-semibold text-gray-700">
                        {areaLabel || "Non specificata"}
                      </p>
                    </div>
                    <div className="mt-4 flex gap-1 items-baseline">
                      <p className="font-semibold text-[#228E8D]">
                        {priceLabel ? `€${priceLabel}*` : "Su richiesta"}
                      </p>
                      <p className="text-xs text-[#228E8D]/70">
                        {priceLabel ? "/mese" : ""}
                      </p>
                    </div>
                    <div className="text-right mt-4">
                      <p className="w-fit text-xs font-semibold text-[#228E8D] hover:bg-[#228E8D]/10 inline-block px-3 py-1 rounded-full transition-colors duration-300">
                        Vedi dettagli
                      </p>
                    </div>
                  </div>
                </CardBase>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-400">
          *I prezzi visualizzati{" "}
          {utilitiesIncluded
            ? "sono comprensivi di utenze."
            : "non comprendono le utenze."}
        </p>
      </InfoSectionCard>

      {activeRoom && (
        <Modal
          onClose={handleCloseModal}
          title={activeRoom.label}
          fullDesc=""
          id="room-details-modal"
        >
          <div className="space-y-5 w-[90vw] max-w-[900px]">
            <div className="w-full max-h-[600px] flex items-center justify-center overflow-hidden rounded-xl bg-black/5">
              {activeRoom.images?.length > 1 ? (
                <Carousel
                  images={activeRoom.images}
                  className="w-full h-[500px] sm:h-[600px]"
                  minHeight="min-h-[200px]"
                  maxHeight="max-h-[450px] sm:max-h-[550px]"
                />
              ) : (
                <ImageWithSkeleton
                  src={activeRoom.image}
                  alt={activeRoom.label}
                  fallback={FALLBACK_IMAGE}
                  imgClassName="!w-fit min-h-[200px] max-h-[600px] mx-auto"
                  rounded="rounded-none"
                />
              )}
            </div>

            {activeRoomDetails?.notes && (
              <InfoSectionCard variant="gradient">
                <InfoSectionHeader
                  title={
                    <div className="flex items-center gap-3">
                      <FontAwesomeIcon
                        icon={faInfo}
                        className="text-[#228E8D] w-4 h-4 rounded-full p-2 border-2 border-[#228E8D]/20"
                      />
                      <div>
                        <p className="text-xs font-semibold text-[#228E8D] uppercase tracking-[0.08em]">
                          Informazioni sulla stanza
                        </p>
                        <h2 className="text-xl font-semibold text-gray-800">
                          Vivi gli spazi come li ha descritti l’
                          {USER_ROLES.HOST}
                        </h2>
                      </div>
                    </div>
                  }
                />
                <pre className="whitespace-pre-wrap text-xs text-gray-600 leading-relaxed mt-5">
                  {activeRoomDetails.notes}
                </pre>
              </InfoSectionCard>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <InfoSectionCard variant="muted">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#228E8D]">
                  Tipologia
                </p>
                <p className="text-base font-semibold text-gray-800">
                  {activeRoom.typeLabel}
                </p>
              </InfoSectionCard>
              <InfoSectionCard variant="muted">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#228E8D]">
                  Prezzo mensile
                </p>
                <p className="text-base font-semibold text-gray-800">
                  {activeRoomPrice
                    ? `€${activeRoomPrice} (${
                        utilitiesIncluded
                          ? "Utenze incluse"
                          : "Utenze non incluse"
                      })`
                    : "Su richiesta"}
                </p>
              </InfoSectionCard>
              <InfoSectionCard variant="muted">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#228E8D]">
                  Superficie
                </p>
                <p className="text-base font-semibold text-gray-800">
                  {activeRoomArea || "Non specificata"}
                </p>
              </InfoSectionCard>
              <InfoSectionCard variant="muted">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#228E8D]">
                  Arredamento
                </p>
                <p className="text-base font-semibold text-gray-800">
                  {formatFurnishing(activeRoomDetails?.furnishing)}
                </p>
              </InfoSectionCard>
              <InfoSectionCard variant="muted" className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#228E8D]">
                  Disponibilità
                </p>
                <p className="text-base font-semibold text-gray-800">
                  {formatAvailability(activeRoomDetails?.availability)}
                </p>
              </InfoSectionCard>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
