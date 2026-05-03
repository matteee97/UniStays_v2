import CardBase from "@/ui/components/common/cards/CardBase";
import ImageWithSkeleton from "@/ui/components/common/ImageWithSkeleton";
import { FALLBACK_IMAGE } from "@/ui/shared/constants";
import {
  formatRoomArea,
  formatRoomAvailability,
  formatRoomFurnishing,
  formatRoomPrice,
} from "./roomPreviewUtils";

export default function RoomPreviewCard({
  room,
  roomIndex,
  selected = false,
  onOpen,
}) {
  const roomDetails = room.room || {};
  const priceLabel = formatRoomPrice(roomDetails?.priceMonthly);
  const areaLabel = formatRoomArea(roomDetails?.areaMq);
  const furnishingLabel = formatRoomFurnishing(roomDetails?.furnishing);
  const availabilityLabel = formatRoomAvailability(roomDetails?.availability);

  return (
    <div className="flex h-full flex-col space-y-1">
      <CardBase
        onClick={onOpen}
        isHighlighted={selected}
        borderColor="border-[#d4f1ef]"
        className="group h-full cursor-pointer !rounded-[32px]"
        imageSection={
          <div className="relative h-full w-full">
            <ImageWithSkeleton
              src={room.image}
              alt={room.label}
              fallback={FALLBACK_IMAGE}
              rounded="rounded-none"
              containerClassName="!h-44 !w-full"
              imgClassName="object-cover"
            />
            <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
              <span className="rounded-full border border-white/15 bg-white/15 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                {room.typeLabel}
              </span>
              {room.roommates.length ? (
                <span className="rounded-full border border-white/15 bg-white/15 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                  {room.roommates.length} coinquilin
                  {room.roommates.length === 1 ? "o" : "i"}
                </span>
              ) : null}
            </div>
          </div>
        }
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#228E8D]">
            {`Stanza ${roomIndex + 1}`}
          </p>
          <span className="text-center text-[11px] font-semibold text-gray-600 opacity-65">
            {availabilityLabel}
          </span>
        </div>

        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-gray-800">
              {room.typeLabel}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {room.roommates.length
                ? `Gia assegnata a ${room.roommates.length} profil${
                    room.roommates.length === 1 ? "o" : "i"
                  } pubblici`
                : room.assignedOccupantsCount > 0
                  ? "Coinquilini presenti ma non pubblici"
                  : "Nessun coinquilino associato"}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Arredamento
            </p>
            <p className="font-semibold text-gray-700">{furnishingLabel}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Superficie
            </p>
            <p className="font-semibold text-gray-700">
              {areaLabel || "Non specificata"}
            </p>
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <p className="font-semibold text-[#228E8D]">
              {priceLabel ? `EUR ${priceLabel}` : "Su richiesta"}
            </p>
            <p className="text-xs text-[#228E8D]/70">
              {priceLabel ? "/mese" : ""}
            </p>
          </div>
          <div className="mt-4 text-right">
            <p className="inline-block w-fit rounded-full px-3 py-1 text-xs font-semibold text-[#228E8D] transition-colors duration-300 hover:bg-[#228E8D]/10">
              Vedi dettagli
            </p>
          </div>
        </div>
      </CardBase>
    </div>
  );
}
