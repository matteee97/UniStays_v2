import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInfo,
  faLocationDot,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "@/ui/components/common/modals/Modal";
import ImageWithSkeleton from "@/ui/components/common/ImageWithSkeleton";
import { InfoSectionCard, InfoSectionHeader } from "../InfoSection";
import { USER_ROLES } from "@/shared/types";
import { FALLBACK_IMAGE } from "@/ui/shared/constants";
import RoommatePortrait from "../RoommatePortrait";
import RoommateProfilePanel from "../RoommateProfilePanel";
import {
  formatRoomArea,
  formatRoomAvailability,
  formatRoomFurnishing,
  formatRoomPrice,
} from "./roomPreviewUtils";

const ROOM_BADGE_CLASS =
  "rounded-full border border-white/15 bg-white/15 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md";

function RoomFactCard({ label, value }) {
  return (
    <InfoSectionCard variant="muted">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#228E8D]">
        {label}
      </p>
      <p className="text-base font-semibold text-gray-800">{value}</p>
    </InfoSectionCard>
  );
}

function RoommateSelectionCard({
  roommate,
  isSelected,
  onToggle,
  showToggleBadge,
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center gap-4 rounded-[28px] border p-4 text-left transition ${
        isSelected
          ? "border-[#228E8D] bg-white shadow-sm"
          : "border-[#d4f1ef] bg-white hover:border-[#93d5cc]"
      }`}
    >
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
        <RoommatePortrait
          profile={roommate}
          alt={roommate.displayName}
          className="h-full w-full"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-gray-800">
              {roommate.displayName}
            </p>
            <p className="mt-1 line-clamp-2 text-sm text-gray-500">
              {roommate.shortBio ||
                roommate.studyLine ||
                "Profilo coinquilino disponibile"}
            </p>
          </div>
          {showToggleBadge ? (
            <span className="rounded-full bg-[#228E8D]/10 px-3 py-1 text-[11px] font-semibold text-[#228E8D]">
              {isSelected ? "Chiudi" : "Apri"}
            </span>
          ) : null}
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
          <FontAwesomeIcon icon={faLocationDot} className="text-[#228E8D]" />
          <span>{roommate.roomLabel}</span>
        </div>
      </div>
    </button>
  );
}

function RoommatesInRoomSection({ room, activeRoommateId, onRoommateToggle }) {
  const activeRoommates = room.roommates || [];
  const selectedRoommate =
    activeRoommates.find((roommate) => roommate.id === activeRoommateId) ||
    (activeRoommates.length === 1 ? activeRoommates[0] : null);

  return (
    <InfoSectionCard variant="gradient" className="space-y-4">
      <InfoSectionHeader
        className="flex-wrap"
        title={
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#228E8D]">
              Chi vive qui
            </p>
            <p className="text-lg font-semibold text-gray-800">
              Coinquilini gia associati alla stanza
            </p>
          </div>
        }
        badge={`${room.assignedOccupantsCount} occupant${
          room.assignedOccupantsCount === 1 ? "" : "s"
        }`}
      />

      {activeRoommates.length ? (
        <>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {activeRoommates.map((roommate) => (
              <RoommateSelectionCard
                key={`${room.id}-${roommate.id}`}
                roommate={roommate}
                isSelected={selectedRoommate?.id === roommate.id}
                onToggle={() =>
                  onRoommateToggle((current) =>
                    current === roommate.id ? null : roommate.id,
                  )
                }
                showToggleBadge={activeRoommates.length > 1}
              />
            ))}
          </div>

          {selectedRoommate ? (
            <div className="border-t border-[#d4f1ef] pt-4">
              <RoommateProfilePanel profile={selectedRoommate} />
            </div>
          ) : null}
        </>
      ) : room.assignedOccupantsCount > 0 ? (
        <div className="rounded-[28px] border border-dashed border-[#d4f1ef] bg-white/80 p-5 text-sm text-gray-600">
          <p className="font-medium text-gray-700">
            Coinquilini presenti, profilo non pubblico.
          </p>
          <p className="mt-1">
            Questa stanza risulta gia occupata in parte, ma l&apos;host non ha
            reso visibili i dettagli pubblici dei coinquilini.
          </p>
        </div>
      ) : (
        <div className="rounded-[28px] border border-dashed border-[#d4f1ef] bg-white/80 p-5 text-sm text-gray-600">
          <p className="inline-flex items-center gap-2 font-medium text-gray-700">
            <FontAwesomeIcon icon={faUsers} className="text-[#228E8D]" />
            Nessun coinquilino associato
          </p>
          <p className="mt-1">
            Al momento la stanza non mostra coinquilini gia presenti.
          </p>
        </div>
      )}
    </InfoSectionCard>
  );
}

export default function RoomDetailsModal({
  room,
  utilitiesIncluded,
  activeRoommateId,
  onRoommateToggle,
  onClose,
}) {
  const roomDetails = room?.room || {};
  const roomPrice = formatRoomPrice(roomDetails?.priceMonthly);
  const roomArea = formatRoomArea(roomDetails?.areaMq);
  const roomAvailability = formatRoomAvailability(roomDetails?.availability);
  const roomFurnishing = formatRoomFurnishing(roomDetails?.furnishing);
  const modalImages = room?.images?.length ? room.images : [FALLBACK_IMAGE];

  const roomOccupancyLabel = useMemo(() => {
    if (room.roommates.length) {
      return `${room.roommates.length} profil${
        room.roommates.length === 1 ? "o" : "i"
      } pubblico${room.roommates.length === 1 ? "" : "i"}`;
    }
    if (room.assignedOccupantsCount > 0) return "Coinquilini presenti";
    return "Stanza libera da coinquilini associati";
  }, [room.assignedOccupantsCount, room.roommates.length]);

  return (
    <Modal
      onClose={onClose}
      title={room.label}
      fullDesc=""
      disableEffects
      disableDistortion
      id="room-details-modal"
    >
      <div className="w-[90vw] max-w-[980px] space-y-5">
        <div className="relative h-[520px] overflow-hidden rounded-[32px] border border-[#d4f1ef] bg-[#0F172A] shadow-sm sm:h-[620px]">
          <ImageWithSkeleton
            src={modalImages[0]}
            alt={room.label}
            fallback={FALLBACK_IMAGE}
            containerClassName="h-full w-full"
            imgClassName="h-full w-full object-cover"
            rounded="rounded-none"
            className="h-full w-full"
          />

          <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-4">
            <span className={ROOM_BADGE_CLASS}>{room.typeLabel}</span>
            <span className={ROOM_BADGE_CLASS}>
              {room.roommates.length} coinquilin
              {room.roommates.length === 1 ? "o" : "i"}
            </span>
          </div>
        </div>

        {roomDetails?.notes ? (
          <InfoSectionCard variant="gradient">
            <InfoSectionHeader
              title={
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon
                    icon={faInfo}
                    className="h-4 w-4 rounded-full border-2 border-[#228E8D]/20 p-2 text-[#228E8D]"
                  />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#228E8D]">
                      Informazioni sulla stanza
                    </p>
                    <h2 className="text-xl font-semibold text-gray-800">
                      Vivi gli spazi come li ha descritti l&apos;
                      {USER_ROLES.HOST}
                    </h2>
                  </div>
                </div>
              }
            />
            <pre className="mt-5 whitespace-pre-wrap text-xs leading-relaxed text-gray-600">
              {roomDetails.notes}
            </pre>
          </InfoSectionCard>
        ) : null}

        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <RoomFactCard label="Tipologia" value={room.typeLabel} />
          <RoomFactCard
            label="Prezzo mensile"
            value={
              roomPrice
                ? `EUR ${roomPrice} (${utilitiesIncluded ? "Utenze incluse" : "Utenze non incluse"})`
                : "Su richiesta"
            }
          />
          <RoomFactCard
            label="Superficie"
            value={roomArea || "Non specificata"}
          />
          <RoomFactCard label="Arredamento" value={roomFurnishing} />
          <RoomFactCard label="Disponibilita" value={roomAvailability} />
          <RoomFactCard label="Stato convivenza" value={roomOccupancyLabel} />
        </div>

        <RoommatesInRoomSection
          room={room}
          activeRoommateId={activeRoommateId}
          onRoommateToggle={onRoommateToggle}
        />
      </div>
    </Modal>
  );
}
